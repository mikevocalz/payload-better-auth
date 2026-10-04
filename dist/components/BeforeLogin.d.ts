export type BeforeLoginProps = {
    /** URL to redirect to for login. Defaults to `${routes.admin}/login`. */
    loginUrl?: string;
};
/**
 * BeforeLogin component that redirects to the custom login page.
 * Injected into Payload's beforeLogin slot to intercept default login.
 */
export declare function BeforeLogin({ loginUrl }?: BeforeLoginProps): import("react").JSX.Element;
export default BeforeLogin;
