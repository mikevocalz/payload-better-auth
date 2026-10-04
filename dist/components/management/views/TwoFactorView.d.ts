import type { AdminViewProps } from 'payload';
type TwoFactorViewProps = AdminViewProps;
/**
 * Two-factor management view for Payload admin panel.
 * Server component that provides the admin layout.
 */
export declare function TwoFactorView({ initPageResult, params, searchParams, }: TwoFactorViewProps): Promise<import("react").JSX.Element>;
export default TwoFactorView;
