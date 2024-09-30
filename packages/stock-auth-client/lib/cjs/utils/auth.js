"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const rxjs_1 = require("rxjs");
const stock_auth_client_1 = require("../stock-auth-client");
class AuthController {
    constructor() {
        this.confirmEnabled = false;
        this.isLoggedIn = false;
    }
    /**
     * The authenticateJwt() method is used to authenticate the JSON Web Token (JWT) for the user.
     * It makes a GET request to the '/user/authexpress' endpoint and returns the response.
     * @returns A promise that resolves to the response from the server.
     */
    authenticateJwt() {
        stock_auth_client_1.StockAuthClient.logger.debug('AuthService:AuthService:authenticateJwt::');
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp
            .makeGet('/user/authexpress');
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    googleLogin() {
        stock_auth_client_1.StockAuthClient.logger.debug('AuthService:googleLogin');
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp
            .makeGet('/user/login/google');
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    facebookLogin() {
        stock_auth_client_1.StockAuthClient.logger.debug('AuthService:facebookLogin');
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp
            .makeGet('/user/login/facebook');
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    login(userInfo) {
        stock_auth_client_1.StockAuthClient.logger.debug('AuthService:login');
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp.makePost('/user/login', { emailPhone: userInfo.emailPhone, passwd: userInfo.password, userType: userInfo.userType });
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    signup(userInfo) {
        const details = {
            emailPhone: userInfo.emailPhone,
            passwd: userInfo.password,
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            userType: userInfo.userType
        };
        stock_auth_client_1.StockAuthClient.logger.debug('AuthService:signup:: - signupUrl : %s, email: %email', '/user/signup', userInfo.emailPhone);
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp
            .makePost('/user/signup', details);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * The recover() method is used for password recovery.
     * It takes a userInfo object containing the email/phone of the user.
     * It makes a POST request to the '/user/recover/{emailPhone}' endpoint with the user information and
     * returns the response as a promise of type Iauthresponse.
     * @param userInfo An object containing the email/phone of the user.
     * @returns A promise that resolves to the response from the server.
     */
    recover(userInfo) {
        stock_auth_client_1.StockAuthClient.logger
            .debug('AuthService:recover');
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp
            .makePost('/user/recover', userInfo);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    confirm(userInfo) {
        stock_auth_client_1.StockAuthClient.logger.debug('AuthService:confirm');
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp
            .makePost('/user/confirm', userInfo);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    // TODO handle social login from here
    /**
     * The socialLogin() method is used for social login.
     * It takes a userInfo object containing the social login information.
     * It makes a POST request to the '/user/sociallogin' endpoint with the social login details and
     * returns the response as a promise of type Iauthresponse.
     * @param userInfo An object containing the social login information.
     * @returns A promise that resolves to the response from the server.
     */
    socialLogin(userInfo) {
        const loginUrl = '/user/sociallogin';
        stock_auth_client_1.StockAuthClient.logger.debug('AuthService:confirm:: - verifyUrl : %s', loginUrl);
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp
            .makePost(loginUrl, userInfo);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.js.map