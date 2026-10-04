/**
 * One-time data migration for the `supportsArrays` correction in 0.12.0.
 *
 * Releases up to 0.11.3 reported `supportsArrays: false` to Better Auth's adapter
 * factory, so every `string[]` / `number[]` value was `JSON.stringify`'d on its
 * way into Payload. Those columns hold a JSON string where an array belongs.
 *
 * ## Why this can't just read the value back
 *
 * On Postgres the stored shape is invisible through the Local API. Payload writes
 * these to a `jsonb` column, so a stringified value is stored as a *jsonb string*.
 * On read, node-postgres parses the jsonb and hands drizzle a JS string — and
 * drizzle's `PgJsonb.mapFromDriverValue` then runs `JSON.parse` on any string it
 * receives (a guard for drivers that return raw text). That second parse turns the
 * stored string back into an array before Payload ever sees it, so a stringified
 * row and a native one are indistinguishable to `payload.find()`.
 *
 * So on Postgres the census runs in SQL against `jsonb_typeof`, which reports what
 * is actually stored. SQLite and MongoDB don't launder: SQLite stores json as TEXT
 * and drizzle parses it exactly once, MongoDB stores the value as-is, so on those
 * the value Payload returns is faithful and is used directly.
 *
 * When the stored shape cannot be observed, this throws rather than reporting a
 * clean database — "we looked and found nothing" and "we couldn't look" are
 * different facts and must not print the same.
 *
 * @packageDocumentation
 */
import type { BetterAuthOptions } from 'better-auth';
import type { BasePayload } from 'payload';
/** How the stored shape was determined for a field. */
export type ObservationMethod = 
/** Read from the database's own type info (Postgres `jsonb_typeof`). */
'stored-shape'
/** Read from the value Payload returned, which is faithful on this backend. */
 | 'local-api';
/** What the migration did to one collection field. */
export type StringifiedArrayMigration = {
    /** Payload collection slug. */
    collection: string;
    /** Payload field name. */
    field: string;
    /** Documents examined. */
    scanned: number;
    /** Documents holding a stringified array, converted (or that would be, when `dryRun`). */
    converted: number;
    /**
     * Documents holding a string that did not parse to an array. Left untouched —
     * the migration never guesses at a value it doesn't recognise.
     */
    skipped: number;
    /**
     * How the stored shape was determined. A `converted: 0` only means "clean" in
     * combination with this — see the module docs.
     */
    observedVia: ObservationMethod;
};
export type MigrateStringifiedArraysOptions = {
    /** The Payload instance. */
    payload: BasePayload;
    /** The same options you pass to `betterAuth()`, so plugin tables are included. */
    betterAuthOptions: BetterAuthOptions;
    /** Must match the adapter's setting. Default `true`, as the adapter uses. */
    usePlural?: boolean;
    /** Report what would change without writing. Default `false`. */
    dryRun?: boolean;
    /** Documents read per page. Default `100`. */
    batchSize?: number;
    /** Called once per converted document, for progress output. */
    onProgress?: (progress: {
        collection: string;
        field: string;
        id: string | number;
    }) => void;
};
/**
 * Convert every stringified `string[]` / `number[]` column written by an earlier
 * release into a real array.
 *
 * Safe to run more than once: a value that is already an array is left alone, so a
 * second run reports `converted: 0`. Run it once, after upgrading and before
 * serving traffic.
 *
 * Read `observedVia` on each result alongside `converted`. On Postgres it must say
 * `stored-shape`; a `converted: 0` from the Local API on Postgres would be a false
 * negative, which is why this throws instead of producing one.
 *
 * ```ts
 * import { migrateStringifiedArrays } from '@delmaredigital/payload-better-auth'
 *
 * const results = await migrateStringifiedArrays({
 *   payload,
 *   betterAuthOptions,
 *   dryRun: true, // drop this once the report looks right
 * })
 * console.table(results)
 * ```
 */
export declare function migrateStringifiedArrays({ payload, betterAuthOptions, usePlural, dryRun, batchSize, onProgress, }: MigrateStringifiedArraysOptions): Promise<StringifiedArrayMigration[]>;
