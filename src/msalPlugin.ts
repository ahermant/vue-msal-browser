import * as msal from "@azure/msal-browser";
import Vue from "vue";
let msalInstance: msal.PublicClientApplication | null = null;

interface ExtendedBrowserAuthOptions extends msal.BrowserAuthOptions {
  scopes?: Array<string>;
}

interface ExtendedConfiguration extends msal.Configuration {
  graph?: Response | {};
  mode?: "redirect" | "popup";
  auth: ExtendedBrowserAuthOptions;
}

export default class msalPlugin extends msal.PublicClientApplication {
  static install(vue: typeof Vue, msalConfig: ExtendedConfiguration) {
    msalInstance = new msalPlugin(msalConfig);
    vue.prototype.$msal = msalInstance;
  }

  extendedConfiguration: ExtendedConfiguration;
  loginRequest: { scopes: Array<string> };

  constructor(options: ExtendedConfiguration) {
    super(options);
    this.extendedConfiguration = { ...options };
    this.loginRequest = { scopes: options.auth.scopes || [] };
  }

  callMSGraph(endpoint: string, accessToken: string): Promise<Response | void> {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;
    headers.append("Authorization", bearer);
    const options = {
      method: "GET",
      headers: headers,
    };
    return fetch(endpoint, options)
      .then((response) => response)
      .catch((error) => console.log(error));
  }

  async getSilentToken(
    account: msal.AccountInfo,
    scopes: string[] = ["User.Read"]
  ): Promise<msal.AuthenticationResult | void> {
    const silentRequest = { account, scopes };
    return await this.acquireTokenSilent(silentRequest).catch((error) => {
      console.error(error);
      if (error instanceof msal.InteractionRequiredAuthError) {
        // fallback to interaction when silent call fails
        return this.acquireTokenRedirect(silentRequest);
      }
    });
  }

  async authenticate(): Promise<
    msal.AccountInfo[] | msal.AuthenticationResult
  > {
    switch (this.extendedConfiguration.mode) {
      case "redirect":
        return await this.authenticateRedirect();
      case "popup":
        return await this.authenticatePopup();
      default:
        throw new Error("Set authentication mode: oneof ['redirect', 'popup']");
    }
  }

  async authenticateRedirect(): Promise<msal.AccountInfo[]> {
    await this.handleRedirectPromise();
    const accounts = this.getAllAccounts();
    if (accounts.length === 0) {
      await this.loginRedirect(this.loginRequest);
    }
    return accounts;
  }

  async authenticatePopup(): Promise<msal.AuthenticationResult> {
    return await this.loginPopup(this.loginRequest);
  }
}

export { msalInstance, ExtendedConfiguration, ExtendedBrowserAuthOptions };
