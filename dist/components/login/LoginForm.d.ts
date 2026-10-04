import type React from 'react';
export declare function LoginForm({ logo, title, successMessage, error, email, onEmailChange, passwordAvailable, password, onPasswordChange, forgotPasswordAvailable, onForgotPassword, showEmailForm, onSubmit, primaryLabel, actionsDisabled, secondaryMethods, showEmptyState, signUpAvailable, onCreateAccount, }: {
    logo?: React.ReactNode;
    title: string;
    successMessage: string | null;
    error: string | null;
    email: string;
    onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    passwordAvailable: boolean;
    password: string;
    onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    forgotPasswordAvailable: boolean;
    onForgotPassword: () => void;
    /** False when no email-based method (password, magic link, email OTP) is enabled: the email form has nothing to submit to. */
    showEmailForm?: boolean;
    onSubmit: (e: React.FormEvent) => void;
    primaryLabel: string;
    actionsDisabled: boolean;
    secondaryMethods: Array<{
        key: string;
        icon?: React.ReactNode;
        label: string;
        onClick: () => void;
        busy: boolean;
    }>;
    showEmptyState: boolean;
    signUpAvailable: boolean;
    onCreateAccount: () => void;
}): React.JSX.Element;
