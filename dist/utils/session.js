/**
 * Server-side session utilities
 *
 * @packageDocumentation
 */ /**
 * Get the current session from headers.
 *
 * Accepts an optional generic type parameter to narrow the user type.
 * Pass your Payload-generated `User` type for full type safety.
 *
 * @example
 * ```ts
 * import { headers } from 'next/headers'
 * import { getServerSession } from '@delmaredigital/payload-better-auth'
 * import type { User } from '@/payload-types'
 *
 * export default async function Page() {
 *   const headersList = await headers()
 *   const session = await getServerSession<User>(payload, headersList)
 *
 *   if (!session) {
 *     redirect('/login')
 *   }
 *
 *   // session.user.role is fully typed
 *   return <div>Hello {session.user.name}</div>
 * }
 * ```
 */ export async function getServerSession(payload, headers) {
    try {
        const payloadWithAuth = payload;
        if (!payloadWithAuth.betterAuth) {
            console.error('[session] Better Auth not initialized');
            return null;
        }
        // Server components (and anything else calling this) have no response to set
        // cookies on. Better Auth's getSession() would otherwise extend the session row
        // once `updateAge` is reached and hand back a Set-Cookie we cannot deliver, so
        // the database expiry would drift away from the cookie the browser holds.
        // `betterAuthStrategy` makes the same call when Payload's `canSetHeaders` is false.
        const session = await payloadWithAuth.betterAuth.api.getSession({
            headers,
            query: {
                disableRefresh: true
            }
        });
        return session;
    } catch (error) {
        console.error('[session] Error getting session:', error);
        return null;
    }
}
/**
 * Get the current user from the session.
 *
 * Accepts an optional generic type parameter to narrow the user type.
 *
 * @example
 * ```ts
 * import { headers } from 'next/headers'
 * import { getServerUser } from '@delmaredigital/payload-better-auth'
 * import type { User } from '@/payload-types'
 *
 * export default async function Page() {
 *   const headersList = await headers()
 *   const user = await getServerUser<User>(payload, headersList)
 *
 *   if (!user) {
 *     redirect('/login')
 *   }
 *
 *   return <div>Hello {user.name}</div>
 * }
 * ```
 */ export async function getServerUser(payload, headers) {
    const session = await getServerSession(payload, headers);
    return session?.user ?? null;
}
/**
 * Coerce numeric-string ID fields to numbers on a shallow object.
 * Matches the adapter's heuristic: `id`, fields ending in `Id` or `_id`.
 */ function coerceIds(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    const result = {
        ...obj
    };
    for (const [key, value] of Object.entries(result)){
        if (typeof value !== 'string') continue;
        if (key === 'id' || /(?:Id|_id)$/.test(key)) {
            if (/^\d+$/.test(value)) {
                result[key] = parseInt(value, 10);
            }
        }
    }
    return result;
}
/**
 * Create typed session helpers bound to your User type.
 *
 * Define once in a shared file, then import the typed helpers
 * everywhere — no generics needed at call sites.
 *
 * @example
 * ```ts
 * // lib/auth.ts
 * import { createSessionHelpers } from '@delmaredigital/payload-better-auth'
 * import type { User } from '@/payload-types'
 *
 * export const { getServerSession, getServerUser } = createSessionHelpers<User>()
 * ```
 *
 * @example
 * ```ts
 * // With serial IDs (Payload default) — coerces string IDs to numbers
 * export const { getServerSession, getServerUser } = createSessionHelpers<User>({
 *   idType: 'number',
 * })
 * ```
 *
 * ```ts
 * // app/page.tsx
 * import { getServerSession } from '@/lib/auth'
 *
 * const session = await getServerSession(payload, headersList)
 * // session.user is typed as User — no generic needed
 * // session.user.id is a number when idType: 'number'
 * ```
 */ export function createSessionHelpers(options) {
    const shouldCoerceIds = options?.idType === 'number';
    const typedGetServerSession = async (payload, headers)=>{
        const session = await getServerSession(payload, headers);
        if (!session || !shouldCoerceIds) return session;
        return {
            user: coerceIds(session.user),
            session: coerceIds(session.session)
        };
    };
    return {
        getServerSession: typedGetServerSession,
        getServerUser: async (payload, headers)=>{
            const session = await typedGetServerSession(payload, headers);
            return session?.user ?? null;
        }
    };
}
