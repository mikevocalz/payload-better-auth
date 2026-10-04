/**
 * Payload Plugins for Better Auth
 *
 * @packageDocumentation
 */
import type { Plugin, AuthStrategy, BasePayload } from 'payload';
import type { betterAuth, BetterAuthOptions } from 'better-auth';
import type { ApiKeyPermissionsConfig } from '../types/apiKey.js';
export type Auth = ReturnType<typeof betterAuth>;
export type { PayloadWithAuth } from '../types/betterAuth.js';
export type CreateAuthFunction = (payload: BasePayload) => any;
export type BetterAuthPluginAdminOptions = {
    /** Disable auto-injection of logout button */
    disableLogoutButton?: boolean;
    /** Disable auto-injection of BeforeLogin redirect */
    disableBeforeLogin?: boolean;
    /** Disable auto-injection of login view */
    disableLoginView?: boolean;
    /** Login page customization */
    login?: {
        /** Custom title for login page */
        title?: string;
        /** Path to redirect after successful login. Default: '/admin' */
        afterLoginPath?: string;
        /**
         * Required role(s) for admin access.
         * - string: Single role required (default: 'admin')
         * - string[]: Multiple roles (behavior depends on requireAllRoles)
         * - null: Disable role checking
         */
        requiredRole?: string | string[] | null;
        /**
         * When requiredRole is an array, require ALL roles (true) or ANY role (false).
         * Default: false (any matching role grants access)
         */
        requireAllRoles?: boolean;
        /**
         * Enable passkey (WebAuthn) sign-in option.
         * - true: Always show passkey button
         * - false: Never show passkey button
         * - 'auto': Auto-detect if passkey plugin is available (default for LoginView)
         * Default: false (for backwards compatibility)
         */
        enablePasskey?: boolean | 'auto';
        /**
         * Enable user registration (sign up) option.
         * - true: Always show "Create account" link
         * - false: Never show registration option
         * - 'auto': Auto-detect if sign-up endpoint is available
         * Default: 'auto' - LoginView automatically detects if Better Auth has signup enabled
         */
        enableSignUp?: boolean | 'auto';
        /**
         * Default role to assign to new users during registration.
         * Only used when enableSignUp is enabled.
         * Default: 'user'
         */
        defaultSignUpRole?: string;
        /**
         * Enable forgot password option.
         * - true: Always show "Forgot password?" link
         * - false: Never show forgot password option
         * - 'auto': Auto-detect if password reset endpoint is available
         * Default: 'auto' - LoginView automatically detects if Better Auth has password reset enabled
         */
        enableForgotPassword?: boolean | 'auto';
        /**
         * Custom URL for password reset page. If provided, users will be redirected here
         * instead of showing the inline password reset form.
         */
        resetPasswordUrl?: string;
        /**
         * Enable email + password sign-in.
         * - true: Always show the password field
         * - false: Hide the password field (passwordless-only)
         * - 'auto': Auto-detect via the /sign-in/email endpoint
         * Default: 'auto' - LoginView hides the password field when the email/password
         * strategy is disabled in Better Auth.
         */
        enablePassword?: boolean | 'auto';
        /**
         * Enable magic-link sign-in ("email me a link").
         * - true: Always show the magic-link option
         * - false: Never show it
         * - 'auto': Auto-detect via the /sign-in/magic-link endpoint
         * Default: 'auto' - requires the Better Auth magicLink() plugin.
         */
        enableMagicLink?: boolean | 'auto';
        /**
         * Enable email-OTP sign-in ("email me a code").
         * - true: Always show the email-OTP option
         * - false: Never show it
         * - 'auto': Auto-detect via the /email-otp/send-verification-otp endpoint
         * Default: 'auto' - requires the Better Auth emailOTP() plugin.
         */
        enableEmailOtp?: boolean | 'auto';
        /**
         * Offer "use a backup code" on the login form's two-factor step.
         * - 'auto': available iff the twoFactor plugin is detected.
         * Default: 'auto'.
         */
        enableTwoFactorBackupCode?: boolean | 'auto';
        /**
         * Offer "email me a code" on the login form's two-factor step.
         * - 'auto': available iff the twoFactor plugin is configured with
         *   `otpOptions.sendOTP`.
         * Default: 'auto'.
         */
        enableTwoFactorEmailOtp?: boolean | 'auto';
        /**
         * Where the emailed magic link returns after verification.
         * Default: afterLoginPath
         */
        magicLinkCallbackURL?: string;
        /**
         * Enable social / OAuth provider sign-in buttons on the admin login.
         * - false (default): no social buttons.
         * - true: a button for every provider configured in Better Auth's `socialProviders`.
         * - string[]: only these provider ids (intersected with what's configured).
         *
         * Opt-in by design: `socialProviders` is global Better Auth config (often meant for your
         * public app), and surfacing it on the admin login lets anyone create a (non-admin) user
         * row. See the docs note on Better Auth's `disableImplicitSignUp`. There is no 'auto'.
         */
        enableSocial?: boolean | string[];
        /**
         * Where a successful social sign-in returns. Default: the admin login page itself, so the
         * built-in session check + role gate run (a non-admin lands on Access Denied, not /admin).
         * Override only to bypass that round-trip. Errors always return to the login page.
         */
        socialCallbackURL?: string;
    };
    /** Path to custom logout button component (import map format) */
    logoutButtonComponent?: string;
    /** Path to custom BeforeLogin component (import map format) */
    beforeLoginComponent?: string;
    /** Path to custom login view component (import map format) */
    loginViewComponent?: string;
    /**
     * Enable management UI for security features (2FA, API keys).
     * Management views are auto-injected based on which Better Auth plugins are enabled.
     * @default true
     */
    enableManagementUI?: boolean;
    /**
     * Better Auth options - used to detect which plugins are enabled.
     * Required for management UI to auto-detect enabled features.
     */
    betterAuthOptions?: Partial<BetterAuthOptions>;
    /** Custom paths for management views */
    managementPaths?: {
        /** Two-factor management view path. Default: '/security/two-factor' */
        twoFactor?: string;
        /** API keys management view path. Default: '/security/api-keys' */
        apiKeys?: string;
        /** Passkeys management view path. Default: '/security/passkeys' */
        passkeys?: string;
    };
    /**
     * API key permissions configuration.
     * Controls which permissions are available when creating API keys.
     * When not provided, permissions are auto-generated from Payload collections.
     */
    apiKey?: ApiKeyPermissionsConfig;
};
export type BetterAuthPluginOptions = {
    /**
     * Function that creates the Better Auth instance.
     * Called during Payload's onInit lifecycle.
     */
    createAuth: CreateAuthFunction;
    /**
     * Base path for auth API endpoints (registered via Payload endpoints).
     * Payload serves them under `routes.api`, so the full mount is
     * `${routes.api}${authBasePath}` (default: `/api/auth`).
     *
     * Better Auth's own `basePath` must match that full mount — its router 404s
     * anything outside it. With the defaults they agree; if you change
     * `routes.api` (or this option), pass `basePath: '<routes.api><authBasePath>'`
     * to `betterAuth()` in your `createAuth`. The plugin verifies this at init
     * and logs the exact value to set when they diverge.
     * @default '/auth'
     */
    authBasePath?: string;
    /**
     * Auto-register auth API endpoints via Payload's endpoint system.
     * Set to false if you need custom route-level handling (rare).
     * Note: All Better Auth customization (hooks, plugins, callbacks)
     * is done in createAuth - the route handler is just a passthrough.
     * @default true
     */
    autoRegisterEndpoints?: boolean;
    /**
     * Auto-inject admin components when disableLocalStrategy is detected.
     * @default true
     */
    autoInjectAdminComponents?: boolean;
    /**
     * Admin UI customization options.
     */
    admin?: BetterAuthPluginAdminOptions;
};
/**
 * Get the stored API key permissions config.
 * Used by the ApiKeysView server component to generate permission definitions.
 *
 * Prefer the config attached to the given Payload instance (correct under
 * multiple plugin instances in one process); falls back to the module-level
 * value for backward compatibility when no payload is provided.
 */
