/**
 * Pure helpers for deciding which sign-in methods the LoginView should display.
 * Kept DOM-free so they can be unit-tested under the project's node-env vitest setup.
 */ import { getPluginIds, PLUGIN_IDS } from './pluginIds.js';
/**
 * Resolve a `boolean | 'auto'` setting against the result of an endpoint probe.
 *
 * - `true`   -> always available
 * - `false`  -> never available
 * - `'auto'` -> available iff the probe succeeded (`probeOk === true`); a `null`
 *               probe (not yet completed) resolves to `false`.
 */ export function resolveAvailability(setting, probeOk) {
    if (setting === true) return true;
    if (setting === false) return false;
    return probeOk === true;
}
/**
 * Choose which available method owns the primary submit button.
 * Precedence: password -> magicLink -> emailOtp. Returns null if none are available.
 */ export function pickPrimaryMethod(available) {
    if (available.password) return 'password';
    if (available.magicLink) return 'magicLink';
    if (available.emailOtp) return 'emailOtp';
    return null;
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
 */ export function detectEnabledMethods(options) {
    const ep = options?.emailAndPassword;
    const password = !!ep?.enabled;
    const pluginIds = getPluginIds(options);
    const twoFactorPlugin = options?.plugins?.find((p)=>p?.id === PLUGIN_IDS.twoFactor);
    return {
        password,
        signup: password && !ep?.disableSignUp,
        forgotPassword: password && !!ep?.sendResetPassword,
        passkey: pluginIds.has(PLUGIN_IDS.passkey),
        magicLink: pluginIds.has(PLUGIN_IDS.magicLink),
        emailOtp: pluginIds.has(PLUGIN_IDS.emailOtp),
        twoFactorBackupCode: !!twoFactorPlugin,
        twoFactorEmailOtp: typeof twoFactorPlugin?.options?.otpOptions?.sendOTP === 'function'
    };
}
/**
 * Decide which second factors to offer, from what sign-in reported for this
 * user (`twoFactorMethods`) narrowed by the server-wide config ceiling.
 *
 * `reported` is `null` when the server didn't say — an older Better Auth, or a
 * flow that doesn't carry the field — in which case the ceiling stands alone.
 * An empty array is a real answer: this user has neither, so only their backup
 * codes are left.
 */ export function resolveTwoFactorOffer(reported, allowEmailOtp) {
    return {
        totp: reported ? reported.includes('totp') : true,
        emailOtp: allowEmailOtp && (reported ? reported.includes('otp') : true)
    };
}
/** Better Auth's default for all three. */ export const DEFAULT_OTP_LENGTHS = {
    emailOtp: 6,
    twoFactorTotp: 6,
    twoFactorEmailOtp: 6
};
/** A configured length is only honoured if it's a positive integer. */ function otpLength(value) {
    return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : 6;
}
/**
 * Read the configured one-time-code lengths off a Better Auth instance's
 * resolved `options`. Anything absent or nonsensical falls back to 6.
 */ export function detectOtpLengths(options) {
    const plugins = options?.plugins;
    const emailOtpPlugin = plugins?.find((p)=>p?.id === PLUGIN_IDS.emailOtp);
    const twoFactorPlugin = plugins?.find((p)=>p?.id === PLUGIN_IDS.twoFactor);
    return {
        emailOtp: otpLength(emailOtpPlugin?.options?.otpLength),
        twoFactorTotp: otpLength(twoFactorPlugin?.options?.totpOptions?.digits),
        twoFactorEmailOtp: otpLength(twoFactorPlugin?.options?.otpOptions?.digits)
    };
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
 */ export async function detectSocialProviders(context) {
    const entries = context?.socialProviders;
    if (!Array.isArray(entries)) return [];
    const detected = [];
    const seen = new Set();
    for (const entry of entries){
        if (!entry) continue;
        let provider;
        try {
            provider = typeof entry === 'function' ? await entry() : entry;
        } catch  {
            continue;
        }
        const id = provider?.id;
        if (typeof id !== 'string' || id === '' || seen.has(id)) continue;
        seen.add(id);
        const name = provider?.name;
        detected.push(typeof name === 'string' && name.trim() !== '' ? {
            id,
            name
        } : {
            id
        });
    }
    return detected;
}
/**
 * Resolve the `enableSocial` setting against the detected providers.
 * - `false` / `undefined` -> `[]` (off; the default)
 * - `true`                -> every detected provider, as `{ id, label }`
 * - `string[]`            -> allowlist ∩ detected, in the ALLOWLIST's order; unknown ids dropped
 */ export function resolveSocialProviders(enableSocial, detected) {
    if (!enableSocial) return [];
    const byId = new Map(detected.map((p)=>[
            p.id,
            p
        ]));
    const ids = enableSocial === true ? detected.map((p)=>p.id) : enableSocial.filter((id)=>byId.has(id));
    const unique = [
        ...new Set(ids)
    ];
    return unique.map((id)=>({
            id,
            label: socialProviderLabel(id, byId.get(id)?.name)
        }));
}
/**
 * Human-facing label for a provider: canonical casing for ids we know (Better Auth
 * calls `microsoft` "Microsoft EntraID"; the admin UI says "Microsoft"), then the
 * provider's own display name — which is how a generic provider configured as
 * `{ providerId: 'zitadel', name: 'Company SSO' }` reads as "Company SSO" rather
 * than "Zitadel" — and finally the capitalized id.
 */ export function socialProviderLabel(id, name) {
    const known = {
        google: 'Google',
        github: 'GitHub',
        microsoft: 'Microsoft',
        apple: 'Apple',
        facebook: 'Facebook',
        discord: 'Discord',
        gitlab: 'GitLab',
        twitch: 'Twitch',
        spotify: 'Spotify',
        twitter: 'Twitter',
        dropbox: 'Dropbox',
        linkedin: 'LinkedIn',
        reddit: 'Reddit',
        kick: 'Kick',
        tiktok: 'TikTok',
        x: 'X',
        zoom: 'Zoom',
        roblox: 'Roblox',
        vk: 'VK',
        notion: 'Notion'
    };
    if (known[id]) return known[id];
    if (name && name.trim() !== '') return name.trim();
    if (!id) return id;
    return id.charAt(0).toUpperCase() + id.slice(1);
}
