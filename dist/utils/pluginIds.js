/**
 * Shared Better Auth plugin-id detection.
 *
 * A single source of truth for reading which plugins are configured, so the
 * management-UI detector (`detectEnabledPlugins`) and the login-method detector
 * (`detectEnabledMethods`) can't drift apart. All ids verified against Better
 * Auth 1.7.
 */ /** Known Better Auth plugin ids this package recognizes. */ export const PLUGIN_IDS = {
    admin: 'admin',
    apiKey: 'api-key',
    twoFactor: 'two-factor',
    passkey: 'passkey',
    magicLink: 'magic-link',
    emailOtp: 'email-otp',
    multiSession: 'multi-session',
    organization: 'organization',
    nextCookies: 'next-cookies'
};
/**
 * Extract the set of plugin ids from Better Auth options. Robust to a missing or
 * non-array `plugins` value (an untyped JS config won't crash detection).
 */ export function getPluginIds(options) {
    const plugins = Array.isArray(options?.plugins) ? options?.plugins : [];
    return new Set(plugins.map((p)=>p?.id).filter((id)=>typeof id === 'string'));
}
