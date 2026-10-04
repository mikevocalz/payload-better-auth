/**
 * Passkey Components
 *
 * Requires @better-auth/passkey peer dependency.
 * These are separated from the main /components barrel to avoid
 * webpack resolution errors for consumers without @better-auth/passkey.
 */ export { PasskeySignInButton } from '../PasskeySignInButton.js';
export { PasskeyRegisterButton } from '../PasskeyRegisterButton.js';
export { PasskeysField } from '../management/fields/PasskeysField.js';
export { PasskeysManagementClient } from '../management/PasskeysManagementClient.js';
