/**
 * Thin wrapper around PasskeysManagementClient for use as a Payload `ui` field.
 *
 * Better Auth's passkey APIs are session-based (always operate on the logged-in user).
 * When viewing another user's document, we show an info message instead of the
 * management UI to avoid displaying the admin's own passkeys on someone else's page.
 *
 * While auth context is hydrating (user is null), we show the management UI since
 * the API is session-based and will only ever return the logged-in user's passkeys —
 * no other user's data can be leaked.
 */
export declare function PasskeysField(): import("react").JSX.Element;
export default PasskeysField;
