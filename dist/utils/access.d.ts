/**
 * Access control utilities for Payload collections.
 *
 * These helpers simplify common access control patterns when using
 * Better Auth with Payload CMS. They handle role checking, self-access
 * patterns, and field-level permissions.
 *
 * @example
 * ```ts
 * import { isAdmin, isAdminOrSelf } from '@delmaredigital/payload-better-auth'
 *
 * export const Users: CollectionConfig = {
 *   slug: 'users',
 *   access: {
 *     read: isAdminOrSelf({ adminRoles: ['admin', 'editor'] }),
 *     update: isAdminOrSelf({ adminRoles: ['admin'] }),
 *     delete: isAdmin({ adminRoles: ['admin'] }),
 *   },
 * }
 * ```
 */
import type { Access, FieldAccess, PayloadRequest } from 'payload';
export type RoleCheckConfig = {
    /**
     * Roles considered admin roles.
     * @default ['admin']
     */
    adminRoles?: string[];
};
export type SelfAccessConfig = RoleCheckConfig & {
    /**
     * The field to use for user ID comparison.
     * @default 'id'
     */
    idField?: string;
};
export type FieldUpdateConfig = SelfAccessConfig & {
    /**
     * Fields the user is allowed to update on their own record.
     * Password is handled specially and requires currentPassword.
     * @default ['name']
     */
    allowedFields?: string[];
    /**
     * The user collection slug for password verification.
     */
    userSlug?: string;
};
/**
 * Normalize a user's role to an array.
 *
 * Handles various role formats:
 * - Array of roles
 * - Comma-separated string
 * - Single role string
 *
 * @param role - The role value from the user object
 * @returns Array of role strings
 */
export declare function normalizeRoles(role: unknown): string[];
/**
 * Check if a user has any of the specified roles.
 *
 * @param user - The user object
 * @param roles - Roles to check for
 * @returns True if user has at least one matching role
 *
 * @example
 * ```ts
 * const user = { role: ['admin', 'editor'] }
 * hasAnyRole(user, ['admin']) // true
 * hasAnyRole(user, ['superadmin']) // false
 * ```
 */
export declare function hasAnyRole(user: {
    role?: unknown;
} | null | undefined, roles: string[]): boolean;
/**
 * Check if a user has all of the specified roles.
 *
 * @param user - The user object
 * @param roles - Roles to check for
 * @returns True if user has all matching roles
 *
 * @example
 * ```ts
 * const user = { role: ['admin', 'editor'] }
 * hasAllRoles(user, ['admin', 'editor']) // true
 * hasAllRoles(user, ['admin', 'superadmin']) // false
 * ```
 */
export declare function hasAllRoles(user: {
    role?: unknown;
} | null | undefined, roles: string[]): boolean;
/**
 * Check if the current request user has admin roles.
 *
 * Use this as a reusable check within access functions.
 *
 * @param config - Configuration with admin roles
 * @returns Access check function
 */
export declare function hasAdminRoles(config?: RoleCheckConfig): (args: {
    req: PayloadRequest;
}) => boolean;
/**
 * Access control: Only allow users with admin roles.
 *
 * @param config - Configuration with admin roles
 * @returns Payload access function
 *
 * @example
 * ```ts
 * access: {
 *   delete: isAdmin({ adminRoles: ['admin', 'superadmin'] }),
 * }
 * ```
 */
export declare function isAdmin(config?: RoleCheckConfig): Access;
/**
 * Field access control: Only allow users with admin roles.
 *
 * @param config - Configuration with admin roles
 * @returns Payload field access function
 *
 * @example
 * ```ts
 * fields: [
 *   {
 *     name: 'role',
 *     type: 'select',
 *     access: {
 *       update: isAdminField({ adminRoles: ['admin'] }),
 *     },
 *   },
 * ]
 * ```
 */
export declare function isAdminField(config?: RoleCheckConfig): FieldAccess;
/**
 * Access control: Allow admin OR the user accessing their own record.
 *
 * Returns a query constraint for non-admin users to limit access
 * to their own records only.
 *
 * @param config - Configuration with admin roles and ID field
 * @returns Payload access function
 *
 * @example
 * ```ts
 * access: {
 *   read: isAdminOrSelf({ adminRoles: ['admin'] }),
 *   update: isAdminOrSelf({ adminRoles: ['admin'] }),
 * }
 * ```
 */
export declare function isAdminOrSelf(config?: SelfAccessConfig): Access;
/**
 * Access control: Allow admin OR user updating allowed fields on own record.
 *
 * This is useful for allowing users to update specific fields (like name)
 * on their own profile while preventing them from changing sensitive fields
 * like role.
 *
 * Password changes require `currentPassword` to be provided and validated.
 *
 * @param config - Configuration with admin roles, allowed fields, and user slug
 * @returns Payload access function
 *
 * @example
 * ```ts
 * access: {
 *   update: canUpdateOwnFields({
 *     adminRoles: ['admin'],
 *     allowedFields: ['name', 'image'],
 *     userSlug: 'users',
 *   }),
 * }
 * ```
 */
export declare function canUpdateOwnFields(config?: FieldUpdateConfig): Access;
/**
 * Access control: Allow any authenticated user.
 *
 * @returns Payload access function
 *
 * @example
 * ```ts
 * access: {
 *   read: isAuthenticated(),
 * }
 * ```
 */
export declare function isAuthenticated(): Access;
/**
 * Field access control: Allow any authenticated user.
 *
 * @returns Payload field access function
 */
export declare function isAuthenticatedField(): FieldAccess;
/**
 * Access control: Allow users with any of the specified roles.
 *
 * @param roles - Roles that have access
 * @returns Payload access function
 *
 * @example
 * ```ts
 * access: {
 *   read: hasRole(['admin', 'editor', 'viewer']),
 *   update: hasRole(['admin', 'editor']),
 * }
 * ```
 */
export declare function hasRole(roles: string[]): Access;
/**
 * Field access control: Allow users with any of the specified roles.
 *
 * @param roles - Roles that have access
 * @returns Payload field access function
 */
export declare function hasRoleField(roles: string[]): FieldAccess;
/**
 * Access control: Allow users with all of the specified roles.
 *
 * @param roles - All roles required for access
 * @returns Payload access function
 *
 * @example
 * ```ts
 * access: {
 *   delete: requireAllRoles(['admin', 'verified']),
 * }
 * ```
 */
export declare function requireAllRoles(roles: string[]): Access;
