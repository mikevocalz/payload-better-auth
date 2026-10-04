export type TwoFactorManagementClientProps = {
    /** Optional pre-configured auth client */
    authClient?: any;
    /** Page title. Default: 'Two-Factor Authentication' */
    title?: string;
    /** Called after 2FA is enabled or disabled. Use to refresh form state. */
    onComplete?: () => void | Promise<void>;
};
/**
 * Client component for two-factor authentication management.
 * Shows 2FA status and allows enabling/disabling.
 */
export declare function TwoFactorManagementClient({ authClient: providedClient, title, onComplete, }?: TwoFactorManagementClientProps): import("react").JSX.Element;
export default TwoFactorManagementClient;
