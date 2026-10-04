/**
 * Pure helpers for deciding which sign-in methods the LoginView should display.
 * Kept DOM-free so they can be unit-tested under the project's node-env vitest setup.
 */
/** A method-enable setting: explicit boolean, or 'auto' to defer to an endpoint probe. */
export type MethodSetting = boolean | 'auto';
/**
 * Resolve a `boolean | 'auto'` setting against the result of an endpoint probe.
 *
 * - `true`   -> always available
 * - `false`  -> never available
 * - `'auto'` -> available iff the probe succeeded (`probeOk === true`); a `null`
 *               probe (not yet completed) resolves to `false`.
 */
export declare function resolveAvailability(setting: MethodSetting, probeOk: boolean | null): boolean;
/** The sign-in methods that can own the primary submit button. */
export type PrimaryMethod = 'password' | 'magicLink' | 'emailOtp';
/**
 * Choose which available method owns the primary submit button.
 * Precedence: password -> magicLink -> emailOtp. Returns null if none are available.
 */
export declare function pickPrimaryMethod(available: {
    password: boolean;
    magicLink: boolean;
    emailOtp: boolean;
}): PrimaryMethod | null;
/** Which sign-in methods a Better Auth instance actually has enabled. */
export interface DetectedMethods {
    password: boolean;
    signup: boolean;
    forgotPassword: boolean;
    passkey: boolean;
    magicLink: boolean;
    emailOtp: boolean;
    /** twoFactor plugin present — backup codes are issued on enable. */
    twoFactorBackupCode: boolean;
    /** twoFactor plugin configured with `otpOptions.sendOTP` (emailed second factor). */
    twoFactorEmailOtp: boolean;
}
/**
 * Minimal structural shape of the Better Auth resolved options we read.
 * Declared locally (not imported from better-auth) so this stays dependency-free
 * and unit-testable.
 */
export interface AuthOptionsLike {
    emailAndPassword?: {
        enabled?: boolean;
        disableSignUp?: boolean;
        sendResetPassword?: unknown;
    };
    plugins?: Array<{
        id?: string;
        options?: {
            otpLength?: unknown;
            otpOptions?: {
                sendOTP?: unknown;
                digits?: unknown;
            };
            totpOptions?: {
                digits?: unknown;
            };
        };
    } | null | undefined>;
    socialProviders?: Record<string, unknown> | null;
}
/**
 * Determine which sign-in methods are enabled from a Better Auth instance's
 * resolved `options`. This is the authoritative, server-side replacement for the
 * old client-side endpoint probing: Better Auth answers every `OPTIONS` request
 * with 200 (CORS preflight), so probing `OPTIONS /sign-in/*` could never tell
 * whether a method was actually enabled.
 *
 * `forgotPassword` requires a configured `sendResetPassword` callback, since the
 * reset flow can't email a link without it.
 */
export declare function detectEnabledMethods(options: AuthOptionsLike | null | undefined): DetectedMethods;
/** Which second factors the two-factor step should offer. */
export interface TwoFactorOffer {
    totp: boolean;
    emailOtp: boolean;
}
/**
 * Decide which second factors to offer, from what sign-in reported for this
 * user (`twoFactorMethods`) narrowed by the server-wide config ceiling.
 *
 * `reported` is `null` when the server didn't say — an older Better Auth, or a
 * flow that doesn't carry the field — in which case the ceiling stands alone.
 * An empty array is a real answer: this user has neither, so only their backup
 * codes are left.
 */
export declare function resolveTwoFactorOffer(reported: string[] | null, allowEmailOtp: boolean): TwoFactorOffer;
/**
 * How many characters each one-time code has. Better Auth lets every one of
 * these be configured, and a form that hardcodes six silently refuses to submit
 * a valid code of any other length.
 */
