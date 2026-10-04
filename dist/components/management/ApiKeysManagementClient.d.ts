import type { PermissionDefinition } from '../../types/apiKey.js';
/** Organization option for the org selector */
export type OrganizationOption = {
    id: string | number;
    name: string;
};
export type ApiKeysManagementClientProps = {
    /** Optional pre-configured auth client with apiKey plugin */
    authClient?: any;
    /** Page title. Default: 'API Keys' */
    title?: string;
    /** Available permission definitions (collections + actions). Auto-generated if not provided. */
    permissions?: PermissionDefinition[];
    /**
     * Available organizations for scoping API keys.
     * When provided, shows an organization selector in the creation form.
     * Each key can be optionally bound to one organization.
     */
    organizations?: OrganizationOption[];
};
/**
 * Client component for API keys management.
 * Lists, creates, and deletes API keys with permission selection (read/write per collection).
 */
export declare function ApiKeysManagementClient({ authClient: providedClient, title, permissions, organizations, }?: ApiKeysManagementClientProps): import("react").JSX.Element;
export default ApiKeysManagementClient;
