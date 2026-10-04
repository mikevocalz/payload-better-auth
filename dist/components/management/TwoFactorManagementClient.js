'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Button, Banner } from '@payloadcms/ui';
import { CopyIcon } from '@payloadcms/ui/icons/Copy';
import { QRCodeSVG } from 'qrcode.react';
import { createPayloadAuthClient } from '../../exports/client.js';
import { useAuthClientBaseURL } from '../useAuthMountPath.js';
import { extractTotpSecret } from '../../utils/totp.js';
/**
 * Client component for two-factor authentication management.
 * Shows 2FA status and allows enabling/disabling.
 */ export function TwoFactorManagementClient({ authClient: providedClient, title = 'Two-Factor Authentication', onComplete } = {}) {
    const [isEnabled, setIsEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [step, setStep] = useState('status');
    const [totpUri, setTotpUri] = useState(null);
    const [secret, setSecret] = useState(null);
    const [backupCodes, setBackupCodes] = useState([]);
    const [verificationCode, setVerificationCode] = useState('');
    const [password, setPassword] = useState('');
    const [passwordAction, setPasswordAction] = useState('enable');
    const [actionLoading, setActionLoading] = useState(false);
    // Full mount URL (origin + routes.api + authBasePath) so the client works
    // when Payload's API route isn't '/api'. createPayloadAuthClient keeps its
    // documented default (origin → '/api/auth') when this is undefined (SSR).
    const authBaseURL = useAuthClientBaseURL();
    const getClient = ()=>providedClient ?? createPayloadAuthClient(authBaseURL ? {
            baseURL: authBaseURL
        } : undefined);
    useEffect(()=>{
        let ignore = false;
        checkStatus(()=>!ignore);
        return ()=>{
            ignore = true;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // `isActive` guards against setState after unmount and StrictMode double-run.
    async function checkStatus(isActive = ()=>true) {
        setLoading(true);
        try {
            const client = getClient();
            const result = await client.getSession();
            if (!isActive()) return;
            if (result.data?.user) {
                setIsEnabled(result.data.user.twoFactorEnabled ?? false);
            } else {
                setIsEnabled(false);
            }
        } catch  {
            if (isActive()) setError('Failed to check 2FA status');
        } finally{
            if (isActive()) setLoading(false);
        }
    }
    function handleEnableClick() {
        // Show password prompt first
        setPasswordAction('enable');
        setStep('password');
        setPassword('');
        setError(null);
    }
    function handlePasswordContinue() {
        if (passwordAction === 'disable') {
            void handleDisableWithPassword();
        } else {
            void handleEnableWithPassword();
        }
    }
    async function handleEnableWithPassword() {
        setActionLoading(true);
        setError(null);
        try {
            const client = getClient();
            // Better Auth 1.7 made the response a discriminated union on `method`;
            // `totp` is still the default, but ask for it explicitly so this stays
            // pinned to the authenticator-app flow this UI actually renders.
            const result = await client.twoFactor.enable({
                password,
                method: 'totp'
            });
            if (result.error) {
                setError(result.error.message ?? 'Failed to enable 2FA');
            } else if (result.data) {
                if (result.data.method !== 'totp') {
                    setError('Unexpected two-factor method returned by the server.');
                    return;
                }
                setTotpUri(result.data.totpURI);
                // Secret is only carried inside the totpURI — offered here for manual entry.
                setSecret(extractTotpSecret(result.data.totpURI));
                setBackupCodes(result.data.backupCodes ?? []);
                setPassword(''); // Clear password
                setStep('setup');
            }
        } catch  {
            setError('Failed to enable 2FA');
        } finally{
            setActionLoading(false);
        }
    }
    async function handleVerify() {
        setActionLoading(true);
        setError(null);
        try {
            const client = getClient();
            const result = await client.twoFactor.verifyTotp({
                code: verificationCode
            });
            if (result.error) {
                setError(result.error.message ?? 'Invalid verification code');
            } else {
                if (backupCodes.length > 0) {
                    setStep('backup');
                } else {
                    setIsEnabled(true);
                    setStep('status');
                    onComplete?.();
                }
            }
        } catch  {
            setError('Verification failed');
        } finally{
            setActionLoading(false);
        }
    }
    function handleDisableClick() {
        if (!confirm('Are you sure you want to disable two-factor authentication?')) {
            return;
        }
        // Better Auth's /two-factor/disable requires the account password.
        // Prompt for it instead of sending an empty string (which fails with
        // "Invalid password" before the real password is ever checked).
        setPasswordAction('disable');
        setStep('password');
        setPassword('');
        setError(null);
    }
    async function handleDisableWithPassword() {
        setActionLoading(true);
        setError(null);
        try {
            const client = getClient();
            const result = await client.twoFactor.disable({
                password
            });
            if (result.error) {
                setError(result.error.message ?? 'Failed to disable 2FA');
            } else {
                setIsEnabled(false);
                setPassword('');
                setStep('status');
                onComplete?.();
            }
        } catch  {
            setError('Failed to disable 2FA');
        } finally{
            setActionLoading(false);
        }
    }
    function handleBackupContinue() {
        setIsEnabled(true);
        setStep('status');
        onComplete?.();
    }
    if (loading) {
        return /*#__PURE__*/ _jsx("p", {
            className: "field-description",
            children: "Loading..."
        });
    }
    return /*#__PURE__*/ _jsxs("div", {
        className: "field-type two-factor-management",
        children: [
            error && /*#__PURE__*/ _jsx(Banner, {
                type: "danger",
                children: error
            }),
            step === 'status' && /*#__PURE__*/ _jsxs("div", {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                },
                children: [
                    /*#__PURE__*/ _jsx("p", {
                        className: "field-description",
                        style: {
                            margin: 0
                        },
                        children: isEnabled ? 'Two-factor authentication is enabled.' : 'Two-factor authentication is not enabled.'
                    }),
                    /*#__PURE__*/ _jsx(Button, {
                        buttonStyle: isEnabled ? 'destructive' : 'secondary',
                        size: "medium",
                        onClick: isEnabled ? handleDisableClick : handleEnableClick,
                        disabled: actionLoading,
                        children: actionLoading ? 'Loading...' : isEnabled ? 'Disable' : 'Enable'
                    })
                ]
            }),
            step === 'password' && /*#__PURE__*/ _jsxs("div", {
                children: [
                    /*#__PURE__*/ _jsxs("p", {
                        className: "field-description",
                        children: [
                            "Enter your password to ",
                            passwordAction === 'disable' ? 'disable' : 'enable',
                            " two-factor authentication."
                        ]
                    }),
                    /*#__PURE__*/ _jsx("input", {
                        type: "password",
                        value: password,
                        onChange: (e)=>setPassword(e.target.value),
                        onKeyDown: (e)=>{
                            if (e.key === 'Enter' && password) {
                                e.preventDefault();
                                handlePasswordContinue();
                            }
                        },
                        placeholder: "Enter your password",
                        className: "field-type__wrap",
                        style: {
                            width: '100%',
                            padding: 'var(--base)',
                            background: 'var(--theme-input-bg)',
                            border: '1px solid var(--theme-border-color)',
                            borderRadius: 'var(--style-radius-s)',
                            color: 'var(--theme-text)',
                            fontSize: 'var(--base-body-size)',
                            marginBottom: 'var(--base)',
                            boxSizing: 'border-box'
                        }
                    }),
                    /*#__PURE__*/ _jsxs("div", {
                        style: {
                            display: 'flex',
                            gap: 'calc(var(--base) * 0.5)'
                        },
                        children: [
                            /*#__PURE__*/ _jsx(Button, {
                                buttonStyle: "primary",
                                size: "medium",
                                onClick: handlePasswordContinue,
                                disabled: actionLoading || !password,
                                children: actionLoading ? passwordAction === 'disable' ? 'Disabling...' : 'Enabling...' : 'Continue'
                            }),
                            /*#__PURE__*/ _jsx(Button, {
                                buttonStyle: "secondary",
                                size: "medium",
                                onClick: ()=>setStep('status'),
                                children: "Cancel"
                            })
                        ]
                    })
                ]
            }),
            step === 'setup' && totpUri && /*#__PURE__*/ _jsxs("div", {
                style: {
                    textAlign: 'center'
                },
                children: [
                    /*#__PURE__*/ _jsx("p", {
                        className: "field-description",
                        children: "Scan this QR code with your authenticator app:"
                    }),
                    /*#__PURE__*/ _jsx(QRCodeSVG, {
                        value: totpUri,
                        size: 200,
                        marginSize: 2,
                        title: "QR code for authenticator app",
                        style: {
                            border: '1px solid var(--theme-border-color)',
                            borderRadius: 'var(--style-radius-s)',
                            marginBottom: 'var(--base)'
                        }
                    }),
                    secret && /*#__PURE__*/ _jsxs("div", {
                        style: {
                            marginBottom: 'calc(var(--base) * 1.5)'
                        },
                        children: [
                            /*#__PURE__*/ _jsx("p", {
                                className: "field-description",
                                style: {
                                    marginBottom: 'calc(var(--base) * 0.5)'
                                },
                                children: "Or enter manually:"
                            }),
                            /*#__PURE__*/ _jsx("code", {
                                style: {
                                    display: 'inline-block',
                                    padding: 'calc(var(--base) * 0.5)',
                                    background: 'var(--theme-elevation-100)',
                                    borderRadius: 'var(--style-radius-s)',
                                    fontFamily: 'monospace',
                                    fontSize: 'var(--base-body-size)',
                                    color: 'var(--theme-text)'
                                },
                                children: secret
                            })
                        ]
                    }),
                    /*#__PURE__*/ _jsxs("div", {
                        children: [
                            /*#__PURE__*/ _jsx("input", {
                                type: "text",
                                inputMode: "numeric",
                                pattern: "[0-9]*",
                                value: verificationCode,
                                onChange: (e)=>setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6)),
                                onKeyDown: (e)=>{
                                    if (e.key === 'Enter' && verificationCode.length === 6) {
                                        e.preventDefault();
                                        handleVerify();
                                    }
                                },
                                placeholder: "000000",
                                style: {
                                    width: '200px',
                                    padding: 'var(--base)',
                                    background: 'var(--theme-input-bg)',
                                    border: '1px solid var(--theme-border-color)',
                                    borderRadius: 'var(--style-radius-s)',
                                    color: 'var(--theme-text)',
                                    fontSize: '1.5rem',
                                    fontFamily: 'monospace',
                                    textAlign: 'center',
                                    letterSpacing: '0.5em',
                                    marginBottom: 'var(--base)',
                                    boxSizing: 'border-box'
                                }
                            }),
                            /*#__PURE__*/ _jsx("br", {}),
                            /*#__PURE__*/ _jsx(Button, {
                                buttonStyle: "primary",
                                size: "medium",
                                onClick: handleVerify,
                                disabled: actionLoading || verificationCode.length !== 6,
                                children: actionLoading ? 'Verifying...' : 'Verify'
                            })
                        ]
                    })
                ]
            }),
            step === 'backup' && /*#__PURE__*/ _jsxs("div", {
                children: [
                    /*#__PURE__*/ _jsx(Banner, {
                        type: "default",
                        children: "Save these backup codes in a safe place. You can use them to sign in if you lose access to your authenticator app."
                    }),
                    /*#__PURE__*/ _jsx("div", {
                        style: {
                            background: 'var(--theme-elevation-100)',
                            padding: 'var(--base)',
                            borderRadius: 'var(--style-radius-s)',
                            marginTop: 'var(--base)',
                            marginBottom: 'var(--base)',
                            fontFamily: 'monospace'
                        },
                        children: /*#__PURE__*/ _jsx("div", {
                            style: {
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: 'calc(var(--base) * 0.5)'
                            },
                            children: backupCodes.map((code, index)=>/*#__PURE__*/ _jsx("div", {
                                    style: {
                                        color: 'var(--theme-text)',
                                        padding: 'calc(var(--base) * 0.25)'
                                    },
                                    children: code
                                }, index))
                        })
                    }),
                    /*#__PURE__*/ _jsxs("div", {
                        style: {
                            display: 'flex',
                            gap: 'calc(var(--base) * 0.5)'
                        },
                        children: [
                            /*#__PURE__*/ _jsx(Button, {
                                buttonStyle: "secondary",
                                size: "medium",
                                icon: /*#__PURE__*/ _jsx(CopyIcon, {}),
                                onClick: ()=>navigator.clipboard.writeText(backupCodes.join('\n')),
                                children: "Copy to Clipboard"
                            }),
                            /*#__PURE__*/ _jsx(Button, {
                                buttonStyle: "primary",
                                size: "medium",
                                onClick: handleBackupContinue,
                                children: "I've Saved My Codes"
                            })
                        ]
                    })
                ]
            })
        ]
    });
}
export default TwoFactorManagementClient;
