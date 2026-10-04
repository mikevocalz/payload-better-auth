/**
 * Utility to detect auth configuration in Payload config
 */ /**
 * Scans Payload config to detect if any collection uses disableLocalStrategy.
 * Used to determine whether to auto-inject admin components.
 */ export function detectAuthConfig(config) {
    const collections = config.collections ?? [];
    for (const collection of collections){
        if (collection.auth) {
            const auth = collection.auth;
            // In Payload, `auth: true` ENABLES the local strategy — it is NOT
            // disableLocalStrategy. Only the object form carries `disableLocalStrategy`.
            // (Treating `auth: true` as disableLocalStrategy hijacked working local
            // logins and could lock out admins whose credentials live only in
            // Payload's local strategy.)
            if (typeof auth === 'object' && auth.disableLocalStrategy) {
                return {
                    hasDisableLocalStrategy: true,
                    authCollectionSlug: collection.slug,
                    authCollectionConfig: collection
                };
            }
        }
    }
    return {
        hasDisableLocalStrategy: false,
        authCollectionSlug: null,
        authCollectionConfig: null
    };
}
