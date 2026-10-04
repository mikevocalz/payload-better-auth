import React from 'react';
export declare function EmailOtpForm({ email, code, onCodeChange, onSubmit, onBack, loading, error, logo, codeLength }: {
    email: string;
    code: string;
    onCodeChange: (v: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onBack: () => void;
    loading: boolean;
    error: string | null;
    logo?: React.ReactNode;
    /** Digits in the emailed code — the emailOTP plugin's `otpLength`. Default: 6. */
    codeLength?: number;
}): React.JSX.Element;
