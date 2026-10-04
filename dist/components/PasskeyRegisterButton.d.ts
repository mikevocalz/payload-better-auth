import { type ButtonHTMLAttributes } from 'react';
export type PasskeyRegisterButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> & {
    /** Optional pre-configured auth client */
    authClient?: any;
    /** Optional name for the passkey */
    passkeyName?: string;
    /** Callback when registration succeeds */
    onSuccess?: (passkey: {
        id: string;
        name?: string;
    }) => void;
    /** Callback when registration fails */
    onError?: (error: string) => void;
    /** Button text when idle. Default: 'Add Passkey' */
    label?: string;
    /** Button text when loading. Default: 'Registering...' */
    loadingLabel?: string;
};
/**
 * Standalone passkey registration button component.
 * Handles the WebAuthn registration flow with Better Auth.
 *
 * @example
 * ```tsx
 * import { PasskeyRegisterButton } from '@delmaredigital/payload-better-auth/components'
 *
 * function SecuritySettings() {
 *   return (
 *     <PasskeyRegisterButton
 *       passkeyName="My MacBook"
 *       onSuccess={(passkey) => {
 *         console.log('Passkey registered:', passkey.id)
 *         refetchPasskeys()
 *       }}
 *       onError={(error) => {
 *         setError(error)
 *       }}
 *     />
 *   )
 * }
 * ```
 */
export declare function PasskeyRegisterButton({ authClient: providedClient, passkeyName, onSuccess, onError, label, loadingLabel, disabled, children, ...buttonProps }: PasskeyRegisterButtonProps): import("react").JSX.Element;
export default PasskeyRegisterButton;
