# Vue-MSAL-Browser

vue-msal-browser is a [VueJS](https://vuejs.org/) 2 wrapper for the [msal-browser](https://www.npmjs.com/package/@azure/msal-browser) library. You can use it to authenticate the users of your SPA and retrieve their access token to call your backend APIs.

It is widely inspired by the [vue-msal library](https://github.com/mvertopoulos/vue-msal) by [@mvertopoulos](https://github.com/mvertopoulos)

## Pre-requisites

To use it you need:

- [npm](https://www.npmjs.com/get-npm) or [yarn](https://classic.yarnpkg.com/en/docs/getting-started/)
- a vueJS application => to generate one you can use the [Vue CLI](https://cli.vuejs.org/)
- a web server able to serve the HTTPS protocol with some valid certificates for your app
- [An Azure tenant](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-create-new-tenant)
- An application in your Azure tenant with [a redirect URL set up for a SPA (single-page-application)](https://docs.microsoft.com/en-us/azure/active-directory/develop/scenario-spa-app-registration#redirect-uri-msaljs-20-with-auth-code-flow)

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

```javascript
import { default as msalPlugin } from "vue-msal-browser";
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

```javascript

<template>
    <a href="#" v-if="accounts !== 0" @click="logout()">Logout</a>
</template>

<script>
export default {
  methods: {
    logout: function () {
      this.$msal.logoutRedirect()
    }
  },
  created () {
    this.$msal.authenticateRedirect()
  }
}

</script>


```

#### Use the plugin in the VueX store

You can also call it from the actions, mutation or getters in your Vue store.  
First import the msalInstance

`import { msalInstance } from "vue-msal-browser"`

And then call the plugin in your actions

```javascript
export default {
  async AzureAuthentication() {
    msalInstance.authenticateRedirect();
  },
};
```

Here is a more detailed example: The following action authentify the users on redirect mode with a cacheLocation `localStorage`.

```javascript
export default {
  // Authenticate the user with Active Directory
  async AzureAuthentication({ commit, getters, dispatch }) {
    try {
      let existingTokenResponse = getters.mainTokenResponse;
      let newTokenResponse;

      // The user has already logged in. We try to get his token silently
      if (existingTokenResponse)
        newTokenResponse = await msalInstance.acquireTokenSilent({
          account: existingTokenResponse.account,
          scopes: msalInstance.extendedConfiguration.auth.scopes,
        });
      // The user has not logged in. We check if he comes back from a redirect with a token
      else newTokenResponse = await msalInstance.handleRedirectPromise();

      // No token found, we redirect the user
      if (!newTokenResponse) {
        await msalInstance.loginRedirect(msalInstance.loginRequest);
        return false;
      }
      // There is an existing token, we authentify the user
      else if (newTokenResponse) {
        // We add the access token as an authorization header for our Axios requests to our API
        this._vm.axios.defaults.headers.common["Authorization"] =
          "Bearer " + newTokenResponse.accessToken;
        if (msalInstance.extendedConfiguration.graph) {
          // The graph is set, we check if the user has already a picture in the local storage
          // if he does not we grab a token silently for our graph scope and call Microsoft graph to get the picture
          if (!localStorage.getItem("userPicture")) {
            let graphTokenResponse = await msalInstance.getSilentToken(
              newTokenResponse.account,
              msalInstance.extendedConfiguration.graph.scopes
            );
            let graphResponse = await msalInstance.callMSGraph(
              msalInstance.extendedConfiguration.graph.url,
              graphTokenResponse.accessToken
            );
            dispatch("AzureSetPicture", graphResponse);
          }
        }
        return true;
      }
    } catch (error) {
      console.error(error);
    }
  },
};
```

## Extra configuration options and methods

The chapter below describes the extra configuration options and methods added by `vue-msal-browser`.
For more information about how to use the basic msal-browser functions, please refer to the [MSAL browser documentation](https://www.npmjs.com/package/@azure/msal-browser#usage).

### Extra configuration options

#### General Config Options

| Option | Description                                                                                                                                                                                                                                                        | Format | Default Value |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ------------- |
| `mode` | [MSAL Interaction type](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/initialization.md#choosing-an-interaction-type) used for authentication. Used in the `authenticate` method. Can be `redirect` or `popup` | string | undefined     |

#### Auth Config Options

| Option   | Description                                                                                                                                                                                           | Format           | Default Value |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------- |
| `scopes` | Default authentication [scopes](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/resources-and-scopes.md) that your users will be allowed to access. | Array of strings | []            |

#### Graph Config Options

| Option          | Description                                                                                                                                                                                            | Format           | Default Value |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ------------- |
| `url`           | The URL of your graph API.                                                                                                                                                                             | string           | undefined     |
| `scopes`        | Default authentication [scopes](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/resources-and-scopes.md) that your users require from you graph API. | Array of strings | []            |
| `response_type` | Response type expected from the graph API.                                                                                                                                                             | string           | undefined     |

### Extra methods

The following methods have been added to the msal-browser original methods

**1. authenticate**

- Usage:
  Authenticate the user with a `redirect` or a `popup` depending on the `mode` configuration option.

- Example:
  `msalInstance.authenticate()`

**2. authenticateRedirect**

- Usage:
  Ensure that there is no interaction ongoing and authenticate the user with the `redirect` mode if he is not authenticated yet.

- Example:
  `msalInstance.authenticateRedirect()`

**3. authenticatePopup**

- Usage:
  Authenticate the user with the `popup` mode if he is not authenticated yet.

- Example:
  `msalInstance.authenticatePopup()`

**4. getSilentToken**

| Parameter name | Type             | Description              |
| -------------- | ---------------- | ------------------------ |
| `account`      | Object           | MSAL user account object |
| `scopes`       | Array of strings | Graph scopes             |

- Usage:  
   Grab a token silently for a given user and scope and return an access token object as a response. Redirect the user to the login if it fails.

- Example:  
   `let graphTokenResponse = await msalInstance.getSilentToken(newTokenResponse.account, msalInstance.extendedConfiguration.graph.scopes);`

**5. callMSGraph**

| Parameter name | Type   | Description              |
| -------------- | ------ | ------------------------ |
| `endpoint`     | String | Microsoft graph endpoint |
| `accessToken`  | String | Azure access token       |

- Usage:
  Allows to use the access token retrieved by the main `msalInstance` to call MSGraph

- Example:
  `let graphResponse = await msalInstance.callMSGraph(msalInstance.extendedConfiguration.graph.url, graphTokenResponse.accessToken);`

## Todos

- Vue 3 version
- Add the `mode` as a parameter to the `getSilentToken` method
- Add tests
- [README] Add infos on Nuxt usage

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
