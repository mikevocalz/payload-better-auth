'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useConfig } from '@payloadcms/ui';
import { useState, useRef } from 'react';
import { createAuthClient } from 'better-auth/react';
import { useAuthClientBaseURL } from '../useAuthMountPath.js';
/**
 * Forgot password page component for requesting a password reset email.
 * Uses the Better Auth client's `requestPasswordReset` (the raw
 * `/forget-password` endpoint was renamed to `/request-password-reset` in
 * Better Auth 1.6; the client tracks such renames across versions).
 */ export function ForgotPasswordView({ authClient: providedClient, logo, title = 'Forgot Password', loginPath = '/admin/login', successMessage = 'If an account exists with this email, you will receive a password reset link.' }) {
    // Payload Config
    const { config: { routes: { admin: adminRoute } } } = useConfig();
    const authBaseURL = useAuthClientBaseURL();
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clientRef = useRef(null);
    const getClient = ()=>{
        if (providedClient) return providedClient;
        if (clientRef.current) return clientRef.current;
        clientRef.current = createAuthClient({
            ...authBaseURL ? {
                baseURL: authBaseURL
            } : {}
        });
        return clientRef.current;
    };
    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const client = getClient();
            const result = await client.requestPasswordReset({
                email,
                redirectTo: `${window.location.origin}${adminRoute}/reset-password`
            });
            // Better Auth already answers unknown emails with a success (that's the
            // anti-enumeration boundary), so a returned error here is a genuine
            // failure (rate limit, misconfiguration, 5xx) — surface it instead of
            // claiming an email was sent when nothing was.
            if (result.error) {
                setError(result.error.message ?? 'Failed to send reset email. Please try again.');
            } else {
                setSuccess(true);
            }
        } catch  {
            setError('An error occurred. Please try again.');
        } finally{
            setLoading(false);
        }
    }
    if (success) {
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
                    maxWidth: '400px',
                    textAlign: 'center'
                },
                children: [
                    logo && /*#__PURE__*/ _jsx("div", {
                        style: {
                            marginBottom: 'calc(var(--base) * 1.5)'
                        },
                        children: logo
                    }),
                    /*#__PURE__*/ _jsx("h1", {
                        style: {
                            color: 'var(--theme-text)',
                            fontSize: 'var(--font-size-h3)',
                            fontWeight: 600,
                            margin: '0 0 var(--base) 0'
                        },
                        children: "Check Your Email"
                    }),
                    /*#__PURE__*/ _jsx("p", {
                        style: {
                            color: 'var(--theme-text)',
                            opacity: 0.8,
                            marginBottom: 'calc(var(--base) * 1.5)',
                            fontSize: 'var(--font-size-small)'
                        },
                        children: successMessage
                    }),
                    /*#__PURE__*/ _jsx("a", {
                        href: loginPath,
                        style: {
                            color: 'var(--theme-elevation-800)',
                            fontSize: 'var(--font-size-small)',
                            textDecoration: 'underline'
                        },
                        children: "Back to login"
                    })
                ]
            })
        });
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
                        marginBottom: 'calc(var(--base) * 0.5)',
                        textAlign: 'center',
                        margin: '0 0 calc(var(--base) * 0.5) 0'
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
                    children: "Enter your email and we'll send you a reset link."
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
                                    htmlFor: "email",
                                    style: {
                                        display: 'block',
                                        color: 'var(--theme-text)',
                                        marginBottom: 'calc(var(--base) * 0.5)',
                                        fontSize: 'var(--font-size-small)',
                                        fontWeight: 500
                                    },
                                    children: "Email"
                                }),
                                /*#__PURE__*/ _jsx("input", {
                                    id: "email",
                                    type: "email",
                                    value: email,
                                    onChange: (e)=>setEmail(e.target.value),
                                    required: true,
                                    autoComplete: "email",
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
                            disabled: loading,
                            style: {
                                width: '100%',
                                padding: 'calc(var(--base) * 0.75)',
                                background: 'var(--theme-elevation-800)',
                                border: 'none',
                                borderRadius: 'var(--style-radius-s)',
                                color: 'var(--theme-elevation-50)',
                                fontSize: 'var(--font-size-base)',
                                fontWeight: 500,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                                transition: 'opacity 150ms ease',
                                marginBottom: 'var(--base)'
                            },
                            children: loading ? 'Sending...' : 'Send Reset Link'
                        }),
                        /*#__PURE__*/ _jsx("div", {
                            style: {
                                textAlign: 'center'
                            },
                            children: /*#__PURE__*/ _jsx("a", {
                                href: loginPath,
                                style: {
                                    color: 'var(--theme-text)',
                                    opacity: 0.7,
                                    fontSize: 'var(--font-size-small)',
                                    textDecoration: 'underline'
                                },
                                children: "Back to login"
                            })
                        })
                    ]
                })
            ]
        })
    });
}
export default ForgotPasswordView;
