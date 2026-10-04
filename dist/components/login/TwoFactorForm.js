import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from 'react';
import { AuthCard } from './AuthCard.js';
import { OtpInput } from './OtpInput.js';
import { AuthBanner } from './AuthBanner.js';
import { AuthButton } from './AuthButton.js';
const RESEND_COOLDOWN_SECONDS = 30;
function copyFor(method, codeLength) {
    switch(method){
        case 'backup':
            return {
                hint: 'Enter one of the backup codes you saved when setting up two-factor authentication. Each code works once.',
                label: 'Backup Code'
            };
        case 'emailOtp':
            return {
                hint: "We've emailed you a verification code. Enter it below.",
                label: 'Emailed Code'
            };
        default:
            return {
                hint: `Enter the ${codeLength}-digit code from your authenticator app`,
                label: 'Verification Code'
            };
    }
}
const linkStyle = {
    background: 'transparent',
    border: 'none',
    color: 'var(--theme-text)',
    cursor: 'pointer',
    fontSize: 'var(--font-size-small)',
    opacity: 0.7,
    padding: 'calc(var(--base) * 0.25)',
    textDecoration: 'underline'
};
export function TwoFactorForm({ code, onCodeChange, onSubmit, onBack, loading, error, logo, method = 'totp', onMethodChange, enableTotp = true, enableBackupCode = false, enableEmailOtp = false, codeLength = 6, onResendEmailOtp }) {
    const { hint, label } = copyFor(method, codeLength);
    const submitDisabled = loading || (method === 'backup' ? code.trim().length === 0 : code.length !== codeLength);
    // A code is emailed when the method is selected and on every resend, so gate
    // resends behind a countdown — the server rate-limits anyway, but a ticking
    // link beats an opaque rate-limit error.
    const [resendCooldown, setResendCooldown] = useState(0);
    useEffect(()=>{
        if (method === 'emailOtp') setResendCooldown(RESEND_COOLDOWN_SECONDS);
    }, [
        method
    ]);
    useEffect(()=>{
        if (resendCooldown === 0) return;
        const timer = setTimeout(()=>setResendCooldown((s)=>Math.max(0, s - 1)), 1000);
        return ()=>clearTimeout(timer);
    }, [
        resendCooldown
    ]);
    const alternates = [];
    if (enableTotp && method !== 'totp') {
        alternates.push({
            label: 'Use your authenticator app',
            method: 'totp'
        });
    }
    if (enableBackupCode && method !== 'backup') {
        alternates.push({
            label: 'Use a backup code',
            method: 'backup'
        });
    }
    if (enableEmailOtp && method !== 'emailOtp') {
        alternates.push({
            label: 'Email me a code',
            method: 'emailOtp'
        });
    }
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
                children: "Two-Factor Authentication"
            }),
            /*#__PURE__*/ _jsx("p", {
                style: {
                    color: 'var(--theme-text)',
                    opacity: 0.7,
                    fontSize: 'var(--font-size-small)',
                    textAlign: 'center',
                    marginBottom: 'calc(var(--base) * 1.5)'
                },
                children: hint
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
                                htmlFor: "totp-code",
                                style: {
                                    display: 'block',
                                    color: 'var(--theme-text)',
                                    marginBottom: 'calc(var(--base) * 0.5)',
                                    fontSize: 'var(--font-size-small)',
                                    fontWeight: 500
                                },
                                children: label
                            }),
                            method === 'backup' ? /*#__PURE__*/ _jsx("input", {
                                id: "totp-code",
                                type: "text",
                                value: code,
                                onChange: (e)=>onCodeChange(e.target.value),
                                autoFocus: true,
                                autoComplete: "off",
                                required: true,
                                style: {
                                    width: '100%',
                                    padding: 'calc(var(--base) * 0.75)',
                                    background: 'var(--theme-input-bg)',
                                    border: '1px solid var(--theme-elevation-150)',
                                    borderRadius: 'var(--style-radius-s)',
                                    color: 'var(--theme-text)',
                                    fontSize: 'var(--font-size-base)',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }
                            }) : /*#__PURE__*/ _jsx(OtpInput, {
                                id: "totp-code",
                                value: code,
                                onChange: onCodeChange,
                                length: codeLength,
                                autoFocus: true,
                                pattern: "[0-9]*"
                            })
                        ]
                    }),
                    error && /*#__PURE__*/ _jsx(AuthBanner, {
                        kind: "error",
                        children: error
                    }),
                    /*#__PURE__*/ _jsx(AuthButton, {
                        type: "submit",
                        disabled: submitDisabled,
                        children: loading ? 'Verifying...' : 'Verify'
                    })
                ]
            }),
            (alternates.length > 0 || method === 'emailOtp' && onResendEmailOtp) && /*#__PURE__*/ _jsxs("div", {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'calc(var(--base) * 0.25)',
                    marginTop: 'var(--base)',
                    textAlign: 'center'
                },
                children: [
                    method === 'emailOtp' && onResendEmailOtp && /*#__PURE__*/ _jsx("button", {
                        type: "button",
                        onClick: ()=>{
                            onResendEmailOtp();
                            setResendCooldown(RESEND_COOLDOWN_SECONDS);
                        },
                        style: {
                            ...linkStyle,
                            cursor: resendCooldown > 0 ? 'default' : linkStyle.cursor,
                            textDecoration: resendCooldown > 0 ? 'none' : linkStyle.textDecoration
                        },
                        disabled: loading || resendCooldown > 0,
                        children: resendCooldown > 0 ? `Resend the code (${resendCooldown}s)` : 'Resend the code'
                    }),
                    alternates.map((alternate)=>/*#__PURE__*/ _jsx("button", {
                            type: "button",
                            onClick: ()=>onMethodChange?.(alternate.method),
                            style: linkStyle,
                            disabled: loading,
                            children: alternate.label
                        }, alternate.method))
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
