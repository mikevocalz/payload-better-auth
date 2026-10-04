import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { AuthCard } from './AuthCard.js';
import { OtpInput } from './OtpInput.js';
import { AuthBanner } from './AuthBanner.js';
import { AuthButton } from './AuthButton.js';
export function EmailOtpForm({ email, code, onCodeChange, onSubmit, onBack, loading, error, logo, codeLength = 6 }) {
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
                children: "Enter Your Code"
            }),
            /*#__PURE__*/ _jsxs("p", {
                style: {
                    color: 'var(--theme-text)',
                    opacity: 0.7,
                    fontSize: 'var(--font-size-small)',
                    textAlign: 'center',
                    marginBottom: 'calc(var(--base) * 1.5)'
                },
                children: [
                    "We've sent a verification code to ",
                    /*#__PURE__*/ _jsx("strong", {
                        children: email
                    })
                ]
            }),
            /*#__PURE__*/ _jsxs("form", {
                onSubmit: onSubmit,
                children: [
                    /*#__PURE__*/ _jsxs("div", {
                        style: {
                            marginBottom: 'calc(var(--base) * 1.5)'
                        },
                        children: [
                            /*#__PURE__*/ _jsx("label", {
                                htmlFor: "email-otp-code",
                                style: {
                                    display: 'block',
                                    color: 'var(--theme-text)',
                                    marginBottom: 'calc(var(--base) * 0.5)',
                                    fontSize: 'var(--font-size-small)',
                                    fontWeight: 500
                                },
                                children: "Verification Code"
                            }),
                            /*#__PURE__*/ _jsx(OtpInput, {
                                id: "email-otp-code",
                                value: code,
                                onChange: onCodeChange,
                                length: codeLength,
                                autoFocus: true
                            })
                        ]
                    }),
                    error && /*#__PURE__*/ _jsx(AuthBanner, {
                        kind: "error",
                        children: error
                    }),
                    /*#__PURE__*/ _jsx(AuthButton, {
                        type: "submit",
                        disabled: loading || code.length !== codeLength,
                        children: loading ? 'Verifying...' : 'Verify'
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
