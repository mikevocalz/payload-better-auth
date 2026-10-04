import React from 'react';
/** Second-factor entry modes the form can render. */
export type TwoFactorMethod = 'totp' | 'backup' | 'emailOtp';
export declare function TwoFactorForm({ code, onCodeChange, onSubmit, onBack, loading, error, logo, method, onMethodChange, enableTotp, enableBackupCode, enableEmailOtp, codeLength, onResendEmailOtp, }: {
    code: string;
    onCodeChange: (v: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onBack: () => void;
    loading: boolean;
    error: string | null;
    logo?: React.ReactNode;
    /** Which second factor is being entered. Default: 'totp'. */
    method?: TwoFactorMethod;
    /** Called when the user picks a different second factor. */
    onMethodChange?: (method: TwoFactorMethod) => void;
    /** Offer the authenticator app. False when this user has no verified TOTP secret. */
    enableTotp?: boolean;
    /** Offer "use a backup code". */
    enableBackupCode?: boolean;
    /** Offer "email me a code" (requires the twoFactor plugin's `otpOptions`). */
    enableEmailOtp?: boolean;
    /** Digits in the TOTP / emailed code. Better Auth allows other than 6. Default: 6. */
    codeLength?: number;
    /** Re-send the emailed code (shown in emailOtp mode). */
    onResendEmailOtp?: () => void;
}): React.JSX.Element;
