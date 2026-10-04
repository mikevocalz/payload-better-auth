/** Default mount segment under Payload's `routes.api` (plugin option `authBasePath`). */
export declare const DEFAULT_AUTH_BASE_PATH = "/auth";
/**
 * Path where the plugin mounts Better Auth's endpoints, derived from the live
 * Payload config: `routes.api` + the plugin's `authBasePath` (e.g.
 * `/api/payload/auth` when `routes.api` is `/api/payload`). Every client
 * component must build its auth URLs from this — a hardcoded `/api/auth` is
 * only correct when `routes.api` is the default `/api`.
 *
 * `authBasePath` is read from `admin.custom.betterAuth` (set by
 * `createBetterAuthPlugin`; `custom` at the config root never reaches the
 * browser). The unauthenticated login page gets a stripped client config
 * without `admin.custom`, so callers rendered there (LoginView) accept the
 * value as a prop resolved server-side; the default `/auth` needs no override.
 */
export declare function useAuthMountPath(authBasePath?: string): string;
/**
 * Absolute `baseURL` for `createAuthClient()` pointing at the mounted
 * endpoints. Better Auth's client requires a protocol on `baseURL` (a bare
 * path throws), so this returns `undefined` during SSR — components only
 * exercise the client in the browser, where the next render provides the URL.
 */
export declare function useAuthClientBaseURL(authBasePath?: string): string | undefined;
