/**
 * Auto-generate Payload collections from Better Auth schema
 *
 * @packageDocumentation
 */
import type { CollectionConfig, Field, Plugin, CollectionBeforeChangeHook, CollectionAfterChangeHook } from 'payload';
import type { BetterAuthOptions } from 'better-auth';
import { getAuthTables } from 'better-auth/db';
import type { FirstUserAdminOptions } from '../utils/firstUserAdmin.js';
export type { FirstUserAdminOptions };
export type BetterAuthCollectionsOptions = {
    /**
     * Better Auth options. Pass the same options you use for betterAuth().
     * The plugin reads the schema to generate collections.
     */
    betterAuthOptions?: BetterAuthOptions;
    /**
     * Collections to skip (they already exist in your config)
     * Default: ['user'] - assumes you have a Users collection
     */
    skipCollections?: string[];
    /**
     * Admin group name for generated collections
     * Default: 'Auth'
     */
    adminGroup?: string;
    /**
     * Custom access control for generated collections.
     * By default, only admins can read/delete, and create/update are disabled.
     */
    access?: CollectionConfig['access'];
    /**
     * Whether to pluralize collection slugs (add 's' suffix).
     * Should match your adapter's usePlural setting.
     * Default: true (matches Payload conventions)
     */
    usePlural?: boolean;
    /**
     * Configure saveToJWT for session-related fields.
     * This controls which fields are included in JWT tokens.
     * Default: true
     */
    configureSaveToJWT?: boolean;
    /**
     * Automatically make the first registered user an admin.
     * Enabled by default. Set to `false` to disable, or provide options to customize.
     *
     * @default true
     *
     * @example Disable
     * ```ts
     * betterAuthCollections({
     *   betterAuthOptions: authOptions,
     *   firstUserAdmin: false,
     * })
     * ```
     *
     * @example Custom roles
     * ```ts
     * betterAuthCollections({
     *   betterAuthOptions: authOptions,
     *   firstUserAdmin: {
     *     adminRole: 'super-admin',
     *     defaultRole: 'member',
     *   },
     * })
     * ```
     */
    firstUserAdmin?: boolean | FirstUserAdminOptions;
    /**
     * Silence the startup warning printed when `firstUserAdmin: false` turns off the
     * plugin's role-forcing guard. Set it only once you have constrained user creation
     * yourself: the users collection's `access.create` AND the role field's
     * `access.create` must reject anonymous and non-admin callers.
     *
     * Acknowledges that one warning only; it does not change behavior and has no
     * effect unless `firstUserAdmin` is `false`.
     *
     * @default false
     */
    acknowledgeRoleGuardDisabled?: boolean;
    /**
     * Deny API/admin access to sensitive credential fields on the collections this
     * plugin manages — session tokens, TOTP secrets and backup codes, verification
     * identifiers/values, stored OAuth tokens, hashed passwords and API keys.
     *
     * Better Auth itself is unaffected (the adapter operates with
     * `overrideAccess: true`); this only closes the Payload REST/GraphQL and
     * admin-UI read path. Without it, anyone the collection's `access.read`
     * admits (admins, by default) can lift live session tokens or TOTP secrets —
     * enough to hijack a session or clone a second factor.
     *
     * - `true` (default): lock the built-in field list per model (see
     *   `defaultSecretFieldsByModel`)
     * - `false`: disable
     * - object: merged over the built-in map (`modelKey -> field names`;
     *   an empty array unlocks that model)
     *
     * Applies to generated collections and to secret fields *added by
     * augmentation* to your pre-existing collections. Fields you defined
     * yourself are never touched.
     *
     * @default true
     */
    secureSecretFields?: boolean | Record<string, string[]>;
    /**
     * Customize a generated collection before it's added to config.
     * Use this to add hooks, modify fields, or adjust any collection setting.
     *
     * @example
     * ```ts
     * customizeCollection: (modelKey, collection) => {
     *   if (modelKey === 'session') {
     *     return {
     *       ...collection,
     *       hooks: {
     *         afterDelete: [myCleanupHook],
     *       },
     *     }
     *   }
     *   return collection
     * }
     * ```
     */
    customizeCollection?: (modelKey: string, collection: CollectionConfig) => CollectionConfig;
};
/**
 * Secret-bearing fields per Better Auth model key, locked by default via the
 * `secureSecretFields` option. Models a consumer hasn't enabled simply don't
 * exist in `getAuthTables`, so unused entries are inert.
 */
