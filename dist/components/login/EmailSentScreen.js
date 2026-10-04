import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AuthCard } from './AuthCard.js';
export function EmailSentScreen({ icon, message, note, logo, onBack }) {
    return /*#__PURE__*/ _jsxs(AuthCard, {
        logo: logo,
        center: true,
        children: [
            /*#__PURE__*/ _jsx("div", {
                style: {
                    width: '64px',
                    height: '64px',
                    background: 'var(--theme-success-100)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto calc(var(--base) * 1.5)',
                    fontSize: '28px'
                },
                children: icon
            }),
            /*#__PURE__*/ _jsx("h1", {
                style: {
                    color: 'var(--theme-text)',
                    fontSize: 'var(--font-size-h3)',
                    fontWeight: 600,
                    margin: '0 0 calc(var(--base) * 0.5) 0'
                },
                children: "Check Your Email"
            }),
            /*#__PURE__*/ _jsx("p", {
                style: {
                    color: 'var(--theme-text)',
                    opacity: 0.7,
                    fontSize: 'var(--font-size-small)',
                    marginBottom: 'calc(var(--base) * 1.5)'
                },
                children: message
            }),
            note && /*#__PURE__*/ _jsx("p", {
                style: {
                    color: 'var(--theme-text)',
                    opacity: 0.6,
                    fontSize: 'var(--font-size-small)',
                    marginBottom: 'calc(var(--base) * 1.5)'
                },
                children: note
            }),
            /*#__PURE__*/ _jsx("button", {
                type: "button",
                onClick: onBack,
                style: {
                    padding: 'calc(var(--base) * 0.75) calc(var(--base) * 1.5)',
                    background: 'var(--theme-elevation-150)',
                    border: 'none',
                    borderRadius: 'var(--style-radius-s)',
                    color: 'var(--theme-text)',
                    fontSize: 'var(--font-size-base)',
                    cursor: 'pointer'
                },
                children: "Back to login"
            })
        ]
    });
}
