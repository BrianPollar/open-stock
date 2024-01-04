"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
// import * as CryptoJs from 'crypto-js';
const rxjs_1 = require("rxjs");
const stock_auth_client_1 = require("../stock-auth-client");
/** The
 * AuthController  class
 * is responsible for handling
 *  authentication-related operations.
 *  It contains various methods for
 * authenticating users, logging in, signing up,
 * recovering passwords, confirming user information,
 *  and performing social logins.  */
/**
 * The AuthController class provides methods for user authentication, login, signup, password recovery, and social login.
 */
class AuthController {
    constructor() {
        /**
         * A boolean flag indicating whether the user confirmation feature is enabled or not.
         */
        this.confirmEnabled = false;
        /**
         * A boolean flag indicating whether a user is currently logged in or not.
         */
        this.isLoggedIn = false;
    }
    /**
     * The authenticateJwt() method is used to authenticate the JSON Web Token (JWT) for the user.
     * It makes a GET request to the '/auth/authexpress' endpoint and returns the response.
     * @returns A promise that resolves to the response from the server.
     */
    async authenticateJwt() {
        stock_auth_client_1.StockAuthClient.logger.debug('AuthService:AuthService:authenticateJwt::');
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp
            .makeGet('/auth/authexpress');
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * The testGoogle() method is used for testing Google authentication.
     * It takes a userInfo object containing the URL for Google authentication and makes a GET request to that URL.
     * It returns the response as a promise of type Iauthresponse.
     * @param userInfo An object containing the URL for Google authentication.
     * @returns A promise that resolves to the response from the server.
     */
    async testGoogle(userInfo) {
        stock_auth_client_1.StockAuthClient.logger.debug('AuthService:testGoogle:: - loginUrl : %s', userInfo.url);
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp
            .makeGet(userInfo.url);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * The login() method is used for user login.
     * It takes a userInfo object containing the login URL, email/phone, and password.
     * The password is encrypted using the MD5 algorithm before sending it to the server.
     * It makes a POST request to the login URL with the login credentials and returns the response as a promise of type Iauthresponse.
     * @param userInfo An object containing the login URL, email/phone, and password.
     * @returns A promise that resolves to the response from the server.
     */
    async login(userInfo) {
        stock_auth_client_1.StockAuthClient.logger.debug('AuthService:login:: - loginUrl : %s', userInfo.url);
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp
            .makePost(userInfo.url, { emailPhone: userInfo.emailPhone, passwd: userInfo.password });
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * The signup() method is used for user registration.
     * It takes a userInfo object containing the email/phone, password, first name, and last name.
     * The password is encrypted using the MD5 algorithm.
     * It makes a POST request to the '/auth/signup' endpoint with the registration details and returns the response as a promise of type Iauthresponse.
     * @param userInfo An object containing the email/phone, password, first name, and last name.
     * @returns A promise that resolves to the response from the server.
     */
    async signup(userInfo) {
        const signupUrl = '/auth/signup';
        const details = {
            emailPhone: userInfo.emailPhone,
            passwd: userInfo.password,
            firstName: userInfo.firstName,
            lastName: userInfo.lastName
        };
        stock_auth_client_1.StockAuthClient.logger.debug('AuthService:signup:: - signupUrl : %s, email: %email', signupUrl, userInfo.emailPhone);
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp
            .makePost(signupUrl, details);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * The recover() method is used for password recovery.
     * It takes a userInfo object containing the email/phone of the user.
     * It makes a POST request to the '/auth/recover/{emailPhone}' endpoint with the user information and returns the response as a promise of type Iauthresponse.
     * @param userInfo An object containing the email/phone of the user.
     * @returns A promise that resolves to the response from the server.
     */
    async recover(userInfo) {
        const recoveryUrl = `/auth/recover/${userInfo.emailPhone}`;
        stock_auth_client_1.StockAuthClient.logger
            .debug('AuthService:recover:: - recoveryUrl : %s', recoveryUrl);
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp
            .makePost(recoveryUrl, userInfo);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * The confirm() method is used for confirming user information.
     * It takes a userInfo object containing the user information and a route string indicating the route to be used for confirmation.
     * It makes a POST request to the '/auth/{route}' endpoint with the user information and returns the response as a promise of type Iauthresponse.
     * @param userInfo An object containing the user information.
     * @param route A string indicating the route to be used for confirmation.
     * @returns A promise that resolves to the response from the server.
     */
    async confirm(userInfo, route) {
        const verifyUrl = `/auth/${route}`;
        stock_auth_client_1.StockAuthClient.logger.debug('AuthService:confirm:: - verifyUrl : %s', verifyUrl);
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp
            .makePost(verifyUrl, userInfo);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * The socialLogin() method is used for social login.
     * It takes a userInfo object containing the social login information.
     * It makes a POST request to the '/auth/sociallogin' endpoint with the social login details and returns the response as a promise of type Iauthresponse.
     * @param userInfo An object containing the social login information.
     * @returns A promise that resolves to the response from the server.
     */
    async socialLogin(userInfo) {
        const loginUrl = '/auth/sociallogin';
        stock_auth_client_1.StockAuthClient.logger.debug('AuthService:confirm:: - verifyUrl : %s', loginUrl);
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp
            .makePost(loginUrl, userInfo);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * The networkError() method is a helper method that returns an error object indicating that there is no internet access.
     * @returns An object indicating that there is no internet access.
     */
    networkError() {
        return {
            success: false,
            err: 'no internet access'
        };
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map