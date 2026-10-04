/**
 * Utility to apply sensible defaults to Better Auth options.
 *
 * @packageDocumentation
 */
import type { BetterAuthOptions } from 'better-auth';
/**
 * Applies sensible defaults to Better Auth options.
 *
 * Currently applies the following defaults:
 * - `trustedOrigins`: If not explicitly provided but `baseURL` is set,
 *   defaults to `[baseURL]`. This handles the common single-domain case
 *   where the app's origin should be trusted for auth requests.
 *
 * Multi-domain setups can still explicitly set `trustedOrigins` to include
 * multiple origins.
 *
 * @example Simple case - trustedOrigins defaults to [baseURL]
 * ```ts
 * import { withBetterAuthDefaults } from '@delmaredigital/payload-better-auth'
 *
 * const auth = betterAuth(withBetterAuthDefaults({
 *   baseURL: 'https://myapp.com',
 *   // trustedOrigins automatically becomes ['https://myapp.com']
 * }))
 * ```
 *
 * @example Multi-domain case - explicit trustedOrigins respected
 * ```ts
 * const auth = betterAuth(withBetterAuthDefaults({
 *   baseURL: 'https://myapp.com',
 *   trustedOrigins: ['https://myapp.com', 'https://other-domain.com'],
 *   // trustedOrigins stays as explicitly provided
 * }))
 * ```
 *
 * @example With createBetterAuthPlugin
 * ```ts
 * createBetterAuthPlugin({
 *   createAuth: (payload) => betterAuth(withBetterAuthDefaults({
 *     database: payloadAdapter({ payloadClient: payload }),
 *     baseURL: process.env.BETTER_AUTH_URL,
 *   })),
 * })
 * ```
 */
export declare function withBetterAuthDefaults<T extends BetterAuthOptions>(options: T): T;
