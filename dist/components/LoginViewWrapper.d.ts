import type { AdminViewProps } from 'payload';
import { type LoginViewProps } from './LoginView.js';
type LoginViewWrapperProps = AdminViewProps;
/**
 * Props resolved server-side and safe to pass across the RSC boundary to a
 * client LoginView (all serializable — no `authClient`/`logo`).
 */
export type ResolvedLoginViewProps = Omit<LoginViewProps, 'authClient' | 'logo'>;
/**
 * Resolve the LoginView props from a Payload instance: read the login config and
 * resolve each `'auto'` method against the Better Auth instance's resolved
 * context (`auth.$context`). Shared by the default wrapper and the passkey-enabled
 * wrapper so the (long) prop list has a single source of truth.
 */
export declare function resolveLoginViewProps(payload: LoginViewWrapperProps['initPageResult']['req']['payload']): Promise<ResolvedLoginViewProps>;
/**
 * Server component wrapper for LoginView.
 *
 * Reads login configuration from `payload.config.custom.betterAuth.login` and
 * resolves each `'auto'` option against the Better Auth instance's resolved
 * context (server-side), passing concrete booleans to the client LoginView.
 *
 * This replaces the old client-side `OPTIONS` endpoint probing: Better Auth
 * answers every `OPTIONS` request with 200 (CORS preflight), so probing could
 * never determine whether a method was actually enabled. The resolved server-side
 * context is authoritative — and, unlike `auth.options`, it accounts for whatever
 * the configured plugins contributed during their `init()`.
 */
export declare function LoginViewWrapper({ initPageResult }: LoginViewWrapperProps): Promise<import("react").JSX.Element>;
export default LoginViewWrapper;
