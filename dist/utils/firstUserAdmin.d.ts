/**
 * First User Admin Hook Utility
 *
 * Provides a Better Auth databaseHooks configuration that automatically
 * makes the first registered user an admin.
 *
 * @packageDocumentation
 */
import type { BetterAuthOptions } from 'better-auth';
export type FirstUserAdminOptions = {
    /**
     * Role to assign to the first user
     * @default 'admin'
     */
    adminRole?: string;
    /**
     * Role to assign to subsequent users (if not already set)
     * @default 'user'
     */
    defaultRole?: string;
    /**
     * Field name for the role field
     * @default 'role'
     */
    roleField?: string;
};
/**
 * Creates Better Auth databaseHooks configuration that makes the first
 * registered user an admin.
 *
 * @example Basic usage
 * ```ts
 * import { betterAuth } from 'better-auth'
 * import { payloadAdapter } from '@delmaredigital/payload-better-auth/adapter'
 * import { firstUserAdminHooks } from '@delmaredigital/payload-better-auth'
 *
 * export const auth = betterAuth({
 *   database: payloadAdapter({ payloadClient: payload }),
 *   databaseHooks: firstUserAdminHooks(),
 * })
 * ```
 *
 * @example Custom roles
 * ```ts
 * export const auth = betterAuth({
 *   database: payloadAdapter({ payloadClient: payload }),
 *   databaseHooks: firstUserAdminHooks({
 *     adminRole: 'super-admin',
 *     defaultRole: 'member',
 *   }),
 * })
 * ```
 *
 * @example Merging with other hooks
 * ```ts
 * export const auth = betterAuth({
 *   database: payloadAdapter({ payloadClient: payload }),
 *   databaseHooks: {
 *     user: {
 *       create: {
 *         before: async (user, ctx) => {
 *           // First apply first-user-admin logic
 *           const result = await firstUserAdminHooks().user.create.before(user, ctx)
 *           const userData = result?.data ?? user
 *
 *           // Then apply your custom logic
 *           return {
 *             data: {
 *               ...userData,
 *               createdVia: 'custom-signup',
 *             },
 *           }
 *         },
 *         after: async (user) => {
 *           // Your after-create logic
 *           console.log('User created:', user.email)
 *         },
 *       },
 *     },
 *   },
 * })
 * ```
 */
export declare function firstUserAdminHooks(options?: FirstUserAdminOptions): NonNullable<BetterAuthOptions['databaseHooks']>;
