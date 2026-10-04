import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AuthCard } from './AuthCard.js';
export function AccessDeniedScreen({ onSignOut }) {
    return /*#__PURE__*/ _jsxs(AuthCard, {
        center: true,
        children: [
            /*#__PURE__*/ _jsx("h1", {
                style: {
                    color: 'var(--theme-error-500)',
                    fontSize: 'var(--font-size-h3)',
                    fontWeight: 600,
                    margin: '0 0 var(--base) 0'
                },
                children: "Access Denied"
            }),
            /*#__PURE__*/ _jsx("p", {
                style: {
                    color: 'var(--theme-text)',
                    opacity: 0.8,
                    marginBottom: 'calc(var(--base) * 1.5)',
                    fontSize: 'var(--font-size-small)'
                },
                children: "You don't have permission to access the admin panel. Please contact an administrator if you believe this is an error."
            }),
            /*#__PURE__*/ _jsx("button", {
                onClick: onSignOut,
                style: {
                    padding: 'calc(var(--base) * 0.75) calc(var(--base) * 1.5)',
                    background: 'var(--theme-elevation-150)',
                    border: 'none',
                    borderRadius: 'var(--style-radius-s)',
                    color: 'var(--theme-text)',
                    fontSize: 'var(--font-size-base)',
                    cursor: 'pointer'
                },
                children: "Sign out and try again"
            })
        ]
    });
}
