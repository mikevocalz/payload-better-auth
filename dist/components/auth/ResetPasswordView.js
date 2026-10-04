'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation.js';
import { useConfig } from '@payloadcms/ui';
import { useAuthMountPath } from '../useAuthMountPath.js';
/**
 * Reset password page component for setting a new password.
 * Expects a token in the URL query parameter.
 * Uses Better Auth's resetPassword endpoint.
 */ export function ResetPasswordView({ logo, title = 'Reset Password', afterResetPath, minPasswordLength = 8 }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { config: { routes: { admin: adminRoute } } } = useConfig();
    const authMountPath = useAuthMountPath();
    const resolvedAfterResetPath = afterResetPath ?? `${adminRoute}/login`;
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    // Capture the token ONCE, before the URL is touched. Next's App Router
    // mirrors `history.replaceState` into its own router state and re-derives
    // `useSearchParams()` from it, so anything keyed on searchParams re-runs
    // after the strip below with an empty query — re-deriving the token there
    // finds nothing and flags a valid link as invalid.
    const [token] = useState(()=>searchParams.get('token'));
    useEffect(()=>{
        if (!token) {
            setError('Invalid or missing reset token. Please request a new password reset link.');
            return;
        }
        // Strip the token from the URL so it doesn't linger in browser history,
        // synced history, or any analytics that records URLs. Remove only the
        // `token` param, preserving the rest of the query string. Runs once on
        // mount — deliberately NOT keyed on searchParams (see token capture above).
        const url = new URL(window.location.href);
        if (url.searchParams.has('token')) {
            url.searchParams.delete('token');
            window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        if (password.length < minPasswordLength) {
            setError(`Password must be at least ${minPasswordLength} characters.`);
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (!token) {
            setError('Invalid reset token.');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${authMountPath}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    token,
                    newPassword: password
                })
            });
            if (response.ok) {
                setSuccess(true);
            } else {
                const data = await response.json().catch(()=>({}));
                setError(data.message || data.error?.message || 'Failed to reset password. The link may have expired.');
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
                            color: 'var(--theme-success-500)',
                            fontSize: 'var(--font-size-h3)',
                            fontWeight: 600,
                            margin: '0 0 var(--base) 0'
                        },
                        children: "Password Reset!"
                    }),
                    /*#__PURE__*/ _jsx("p", {
                        style: {
                            color: 'var(--theme-text)',
                            opacity: 0.8,
                            marginBottom: 'calc(var(--base) * 1.5)',
                            fontSize: 'var(--font-size-small)'
                        },
                        children: "Your password has been successfully reset. You can now log in with your new password."
                    }),
                    /*#__PURE__*/ _jsx("button", {
                        onClick: ()=>router.push(resolvedAfterResetPath),
                        style: {
                            padding: 'calc(var(--base) * 0.75) calc(var(--base) * 1.5)',
                            background: 'var(--theme-elevation-800)',
                            border: 'none',
                            borderRadius: 'var(--style-radius-s)',
                            color: 'var(--theme-elevation-50)',
                            fontSize: 'var(--font-size-base)',
                            fontWeight: 500,
                            cursor: 'pointer'
                        },
                        children: "Go to Login"
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
                    children: "Enter your new password below."
                }),
                /*#__PURE__*/ _jsxs("form", {
                    onSubmit: handleSubmit,
                    children: [
                        /*#__PURE__*/ _jsxs("div", {
                            style: {
                                marginBottom: 'var(--base)'
                            },
                            children: [
                                /*#__PURE__*/ _jsx("label", {
                                    htmlFor: "password",
                                    style: {
                                        display: 'block',
                                        color: 'var(--theme-text)',
                                        marginBottom: 'calc(var(--base) * 0.5)',
                                        fontSize: 'var(--font-size-small)',
                                        fontWeight: 500
                                    },
                                    children: "New Password"
                                }),
                                /*#__PURE__*/ _jsx("input", {
                                    id: "password",
                                    type: "password",
                                    value: password,
                                    onChange: (e)=>setPassword(e.target.value),
                                    required: true,
                                    minLength: minPasswordLength,
                                    autoComplete: "new-password",
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
                        /*#__PURE__*/ _jsxs("div", {
                            style: {
                                marginBottom: 'calc(var(--base) * 1.5)'
                            },
                            children: [
                                /*#__PURE__*/ _jsx("label", {
                                    htmlFor: "confirmPassword",
                                    style: {
                                        display: 'block',
                                        color: 'var(--theme-text)',
                                        marginBottom: 'calc(var(--base) * 0.5)',
                                        fontSize: 'var(--font-size-small)',
                                        fontWeight: 500
                                    },
                                    children: "Confirm Password"
                                }),
                                /*#__PURE__*/ _jsx("input", {
                                    id: "confirmPassword",
                                    type: "password",
                                    value: confirmPassword,
                                    onChange: (e)=>setConfirmPassword(e.target.value),
                                    required: true,
                                    minLength: minPasswordLength,
                                    autoComplete: "new-password",
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
                            disabled: loading || !token,
                            style: {
                                width: '100%',
                                padding: 'calc(var(--base) * 0.75)',
                                background: 'var(--theme-elevation-800)',
                                border: 'none',
                                borderRadius: 'var(--style-radius-s)',
                                color: 'var(--theme-elevation-50)',
                                fontSize: 'var(--font-size-base)',
                                fontWeight: 500,
                                cursor: loading || !token ? 'not-allowed' : 'pointer',
                                opacity: loading || !token ? 0.7 : 1,
                                transition: 'opacity 150ms ease'
                            },
                            children: loading ? 'Resetting...' : 'Reset Password'
                        })
                    ]
                })
            ]
        })
    });
}
export default ResetPasswordView;
