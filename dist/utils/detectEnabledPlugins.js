/**
 * Utility to detect which Better Auth plugins are enabled
 */ import { getPluginIds, PLUGIN_IDS } from './pluginIds.js';
/**
 * Detects which Better Auth plugins are enabled from the options.
 * Inspects the plugins array by checking plugin identifiers.
 *
 * @param options - Better Auth options containing plugins array
 * @returns Object with boolean flags for each supported plugin
 */ export function detectEnabledPlugins(options) {
    const ids = getPluginIds(options);
    return {
        hasAdmin: ids.has(PLUGIN_IDS.admin),
        hasApiKey: ids.has(PLUGIN_IDS.apiKey),
        hasTwoFactor: ids.has(PLUGIN_IDS.twoFactor),
        hasPasskey: ids.has(PLUGIN_IDS.passkey),
        hasMagicLink: ids.has(PLUGIN_IDS.magicLink),
        hasMultiSession: ids.has(PLUGIN_IDS.multiSession),
        hasOrganization: ids.has(PLUGIN_IDS.organization),
        hasNextCookies: ids.has(PLUGIN_IDS.nextCookies)
    };
}
