/**
 * Generate permission definitions from Payload collections for the admin UI.
 */
import type { CollectionConfig } from 'payload';
import type { PermissionDefinition } from '../types/apiKey.js';
/**
 * Generate permission definitions from Payload collections.
 * Returns a list of collections with their available actions (read/write)
 * for display in the API key management UI.
 */
export declare function generateCollectionPermissions(collections: CollectionConfig[], excludeCollections?: string[]): PermissionDefinition[];
