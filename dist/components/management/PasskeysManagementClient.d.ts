export type PasskeysManagementClientProps = {
    /** Optional pre-configured auth client */
    authClient?: any;
    /** Page title. Default: 'Passkeys' */
    title?: string;
};
/**
 * Client component for passkey management.
 * Lists, registers, and deletes passkeys.
 */
export declare function PasskeysManagementClient({ authClient: providedClient, title, }?: PasskeysManagementClientProps): import("react").JSX.Element;
export default PasskeysManagementClient;
