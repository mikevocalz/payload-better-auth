/**
 * Admin Components for Better Auth
 *
 * These components are auto-injected when disableLocalStrategy is detected.
 * They can also be used standalone or customized.
 */
export { LogoutButton } from '../components/LogoutButton.js';
export { useAuthMountPath, useAuthClientBaseURL, DEFAULT_AUTH_BASE_PATH, } from '../components/useAuthMountPath.js';
export type { BeforeLoginProps } from '../components/BeforeLogin.js';
export { BeforeLogin } from '../components/BeforeLogin.js';
export type { LoginViewProps } from '../components/LoginView.js';
export { LoginView } from '../components/LoginView.js';
export type { ForgotPasswordViewProps } from '../components/auth/ForgotPasswordView.js';
export { ForgotPasswordView } from '../components/auth/ForgotPasswordView.js';
export type { ResetPasswordViewProps } from '../components/auth/ResetPasswordView.js';
export { ResetPasswordView } from '../components/auth/ResetPasswordView.js';
export type { TwoFactorSetupViewProps } from '../components/twoFactor/TwoFactorSetupView.js';
export { TwoFactorSetupView } from '../components/twoFactor/TwoFactorSetupView.js';
export type { TwoFactorVerifyViewProps } from '../components/twoFactor/TwoFactorVerifyView.js';
export { TwoFactorVerifyView } from '../components/twoFactor/TwoFactorVerifyView.js';
export { TwoFactorField } from '../components/management/fields/TwoFactorField.js';
