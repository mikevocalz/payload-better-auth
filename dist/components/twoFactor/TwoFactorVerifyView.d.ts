export type TwoFactorVerifyViewProps = {
    /** Custom logo element */
    logo?: React.ReactNode;
    /** Page title. Default: 'Two-Factor Authentication' */
    title?: string;
    /** Path to redirect after successful verification. Defaults to `routes.admin`. */
    afterVerifyPath?: string;
    /** Callback after successful verification */
    onVerifyComplete?: () => void;
};
/**
 * Two-factor authentication verification component.
 * Used during login flow when 2FA is enabled on the account.
 * Uses Better Auth's twoFactor plugin endpoints.
 */
export declare function TwoFactorVerifyView({ logo, title, afterVerifyPath, onVerifyComplete, }: TwoFactorVerifyViewProps): import("react").JSX.Element;
export default TwoFactorVerifyView;
