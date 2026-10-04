import { jsx as _jsx } from "react/jsx-runtime";
import { DefaultTemplate } from '@payloadcms/ui/rsc';
import { getVisibleEntities } from '@payloadcms/ui/shared';
import { ApiKeysManagementClient } from '../ApiKeysManagementClient.js';
import { getApiKeyPermissionsConfig } from '../../../plugin/index.js';
import { generateCollectionPermissions } from '../../../utils/generatePermissions.js';
/**
 * Fetch organizations the current user belongs to.
 * Returns an empty array if the members/organizations collections don't exist.
 */ async function getUserOrganizations(payload, userId) {
    try {
        // Check if members and organizations collections exist
        const collectionSlugs = payload.config.collections.map((c)=>c.slug);
        if (!collectionSlugs.includes('members') || !collectionSlugs.includes('organizations')) {
            return [];
        }
        // Find all memberships for this user
        const memberships = await payload.find({
            collection: 'members',
            where: {
                user: {
                    equals: userId
                }
            },
            limit: 100,
            depth: 0,
            overrideAccess: true
        });
        if (memberships.docs.length === 0) return [];
        // Fetch organization details
        const orgIds = memberships.docs.map((m)=>m.organization);
        const orgs = await payload.find({
            collection: 'organizations',
            where: {
                id: {
                    in: orgIds
                }
            },
            limit: 100,
            depth: 0,
            overrideAccess: true
        });
        return orgs.docs.map((org)=>({
                id: org.id,
                name: org.name || String(org.id)
            }));
    } catch  {
        // Collections might not exist or have different schemas — return empty
        return [];
    }
}
/**
 * API Keys management view for Payload admin panel.
 * Server component that provides the admin layout.
 */ export async function ApiKeysView({ initPageResult, params, searchParams }) {
    const { req } = initPageResult;
    const { payload } = req;
    // Await params/searchParams for Next.js 15+ compatibility
    const resolvedParams = params ? await params : undefined;
    const resolvedSearchParams = searchParams ? await searchParams : undefined;
    const visibleEntities = getVisibleEntities({
        req
    });
    // Build permission definitions from collections. Pass the payload instance so
    // the config resolves per-instance (not the last-initialized plugin's).
    const permissionsConfig = getApiKeyPermissionsConfig(payload);
    const permissions = generateCollectionPermissions(payload.config.collections, permissionsConfig?.excludeCollections);
    // Fetch user's organizations if the organization plugin is in use
    const userId = req.user?.id;
    const organizations = userId ? await getUserOrganizations(payload, userId) : [];
    return /*#__PURE__*/ _jsx(DefaultTemplate, {
        i18n: req.i18n,
        locale: req.locale,
        params: resolvedParams,
        payload: payload,
        permissions: initPageResult.permissions,
        searchParams: resolvedSearchParams,
        user: req.user ?? undefined,
        visibleEntities: visibleEntities,
        children: /*#__PURE__*/ _jsx(ApiKeysManagementClient, {
            permissions: permissions,
            organizations: organizations
        })
    });
}
export default ApiKeysView;
