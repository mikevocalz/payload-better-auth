import { type ButtonHTMLAttributes } from 'react';
export type PasskeySignInButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> & {
    /** Optional pre-configured auth client */
    authClient?: any;
    /** Callback when sign-in succeeds */
    onSuccess?: (user: {
        id: string;
        email: string;
        role?: string;
    }) => void;
    /** Callback when sign-in fails */
    onError?: (error: string) => void;
    /** Button text when idle. Default: 'Sign in with Passkey' */
    label?: string;
    /** Button text when loading. Default: 'Authenticating...' */
    loadingLabel?: string;
};
/**
 * Standalone passkey sign-in button component.
 * Handles the WebAuthn authentication flow with Better Auth.
 *
 * @example
 * ```tsx
 * import { PasskeySignInButton } from '@delmaredigital/payload-better-auth/components'
 *
 * function LoginForm() {
 *   return (
 *     <PasskeySignInButton
 *       onSuccess={(user) => {
 *         router.push('/dashboard')
 *       }}
 *       onError={(error) => {
 *         setError(error)
 *       }}
 *     />
 *   )
 * }
 * ```
 */
export declare function PasskeySignInButton({ authClient: providedClient, onSuccess, onError, label, loadingLabel, disabled, children, ...buttonProps }: PasskeySignInButtonProps): import("react").JSX.Element;
export default PasskeySignInButton;
