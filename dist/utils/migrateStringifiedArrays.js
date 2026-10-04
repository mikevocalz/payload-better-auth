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
 */ import { getAuthTables } from 'better-auth/db';
import { pluralize } from '../adapter/collections.js';
import { detectDbType } from '../adapter/index.js';
/** Payload's own convention for turning a collection slug into a table name. */ function toSnakeCase(value) {
    return value.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/([A-Z])([A-Z][a-z])/g, '$1_$2').toLowerCase();
}
/** Identifiers come from Payload's own maps; refuse anything that isn't a plain one. */ function assertSafeIdentifier(value, what) {
    if (!/^[a-z_][a-z0-9_]*$/i.test(value)) {
        throw new Error(`[migrateStringifiedArrays] refusing to build SQL with an unexpected ${what}: ${JSON.stringify(value)}`);
    }
    return value;
}
/**
 * Inline a value the database itself gave us as a SQL literal. Only ever used for
 * an `id` read back from the row we are paging past.
 */ function sqlLiteral(value) {
    if (typeof value === 'number') {
        if (!Number.isFinite(value)) {
            throw new Error(`[migrateStringifiedArrays] refusing to page on a non-finite id: ${value}`);
        }
        return String(value);
    }
    return `'${value.replace(/'/g, "''")}'`;
}
/** Resolve a collection's real table and the database name of each array column. */ function resolvePostgresTarget(payload, slug, fields) {
    const db = payload.db;
    if (typeof db.execute !== 'function' || !db.drizzle || !db.tables || !db.tableNameMap) {
        throw new Error(`[migrateStringifiedArrays] cannot inspect stored shape on Postgres: the Payload database ` + `adapter does not expose drizzle (needed because the ORM parses stored strings into arrays ` + `on read, hiding what is actually in the column). Upgrade @payloadcms/db-postgres, or ` + `migrate '${slug}' by hand — see the CHANGELOG for the SQL.`);
    }
    const tableName = db.tableNameMap.get(toSnakeCase(slug));
    const table = tableName ? db.tables[tableName] : undefined;
    if (!tableName || !table) {
        throw new Error(`[migrateStringifiedArrays] cannot resolve a database table for collection '${slug}'. ` + `Reporting it as clean would be a false negative, so refusing to continue.`);
    }
    const columns = new Map();
    for (const field of fields){
        // The drizzle column knows its real database name; fall back to Payload's convention.
        const columnName = table[field]?.name ?? toSnakeCase(field);
        columns.set(field, assertSafeIdentifier(columnName, 'column name'));
    }
    return {
        table: assertSafeIdentifier(tableName, 'table name'),
        columns
    };
}
/**
 * Page over the rows of one table whose stored jsonb is a *string*, for every
 * array field at once.
 *
 * All of a table's array columns are censused in a single scan — a provider's
 * `oauthAccessTokens` carries several, and scanning once per field would read the
 * table several times over.
 *
 * Paging is keyset on `id`, not `OFFSET`: converting a row makes it stop matching
 * `jsonb_typeof(...) = 'string'`, so an offset would step over rows as the result
 * set shrinks underneath it. Rows we skip stay matching, which an offset would
 * also mishandle. Advancing past the last id we handled is correct for both.
 */ async function* censusPostgres(payload, target, batchSize) {
    const db = payload.db;
    const entries = [
        ...target.columns.entries()
    ];
    // `#>> '{}'` returns a jsonb scalar's text without its JSON quoting.
    const projection = entries.map(([, col], i)=>`CASE WHEN jsonb_typeof("${col}") = 'string' THEN "${col}" #>> '{}' END AS "c${i}"`).join(', ');
    const predicate = entries.map(([, col])=>`jsonb_typeof("${col}") = 'string'`).join(' OR ');
    let cursor;
    for(;;){
        const after = cursor === undefined ? '' : ` AND "id" > ${sqlLiteral(cursor)}`;
        const raw = `SELECT "id", ${projection} FROM "${target.table}" ` + `WHERE (${predicate})${after} ORDER BY "id" LIMIT ${batchSize}`;
        const result = await db.execute({
            drizzle: db.drizzle,
            raw
        });
        const rows = Array.isArray(result) ? result : result?.rows ?? [];
        for (const row of rows){
            const values = new Map();
            entries.forEach(([field], i)=>{
                const v = row[`c${i}`];
                if (typeof v === 'string') values.set(field, v);
            });
            cursor = row.id;
            if (values.size > 0) yield {
                id: cursor,
                values
            };
        }
        if (rows.length < batchSize) return;
    }
}
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
 */ export async function migrateStringifiedArrays({ payload, betterAuthOptions, usePlural = true, dryRun = false, batchSize = 100, onProgress }) {
    const tables = getAuthTables(betterAuthOptions);
    const dbType = detectDbType(payload);
    // Only Postgres launders the stored shape on read. SQLite parses TEXT json exactly
    // once and MongoDB stores the value verbatim, so there the Local API is faithful.
    const observedVia = dbType === 'postgres' ? 'stored-shape' : 'local-api';
    const results = [];
    for (const [modelKey, table] of Object.entries(tables)){
        const baseName = table.modelName ?? modelKey;
        const slug = usePlural ? pluralize(baseName) : baseName;
        const arrayFields = Object.entries(table.fields).filter(([, def])=>def.type === 'string[]' || def.type === 'number[]').map(([fieldKey, def])=>def.fieldName ?? fieldKey);
        if (arrayFields.length === 0) continue;
        // A collection the consumer skipped (or hasn't generated) has nothing of ours in it.
        if (!payload.collections?.[slug]) continue;
        const perField = new Map(arrayFields.map((field)=>[
                field,
                {
                    collection: slug,
                    field,
                    scanned: 0,
                    converted: 0,
                    skipped: 0,
                    observedVia
                }
            ]));
        /**
     * Turn one row's stringified values into arrays. Every field converted on a
     * row is written in a single update rather than one write per field.
     */ const convertRow = async (id, values)=>{
            const data = {};
            for (const [field, raw] of values){
                const stat = perField.get(field);
                let parsed;
                try {
                    parsed = JSON.parse(raw);
                } catch  {
                    stat.skipped++;
                    continue;
                }
                if (!Array.isArray(parsed)) {
                    stat.skipped++;
                    continue;
                }
                data[field] = parsed;
                stat.converted++;
                onProgress?.({
                    collection: slug,
                    field,
                    id
                });
            }
            if (!dryRun && Object.keys(data).length > 0) {
                await payload.update({
                    collection: slug,
                    id,
                    data,
                    depth: 0,
                    overrideAccess: true
                });
            }
        };
        if (observedVia === 'stored-shape') {
            // The census reads only matching rows, but its predicate evaluated them all.
            const { totalDocs } = await payload.count({
                collection: slug,
                overrideAccess: true
            });
            for (const stat of perField.values())stat.scanned = totalDocs;
            const target = resolvePostgresTarget(payload, slug, arrayFields);
            for await (const row of censusPostgres(payload, target, batchSize)){
                await convertRow(row.id, row.values);
            }
        } else {
            let page = 1;
            let hasNextPage = true;
            while(hasNextPage){
                const { docs, hasNextPage: more } = await payload.find({
                    collection: slug,
                    limit: batchSize,
                    page,
                    depth: 0,
                    sort: 'id',
                    overrideAccess: true,
                    pagination: true
                });
                for (const doc of docs){
                    const values = new Map();
                    for (const field of arrayFields){
                        perField.get(field).scanned++;
                        const value = doc[field];
                        if (typeof value === 'string') values.set(field, value);
                    }
                    if (values.size > 0) await convertRow(doc.id, values);
                }
                hasNextPage = more;
                page++;
            }
        }
        results.push(...perField.values());
    }
    return results;
}
