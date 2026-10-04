import React from 'react';
export declare function ForgotPasswordForm({ email, onEmailChange, onSubmit, onBack, loading, error, logo }: {
    email: string;
    onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    onBack: () => void;
    loading: boolean;
    error: string | null;
    logo?: React.ReactNode;
}): React.JSX.Element;
