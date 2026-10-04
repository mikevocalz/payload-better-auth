/**
 * Utility to detect auth configuration in Payload config
 */
import type { Config, CollectionConfig } from 'payload';
export type AuthDetectionResult = {
    /** Whether any collection has disableLocalStrategy: true */
    hasDisableLocalStrategy: boolean;
    /** The slug of the auth collection (if found) */
    authCollectionSlug: string | null;
    /** The auth collection config (if found) */
    authCollectionConfig: CollectionConfig | null;
};
/**
 * Scans Payload config to detect if any collection uses disableLocalStrategy.
 * Used to determine whether to auto-inject admin components.
 */
export declare function detectAuthConfig(config: Config): AuthDetectionResult;
