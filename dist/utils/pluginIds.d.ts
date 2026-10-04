/**
 * Shared Better Auth plugin-id detection.
 *
 * A single source of truth for reading which plugins are configured, so the
 * management-UI detector (`detectEnabledPlugins`) and the login-method detector
 * (`detectEnabledMethods`) can't drift apart. All ids verified against Better
 * Auth 1.7.
 */
/** Known Better Auth plugin ids this package recognizes. */
export declare const PLUGIN_IDS: {
    readonly admin: "admin";
    readonly apiKey: "api-key";
    readonly twoFactor: "two-factor";
    readonly passkey: "passkey";
    readonly magicLink: "magic-link";
    readonly emailOtp: "email-otp";
    readonly multiSession: "multi-session";
    readonly organization: "organization";
    readonly nextCookies: "next-cookies";
};
/**
 * Extract the set of plugin ids from Better Auth options. Robust to a missing or
 * non-array `plugins` value (an untyped JS config won't crash detection).
 */
export declare function getPluginIds(options?: {
    plugins?: unknown;
} | null): Set<string>;
