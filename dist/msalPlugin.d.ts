import * as msal from "@azure/msal-browser";
import Vue from "vue";
declare let msalInstance: msal.PublicClientApplication | null;
interface ExtendedConfiguration extends msal.Configuration {
    graph?: Response | {};
}
export default class msalPlugin extends msal.PublicClientApplication {
    static install(vue: typeof Vue, msalConfig: ExtendedConfiguration): void;
    constructor(options: ExtendedConfiguration);
    callMSGraph(endpoint: string, accessToken: string): Promise<Response | void>;
    getSilentToken(account: msal.AccountInfo, scopes?: string[]): Promise<msal.AuthenticationResult | void>;
}
export { msalInstance, ExtendedConfiguration };
