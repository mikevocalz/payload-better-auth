/**
 * Payload CMS Adapter for Better Auth
 *
 * Uses Better Auth's createAdapterFactory for schema-aware transformations,
 * eliminating hardcoded field mappings and supporting all Better Auth plugins.
 *
 * @packageDocumentation
 */
import type { DBAdapter, BetterAuthOptions } from 'better-auth';
import type { BasePayload } from 'payload';
/**
 * Database types supported by Payload CMS.
 */
export type DbType = 'postgres' | 'mongodb' | 'sqlite';
/**
 * Detect the database type from the Payload instance.
 */
export declare function detectDbType(payload: BasePayload): DbType;
/**
 * Determine ID type based on database type and Better Auth config.
 * MongoDB always uses text IDs (ObjectId strings).
 * Postgres defaults to 'number' (SERIAL) unless generateId indicates otherwise.
 */
export declare function resolveIdType(dbType: DbType, options: BetterAuthOptions, explicitIdType?: 'number' | 'text'): 'number' | 'text';
export type PayloadAdapterConfig = {
    /**
     * The Payload instance or a function that returns it.
     * Use a function for lazy initialization to avoid circular dependencies.
     */
    payloadClient: BasePayload | (() => Promise<BasePayload>);
    /**
     * Adapter configuration options
     */
    adapterConfig?: {
        /**
         * Enable debug logging for troubleshooting
         */
        enableDebugLogs?: boolean;
        /**
         * Database type. Auto-detected from Payload's database adapter if not set.
         * Set explicitly if auto-detection doesn't work for your adapter.
         */
        dbType?: DbType;
        /**
         * ID type used by Payload.
         * If not specified, auto-detects from Better Auth's generateId setting.
         * - 'number' for SERIAL/auto-increment (Payload default)
         * - 'text' for UUID
         */
        idType?: 'number' | 'text';
    };
};
/**
 * Creates a Better Auth adapter that uses Payload CMS as the database.
 *
 * Uses Better Auth's createAdapterFactory for proper schema-aware transformations,
 * automatically supporting all Better Auth plugins without hardcoded field mappings.
 *
 * @example Basic usage
 * ```ts
 * import { payloadAdapter } from '@delmaredigital/payload-better-auth/adapter'
 *
 * const auth = betterAuth({
 *   database: payloadAdapter({
 *     payloadClient: payload,
 *   }),
 *   // For serial IDs (Payload default), configure Better Auth:
 *   advanced: {
 *     database: {
 *       generateId: 'serial',
 *     },
 *   },
 * })
 * ```
 *
 * @example Custom collection names
 * ```ts
 * const auth = betterAuth({
 *   database: payloadAdapter({ payloadClient: payload }),
 *   // Use BetterAuthOptions to customize collection names.
 *   // Provide SINGULAR names - they get pluralized automatically:
 *   user: { modelName: 'member' },         // → 'members' collection
 *   session: { modelName: 'auth_session' }, // → 'auth_sessions' collection
 * })
 * ```
 */
export declare function payloadAdapter({ payloadClient, adapterConfig, }: PayloadAdapterConfig): (options: BetterAuthOptions) => DBAdapter;
export type { DBAdapter, BetterAuthOptions };
