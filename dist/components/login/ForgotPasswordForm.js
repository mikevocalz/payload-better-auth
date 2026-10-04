import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { AuthCard } from './AuthCard.js';
import { AuthField } from './AuthField.js';
import { AuthBanner } from './AuthBanner.js';
import { AuthButton } from './AuthButton.js';
export function ForgotPasswordForm({ email, onEmailChange, onSubmit, onBack, loading, error, logo }) {
    return /*#__PURE__*/ _jsxs(AuthCard, {
        logo: logo,
        children: [
            /*#__PURE__*/ _jsx("h1", {
                style: {
                    color: 'var(--theme-text)',
                    fontSize: 'var(--font-size-h3)',
                    fontWeight: 600,
                    margin: '0 0 calc(var(--base) * 0.5) 0',
                    textAlign: 'center'
                },
                children: "Reset Password"
            }),
            /*#__PURE__*/ _jsx("p", {
                style: {
                    color: 'var(--theme-text)',
                    opacity: 0.7,
                    fontSize: 'var(--font-size-small)',
                    textAlign: 'center',
                    marginBottom: 'calc(var(--base) * 1.5)'
                },
                children: "Enter your email and we'll send you a link to reset your password"
            }),
            /*#__PURE__*/ _jsxs("form", {
                onSubmit: onSubmit,
                children: [
                    /*#__PURE__*/ _jsx(AuthField, {
                        id: "forgot-email",
                        label: "Email",
                        type: "email",
                        value: email,
                        onChange: onEmailChange,
                        autoComplete: "email",
                        marginBottom: "calc(var(--base) * 1.5)",
                        autoFocus: true
                    }),
                    error && /*#__PURE__*/ _jsx(AuthBanner, {
                        kind: "error",
                        children: error
                    }),
                    /*#__PURE__*/ _jsx(AuthButton, {
                        type: "submit",
                        disabled: loading,
                        children: loading ? 'Sending...' : 'Send Reset Link'
                    })
                ]
            }),
            /*#__PURE__*/ _jsx("button", {
                type: "button",
                onClick: onBack,
                style: {
                    width: '100%',
                    marginTop: 'var(--base)',
                    padding: 'calc(var(--base) * 0.5)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--theme-text)',
                    opacity: 0.7,
                    fontSize: 'var(--font-size-small)',
                    cursor: 'pointer'
                },
                children: "← Back to login"
            })
        ]
    });
}
