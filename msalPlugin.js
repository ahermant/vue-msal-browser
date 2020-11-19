import * as msal from "@azure/msal-browser";
let msalInstance = null;

export default class msalPlugin extends msal.PublicClientApplication {
    static install(vue, msalConfig = {}) {
        msalInstance = new msalPlugin(msalConfig);
        vue.prototype.$msal = msalInstance;
    }
    constructor(options) {
        super(options);
        this.config.graph = options.graph || {};
    }
    callMSGraph(endpoint, accessToken) {
        const headers = new Headers();
        const bearer = `Bearer ${accessToken}`;
        headers.append("Authorization", bearer);
        const options = {
            method: "GET",
            headers: headers
        };
        return fetch(endpoint, options)
            .then(response => response)
            .catch(error => console.log(error));
    }
    async getSilentToken(account, scopes = ["User.Read"]) {
        const silentRequest = { account, scopes };
        return await this.acquireTokenSilent(silentRequest).catch(error => {
            console.error(error);
            if (error instanceof InteractionRequiredAuthError) {
                // fallback to interaction when silent call fails
                return this.acquireTokenRedirect(silentRequest)
            }
        });
    }
};

export { msalInstance }