export interface OtpLengths {
    /** emailOTP plugin's `otpLength` — the sign-in code. */
    emailOtp: number;
    /** twoFactor plugin's `totpOptions.digits` — the authenticator-app code. */
    twoFactorTotp: number;
    /** twoFactor plugin's `otpOptions.digits` — the emailed second factor. */
    twoFactorEmailOtp: number;
}
/** Better Auth's default for all three. */
export declare const DEFAULT_OTP_LENGTHS: OtpLengths;
/**
 * Read the configured one-time-code lengths off a Better Auth instance's
 * resolved `options`. Anything absent or nonsensical falls back to 6.
 */
export declare function detectOtpLengths(options: AuthOptionsLike | null | undefined): OtpLengths;
/** A resolved social provider ready to render in the LoginView. */
export interface SocialProvider {
    id: string;
    label: string;
}
/**
 * A social provider as it appears on Better Auth's resolved context.
 *
 * Entries may be a provider object or a thunk resolving to one: Better Auth's own
 * lookup (`getAwaitableValue`) calls function entries before matching, so anything
 * reading this list has to resolve them the same way.
 */
export type ContextSocialProvider = {
    id?: unknown;
    name?: unknown;
} | (() => {
    id?: unknown;
    name?: unknown;
} | Promise<{
    id?: unknown;
    name?: unknown;
}>) | null | undefined;
/**
 * Minimal structural shape of Better Auth's resolved auth context (`auth.$context`).
 * Declared locally, like `AuthOptionsLike`, so this module stays dependency-free.
 */
export interface AuthContextLike {
    /**
     * Options AFTER plugin `init()` ran. Not the same object as `auth.options`:
     * Better Auth merges plugin-contributed options into the context, so a plugin
     * that enables a sign-in method is only visible here.
     */
    options?: AuthOptionsLike | null;
    /** Providers Better Auth actually resolved — the list `/sign-in/social` matches against. */
    socialProviders?: ContextSocialProvider[] | null;
}
/** A social provider detected on the resolved context. */
export interface DetectedSocialProvider {
    id: string;
    /** Better Auth's display name for the provider, when it has one ('Company SSO'). */
    name?: string;
}
/**
 * Providers Better Auth actually resolved, read off `auth.$context`.
 *
 * This is deliberately not derived from `options.socialProviders`. That record is
 * the raw config, and three things happen between it and a working sign-in:
 *
 * - `genericOAuth` registers its providers as first-class social providers by
 *   merging them into the context during plugin `init()` (Better Auth >= 1.7) —
 *   they never appear in options at all.
 * - A provider with `enabled: false` is dropped.
 * - A provider whose config is a thunk is awaited, and dropped if it resolves to
 *   `null`.
 *
 * Reading the resolved list instead keeps the login page honest by construction:
 * if a button renders, `/sign-in/social` will accept its id.
 *
 * Order and shadowing follow Better Auth: the first entry for an id wins, which is
 * how a generic provider shadows a built-in one of the same name.
 */
export declare function detectSocialProviders(context: AuthContextLike | null | undefined): Promise<DetectedSocialProvider[]>;
/**
 * Resolve the `enableSocial` setting against the detected providers.
 * - `false` / `undefined` -> `[]` (off; the default)
 * - `true`                -> every detected provider, as `{ id, label }`
 * - `string[]`            -> allowlist ∩ detected, in the ALLOWLIST's order; unknown ids dropped
 */
export declare function resolveSocialProviders(enableSocial: boolean | string[] | undefined, detected: DetectedSocialProvider[]): SocialProvider[];
/**
 * Human-facing label for a provider: canonical casing for ids we know (Better Auth
 * calls `microsoft` "Microsoft EntraID"; the admin UI says "Microsoft"), then the
 * provider's own display name — which is how a generic provider configured as
 * `{ providerId: 'zitadel', name: 'Company SSO' }` reads as "Company SSO" rather
 * than "Zitadel" — and finally the capitalized id.
 */
export declare function socialProviderLabel(id: string, name?: string): string;
