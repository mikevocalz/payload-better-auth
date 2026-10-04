/**
 * API Key Permission Types
 *
 * Uses Better Auth's native permission format: Record<string, string[]>
 * where keys are resource names (collection slugs) and values are action arrays.
 *
 * Convention: two actions per collection — 'read' and 'write'.
 * - read: view records
 * - write: full access (create, update, delete) — implies read
 */ /**
 * A permission definition for the admin UI.
 * Describes a collection's available permission levels.
 */ /**
 * Configuration options for API key permissions.
 */ export { };
