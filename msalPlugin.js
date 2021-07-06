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
        this.config.mode = options.mode;
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
            if (error instanceof msal.InteractionRequiredAuthError) {
                // fallback to interaction when silent call fails
                return this.acquireTokenRedirect(silentRequest)
            }
        });
    }

    async authenticate() {
        switch(this.config.mode) {
            case "redirect":
                return this.authenticateRedirect();
                break;
            case "popup":
                return this.authenticatePopup();
                break;
            default:
                throw new Error("Set authentication mode: oneof ['redirect', 'popup']");
        }
    }

    async authenticateRedirect() {
        await this.handleRedirectPromise();
        const accounts = this.getAllAccounts();
        if (accounts.length === 0) {
            // No user signed in
            await this.loginRedirect();
            return
        }
        return accounts
    }

    async authenticatePopup() {
        const loginRequest = {
            scopes: this.config.auth.scopes || []
        }
        return await this.loginPopup(loginRequest)
    }
};

export { msalInstance }