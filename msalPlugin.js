import * as msal from "@azure/msal-browser";
import { InteractionRequiredAuthError } from "msal";

let msalInstance = null;

export default class msalPlugin {
    static install(vue, msalConfig = {}) {
        msalInstance = new msalPlugin(msalConfig);
        vue.prototype.$msal = msalInstance;
    }
    constructor(options) {
        this.config = options || {
            auth: {
                clientId: "Azure application ID",
                authority: "Azure authority, format https://login.microsoftonline.com/TenantID",
                redirectUri: "Base Url for the App",
                scopes: ["User.Read"]
            },
            cache: {
                cacheLocation: "localStorage"
            },
            graph: {
                scopes: ["User.Read"],
                url: "Microsoft graph Url"
            },
            mode: "redirect"
        }
        this.msalInstance = new msal.PublicClientApplication(this.config);
        return this.msalInstance
    }
    callMSGraph(endpoint, accessToken) {
        const headers = new Headers();
        const bearer = `Bearer ${accessToken}`;

        headers.append("Authorization", bearer);

        const options = {
            method: "GET",
            headers: headers
        };
        console.log('request made to Graph API at: ' + new Date().toString());

        return fetch(endpoint, options)
            .then(response => response)
            .catch(error => console.log(error));
    }
    async getSilentToken(account, scopes = ["User.Read"]) {
        const silentRequest = { account, scopes };

        return await this.msalInstance.acquireTokenSilent(silentRequest).catch(error => {
            console.error(error);
            if (error instanceof InteractionRequiredAuthError) {
                // fallback to interaction when silent call fails
                return this.msalInstance.acquireTokenRedirect(silentRequest)
            }
        });
    }
};

export { msalInstance };