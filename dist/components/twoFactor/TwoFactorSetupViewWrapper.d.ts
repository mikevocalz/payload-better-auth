import type { AdminViewProps } from 'payload';
import { type TwoFactorSetupViewProps } from './TwoFactorSetupView.js';
export type TwoFactorSetupViewWrapperProps = AdminViewProps & Omit<TwoFactorSetupViewProps, 'hasPassword' | 'onSetupComplete'>;
/**
 * Server component wrapper for TwoFactorSetupView.
 *
 * Resolves `hasPassword` server-side by listing the signed-in user's Better
 * Auth accounts and looking for a credential one — so the view can ask
 * credential accounts to confirm their password and start enablement directly
 * for passwordless (social/passkey-only) accounts, without ever asking the
 * user which kind of account they have.
 *
 * Falls back to `hasPassword: true` (the password step) if the accounts can't
 * be read — the safe default, since most admin accounts hold a password.
 */
export declare function TwoFactorSetupViewWrapper({ initPageResult, logo, title, afterSetupPath, }: TwoFactorSetupViewWrapperProps): Promise<import("react").JSX.Element>;
export default TwoFactorSetupViewWrapper;
