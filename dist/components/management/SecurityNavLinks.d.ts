export type SecurityNavLinksProps = {
    /** Base path for security views. Default: '/admin/security' */
    basePath?: string;
    /** Show API Keys link. Default: true */
    showApiKeys?: boolean;
};
/**
 * Navigation links for security management features.
 * Rendered in admin sidebar via afterNavLinks injection.
 * Uses Payload's NavGroup and nav CSS classes for native styling.
 *
 * Currently only renders API Keys link — 2FA and Passkeys
 * are now embedded as ui fields on the user document.
 */
export declare function SecurityNavLinks({ basePath, showApiKeys, }?: SecurityNavLinksProps): import("react").JSX.Element | null;
export default SecurityNavLinks;
