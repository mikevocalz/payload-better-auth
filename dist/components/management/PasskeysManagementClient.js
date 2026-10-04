'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Button, Banner } from '@payloadcms/ui';
import { PlusIcon } from '@payloadcms/ui/icons/Plus';
import { XIcon } from '@payloadcms/ui/icons/X';
import { createAuthClient } from 'better-auth/react';
import { twoFactorClient } from 'better-auth/client/plugins';
import { useAuthClientBaseURL } from '../useAuthMountPath.js';
/**
 * Client component for passkey management.
 * Lists, registers, and deletes passkeys.
 */ export function PasskeysManagementClient({ authClient: providedClient, title = 'Passkeys' } = {}) {
    const [passkeys, setPasskeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [registering, setRegistering] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const [passkeyName, setPasskeyName] = useState('');
    const authBaseURL = useAuthClientBaseURL();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clientRef = useRef(null);
    const getClient = async ()=>{
        if (providedClient) return providedClient;
        if (clientRef.current) return clientRef.current;
        const { passkeyClient } = await import('@better-auth/passkey/client');
        clientRef.current = createAuthClient({
            ...authBaseURL ? {
                baseURL: authBaseURL
            } : {},
            plugins: [
                twoFactorClient(),
                passkeyClient()
            ]
        });
        return clientRef.current;
    };
    useEffect(()=>{
        let ignore = false;
        fetchPasskeys(()=>!ignore);
        return ()=>{
            ignore = true;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // `isActive` guards against setState after unmount and StrictMode double-fetch.
    async function fetchPasskeys(isActive = ()=>true) {
        setLoading(true);
        setError(null);
        try {
            const client = await getClient();
            const result = await client.passkey.listUserPasskeys();
            if (!isActive()) return;
            if (result.error) {
                setError(result.error.message ?? 'Failed to load passkeys');
            } else {
                setPasskeys(result.data ?? []);
            }
        } catch  {
            if (isActive()) setError('Failed to load passkeys');
        } finally{
            if (isActive()) setLoading(false);
        }
    }
    async function handleRegister() {
        setRegistering(true);
        setError(null);
        setSuccess(null);
        try {
            const client = await getClient();
            const result = await client.passkey.addPasskey({
                name: passkeyName || undefined
            });
            if (result.error) {
                setError(result.error.message ?? 'Failed to register passkey');
            } else {
                setSuccess('Passkey registered successfully!');
                setShowRegisterForm(false);
                setPasskeyName('');
                fetchPasskeys();
            }
        } catch (err) {
            if (err instanceof Error && err.name === 'NotAllowedError') {
                setError('Passkey registration was cancelled or not allowed');
            } else if (err instanceof Error && err.name === 'InvalidStateError') {
                setError('This passkey is already registered');
            } else {
                setError(err instanceof Error ? err.message : 'Failed to register passkey');
            }
        } finally{
            setRegistering(false);
        }
    }
    async function handleDelete(passkeyId) {
        if (!confirm('Are you sure you want to delete this passkey?')) {
            return;
        }
        setDeleting(passkeyId);
        setError(null);
        setSuccess(null);
        try {
            const client = await getClient();
            const result = await client.passkey.deletePasskey({
                id: passkeyId
            });
            if (result.error) {
                setError(result.error.message ?? 'Failed to delete passkey');
            } else {
                setPasskeys((prev)=>prev.filter((p)=>p.id !== passkeyId));
                setSuccess('Passkey deleted successfully');
            }
        } catch  {
            setError('Failed to delete passkey');
        } finally{
            setDeleting(null);
        }
    }
    function formatDate(date) {
        if (!date) return 'Never';
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleString();
    }
    return /*#__PURE__*/ _jsxs("div", {
        className: "field-type passkeys-management",
        children: [
            error && /*#__PURE__*/ _jsx(Banner, {
                type: "danger",
                children: error
            }),
            success && /*#__PURE__*/ _jsx(Banner, {
                type: "success",
                children: success
            }),
            /*#__PURE__*/ _jsxs("div", {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--base)'
                },
                children: [
                    /*#__PURE__*/ _jsx("p", {
                        className: "field-description",
                        style: {
                            margin: 0
                        },
                        children: "Passkeys provide secure, passwordless sign-in using your device's biometrics or security keys."
                    }),
                    !showRegisterForm && /*#__PURE__*/ _jsx(Button, {
                        buttonStyle: "secondary",
                        size: "medium",
                        icon: /*#__PURE__*/ _jsx(PlusIcon, {}),
                        onClick: ()=>setShowRegisterForm(true),
                        children: "Add Passkey"
                    })
                ]
            }),
            showRegisterForm && /*#__PURE__*/ _jsxs("div", {
                style: {
                    marginBottom: 'var(--base)'
                },
                children: [
                    /*#__PURE__*/ _jsxs("div", {
                        style: {
                            marginBottom: 'var(--base)'
                        },
                        children: [
                            /*#__PURE__*/ _jsx("label", {
                                className: "field-label",
                                style: {
                                    marginBottom: 'calc(var(--base) * 0.5)',
                                    display: 'block'
                                },
                                children: "Name (optional)"
                            }),
                            /*#__PURE__*/ _jsx("input", {
                                type: "text",
                                value: passkeyName,
                                onChange: (e)=>setPasskeyName(e.target.value),
                                onKeyDown: (e)=>{
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleRegister();
                                    }
                                },
                                placeholder: "e.g., MacBook Pro, iPhone",
                                style: {
                                    width: '100%',
                                    padding: 'var(--base)',
                                    background: 'var(--theme-input-bg)',
                                    border: '1px solid var(--theme-border-color)',
                                    borderRadius: 'var(--style-radius-s)',
                                    color: 'var(--theme-text)',
                                    fontSize: 'var(--base-body-size)',
                                    boxSizing: 'border-box'
                                }
                            }),
                            /*#__PURE__*/ _jsx("p", {
                                className: "field-description",
                                style: {
                                    marginTop: 'calc(var(--base) * 0.25)'
                                },
                                children: "Your browser will prompt you to use your device's biometrics or security key."
                            })
                        ]
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
                                onClick: handleRegister,
                                disabled: registering,
                                children: registering ? 'Registering...' : 'Register Passkey'
                            }),
                            /*#__PURE__*/ _jsx(Button, {
                                buttonStyle: "secondary",
                                size: "medium",
                                onClick: ()=>setShowRegisterForm(false),
                                children: "Cancel"
                            })
                        ]
                    })
                ]
            }),
            loading ? /*#__PURE__*/ _jsx("p", {
                className: "field-description",
                children: "Loading passkeys..."
            }) : passkeys.length === 0 ? /*#__PURE__*/ _jsx("p", {
                className: "field-description",
                children: "No passkeys registered."
            }) : /*#__PURE__*/ _jsx("div", {
                style: {
                    border: '1px solid var(--theme-border-color)',
                    borderRadius: 'var(--style-radius-s)',
                    overflow: 'hidden'
                },
                children: passkeys.map((pk, index)=>/*#__PURE__*/ _jsxs("div", {
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 'var(--base)',
                            borderBottom: index < passkeys.length - 1 ? '1px solid var(--theme-border-color)' : 'none'
                        },
                        children: [
                            /*#__PURE__*/ _jsxs("div", {
                                children: [
                                    /*#__PURE__*/ _jsx("div", {
                                        style: {
                                            color: 'var(--theme-text)',
                                            fontWeight: 500
                                        },
                                        children: pk.name || 'Passkey'
                                    }),
                                    /*#__PURE__*/ _jsxs("p", {
                                        className: "field-description",
                                        style: {
                                            margin: 'calc(var(--base) * 0.25) 0 0 0'
                                        },
                                        children: [
                                            "Created: ",
                                            formatDate(pk.createdAt),
                                            pk.lastUsedAt && ` | Last used: ${formatDate(pk.lastUsedAt)}`
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ _jsx(Button, {
                                buttonStyle: "destructive",
                                size: "medium",
                                icon: /*#__PURE__*/ _jsx(XIcon, {}),
                                onClick: ()=>handleDelete(pk.id),
                                disabled: deleting === pk.id,
                                children: deleting === pk.id ? 'Deleting...' : 'Delete'
                            })
                        ]
                    }, pk.id))
            })
        ]
    });
}
export default PasskeysManagementClient;
