# Vue-MSAL-Browser

vue-msal-browser is a [VueJS](https://vuejs.org/) wrapper for the [msal-browser](https://www.npmjs.com/package/@azure/msal-browser) library. You can use it to authenticate the users of your SPA and retrieve their access token to call your backend APIs.

It is widely inspired by the [vue-msal library](https://github.com/mvertopoulos/vue-msal) by [@mvertopoulos](https://github.com/mvertopoulos)

## Pre-requisites

To use it you need:
* [npm](https://www.npmjs.com/get-npm) or [yarn](https://classic.yarnpkg.com/en/docs/getting-started/)
* a vueJS application => to generate one you can use the [Vue CLI](https://cli.vuejs.org/)
* a web server able to serve the HTTPS protocol with some valid certificates for your app
* [An Azure tenant](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-create-new-tenant)
* An application in your Azure tenant with [a redirect URL set up for a SPA (single-page-application)](https://docs.microsoft.com/en-us/azure/active-directory/develop/scenario-spa-app-registration#redirect-uri-msaljs-20-with-auth-code-flow)

## Installation

Use [npm](https://www.npmjs.com/get-npm) or [yarn](https://classic.yarnpkg.com/en/docs/getting-started/) to install vue-msal-browser.

```bash
npm install vue-msal-browser
or
yarn add vue-msal-browser
```

## Usage

### Vue CLI

#### Initialize the plugin

For the Vue apps generated with the Vue CLI, you can import the plugin in the main.js file like described below.  
The options allowed are the same as [the options of the MSAL browser library](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md). 

``` javascript
import { default as msalPlugin } from "msal-browser";
const msalConfig = {
  auth: {
    tenant: '<your-tenant>',
    clientId: '<your-client-id>',
    authority: '<your-tenant-address>',
    redirectUri: '<your-redirect-url>', // It has to be configured on your Azure tenant
    scopes: ['<your-scopes>']
  },
  cache: {
    cacheLocation: '<your-cache-location>'
  },
  graph: {
    url: '<your-graph-api-url>',
    scopes: '<your-graph-api-scopes>',
    response_type: "blob"
  },
  mode: "redirect"
  ...
}
Vue.use(msalPlugin, msalConfig);
```

#### Use the plugin from a view component

You can call the plugin from you Vue components like a Vue.prototype

``` javascript

<template>
    <a v-if="$msal.isAuthenticated()" class="toolbar-items" @click="$emit('logout')">
        <v-icon color="tertiary">mdi-logout</v-icon>
    </a>
</template>

<script>
    export default {
        created() {
            if (!this.$msal.isAuthenticated()) {
                try {
                    this.$msal.loginRedirect({});
                } catch (err) {
                    // handle error
                }
            }
        }
    }
</script>

```

#### Use the plugin in the VueX store

You can also call it from the actions, mutation or getters in your Vue store.  
First import the msalInstance

`import { msalInstance } from "vue-msal-browser"`

And then call the plugin in your actions

``` javascript

export default {
  async AzureAuthentication() {
    msalInstance.loginRedirect({});
  }
}


```

Here is a more detailed example: The following action authentify the users on redirect mode with a cachelocation "localStorage".

``` javascript

export default {
  // Authenticate the user with Active Directory
  async AzureAuthentication({ commit, getters, dispatch }) {
    try {
      
      let exisitingTokenResponse = getters.mainTokenResponse;
      let newTokenResponse;

      // The user has already logged in. We try to get his token silently
      if (exisitingTokenResponse) 
        newTokenResponse = await msalInstance.acquireTokenSilent({ account: exisitingTokenResponse.account, scopes: msalInstance.config.auth.scopes });
      // The user has not logged in. We check if he comes back from a redirect with a token
      else 
        newTokenResponse = await msalInstance.handleRedirectPromise();

      // No token found, we redirect the user
      if (!newTokenResponse) {
        const loginRequest = { scopes: msalInstance.config.auth.scopes };
        await msalInstance.loginRedirect(loginRequest);
        return false;
      }
      // There is an existing token, we authentify the user
      else if (newTokenResponse) {
        // We add the access token as an authorization header for our Axios requests to our API
        this._vm.axios.defaults.headers.common['Authorization'] = "Bearer " + newTokenResponse.accessToken;
        if (msalInstance.config.graph) {
          // The graph is set, we check if the user has already a picture in the local storage
          // if he does not we grab a token silently for our graph scope and call Microsoft graph to get the picture
          if (!localStorage.getItem("userPicture")) {
            let graphTokenResponse = await msalInstance.getSilentToken(newTokenResponse.account, msalInstance.config.graph.scopes);
            let graphResponse = await msalInstance.callMSGraph(msalInstance.config.graph.url, graphTokenResponse.accessToken);
            dispatch("AzureSetPicture", graphResponse);
          }
        }
        return true;
      }

    } catch (error) {
      console.error(error);
    }
  }
}

```

## Methods and data

For more information about how to use the msal-browser functions, please refer to the [MSAL browser documentation](https://www.npmjs.com/package/@azure/msal-browser#usage)

### Extra methods

The following methods have been added to the msal-browser original methods

**1. getSilentToken method**
* Parameters: 
    * Type: object - MSAL user account object
    * Type: Array - Graph scopes

* Usage:  
    Grab a token silently for a given user and scope and return an access token object as a response. Redirect the user to the login if it fails.

* Example:  
    `let graphTokenResponse = await msalInstance.getSilentToken(newTokenResponse.account, msalInstance.config.graph.scopes);`

**2. callMSGraph method**
* Parameters:
    * Type: string - Microsoft graph endpoint
    * Type: string - Azure zccess token

* Usage: 
    Allows to use the access token retrieved by the main msalInstance to call MSGraph

* Example: 
    `let graphResponse = await msalInstance.callMSGraph(msalInstance.config.graph.url, graphTokenResponse.accessToken);`

## Todos

* Add the mode as a parameter to the getSilentRequest method
* [README] Add infos on Nuxt usage
* Convert to Typescript

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)