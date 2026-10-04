/**
 * API Key Permission Enforcement Utilities
 *
 * Thin wrappers around Better Auth's verifyApiKey() for use in
 * Payload access control. Uses BA's native permission format.
 *
 * @example
 * ```ts
 * import { requirePermission, allowSessionOrPermission } from '@delmaredigital/payload-better-auth'
 *
 * export const Posts: CollectionConfig = {
 *   slug: 'posts',
 *   access: {
 *     read: requirePermission('posts', 'read'),
 *     create: requirePermission('posts', 'write'),
 *     update: requirePermission('posts', 'write'),
 *     delete: requirePermission('posts', 'write'),
 *   },
 * }
 * ```
 */
import type { Access, PayloadRequest } from 'payload';
export type ApiKeyPermissionConfig = {
    /**
     * Allow access if user is authenticated (non-API key session).
     * Useful for allowing both API keys and regular sessions.
     * @default false
     */
    allowAuthenticatedUsers?: boolean;
    /**
     * Custom function to extract API key from request.
     * By default, extracts from Authorization: Bearer <key> header.
     */
    extractApiKey?: (req: PayloadRequest) => string | null;
};
/** A single permission check: resource + action */
export type PermissionCheck = {
    resource: string;
    action: string;
};
/**
 * Extract API key from request headers.
 *
 * Reads both headers a key may arrive on:
 *   - `x-api-key: <api-key>` — what Better Auth's api-key plugin accepts by default
 *   - `Authorization: Bearer <api-key>` (or a bare `Authorization` value) — only
 *     authenticated by Better Auth if the app configured the plugin's
 *     `apiKeyHeaders` / `customAPIKeyGetter`; with a default configuration such a
 *     request reaches access control with `req.user === null`
 *
 * The `x-api-key` case is security-critical: the strategy (plugin/index.ts)
 * mints `req.user` for keys sent via `x-api-key`, so if this helper only read
 * `Authorization`, a key sent via `x-api-key` would yield `apiKey === null`
 * while `req.user` was set — and any `allowAuthenticatedUsers` guard would
 * treat a scoped (or zero-scope) key as a full session, bypassing scope
 * enforcement entirely.
 */
export declare function extractApiKeyFromRequest(req: PayloadRequest): string | null;
/**
 * Require a specific permission on an API key.
 *
 * @param resource - Collection slug (e.g., 'posts')
 * @param action - Permission action: 'read' or 'write'
 * @param config - Optional configuration
 * @returns Payload access function
 *
 * @example
 * ```ts
 * access: {
 *   read: requirePermission('posts', 'read'),
 *   create: requirePermission('posts', 'write'),
 * }
 * ```
 */
export declare function requirePermission(resource: string, action: string, config?: ApiKeyPermissionConfig): Access;
/**
 * Require any one of the specified permissions.
 *
 * @param permissions - Array of {resource, action} pairs (at least one must match)
 * @param config - Optional configuration
 * @returns Payload access function
 *
 * @example
 * ```ts
 * access: {
 *   read: requireAnyPermission([
 *     { resource: 'posts', action: 'read' },
 *     { resource: 'pages', action: 'read' },
 *   ]),
 * }
 * ```
 */
export declare function requireAnyPermission(permissions: PermissionCheck[], config?: ApiKeyPermissionConfig): Access;
/**
 * Require all of the specified permissions.
 *
 * @param permissions - Array of {resource, action} pairs (all must match)
 * @param config - Optional configuration
 * @returns Payload access function
 *
 * @example
 * ```ts
 * access: {
 *   delete: requireAllPermissions([
 *     { resource: 'posts', action: 'write' },
 *     { resource: 'admin', action: 'write' },
 *   ]),
 * }
 * ```
 */
export declare function requireAllPermissions(permissions: PermissionCheck[], config?: ApiKeyPermissionConfig): Access;
/**
 * Allow either authenticated session OR API key with permission.
 *
 * @example
 * ```ts
 * access: {
 *   read: allowSessionOrPermission('posts', 'read'),
 * }
 * ```
 */
export declare function allowSessionOrPermission(resource: string, action: string, config?: Omit<ApiKeyPermissionConfig, 'allowAuthenticatedUsers'>): Access;
/**
 * Allow either authenticated session OR API key with any of the permissions.
 */
export declare function allowSessionOrAnyPermission(permissions: PermissionCheck[], config?: Omit<ApiKeyPermissionConfig, 'allowAuthenticatedUsers'>): Access;
/**
 * Require a valid API key (no specific permissions checked).
 * Useful for apps that use role-based access and just need to verify the key exists.
 *
 * @example
 * ```ts
 * access: {
 *   read: requireApiKey(),
 * }
 * ```
 */
export declare function requireApiKey(config?: ApiKeyPermissionConfig): Access;
