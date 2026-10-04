'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AuthCard } from './AuthCard.js';
import { AuthBanner } from './AuthBanner.js';
import { AuthButton } from './AuthButton.js';
import { AuthField } from './AuthField.js';
export function RegisterForm({ name, email, password, confirmPassword, onNameChange, onEmailChange, onPasswordChange, onConfirmPasswordChange, onSubmit, onBackToLogin, loading, error, logo }) {
    return /*#__PURE__*/ _jsxs(AuthCard, {
        logo: logo,
        children: [
            /*#__PURE__*/ _jsx("h1", {
                style: {
                    color: 'var(--theme-text)',
                    fontSize: 'var(--font-size-h3)',
                    fontWeight: 600,
                    margin: '0 0 calc(var(--base) * 1.5) 0',
                    textAlign: 'center'
                },
                children: "Create Account"
            }),
            /*#__PURE__*/ _jsxs("form", {
                onSubmit: onSubmit,
                children: [
                    /*#__PURE__*/ _jsx(AuthField, {
                        id: "name",
                        label: "Name",
                        type: "text",
                        value: name,
                        onChange: onNameChange,
                        autoComplete: "name",
                        autoFocus: true
                    }),
                    /*#__PURE__*/ _jsx(AuthField, {
                        id: "register-email",
                        label: "Email",
                        type: "email",
                        value: email,
                        onChange: onEmailChange,
                        autoComplete: "email"
                    }),
                    /*#__PURE__*/ _jsx(AuthField, {
                        id: "register-password",
                        label: "Password",
                        type: "password",
                        value: password,
                        onChange: onPasswordChange,
                        autoComplete: "new-password"
                    }),
                    /*#__PURE__*/ _jsx(AuthField, {
                        id: "confirm-password",
                        label: "Confirm Password",
                        type: "password",
                        value: confirmPassword,
                        onChange: onConfirmPasswordChange,
                        autoComplete: "new-password",
                        marginBottom: "calc(var(--base) * 1.5)"
                    }),
                    error && /*#__PURE__*/ _jsx(AuthBanner, {
                        kind: "error",
                        children: error
                    }),
                    /*#__PURE__*/ _jsx(AuthButton, {
                        type: "submit",
                        disabled: loading,
                        children: loading ? 'Creating account...' : 'Create Account'
                    })
                ]
            }),
            /*#__PURE__*/ _jsxs("div", {
                style: {
                    marginTop: 'calc(var(--base) * 1.5)',
                    textAlign: 'center',
                    fontSize: 'var(--font-size-small)',
                    color: 'var(--theme-text)',
                    opacity: 0.8
                },
                children: [
                    "Already have an account?",
                    ' ',
                    /*#__PURE__*/ _jsx("button", {
                        type: "button",
                        onClick: onBackToLogin,
                        style: {
                            background: 'none',
                            border: 'none',
                            color: 'var(--theme-elevation-800)',
                            cursor: 'pointer',
                            fontSize: 'inherit',
                            textDecoration: 'underline',
                            padding: 0
                        },
                        children: "Sign in"
                    })
                ]
            })
        ]
    });
}
