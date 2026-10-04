export type TwoFactorSetupViewProps = {
    /** Custom logo element */
    logo?: React.ReactNode;
    /** Page title. Default: 'Set Up Two-Factor Authentication' */
    title?: string;
    /** Path to redirect after successful setup. Defaults to `routes.admin`. */
    afterSetupPath?: string;
    /** Callback after successful setup */
    onSetupComplete?: () => void;
    /**
     * Whether the signed-in account has a credential (password) account.
     * `true` (default): the flow starts with a password confirmation step —
     * Better Auth's `/two-factor/enable` requires the password. `false`:
     * enablement starts immediately (needs the twoFactor plugin's
     * `allowPasswordless`). Resolve it server-side — don't ask the user — by
     * rendering through `TwoFactorSetupViewWrapper` (from `/rsc`).
     */
    hasPassword?: boolean;
};
/**
 * Two-factor authentication setup component.
 * Displays QR code for TOTP apps and allows verification.
 * Uses Better Auth's twoFactor plugin endpoints.
 */
export declare function TwoFactorSetupView({ logo, title, afterSetupPath, onSetupComplete, hasPassword, }: TwoFactorSetupViewProps): import("react").JSX.Element;
export default TwoFactorSetupView;
