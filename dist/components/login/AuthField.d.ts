import type { ChangeEvent, Ref } from 'react';
export declare function AuthField({ id, label, type, value, onChange, autoComplete, required, inputRef, marginBottom, autoFocus }: {
    id: string;
    label: string;
    type: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    autoComplete?: string;
    required?: boolean;
    inputRef?: Ref<HTMLInputElement>;
    marginBottom?: string;
    autoFocus?: boolean;
}): import("react").JSX.Element;
