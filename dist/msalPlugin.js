var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import * as msal from "@azure/msal-browser";
var msalInstance = null;
var msalPlugin = /** @class */ (function (_super) {
    __extends(msalPlugin, _super);
    function msalPlugin(options) {
        var _this = _super.call(this, options) || this;
        _this.extendedConfiguration = __assign({}, options);
        _this.loginRequest = { scopes: options.auth.scopes || [] };
        return _this;
    }
    msalPlugin.install = function (vue, msalConfig) {
        msalInstance = new msalPlugin(msalConfig);
        vue.prototype.$msal = msalInstance;
    };
    msalPlugin.prototype.callMSGraph = function (endpoint, accessToken) {
        var headers = new Headers();
        var bearer = "Bearer ".concat(accessToken);
        headers.append("Authorization", bearer);
        var options = {
            method: "GET",
            headers: headers,
        };
        return fetch(endpoint, options)
            .then(function (response) { return response; })
            .catch(function (error) { return console.log(error); });
    };
    msalPlugin.prototype.getSilentToken = function (account, scopes) {
        if (scopes === void 0) { scopes = ["User.Read"]; }
        return __awaiter(this, void 0, void 0, function () {
            var silentRequest;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        silentRequest = { account: account, scopes: scopes };
                        return [4 /*yield*/, this.acquireTokenSilent(silentRequest).catch(function (error) {
                                console.error(error);
                                if (error instanceof msal.InteractionRequiredAuthError) {
                                    // fallback to interaction when silent call fails
                                    return _this.acquireTokenRedirect(silentRequest);
                                }
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    msalPlugin.prototype.authenticate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.extendedConfiguration.mode;
                        switch (_a) {
                            case "redirect": return [3 /*break*/, 1];
                            case "popup": return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 5];
                    case 1: return [4 /*yield*/, this.authenticateRedirect()];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, this.authenticatePopup()];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: throw new Error("Set authentication mode: oneof ['redirect', 'popup']");
                }
            });
        });
    };
    msalPlugin.prototype.authenticateRedirect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var accounts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.handleRedirectPromise()];
                    case 1:
                        _a.sent();
                        accounts = this.getAllAccounts();
                        if (!(accounts.length === 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.loginRedirect(this.loginRequest)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, accounts];
                }
            });
        });
    };
    msalPlugin.prototype.authenticatePopup = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loginPopup(this.loginRequest)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return msalPlugin;
}(msal.PublicClientApplication));
export default msalPlugin;
export { msalInstance };
