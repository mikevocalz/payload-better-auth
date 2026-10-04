import type { AdminViewProps } from 'payload';
type PasskeysViewProps = AdminViewProps;
/**
 * Passkeys management view for Payload admin panel.
 * Server component that provides the admin layout.
 */
export declare function PasskeysView({ initPageResult, params, searchParams, }: PasskeysViewProps): Promise<import("react").JSX.Element>;
export default PasskeysView;
