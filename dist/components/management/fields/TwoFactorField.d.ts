/**
 * Wrapper around TwoFactorManagementClient for use as a Payload `ui` field.
 *
 * Better Auth's 2FA APIs are session-based (always operate on the logged-in user).
 * When viewing another user's document, we show an info message instead of the
 * management UI to avoid the admin accidentally modifying their own 2FA settings
 * while on someone else's page.
 *
 * While auth context is hydrating (user is null), we show the management UI since
 * the API is session-based and will only ever operate on the logged-in user's own
 * 2FA settings — no other user's data can be leaked or modified.
 *
 * After 2FA is enabled or disabled, triggers a Next.js router refresh so that
 * the document form re-fetches from the DB and picks up the `twoFactorEnabled`
 * value that Better Auth wrote. Without this, navigating away without clicking
 * Save would overwrite the change.
 */
export declare function TwoFactorField(): import("react").JSX.Element;
export default TwoFactorField;
