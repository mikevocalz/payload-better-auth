/**
 * Payload Plugins for Better Auth
 *
 * @packageDocumentation
 */ import { detectAuthConfig } from '../utils/detectAuthConfig.js';
import { detectEnabledPlugins } from '../utils/detectEnabledPlugins.js';
import { hasAnyRole, normalizeRoles } from '../utils/access.js';
// Track auth instance for HMR
let authInstance = null;
// Store API key permissions config for access by management views
let apiKeyPermissionsConfig = undefined;
/**
 * Get the stored API key permissions config.
 * Used by the ApiKeysView server component to generate permission definitions.
 *
 * Prefer the config attached to the given Payload instance (correct under
 * multiple plugin instances in one process); falls back to the module-level
 * value for backward compatibility when no payload is provided.
 */ export function getApiKeyPermissionsConfig(payload) {
    const scoped = payload?.__betterAuthApiKeyConfig;
    return scoped ?? apiKeyPermissionsConfig;
}
/**
 * Handle API key creation server-side.
 * Passes permissions directly from the client to Better Auth's server API.
 *
 * When `organizationId` is provided in the body, it is validated against the
 * user's memberships and stored in the API key's metadata. This allows the
 * `betterAuthStrategy` to resolve organization context for API key requests.
 */ async function handleApiKeyCreate(authApi, headers, body, payload, membersCollection = 'members') {
    try {
        // Get the current session to find the user. Read-only: this handler answers
        // with its own JSON Response, so a refreshed cookie would never reach the client.
        const session = await authApi.getSession({
            headers,
            query: {
                disableRefresh: true
            }
        });
        if (!session?.user?.id) {
            return new Response(JSON.stringify({
                error: 'Unauthorized'
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
        // If organizationId is provided, validate that the user is a member
        const organizationId = body.organizationId;
        if (organizationId && payload) {
            try {
                const memberships = await payload.find({
                    collection: membersCollection,
                    where: {
                        and: [
                            {
                                user: {
                                    equals: session.user.id
                                }
                            },
                            {
                                organization: {
                                    equals: organizationId
                                }
                            }
                        ]
                    },
                    limit: 1,
                    depth: 0
                });
                if (memberships.docs.length === 0) {
                    return new Response(JSON.stringify({
                        error: 'You are not a member of this organization'
                    }), {
                        status: 403,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                }
            } catch  {
            // Members collection might not exist — allow creation without org binding
            }
        }
        // Permissions come directly from the client in BA's native format
        const permissions = body.permissions;
        // Merge organizationId into metadata if provided
        const existingMetadata = body.metadata;
        const metadata = organizationId ? {
            ...existingMetadata || {},
            organizationId
        } : existingMetadata;
        const createOptions = {
            body: {
                name: body.name,
                userId: session.user.id,
                expiresIn: body.expiresIn,
                prefix: body.prefix,
                permissions: permissions && Object.keys(permissions).length > 0 ? permissions : undefined,
                metadata: metadata && Object.keys(metadata).length > 0 ? metadata : undefined
            }
        };
        // Call Better Auth's server-side API
        if (typeof authApi.createApiKey !== 'function') {
            return new Response(JSON.stringify({
                error: 'API key plugin not enabled'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
        const result = await authApi.createApiKey(createOptions);
        return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('[better-auth] API key creation error:', error);
        const message = error instanceof Error ? error.message : 'Failed to create API key';
        return new Response(JSON.stringify({
            error: message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
/**
 * Creates the auth endpoint handler that proxies requests to Better Auth.
 */ function createAuthEndpointHandler(adminOptions) {
    return async (req)=>{
        const payloadWithAuth = req.payload;
        const auth = payloadWithAuth.betterAuth;
        if (!auth) {
            return new Response(JSON.stringify({
                error: 'Better Auth not initialized'
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
        try {
            // Construct the full URL for Better Auth
            // PayloadRequest provides these properties
            // Prefer the configured Better Auth baseURL origin over client-supplied
            // headers. A spoofed `x-forwarded-proto`/`host` could otherwise influence
            // the URL Better Auth signs/validates against — affecting cookie
            // secure/domain decisions and OAuth callback/reset-link origins. Fall back
            // to headers only when no baseURL is configured (e.g. local dev).
            let protocol = req.headers.get('x-forwarded-proto') || 'http';
            let host = req.headers.get('host') || 'localhost';
            const baseUrlOption = auth.options?.baseURL;
            const baseUrlStr = typeof baseUrlOption === 'string' ? baseUrlOption : baseUrlOption?.fallback;
            if (baseUrlStr) {
                try {
                    const u = new URL(baseUrlStr);
                    protocol = u.protocol.replace(/:$/, '');
                    host = u.host;
                } catch  {
                // Malformed baseURL — keep the header-derived values.
                }
            }
            let pathname = req.pathname || '';
            if (!pathname) {
                // Fall back to parsing the path from the full URL when Payload didn't
                // populate `pathname` directly.
                const rawUrl = req.url;
                if (rawUrl) {
                    try {
                        pathname = new URL(rawUrl, `${protocol}://${host}`).pathname;
                    } catch  {
                    // leave pathname empty; handled by the fail-closed guard below
                    }
                }
            }
            // Fail closed on an unresolvable path. Proceeding with an empty pathname
            // would build `new URL('', base)` (the base origin — a wrong route) AND
            // make every `endsWith('/api-key/…')` guard below evaluate false, silently
            // disabling the api-key authorization gate while still forwarding to
            // auth.handler.
            if (!pathname || pathname === '/') {
                return new Response(JSON.stringify({
                    error: 'Bad request: could not resolve request path'
                }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
            const search = req.search || req.url?.split('?')[1] || '';
            const url = new URL(pathname, `${protocol}://${host}`);
            if (search) {
                url.search = search.startsWith('?') ? search : `?${search}`;
            }
            // Get request body for non-GET methods
            let body;
            let parsedBody;
            if (req.method && ![
                'GET',
                'HEAD'
            ].includes(req.method)) {
                try {
                    // Try to get body from request
                    if (typeof req.text === 'function') {
                        body = await req.text();
                        if (body) {
                            try {
                                parsedBody = JSON.parse(body);
                            } catch  {
                            // Not JSON, that's okay
                            }
                        }
                    } else if (req.data) {
                        parsedBody = req.data;
                        body = JSON.stringify(parsedBody);
                    }
                } catch  {
                    // Body might already be consumed, try data property
                    if (req.data) {
                        parsedBody = req.data;
                        body = JSON.stringify(parsedBody);
                    }
                }
            }
            // Guard API key mutation and list endpoints — require admin role
            const isApiKeyMutation = req.method === 'POST' && (pathname.endsWith('/api-key/create') || pathname.endsWith('/api-key/update') || pathname.endsWith('/api-key/delete'));
            const isApiKeyList = req.method === 'GET' && pathname.endsWith('/api-key/list');
            if (isApiKeyMutation || isApiKeyList) {
                // Authorization check only. The Response the client gets comes from Better
                // Auth's handler below (which does its own session refresh, with cookies
                // that reach the client) — a Set-Cookie attached here would be dropped, so
                // don't let this read extend the session row.
                const session = await auth.api.getSession({
                    headers: req.headers,
                    query: {
                        disableRefresh: true
                    }
                });
                if (!session?.user?.id) {
                    return new Response(JSON.stringify({
                        error: 'Unauthorized'
                    }), {
                        status: 401,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                }
                // Resolve required role: apiKey config > login config > default 'admin'.
                // Read the config from THIS request's payload instance (falls back to
                // the module value) so a second plugin instance can't relax the guard.
                const requiredRole = getApiKeyPermissionsConfig(req.payload)?.requiredRole ?? adminOptions?.login?.requiredRole ?? 'admin';
                if (requiredRole !== null) {
                    // Find the auth collection slug from Payload's config
                    const authSlug = req.payload.config.collections.find((c)=>typeof c.auth === 'object' || c.auth === true)?.slug ?? 'users';
                    const user = await req.payload.findByID({
                        collection: authSlug,
                        id: session.user.id,
                        depth: 0,
                        overrideAccess: true
                    });
                    if (!hasAnyRole(user, normalizeRoles(requiredRole))) {
                        return new Response(JSON.stringify({
                            error: 'Forbidden: insufficient permissions to manage API keys'
                        }), {
                            status: 403,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });
                    }
                }
            }
            // Intercept API key creation requests to inject userId from session
            const isApiKeyCreate = req.method === 'POST' && pathname.endsWith('/api-key/create');
            if (isApiKeyCreate && parsedBody) {
                return handleApiKeyCreate(auth.api, req.headers, parsedBody, req.payload);
            }
            // Create a new Request for Better Auth
            const request = new Request(url.toString(), {
                method: req.method || 'GET',
                headers: req.headers,
                body
            });
            const response = await auth.handler(request);
            return response;
        } catch (error) {
            console.error('[better-auth] Endpoint handler error:', error);
            return new Response(JSON.stringify({
                error: 'Internal server error'
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    };
}
/**
 * Generates Payload endpoints for Better Auth.
 */ function generateAuthEndpoints(basePath, adminOptions) {
    const handler = createAuthEndpointHandler(adminOptions);
    const methods = [
        'get',
        'post',
        'patch',
        'put',
        'delete'
    ];
    return methods.map((method)=>({
            path: `${basePath}/:path*`,
            method,
            handler
        }));
}
/**
 * Injects admin components into the Payload config when disableLocalStrategy is detected.
 */ function injectAdminComponents(config, options) {
    const authDetection = detectAuthConfig(config);
    // Skip if not using disableLocalStrategy or auto-injection is disabled
    if (!authDetection.hasDisableLocalStrategy || options.autoInjectAdminComponents === false) {
        return config;
    }
    const adminOptions = options.admin ?? {};
    const existingComponents = config.admin?.components ?? {};
    // Build logout button config
    const logoutButton = adminOptions.disableLogoutButton ? existingComponents.logout?.Button : adminOptions.logoutButtonComponent ?? '@delmaredigital/payload-better-auth/components#LogoutButton';
    // Build beforeLogin config. Payload renders `beforeLogin` inside its OWN
    // login view — which this plugin replaces below unless `disableLoginView` is
    // set. Injecting it alongside the replacement made `beforeLoginComponent` a
    // dead extension point (never rendered, no error), so only inject when
    // Payload's login view actually survives.
    const existingBeforeLogin = existingComponents.beforeLogin ?? [];
    const injectBeforeLogin = !adminOptions.disableBeforeLogin && adminOptions.disableLoginView === true;
    // Dropping a component the consumer explicitly asked for is worth a word —
    // it never rendered, but silence makes that look like a bug in their code.
    if (adminOptions.beforeLoginComponent && !adminOptions.disableBeforeLogin && adminOptions.disableLoginView !== true) {
        console.warn('[payload-better-auth] admin.beforeLoginComponent was not injected: Payload renders ' + '`beforeLogin` inside its own login view, which this plugin replaces. Set ' + '`admin.disableLoginView: true` to keep that view (and the component), or render your ' + 'content from `admin.login` options on the plugin\'s login view instead.');
    }
    const beforeLogin = injectBeforeLogin ? [
        ...Array.isArray(existingBeforeLogin) ? existingBeforeLogin : [
            existingBeforeLogin
        ],
        adminOptions.beforeLoginComponent ?? '@delmaredigital/payload-better-auth/components#BeforeLogin'
    ] : existingBeforeLogin;
    // Build login view config
    const existingViews = existingComponents.views ?? {};
    const newLoginView = adminOptions.disableLoginView ? undefined : {
        Component: adminOptions.loginViewComponent ?? '@delmaredigital/payload-better-auth/rsc#LoginViewWrapper',
        path: '/login'
    };
    const views = {
        ...existingViews,
        ...newLoginView ? {
            login: newLoginView
        } : {}
    };
    // Store login config in config.custom for the RSC wrapper to read
    const loginConfig = adminOptions.login ?? {};
    // Note: enabledPlugins will be added by injectManagementComponents
    return {
        ...config,
        custom: {
            ...config.custom,
            betterAuth: {
                ...config.custom?.betterAuth,
                login: loginConfig
            }
        },
        admin: {
            ...config.admin,
            components: {
                ...existingComponents,
                logout: logoutButton ? {
                    ...typeof existingComponents.logout === 'object' ? existingComponents.logout : {},
                    Button: logoutButton
                } : existingComponents.logout,
                beforeLogin,
                views
            }
        }
    };
}
/**
 * Injects management UI components into the Payload config based on enabled plugins.
 *
 * - 2FA and Passkeys are injected as `ui` fields on the auth collection (per-user settings)
 * - API Keys remain as a sidebar admin view (admin-level feature)
 */ function injectManagementComponents(config, options) {
    const adminOptions = options.admin ?? {};
    // Skip if management UI is disabled
    if (adminOptions.enableManagementUI === false) {
        return config;
    }
    // Detect which plugins are enabled
    const enabledPlugins = detectEnabledPlugins(adminOptions.betterAuthOptions);
    // Get custom paths or use defaults
    const paths = {
        apiKeys: adminOptions.managementPaths?.apiKeys ?? '/security/api-keys'
    };
    const existingComponents = config.admin?.components ?? {};
    const existingViews = existingComponents.views ?? {};
    const existingAfterNavLinks = existingComponents.afterNavLinks ?? [];
    // Build management views — only API Keys stays as a sidebar view
    const managementViews = {};
    if (enabledPlugins.hasApiKey) {
        managementViews.securityApiKeys = {
            Component: '@delmaredigital/payload-better-auth/rsc/api-key#ApiKeysView',
            path: paths.apiKeys
        };
    }
    // Only add nav links if API Keys is enabled
    const afterNavLinks = enabledPlugins.hasApiKey ? [
        ...Array.isArray(existingAfterNavLinks) ? existingAfterNavLinks : [
            existingAfterNavLinks
        ],
        {
            path: '@delmaredigital/payload-better-auth/components/management#SecurityNavLinks',
            clientProps: {
                showApiKeys: enabledPlugins.hasApiKey
            }
        }
    ] : existingAfterNavLinks;
    // Inject 2FA and Passkeys as ui fields on the auth collection
    const securityFields = [];
    if (enabledPlugins.hasTwoFactor) {
        securityFields.push({
            type: 'ui',
            name: 'twoFactorManagement',
            label: 'Two-Factor Authentication',
            admin: {
                components: {
                    Field: '@delmaredigital/payload-better-auth/components#TwoFactorField'
                }
            }
        });
    }
    if (enabledPlugins.hasPasskey) {
        securityFields.push({
            type: 'ui',
            name: 'passkeysManagement',
            label: 'Passkeys',
            admin: {
                components: {
                    Field: '@delmaredigital/payload-better-auth/components/passkey#PasskeysField'
                }
            }
        });
    }
    // Add ui fields to the auth collection
    const collections = (config.collections ?? []).map((collection)=>{
        const isAuthCollection = collection.auth === true || typeof collection.auth === 'object' && collection.auth.disableLocalStrategy;
        if (!isAuthCollection || securityFields.length === 0) return collection;
        return {
            ...collection,
            fields: [
                ...collection.fields ?? [],
                ...securityFields
            ]
        };
    });
    return {
        ...config,
        collections,
        admin: {
            ...config.admin,
            components: {
                ...existingComponents,
                views: {
                    ...existingViews,
                    ...managementViews
                },
                afterNavLinks
            }
        }
    };
}
/**
 * Payload plugin that initializes Better Auth.
 *
 * Better Auth is created in onInit (after Payload is ready) to avoid
 * circular dependency issues. The auth instance is then attached to
 * payload.betterAuth for access throughout the app.
 *
 * Features:
 * - Auto-registers auth API endpoints (configurable)
 * - Auto-injects admin components when disableLocalStrategy is detected
 * - Auto-injects management UI for security features based on enabled plugins
 * - Handles HMR gracefully
 *
 * @example
 * ```ts
 * import { createBetterAuthPlugin } from '@delmaredigital/payload-better-auth/plugin'
 *
 * export default buildConfig({
 *   plugins: [
 *     createBetterAuthPlugin({
 *       createAuth: (payload) => betterAuth({
 *         database: payloadAdapter({ payloadClient: payload, ... }),
 *         // ... other options
 *       }),
 *     }),
 *   ],
 * })
 * ```
 */ export function createBetterAuthPlugin(options) {
    const { createAuth, authBasePath = '/auth', autoRegisterEndpoints = true, autoInjectAdminComponents = true } = options;
    // Store API key permissions config for access by management views
    apiKeyPermissionsConfig = options.admin?.apiKey;
    return (incomingConfig)=>{
        // Inject admin components if enabled
        let config = autoInjectAdminComponents ? injectAdminComponents(incomingConfig, options) : incomingConfig;
        // Inject management UI components
        config = injectManagementComponents(config, options);
        // Expose the auth mount segment to components so they can build URLs that
        // respect a non-default `routes.api`: `config.custom` for server components
        // (the RSC login wrappers) and `admin.custom` for client components —
        // root-level `custom` is server-only and never reaches the browser.
        config = {
            ...config,
            custom: {
                ...config.custom,
                betterAuth: {
                    ...config.custom?.betterAuth,
                    authBasePath
                }
            },
            admin: {
                ...config.admin,
                custom: {
                    ...config.admin?.custom,
                    betterAuth: {
                        ...config.admin?.custom?.betterAuth,
                        authBasePath
                    }
                }
            }
        };
        // Generate auth endpoints if enabled
        const authEndpoints = autoRegisterEndpoints ? generateAuthEndpoints(authBasePath, options.admin) : [];
        // Merge endpoints
        const existingEndpoints = config.endpoints ?? [];
        // Get existing onInit
        const existingOnInit = config.onInit;
        return {
            ...config,
            endpoints: [
                ...existingEndpoints,
                ...authEndpoints
            ],
            onInit: async (payload)=>{
                if (existingOnInit) {
                    await existingOnInit(payload);
                }
                // Check if already attached (HMR scenario)
                if ('betterAuth' in payload) {
                    return;
                }
                // Create an auth instance bound to THIS payload. Do NOT reuse a
                // module-level singleton across instances: a second Payload instance
                // (monorepo dev server, multi-tenant, parallel tests) would otherwise be
                // handed the first instance's auth — bound to the wrong DB adapter, so
                // sessions validate against the wrong data store.
                let auth;
                try {
                    auth = createAuth(payload);
                } catch (error) {
                    console.error('[better-auth] Failed to create auth:', error);
                    throw error;
                }
                authInstance = auth; // retained only as an HMR/back-compat reference
                // Warn if nextCookies() plugin is detected — it's incompatible with Payload CMS.
                // Check via betterAuthOptions (if provided) or the auth instance's options.
                const pluginsToCheck = options.admin?.betterAuthOptions?.plugins ?? auth.options?.plugins;
                if (pluginsToCheck?.some((p)=>p.id === 'next-cookies')) {
                    console.warn('\n⚠️  [payload-better-auth] The nextCookies() plugin was detected in your Better Auth config.\n' + '   This plugin is INCOMPATIBLE with Payload CMS and will cause infinite form-state\n' + '   submissions and input resets in the admin panel.\n\n' + '   The nextCookies() plugin is designed for Server Actions, but payload-better-auth\n' + '   handles cookie passthrough automatically via its endpoint proxy.\n\n' + '   → Remove nextCookies() from your Better Auth plugins to fix this issue.\n' + '   → See: https://github.com/delmaredigital/payload-better-auth/issues/15\n');
                }
                // Better Auth's router 404s any request whose pathname doesn't start
                // with its own `basePath` (default '/api/auth'), while this plugin
                // mounts the endpoints at `routes.api` + `authBasePath`. With a
                // non-default `routes.api` the two silently diverge and every auth
                // request dies as a bodyless 404 — so compare them here and name the
                // exact value to set. `basePath` also decides the path Better Auth
                // embeds in emailed links (password reset, magic links), so a mismatch
                // produces dead links even where requests happen to route.
                if (autoRegisterEndpoints) {
                    const expectedBasePath = `${payload.config.routes?.api ?? '/api'}${authBasePath}`;
                    const configuredBasePath = auth.options?.basePath ?? '/api/auth';
                    const normalize = (p)=>p.replace(/\/+$/, '') || '/';
                    if (normalize(configuredBasePath) !== normalize(expectedBasePath)) {
                        console.error('\n❌ [payload-better-auth] Better Auth basePath mismatch — auth requests will 404.\n' + `   This plugin serves Better Auth at "${expectedBasePath}/*" (Payload's routes.api +\n` + `   the plugin's authBasePath), but Better Auth's basePath resolves to\n` + `   "${configuredBasePath}" and its router rejects every request outside that path\n` + '   with an empty 404 — the admin login cannot sign in. Emailed links (password\n' + '   reset, magic links) are also built from basePath, so they would point at the\n' + '   wrong path even when requests get through.\n\n' + `   → Fix: pass basePath: '${expectedBasePath}' to betterAuth() inside your createAuth.\n`);
                    }
                }
                // Attach to payload for global access
                Object.defineProperty(payload, 'betterAuth', {
                    value: auth,
                    writable: false,
                    enumerable: false,
                    configurable: false
                });
                // Store the api-key permissions config on the payload instance (not just
                // the module singleton) so the endpoint guard and management view resolve
                // THIS instance's config rather than the last plugin's to initialize.
                Object.defineProperty(payload, '__betterAuthApiKeyConfig', {
                    value: options.admin?.apiKey,
                    writable: false,
                    enumerable: false,
                    configurable: true
                });
            }
        };
    };
}
/**
 * Flatten an API key's stored permissions map into `resource:action` scope strings.
 *
 * Better Auth stores API key permissions as `{ resource: [action, ...] }` (e.g.
 * `{ inquiries: ['write'], invoices: ['read', 'write'] }`). This converts that to a
 * flat list (`['inquiries:write', 'invoices:read', 'invoices:write']`) so it can be
 * attached to `req.user` symmetrically with the JWT/OAuth `scope` claim.
 *
 * Tolerates both the raw JSON-string form (how Payload stores the `permissions` text
 * field, and what reading the row directly returns) and the already-parsed object form.
 * Returns `[]` for absent, empty, or malformed permissions so callers can always treat
 * the result as an array.
 */ export function apiKeyPermissionsToScopes(permissions) {
    if (!permissions) return [];
    let perms = permissions;
    if (typeof perms === 'string') {
        try {
            perms = JSON.parse(perms);
        } catch  {
            return [];
        }
    }
    if (typeof perms !== 'object' || perms === null || Array.isArray(perms)) return [];
    const scopes = [];
    for (const [resource, actions] of Object.entries(perms)){
        if (!Array.isArray(actions)) continue;
        for (const action of actions){
            if (typeof action === 'string') scopes.push(`${resource}:${action}`);
        }
    }
    return scopes;
}
/**
 * Payload auth strategy that uses Better Auth for authentication.
 *
 * Use this in your Users collection to authenticate via Better Auth sessions.
 *
 * Session fields (like `activeOrganizationId` from the organization plugin) are
 * automatically merged onto `req.user`, making them available in access control functions.
 *
 * If an active organization is set, the user's role in that organization is also
 * fetched and available as `req.user.organizationRole`.
 *
 * @example
 * ```ts
 * import { betterAuthStrategy } from '@delmaredigital/payload-better-auth/plugin'
 *
 * export const Users: CollectionConfig = {
 *   slug: 'users',
 *   auth: {
 *     disableLocalStrategy: true,
 *     strategies: [betterAuthStrategy()],
 *   },
 *   // ...
 * }
 * ```
 *
 * @example Access control with organization data
 * ```ts
 * // In your access control:
 * export const orgReadAccess: Access = ({ req }) => {
 *   if (!req.user?.activeOrganizationId) return false
 *   return {
 *     organization: { equals: req.user.activeOrganizationId }
 *   }
 * }
 * ```
 */ export function betterAuthStrategy(options = {}) {
    const { usersCollection = 'users', membersCollection = 'members', apiKeysCollection = 'apikeys', idType = 'number' } = options;
    return {
        name: 'better-auth',
        authenticate: async ({ payload, headers, canSetHeaders })=>{
            let responseHeadersResult;
            try {
                const payloadWithAuth = payload;
                const auth = payloadWithAuth.betterAuth;
                if (!auth) {
                    console.error('Better Auth not initialized on payload instance');
                    return {
                        user: null
                    };
                }
                const { response: sessionData, headers: sessionHeaders } = await auth.api.getSession({
                    headers,
                    returnHeaders: true,
                    query: canSetHeaders ? undefined : {
                        disableRefresh: true
                    }
                });
                if (canSetHeaders) {
                    const responseHeaders = new Headers();
                    for (const cookie of sessionHeaders?.getSetCookie() ?? []){
                        responseHeaders.append('set-cookie', cookie);
                    }
                    if (responseHeaders.has('set-cookie')) {
                        responseHeadersResult = {
                            responseHeaders
                        };
                    }
                }
                if (!sessionData?.user?.id) {
                    // No session found — check for OAuth JWT Bearer token
                    const authHeader = headers.get('authorization');
                    if (authHeader?.startsWith('Bearer ')) {
                        const token = authHeader.slice(7);
                        // Try OAuth JWT verification via the oauth-provider's verifyAccessToken
                        try {
                            // Better Auth 1.7 split `verifyAccessToken` into `verifyBearerToken`
                            // (raw token, bearer only) and `verifyAccessTokenRequest` (full
                            // request, also handles DPoP sender-constrained tokens). We hold a
                            // raw token lifted from the Authorization header, and Payload's
                            // auth strategy is only handed `headers` — no method/URL — so the
                            // bearer form is the one we can satisfy. DPoP-bound tokens are
                            // rejected here by design.
                            const { verifyBearerToken } = await import('better-auth/oauth2');
                            const baseURL = auth.options?.baseURL;
                            const basePath = auth.options?.basePath || '/api/auth';
                            if (!baseURL) throw new Error('baseURL not configured');
                            // issuer = baseURL + basePath (e.g., https://example.com/api/auth)
                            // audience = baseURL (e.g., https://example.com) — the resource server
                            // jwks = issuer + /jwks
                            const issuer = `${baseURL}${basePath}`;
                            const jwtPayload = await verifyBearerToken(token, {
                                jwksUrl: `${issuer}/jwks`,
                                verifyOptions: {
                                    issuer,
                                    audience: baseURL
                                }
                            });
                            if (jwtPayload?.sub) {
                                const users = await payload.find({
                                    collection: usersCollection,
                                    where: {
                                        id: {
                                            equals: jwtPayload.sub
                                        }
                                    },
                                    limit: 1,
                                    depth: 0
                                });
                                if (users.docs.length > 0) {
                                    // Extract org context and scopes from JWT claims
                                    const oauthOrgId = jwtPayload.organizationId;
                                    const oauthScopes = typeof jwtPayload.scope === 'string' ? jwtPayload.scope.split(' ') : Array.isArray(jwtPayload.scope) ? jwtPayload.scope : [];
                                    // Look up org role if orgId is present
                                    let orgRole;
                                    if (oauthOrgId) {
                                        try {
                                            const memberships = await payload.find({
                                                collection: membersCollection,
                                                where: {
                                                    and: [
                                                        {
                                                            user: {
                                                                equals: jwtPayload.sub
                                                            }
                                                        },
                                                        {
                                                            organization: {
                                                                equals: oauthOrgId
                                                            }
                                                        }
                                                    ]
                                                },
                                                limit: 1,
                                                depth: 0
                                            });
                                            if (memberships.docs.length > 0) {
                                                orgRole = memberships.docs[0].role;
                                            }
                                        } catch  {
                                        // Members collection might not exist
                                        }
                                    }
                                    const userDoc = users.docs[0];
                                    const oauthUser = {
                                        ...userDoc,
                                        id: userDoc.id,
                                        oauthScopes,
                                        collection: usersCollection,
                                        _strategy: 'better-auth',
                                        ...oauthOrgId ? {
                                            activeOrganizationId: oauthOrgId
                                        } : {},
                                        ...orgRole ? {
                                            organizationRole: orgRole
                                        } : {}
                                    };
                                    return {
                                        ...responseHeadersResult ?? {},
                                        user: oauthUser
                                    };
                                }
                            }
                        } catch  {
                        // JWT verification failed — token is not a valid OAuth JWT
                        // Per Better Auth docs: "only accept JWT-formatted access tokens for your API"
                        // Opaque tokens should be handled via the /oauth2/introspect endpoint if needed
                        }
                    }
                    return {
                        ...responseHeadersResult ?? {},
                        user: null
                    };
                }
                const users = await payload.find({
                    collection: usersCollection,
                    where: {
                        id: {
                            equals: sessionData.user.id
                        }
                    },
                    limit: 1,
                    depth: 0
                });
                if (users.docs.length === 0) {
                    return {
                        ...responseHeadersResult ?? {},
                        user: null
                    };
                }
                // Extract session fields to merge onto user (e.g., activeOrganizationId from org plugin)
                // Exclude fields that might conflict with user fields
                const { id: _sessionId, userId: _userId, expiresAt: _expiresAt, token: _token, ...sessionFields } = sessionData.session || {};
                // Coerce string IDs in session fields to numbers when using serial IDs.
                // BA's api.getSession() always returns strings, but Payload relationship
                // fields expect numbers for serial IDs.
                if (idType === 'number') {
                    for (const [key, value] of Object.entries(sessionFields)){
                        if (typeof value !== 'string') continue;
                        if (key === 'id' || /(?:Id|_id)$/.test(key)) {
                            if (/^\d+$/.test(value)) {
                                sessionFields[key] = parseInt(value, 10);
                            }
                        }
                    }
                }
                // If there's an active organization, fetch the user's role in that org
                let organizationRole;
                if (sessionFields.activeOrganizationId) {
                    try {
                        const memberships = await payload.find({
                            collection: membersCollection,
                            where: {
                                and: [
                                    {
                                        user: {
                                            equals: sessionData.user.id
                                        }
                                    },
                                    {
                                        organization: {
                                            equals: sessionFields.activeOrganizationId
                                        }
                                    }
                                ]
                            },
                            limit: 1,
                            depth: 0
                        });
                        if (memberships.docs.length > 0) {
                            organizationRole = memberships.docs[0].role;
                        }
                    } catch  {
                    // Members collection might not exist (org plugin not used), silently ignore
                    }
                }
                // For API-key requests, resolve scopes and organization context by reading the
                // API key row DIRECTLY. The api-key plugin's mock session sets `session.id` to
                // the API key's row id, so we can look it up without calling `verifyApiKey`.
                //
                // This deliberately avoids `verifyApiKey`, which is NOT a read: it consumes the
                // key's usage quota (`remaining`) and a rate-limit slot, and can delete the key
                // on exhaustion/expiry. `getSession()` above already validated the key once; a
                // second consuming call per request would double-count quota and rate limits.
                //
                // `apiKeyScopes` stays `undefined` for non-API-key requests so consumers can
                // distinguish "key with no scopes" ([]) from "not an API key" (undefined).
                //
                // Transport: whether a header is treated as an API key is decided by Better
                // Auth's api-key plugin inside `getSession()` above, not here. By default that
                // plugin reads ONLY `x-api-key`; `Authorization: Bearer <key>` is a session or
                // OAuth token to Better Auth and yields no session unless the app configured
                // `apiKeyHeaders` / `customAPIKeyGetter` to accept it. The `authorization`
                // fallback below only matters for apps that did so — with a default
                // configuration the row lookup finds nothing for a Bearer value and this
                // request carries no scopes.
                let apiKeyScopes;
                const apiKeyHeader = headers.get('x-api-key') || headers.get('authorization')?.replace('Bearer ', '');
                const sessionId = sessionData.session?.id;
                if (apiKeyHeader && sessionId != null) {
                    // The mock-session id is the API key row id. Coerce for serial IDs.
                    let apiKeyId = sessionId;
                    if (idType === 'number' && typeof apiKeyId === 'string' && /^\d+$/.test(apiKeyId)) {
                        apiKeyId = parseInt(apiKeyId, 10);
                    }
                    try {
                        // Bind the lookup to the authenticated user. The mock-session id and a
                        // cookie-session id can collide (separate Payload collections, independent
                        // serial sequences), so an attacker could attach `Authorization: Bearer x`
                        // to a cookie request to coerce a lookup of an arbitrary key id. Requiring
                        // `referenceId === sessionData.user.id` ensures we only ever read a key the
                        // session's user owns — for a genuine api-key session this always holds,
                        // because Better Auth mints the mock session's user from the key's
                        // referenceId. A colliding cookie session belonging to another user simply
                        // finds no row.
                        const apiKeyRows = await payload.find({
                            collection: apiKeysCollection,
                            where: {
                                and: [
                                    {
                                        id: {
                                            equals: apiKeyId
                                        }
                                    },
                                    {
                                        referenceId: {
                                            equals: sessionData.user.id
                                        }
                                    }
                                ]
                            },
                            limit: 1,
                            depth: 0
                        });
                        if (apiKeyRows.docs.length > 0) {
                            const apiKeyDoc = apiKeyRows.docs[0];
                            // Scopes: always derive (defaults to [] when the key has no permissions).
                            apiKeyScopes = apiKeyPermissionsToScopes(apiKeyDoc.permissions);
                            // Org context: only resolve from metadata when not already set by the
                            // session (the org plugin sets activeOrganizationId on real sessions).
                            if (!sessionFields.activeOrganizationId && apiKeyDoc.metadata) {
                                const metadata = typeof apiKeyDoc.metadata === 'string' ? JSON.parse(apiKeyDoc.metadata) : apiKeyDoc.metadata;
                                if (metadata?.organizationId) {
                                    // Coerce to number if using serial IDs
                                    let orgId = metadata.organizationId;
                                    if (idType === 'number' && typeof orgId === 'string' && /^\d+$/.test(orgId)) {
                                        orgId = parseInt(orgId, 10);
                                    }
                                    // Verify the user is actually a member of this org
                                    try {
                                        const memberships = await payload.find({
                                            collection: membersCollection,
                                            where: {
                                                and: [
                                                    {
                                                        user: {
                                                            equals: sessionData.user.id
                                                        }
                                                    },
                                                    {
                                                        organization: {
                                                            equals: orgId
                                                        }
                                                    }
                                                ]
                                            },
                                            limit: 1,
                                            depth: 0
                                        });
                                        if (memberships.docs.length > 0) {
                                            sessionFields.activeOrganizationId = orgId;
                                            organizationRole = memberships.docs[0].role;
                                        }
                                    } catch  {
                                    // Members collection might not exist, continue without org context
                                    }
                                }
                            }
                        }
                    } catch  {
                    // API keys collection might not exist, or the id was a regular session id
                    // (no matching row) — continue without org/scope context.
                    }
                }
                return {
                    ...responseHeadersResult ?? {},
                    user: {
                        ...users.docs[0],
                        ...sessionFields,
                        ...organizationRole && {
                            organizationRole
                        },
                        // API-key scopes, mirroring oauthScopes on the JWT path. `[]` for a key with
                        // no permissions; absent entirely for non-API-key requests.
                        ...apiKeyScopes && {
                            apiKeyScopes
                        },
                        collection: usersCollection,
                        _strategy: 'better-auth'
                    }
                };
            } catch (error) {
                console.error('Better Auth strategy error:', error);
                return {
                    ...responseHeadersResult ?? {},
                    user: null
                };
            }
        }
    };
}
/**
 * Reset the auth instance (useful for testing)
 */ export function resetAuthInstance() {
    authInstance = null;
}
