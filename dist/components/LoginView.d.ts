import { type OtpLengths } from '../utils/loginMethods.js';
export type LoginViewProps = {
    /** Optional pre-configured auth client */
    authClient?: any;
    /** Custom logo element */
    logo?: React.ReactNode;
    /** Login page title. Default: 'Login' */
    title?: string;
    /** Path to redirect after successful login. Default: '/admin' */
    afterLoginPath?: string;
    /**
     * Required role(s) for admin access.
     * - string: Single role required (default: 'admin')
     * - string[]: Multiple roles (behavior depends on requireAllRoles)
     * - null/undefined: Disable role checking
     * For complex RBAC beyond these options, disable the login view and create your own.
     */
    requiredRole?: string | string[] | null;
    /**
     * When requiredRole is an array, require ALL roles (true) or ANY role (false).
     * Default: false (any matching role grants access)
     */
    requireAllRoles?: boolean;
    /**
     * Enable passkey (WebAuthn) sign-in option.
     * - true: Always show passkey button
     * - false: Never show passkey button
     * - 'auto' (default): Auto-detect if passkey plugin is available
     *
     * Passkey requires an injected `authClient` built with `passkeyClient()` —
     * the optional `@better-auth/passkey` peer is not (and cannot be) bundled into
     * this component. Without such a client, the passkey button surfaces a
     * guidance message instead of signing in.
     */
    enablePasskey?: boolean | 'auto';
    /**
     * Enable user registration (sign up) option.
     * - true: Always show "Create account" link
     * - false: Never show registration option
     * - 'auto' (default): Auto-detect if sign-up endpoint is available
     */
    enableSignUp?: boolean | 'auto';
    /**
     * @deprecated No longer sent to the server. Role is now assigned
     * authoritatively server-side (the sign-up form no longer transmits a role,
     * to close a privilege-escalation path). Configure the default self-sign-up
     * role via `firstUserAdmin: { defaultRole }` in `betterAuthCollections()`
     * instead. This prop is retained for backward compatibility but is ignored.
     */
    defaultSignUpRole?: string;
    /**
     * Enable forgot password option.
     * - true: Always show "Forgot password?" link
     * - false: Never show forgot password option
     * - 'auto' (default): Auto-detect if forget-password endpoint is available
     */
    enableForgotPassword?: boolean | 'auto';
    /**
     * Custom URL for password reset page. If provided, users will be redirected here
     * instead of showing the inline password reset form.
     * The reset token will be appended as ?token=xxx
     */
    resetPasswordUrl?: string;
    /**
     * Enable email + password sign-in.
     * - true: Always show the password field
     * - false: Hide the password field (passwordless-only)
     * - 'auto' (default): Auto-detect via the /sign-in/email endpoint
     */
    enablePassword?: boolean | 'auto';
    /**
     * Enable magic-link sign-in ("email me a link").
     * - true / false / 'auto' (default: auto-detect via /sign-in/magic-link)
     */
    enableMagicLink?: boolean | 'auto';
    /**
     * Enable email-OTP sign-in ("email me a code").
     * - true / false / 'auto' (default: auto-detect via /email-otp/send-verification-otp)
     */
    enableEmailOtp?: boolean | 'auto';
    /**
     * Where the emailed magic link returns after verification.
     * Default: afterLoginPath
     */
    magicLinkCallbackURL?: string;
    /** Resolved social providers to display (server-resolved by LoginViewWrapper). Default: none. */
    socialProviders?: Array<{
        id: string;
        label: string;
    }>;
    /**
     * Where a successful social sign-in returns. Default: the current login page URL, so the
     * built-in session check + role gate run. Errors always return to the login page.
     */
    socialCallbackURL?: string;
    /**
     * The plugin's `authBasePath` (mount segment under `routes.api`). Combined with
     * `routes.api` from the live Payload config to point the auth client at the
     * mounted endpoints — Better Auth's client otherwise defaults to `/api/auth`,
     * which is wrong whenever `routes.api` isn't `/api`. Resolved server-side by
     * LoginViewWrapper (the unauthenticated login page's client config carries no
     * `admin.custom`). Default: '/auth'.
     */
    authBasePath?: string;
    /**
     * Offer "use a backup code" on the two-factor step.
     * - 'auto': available iff the twoFactor plugin is detected (backup codes are
     *   issued on enable). Standalone use without the wrapper resolves to true —
     *   the 2FA step only renders when a second factor exists.
     * Default: 'auto'.
     *
     * Better Auth never reports whether a given user still holds unused backup
     * codes, so this stays a server-wide ceiling rather than a per-user fact.
     */
    enableTwoFactorBackupCode?: boolean | 'auto';
    /**
     * Offer "email me a code" on the two-factor step (`sendOtp`/`verifyOtp`).
     * - 'auto': available iff the twoFactor plugin is configured with
     *   `otpOptions.sendOTP`. Standalone use without the wrapper resolves to false.
     * Default: 'auto'.
     *
     * This is a ceiling: sign-in reports the factors this user actually has, and
     * the step never offers one the server left out of that list.
     */
    enableTwoFactorEmailOtp?: boolean | 'auto';
    /**
     * Digits in each one-time code, read from the Better Auth plugin options by
     * LoginViewWrapper. Better Auth lets all three be configured, and a form that
     * assumes six refuses to submit a valid code of any other length.
     * Default: 6 for each.
     */
    otpLengths?: Partial<OtpLengths>;
};
export declare function LoginView({ authClient: providedClient, logo, title, afterLoginPath, requiredRole, requireAllRoles, enablePasskey, enableSignUp, enableForgotPassword, resetPasswordUrl, enablePassword, enableMagicLink, enableEmailOtp, magicLinkCallbackURL, socialProviders, socialCallbackURL, authBasePath, enableTwoFactorBackupCode, enableTwoFactorEmailOtp, otpLengths, }: LoginViewProps): import("react").JSX.Element;
export default LoginView;
