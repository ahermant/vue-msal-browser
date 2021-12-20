import * as msal from "@azure/msal-browser";
import Vue from "vue";
let msalInstance: msal.PublicClientApplication | null = null;

interface ExtendedConfiguration extends msal.Configuration {
  graph?: Response | {};
}

export default class msalPlugin extends msal.PublicClientApplication {
  static install(vue: typeof Vue, msalConfig: ExtendedConfiguration) {
    msalInstance = new msalPlugin(msalConfig);
    vue.prototype.$msal = msalInstance;
  }
  constructor(options: ExtendedConfiguration) {
    super(options);
    (this.config as ExtendedConfiguration).graph = options.graph || {};
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
}

export { msalInstance, ExtendedConfiguration };