export declare const defaultSecretFieldsByModel: Record<string, string[]>;
/**
 * Creates the first-user-admin hooks.
 *
 * Security model (roles are assigned authoritatively on the server):
 * - The FIRST user (no users exist yet) is bootstrapped as admin.
 * - A role supplied in `data` is honored ONLY when an already-authenticated
 *   admin performs the create (e.g. via the Payload admin UI). For
 *   self-service sign-up, `data` is attacker-controllable, so any incoming
 *   role is ignored and `defaultRole` is assigned. This closes the
 *   privilege-escalation path where a client POSTs `{ role: 'admin' }` to the
 *   sign-up endpoint.
 * - `afterChange` resolves a concurrent-first-signup race: if this user was
 *   bootstrap-assigned admin but other admins now exist, only the canonical
 *   first admin is kept and the rest are demoted. Only bootstrap-assigned
 *   admins (flagged via req.context) are ever demoted, so admins created
 *   deliberately by an existing admin are never touched.
 */
export declare function createFirstUserAdminHooks(options: FirstUserAdminOptions, usersSlug: string): {
    before: CollectionBeforeChangeHook;
    after: CollectionAfterChangeHook;
};
/**
 * Simple pluralization (add 's' suffix).
 *
 * Exported for `migrateStringifiedArrays`, which has to resolve the same slugs
 * this generator produces. Not part of the public API.
 */
export declare function pluralize(name: string): string;
/**
 * Get existing field names from a collection, recursing into presentational
 * containers whose children live at the parent data level (`row`, `collapsible`,
 * and unnamed `tabs`). Named containers (`group`, named tabs) namespace their
 * children, so those are NOT collected as top-level names (only the container's
 * own name is). Without this recursion, a users collection that organizes
 * `email`/`role` inside tabs/rows would have those fields re-added by
 * augmentation, producing duplicate-field config errors.
 */
export declare function getExistingFieldNames(fields: Field[]): Set<string>;
/**
 * Augment an existing collection with missing fields from Better Auth schema.
 * This ensures user-defined collections (like 'users') get plugin fields automatically.
 */
export declare function augmentCollectionWithMissingFields(collection: CollectionConfig, table: ReturnType<typeof getAuthTables>[string], usePlural: boolean, modelKey: string, configureSaveToJWT?: boolean, secretFields?: string[]): CollectionConfig;
/**
 * Payload plugin that auto-generates collections from Better Auth schema.
 *
 * @example Basic usage
 * ```ts
 * import { betterAuthCollections } from '@delmaredigital/payload-better-auth'
 *
 * export default buildConfig({
 *   plugins: [
 *     betterAuthCollections({
 *       betterAuthOptions: { ... },
 *       skipCollections: ['user'], // Define Users yourself
 *     }),
 *   ],
 * })
 * ```
 *
 * @example With customization callback
 * ```ts
 * betterAuthCollections({
 *   betterAuthOptions: authOptions,
 *   customizeCollection: (modelKey, collection) => {
 *     if (modelKey === 'session') {
 *       return {
 *         ...collection,
 *         hooks: { afterDelete: [cleanupHook] },
 *       }
 *     }
 *     return collection
 *   },
 * })
 * ```
 */
export declare function betterAuthCollections(options?: BetterAuthCollectionsOptions): Plugin;
