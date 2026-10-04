'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { NavGroup, useConfig } from '@payloadcms/ui';
/**
 * Navigation links for security management features.
 * Rendered in admin sidebar via afterNavLinks injection.
 * Uses Payload's NavGroup and nav CSS classes for native styling.
 *
 * Currently only renders API Keys link — 2FA and Passkeys
 * are now embedded as ui fields on the user document.
 */ export function SecurityNavLinks({ basePath, showApiKeys = true } = {}) {
    const { config: { routes: { admin: adminRoute } } } = useConfig();
    if (!showApiKeys) {
        return null;
    }
    const resolvedBasePath = basePath ?? `${adminRoute}/security`;
    return /*#__PURE__*/ _jsx(NavGroup, {
        label: "Security",
        children: /*#__PURE__*/ _jsx("a", {
            href: `${resolvedBasePath}/api-keys`,
            className: "nav__link",
            children: /*#__PURE__*/ _jsx("span", {
                className: "nav__link-label",
                children: "API Keys"
            })
        })
    });
}
export default SecurityNavLinks;
