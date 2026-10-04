export type ResetPasswordViewProps = {
    /** Custom logo element */
    logo?: React.ReactNode;
    /** Page title. Default: 'Reset Password' */
    title?: string;
    /** Path to redirect after successful reset. Defaults to `${routes.admin}/login`. */
    afterResetPath?: string;
    /** Minimum password length. Default: 8 */
    minPasswordLength?: number;
};
/**
 * Reset password page component for setting a new password.
 * Expects a token in the URL query parameter.
 * Uses Better Auth's resetPassword endpoint.
 */
export declare function ResetPasswordView({ logo, title, afterResetPath, minPasswordLength, }: ResetPasswordViewProps): import("react").JSX.Element;
export default ResetPasswordView;
