export type ForgotPasswordViewProps = {
    /** Optional pre-configured auth client */
    authClient?: any;
    /** Custom logo element */
    logo?: React.ReactNode;
    /** Page title. Default: 'Forgot Password' */
    title?: string;
    /** Path to login page. Default: '/admin/login' */
    loginPath?: string;
    /** Success message to show after email is sent */
    successMessage?: string;
};
/**
 * Forgot password page component for requesting a password reset email.
 * Uses the Better Auth client's `requestPasswordReset` (the raw
 * `/forget-password` endpoint was renamed to `/request-password-reset` in
 * Better Auth 1.6; the client tracks such renames across versions).
 */
export declare function ForgotPasswordView({ authClient: providedClient, logo, title, loginPath, successMessage, }: ForgotPasswordViewProps): import("react").JSX.Element;
export default ForgotPasswordView;
