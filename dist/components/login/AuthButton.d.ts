import type { ReactNode } from 'react';
export declare function AuthButton({ variant, type, disabled, onClick, icon, children }: {
    variant?: 'primary' | 'secondary';
    type?: 'button' | 'submit';
    disabled?: boolean;
    onClick?: () => void;
    icon?: ReactNode;
    children: ReactNode;
}): import("react").JSX.Element;
