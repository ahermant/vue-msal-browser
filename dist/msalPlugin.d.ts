import * as msal from "@azure/msal-browser";
import Vue from "vue";
declare let msalInstance: msal.PublicClientApplication | null;
interface ExtendedBrowserAuthOptions extends msal.BrowserAuthOptions {
    scopes?: Array<string>;
}
interface ExtendedConfiguration extends msal.Configuration {
    graph?: Response | {};
    mode?: "redirect" | "popup";
    auth: ExtendedBrowserAuthOptions;
}
export default class msalPlugin extends msal.PublicClientApplication {
    static install(vue: typeof Vue, msalConfig: ExtendedConfiguration): void;
    extendedConfiguration: ExtendedConfiguration;
    loginRequest: {
        scopes: Array<string>;
    };
    constructor(options: ExtendedConfiguration);
    callMSGraph(endpoint: string, accessToken: string): Promise<Response | void>;
    getSilentToken(account: msal.AccountInfo, scopes?: string[]): Promise<msal.AuthenticationResult | void>;
    authenticate(): Promise<msal.AccountInfo[] | msal.AuthenticationResult | undefined>;
    authenticateRedirect(): Promise<msal.AccountInfo[] | undefined>;
    authenticatePopup(): Promise<msal.AuthenticationResult>;
}
export { msalInstance, ExtendedConfiguration, ExtendedBrowserAuthOptions };