export declare function getApiKeyPermissionsConfig(payload?: unknown): ApiKeyPermissionsConfig | undefined;
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
 */
export declare function createBetterAuthPlugin(options: BetterAuthPluginOptions): Plugin;
export type BetterAuthStrategyOptions = {
    /**
     * The collection slug for users
     * @default 'users'
     */
    usersCollection?: string;
    /**
     * The collection slug for organization members (used for organization role lookup)
     * @default 'members'
     */
    membersCollection?: string;
    /**
     * The collection slug for API keys (used to resolve an API key's scopes and
     * organization metadata directly from the row, without consuming the key's
     * usage quota or rate-limit budget).
     *
     * Note on transport: Better Auth's api-key plugin authenticates keys sent as
     * `x-api-key` by default. `Authorization: Bearer <key>` is only recognised as an
     * API key if the app configures the plugin's `apiKeyHeaders` or
     * `customAPIKeyGetter`; otherwise such a request authenticates as nobody.
     *
     * Must match the slug generated by `betterAuthCollections()` — `'apikeys'` when
     * collections are pluralized (the default), or `'apikey'` when `usePlural: false`.
     *
     * @default 'apikeys'
     */
    apiKeysCollection?: string;
    /**
     * ID type strategy matching your adapter's `adapterConfig.idType`.
     *
     * When `'number'` (default), coerces string IDs in session fields
     * (e.g., `activeOrganizationId`) to numbers before merging onto `req.user`.
     * Better Auth always returns string IDs from `api.getSession()`, but Payload
     * relationship fields expect numbers when using serial IDs.
     *
     * @default 'number'
     */
    idType?: 'number' | 'text';
};
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
 */
export declare function apiKeyPermissionsToScopes(permissions: unknown): string[];
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
 */
export declare function betterAuthStrategy(options?: BetterAuthStrategyOptions): AuthStrategy;
/**
 * Reset the auth instance (useful for testing)
 */
export declare function resetAuthInstance(): void;
