/**
 * @delmare/payload-better-auth
 *
 * Better Auth adapter and plugins for Payload CMS.
 * Enables seamless integration between Better Auth and Payload.
 *
 * @packageDocumentation
 */ // Adapter
export { payloadAdapter, detectDbType, resolveIdType } from './adapter/index.js';
// Collection generator plugin
export { betterAuthCollections, defaultSecretFieldsByModel } from './adapter/collections.js';
// Payload plugin and strategy
export { createBetterAuthPlugin, betterAuthStrategy, resetAuthInstance, getApiKeyPermissionsConfig } from './plugin/index.js';
// Permission utilities
export { generateCollectionPermissions } from './utils/generatePermissions.js';
// Access control utilities
export { normalizeRoles, hasAnyRole, hasAllRoles, hasAdminRoles, isAdmin, isAdminField, isAdminOrSelf, canUpdateOwnFields, isAuthenticated, isAuthenticatedField, hasRole, hasRoleField, requireAllRoles } from './utils/access.js';
// API key permission enforcement utilities
export { extractApiKeyFromRequest, requirePermission, requireAnyPermission, requireAllPermissions, allowSessionOrPermission, allowSessionOrAnyPermission, requireApiKey } from './utils/apiKeyAccess.js';
// Auth config detection utility
export { detectAuthConfig } from './utils/detectAuthConfig.js';
// Session utilities
export { getServerSession, getServerUser, createSessionHelpers } from './utils/session.js';
// First user admin hook utility
export { firstUserAdminHooks } from './utils/firstUserAdmin.js';
// Better Auth defaults utility
export { withBetterAuthDefaults } from './utils/betterAuthDefaults.js';
// One-time data migration for the 0.12.0 `supportsArrays` correction
export { migrateStringifiedArrays } from './utils/migrateStringifiedArrays.js';
