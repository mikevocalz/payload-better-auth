/**
 * Utility to detect which Better Auth plugins are enabled
 */
import type { BetterAuthOptions } from 'better-auth';
export type EnabledPluginsResult = {
    hasAdmin: boolean;
    hasApiKey: boolean;
    hasTwoFactor: boolean;
    hasPasskey: boolean;
    hasMagicLink: boolean;
    hasMultiSession: boolean;
    hasOrganization: boolean;
    hasNextCookies: boolean;
};
/**
 * Detects which Better Auth plugins are enabled from the options.
 * Inspects the plugins array by checking plugin identifiers.
 *
 * @param options - Better Auth options containing plugins array
 * @returns Object with boolean flags for each supported plugin
 */
export declare function detectEnabledPlugins(options?: Partial<BetterAuthOptions>): EnabledPluginsResult;
