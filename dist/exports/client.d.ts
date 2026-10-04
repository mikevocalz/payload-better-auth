/**
 * Client-side auth utilities
 * Re-exports createAuthClient from better-auth/react and core plugins
 *
 * NOTE: Only plugins from the core `better-auth` package are statically imported here.
 * Optional peer dep plugins (passkey, apiKey, etc.) must NOT be statically imported
 * because webpack resolves all static imports at build time, breaking consumers
 * who don't have those packages installed.
 */
import { createAuthClient } from 'better-auth/react';
import type { BetterAuthClientPlugin } from 'better-auth/client';
export { createAuthClient } from 'better-auth/react';
export { twoFactorClient } from 'better-auth/client/plugins';
/**
 * Default plugins included with Payload Better Auth (core only).
 * Add optional plugins (passkeyClient, apiKeyClient) from their own packages.
 *
 * Typed as `BetterAuthClientPlugin[]` so consumers' `.d.ts` files don't need
 * to name Better Auth's zod-backed inferred plugin types (not portable across
 * installs).
 *
 * @example
 * ```typescript
 * import { createAuthClient, payloadAuthPlugins } from '@delmaredigital/payload-better-auth/client'
 * import { passkeyClient } from '@better-auth/passkey/client'
 * import { apiKeyClient } from '@better-auth/api-key/client'
 *
 * export const authClient = createAuthClient({
 *   plugins: [...payloadAuthPlugins, passkeyClient(), apiKeyClient()],
 * })
 * ```
 */
export declare const payloadAuthPlugins: BetterAuthClientPlugin[];
export interface PayloadAuthClientOptions {
    /**
     * Base URL for auth endpoints. Defaults to `window.location.origin`, which
     * Better Auth expands to `<origin>/api/auth` — correct only while Payload's
     * `routes.api` is the default `/api`. With a non-default API route, pass the
     * full mount instead, e.g. `${window.location.origin}/api/payload/auth`
     * (inside admin components, `useAuthClientBaseURL()` from
     * `@delmaredigital/payload-better-auth/components` derives this for you).
     */
    baseURL?: string;
}
export type PayloadAuthClient = ReturnType<typeof createAuthClient>;
/**
 * Create a pre-configured auth client with default core plugins (twoFactor).
 *
 * For passkeys, API keys, or other optional plugins, use `createAuthClient` directly:
 *
 * @example Basic usage
 * ```typescript
 * import { createPayloadAuthClient } from '@delmaredigital/payload-better-auth/client'
 * export const authClient = createPayloadAuthClient()
 * ```
 *
 * @example With optional plugins
 * ```typescript
 * import { createAuthClient, payloadAuthPlugins } from '@delmaredigital/payload-better-auth/client'
 * import { passkeyClient } from '@better-auth/passkey/client'
 *
 * export const authClient = createAuthClient({
 *   plugins: [...payloadAuthPlugins, passkeyClient()],
 * })
 * ```
 */
export declare function createPayloadAuthClient(options?: PayloadAuthClientOptions): PayloadAuthClient;
