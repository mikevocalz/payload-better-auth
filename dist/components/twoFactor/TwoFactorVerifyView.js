'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useRouter } from 'next/navigation.js';
import { useConfig } from '@payloadcms/ui';
import { useAuthMountPath } from '../useAuthMountPath.js';
/**
 * Two-factor authentication verification component.
 * Used during login flow when 2FA is enabled on the account.
 * Uses Better Auth's twoFactor plugin endpoints.
 */ export function TwoFactorVerifyView({ logo, title = 'Two-Factor Authentication', afterVerifyPath, onVerifyComplete }) {
    const router = useRouter();
    const { config: { routes: { admin: adminRoute } } } = useConfig();
    const authMountPath = useAuthMountPath();
    const resolvedAfterVerifyPath = afterVerifyPath ?? adminRoute;
    const [code, setCode] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [useBackupCode, setUseBackupCode] = useState(false);
    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const endpoint = useBackupCode ? `${authMountPath}/two-factor/verify-backup-code` : `${authMountPath}/two-factor/verify-totp`;
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    code
                })
            });
            if (response.ok) {
                onVerifyComplete?.();
                router.push(resolvedAfterVerifyPath);
                router.refresh();
            } else {
                const data = await response.json().catch(()=>({}));
                setError(data.message || 'Invalid code. Please try again.');
            }
        } catch  {
            setError('An error occurred. Please try again.');
        } finally{
            setLoading(false);
        }
    }
    return /*#__PURE__*/ _jsx("div", {
        style: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--theme-bg)',
            padding: 'var(--base)'
        },
        children: /*#__PURE__*/ _jsxs("div", {
            style: {
                background: 'var(--theme-elevation-50)',
                padding: 'calc(var(--base) * 2)',
                borderRadius: 'var(--style-radius-m)',
                boxShadow: '0 2px 20px rgba(0, 0, 0, 0.1)',
                width: '100%',
                maxWidth: '400px'
            },
            children: [
                logo && /*#__PURE__*/ _jsx("div", {
                    style: {
                        textAlign: 'center',
                        marginBottom: 'calc(var(--base) * 1.5)'
                    },
                    children: logo
                }),
                /*#__PURE__*/ _jsx("h1", {
                    style: {
                        color: 'var(--theme-text)',
                        fontSize: 'var(--font-size-h3)',
                        fontWeight: 600,
                        margin: '0 0 calc(var(--base) * 0.5) 0',
                        textAlign: 'center'
                    },
                    children: title
                }),
                /*#__PURE__*/ _jsx("p", {
                    style: {
                        color: 'var(--theme-text)',
                        opacity: 0.7,
                        fontSize: 'var(--font-size-small)',
                        textAlign: 'center',
                        marginBottom: 'calc(var(--base) * 1.5)'
                    },
                    children: useBackupCode ? 'Enter one of your backup codes.' : 'Enter the code from your authenticator app.'
                }),
                /*#__PURE__*/ _jsxs("form", {
                    onSubmit: handleSubmit,
                    children: [
                        /*#__PURE__*/ _jsxs("div", {
                            style: {
                                marginBottom: 'calc(var(--base) * 1.5)'
                            },
                            children: [
                                /*#__PURE__*/ _jsx("label", {
                                    htmlFor: "code",
                                    style: {
                                        display: 'block',
                                        color: 'var(--theme-text)',
                                        marginBottom: 'calc(var(--base) * 0.5)',
                                        fontSize: 'var(--font-size-small)',
                                        fontWeight: 500
                                    },
                                    children: useBackupCode ? 'Backup Code' : 'Verification Code'
                                }),
                                /*#__PURE__*/ _jsx("input", {
                                    id: "code",
                                    type: "text",
                                    inputMode: useBackupCode ? 'text' : 'numeric',
                                    pattern: useBackupCode ? undefined : '[0-9]*',
                                    autoComplete: "one-time-code",
                                    value: code,
                                    onChange: (e)=>{
                                        if (useBackupCode) {
                                            setCode(e.target.value);
                                        } else {
                                            setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                                        }
                                    },
                                    required: true,
                                    placeholder: useBackupCode ? 'xxxxxxxx' : '000000',
                                    style: {
                                        width: '100%',
                                        padding: 'calc(var(--base) * 0.75)',
                                        background: 'var(--theme-input-bg)',
                                        border: '1px solid var(--theme-elevation-150)',
                                        borderRadius: 'var(--style-radius-s)',
                                        color: 'var(--theme-text)',
                                        fontSize: 'var(--font-size-h4)',
                                        fontFamily: 'monospace',
                                        textAlign: 'center',
                                        letterSpacing: useBackupCode ? '0.2em' : '0.5em',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }
                                })
                            ]
                        }),
                        error && /*#__PURE__*/ _jsx("div", {
                            style: {
                                color: 'var(--theme-error-500)',
                                marginBottom: 'var(--base)',
                                fontSize: 'var(--font-size-small)',
                                padding: 'calc(var(--base) * 0.5)',
                                background: 'var(--theme-error-50)',
                                borderRadius: 'var(--style-radius-s)',
                                border: '1px solid var(--theme-error-200)'
                            },
                            children: error
                        }),
                        /*#__PURE__*/ _jsx("button", {
                            type: "submit",
                            disabled: loading || !useBackupCode && code.length !== 6,
                            style: {
                                width: '100%',
                                padding: 'calc(var(--base) * 0.75)',
                                background: 'var(--theme-elevation-800)',
                                border: 'none',
                                borderRadius: 'var(--style-radius-s)',
                                color: 'var(--theme-elevation-50)',
                                fontSize: 'var(--font-size-base)',
                                fontWeight: 500,
                                cursor: loading || !useBackupCode && code.length !== 6 ? 'not-allowed' : 'pointer',
                                opacity: loading || !useBackupCode && code.length !== 6 ? 0.7 : 1,
                                transition: 'opacity 150ms ease',
                                marginBottom: 'var(--base)'
                            },
                            children: loading ? 'Verifying...' : 'Verify'
                        }),
                        /*#__PURE__*/ _jsx("div", {
                            style: {
                                textAlign: 'center'
                            },
                            children: /*#__PURE__*/ _jsx("button", {
                                type: "button",
                                onClick: ()=>{
                                    setUseBackupCode(!useBackupCode);
                                    setCode('');
                                    setError(null);
                                },
                                style: {
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--theme-text)',
                                    opacity: 0.7,
                                    fontSize: 'var(--font-size-small)',
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                    padding: 0
                                },
                                children: useBackupCode ? 'Use authenticator app instead' : 'Use a backup code instead'
                            })
                        })
                    ]
                })
            ]
        })
    });
}
export default TwoFactorVerifyView;
