'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { AuthCard } from './AuthCard.js';
import { AuthBanner } from './AuthBanner.js';
import { AuthButton } from './AuthButton.js';
import { AuthField } from './AuthField.js';
import { OrDivider } from './OrDivider.js';
export function LoginForm({ logo, title, successMessage, error, email, onEmailChange, passwordAvailable, password, onPasswordChange, forgotPasswordAvailable, onForgotPassword, showEmailForm = true, onSubmit, primaryLabel, actionsDisabled, secondaryMethods, showEmptyState, signUpAvailable, onCreateAccount }) {
    return /*#__PURE__*/ _jsxs(AuthCard, {
        logo: logo,
        children: [
            /*#__PURE__*/ _jsx("h1", {
                style: {
                    color: 'var(--theme-text)',
                    fontSize: 'var(--font-size-h3)',
                    fontWeight: 600,
                    textAlign: 'center',
                    margin: '0 0 calc(var(--base) * 1.5) 0'
                },
                children: title
            }),
            successMessage && /*#__PURE__*/ _jsx(AuthBanner, {
                kind: "success",
                children: successMessage
            }),
            showEmailForm ? /*#__PURE__*/ _jsxs("form", {
                onSubmit: onSubmit,
                children: [
                    /*#__PURE__*/ _jsx(AuthField, {
                        id: "email",
                        label: "Email",
                        type: "email",
                        value: email,
                        onChange: onEmailChange,
                        autoComplete: "email",
                        autoFocus: true
                    }),
                    passwordAvailable && /*#__PURE__*/ _jsxs(_Fragment, {
                        children: [
                            /*#__PURE__*/ _jsx(AuthField, {
                                id: "password",
                                label: "Password",
                                type: "password",
                                value: password,
                                onChange: onPasswordChange,
                                autoComplete: "current-password"
                            }),
                            forgotPasswordAvailable && /*#__PURE__*/ _jsx("div", {
                                style: {
                                    marginBottom: 'calc(var(--base) * 1.5)',
                                    textAlign: 'right'
                                },
                                children: /*#__PURE__*/ _jsx("button", {
                                    type: "button",
                                    onClick: onForgotPassword,
                                    style: {
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--theme-text)',
                                        opacity: 0.7,
                                        cursor: 'pointer',
                                        fontSize: 'var(--font-size-small)',
                                        padding: 0,
                                        textDecoration: 'underline'
                                    },
                                    children: "Forgot password?"
                                })
                            })
                        ]
                    }),
                    error && /*#__PURE__*/ _jsx(AuthBanner, {
                        kind: "error",
                        children: error
                    }),
                    /*#__PURE__*/ _jsx(AuthButton, {
                        type: "submit",
                        disabled: actionsDisabled,
                        children: primaryLabel
                    })
                ]
            }) : error && /*#__PURE__*/ _jsx(AuthBanner, {
                kind: "error",
                children: error
            }),
            showEmailForm && secondaryMethods.length > 0 && /*#__PURE__*/ _jsx(OrDivider, {}),
            secondaryMethods.length > 0 && /*#__PURE__*/ _jsx(_Fragment, {
                children: secondaryMethods.map((method)=>/*#__PURE__*/ _jsx("div", {
                        style: {
                            marginBottom: 'calc(var(--base) * 0.5)'
                        },
                        children: /*#__PURE__*/ _jsx(AuthButton, {
                            variant: "secondary",
                            icon: method.icon,
                            disabled: actionsDisabled || method.busy,
                            onClick: method.onClick,
                            children: method.label
                        })
                    }, method.key))
            }),
            showEmptyState && /*#__PURE__*/ _jsx("p", {
                style: {
                    marginTop: 'var(--base)',
                    textAlign: 'center',
                    fontSize: 'var(--font-size-small)',
                    color: 'var(--theme-text)',
                    opacity: 0.7
                },
                children: "No sign-in methods are currently enabled."
            }),
            signUpAvailable && /*#__PURE__*/ _jsxs("div", {
                style: {
                    marginTop: 'calc(var(--base) * 1.5)',
                    textAlign: 'center',
                    fontSize: 'var(--font-size-small)',
                    color: 'var(--theme-text)',
                    opacity: 0.8
                },
                children: [
                    "Don't have an account?",
                    ' ',
                    /*#__PURE__*/ _jsx("button", {
                        type: "button",
                        onClick: onCreateAccount,
                        style: {
                            background: 'none',
                            border: 'none',
                            color: 'var(--theme-elevation-800)',
                            cursor: 'pointer',
                            fontSize: 'inherit',
                            textDecoration: 'underline',
                            padding: 0
                        },
                        children: "Create account"
                    })
                ]
            })
        ]
    });
}
