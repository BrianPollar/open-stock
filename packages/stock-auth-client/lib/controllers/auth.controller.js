// import * as CryptoJs from 'crypto-js';
import { lastValueFrom } from 'rxjs';
import { StockAuthClient } from '../stock-auth-client';
/** The
 * AuthController  class
 * is responsible for handling
 *  authentication-related operations.
 *  It contains various methods for
 * authenticating users, logging in, signing up,
 * recovering passwords, confirming user information,
 *  and performing social logins.  */
/** */
export class AuthController {
    constructor() {
        /** The  confirmEnabled  property
         * is a boolean flag indicating
         * whether the user confirmation
         *  feature is enabled or not. */
        this.confirmEnabled = false;
        /** The
         * isLoggedIn  property is a boolean
         * flag indicating whether a user is
         * currently logged in or not.  */
        this.isLoggedIn = false;
    }
    /** The  authenticateJwt()  method is used to authenticate the JSON Web Token (JWT) for the user. It makes a GET request to the '/auth/authexpress' endpoint and returns the response.  */
    async authenticateJwt() {
        StockAuthClient.logger.debug('AuthService:AuthService:authenticateJwt::');
        const observer$ = StockAuthClient.ehttp
            .makeGet('/auth/authexpress');
        return lastValueFrom(observer$);
    }
    /** The  testGoogle()  method is used for testing Google authentication. It takes a  userInfo  object containing the URL for Google authentication and makes a GET request to that URL. It returns the response as a promise of type  Iauthresponse */
    async testGoogle(userInfo) {
        StockAuthClient.logger.debug('AuthService:testGoogle:: - loginUrl : %s', userInfo.url);
        const observer$ = StockAuthClient.ehttp
            .makeGet(userInfo.url);
        return lastValueFrom(observer$);
    }
    /** The  login()  method is used for user login. It takes a  userInfo  object containing the login URL, email/phone, and password. The password is encrypted using the MD5 algorithm before sending it to the server. It makes a POST request to the login URL with the login credentials and returns the response as a promise of type  Iauthresponse */
    async login(userInfo) {
        StockAuthClient.logger.debug('AuthService:login:: - loginUrl : %s', userInfo.url);
        const observer$ = StockAuthClient.ehttp
            .makePost(userInfo.url, { emailPhone: userInfo.emailPhone, passwd: userInfo.password });
        return lastValueFrom(observer$);
    }
    /** The  signup()  method is used for user registration. It takes a  userInfo  object containing the email/phone, password, first name, and last name. The password is encrypted using the MD5 algorithm. It makes a POST request to the '/auth/signup' endpoint with the registration details and returns the response as a promise of type  Iauthresponse .*/
    async signup(userInfo) {
        const signupUrl = '/auth/signup';
        const details = {
            emailPhone: userInfo.emailPhone,
            passwd: userInfo.password,
            firstName: userInfo.firstName,
            lastName: userInfo.lastName
        };
        StockAuthClient.logger.debug('AuthService:signup:: - signupUrl : %s, email: %email', signupUrl, userInfo.emailPhone);
        const observer$ = StockAuthClient.ehttp
            .makePost(signupUrl, details);
        return lastValueFrom(observer$);
    }
    /** The  recover()  method is used for password recovery. It takes a  userInfo  object containing the email/phone of the user. It makes a POST request to the '/auth/recover/{emailPhone}' endpoint with the user information and returns the response as a promise of type  Iauthresponse .  */
    async recover(userInfo) {
        const recoveryUrl = `/auth/recover/${userInfo.emailPhone}`;
        StockAuthClient.logger
            .debug('AuthService:recover:: - recoveryUrl : %s', recoveryUrl);
        const observer$ = StockAuthClient.ehttp
            .makePost(recoveryUrl, userInfo);
        return lastValueFrom(observer$);
    }
    /** The  confirm()  method is used for confirming user information. It takes a  userInfo  object containing the user information and a  route  string indicating the route to be used for confirmation. It makes a POST request to the '/auth/{route}' endpoint with the user information and returns the response as a promise of type  Iauthresponse .  */
    async confirm(userInfo, route) {
        const verifyUrl = `/auth/${route}`;
        StockAuthClient.logger.debug('AuthService:confirm:: - verifyUrl : %s', verifyUrl);
        const observer$ = StockAuthClient.ehttp
            .makePost(verifyUrl, userInfo);
        return lastValueFrom(observer$);
    }
    /** The  socialLogin()  method is used for social login. It takes a  userInfo  object containing the social login information. It makes a POST request to the '/auth/sociallogin' endpoint with the social login details and returns the response as a promise of type  Iauthresponse .*/
    async socialLogin(userInfo) {
        const loginUrl = '/auth/sociallogin';
        StockAuthClient.logger.debug('AuthService:confirm:: - verifyUrl : %s', loginUrl);
        const observer$ = StockAuthClient.ehttp
            .makePost(loginUrl, userInfo);
        return lastValueFrom(observer$);
    }
    /** The  networkError()  method is a helper method that returns an error object indicating that there is no internet access.*/
    networkError() {
        return {
            success: false,
            err: 'no internet access'
        };
    }
}
//# sourceMappingURL=auth.controller.js.map