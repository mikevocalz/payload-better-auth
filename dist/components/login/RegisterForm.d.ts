import type React from 'react';
export declare function RegisterForm({ name, email, password, confirmPassword, onNameChange, onEmailChange, onPasswordChange, onConfirmPasswordChange, onSubmit, onBackToLogin, loading, error, logo, }: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onConfirmPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    onBackToLogin: () => void;
    loading: boolean;
    error: string | null;
    logo?: React.ReactNode;
}): React.JSX.Element;
