import { lastValueFrom } from 'rxjs';
import { StockAuthClient } from '../stock-auth-client';
export class AuthController {
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
        StockAuthClient.logger.debug('AuthService:AuthService:authenticateJwt::');
        const observer$ = StockAuthClient.ehttp
            .makeGet('/user/authexpress');
        return lastValueFrom(observer$);
    }
    googleLogin() {
        StockAuthClient.logger.debug('AuthService:googleLogin');
        const observer$ = StockAuthClient.ehttp
            .makeGet('/user/login/google');
        return lastValueFrom(observer$);
    }
    facebookLogin() {
        StockAuthClient.logger.debug('AuthService:facebookLogin');
        const observer$ = StockAuthClient.ehttp
            .makeGet('/user/login/facebook');
        return lastValueFrom(observer$);
    }
    login(userInfo) {
        StockAuthClient.logger.debug('AuthService:login');
        const observer$ = StockAuthClient.ehttp.makePost('/user/login', { emailPhone: userInfo.emailPhone, passwd: userInfo.password, userType: userInfo.userType });
        return lastValueFrom(observer$);
    }
    signup(userInfo) {
        const details = {
            emailPhone: userInfo.emailPhone,
            passwd: userInfo.password,
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            userType: userInfo.userType
        };
        StockAuthClient.logger.debug('AuthService:signup:: - signupUrl : %s, email: %email', '/user/signup', userInfo.emailPhone);
        const observer$ = StockAuthClient.ehttp
            .makePost('/user/signup', details);
        return lastValueFrom(observer$);
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
        StockAuthClient.logger
            .debug('AuthService:recover');
        const observer$ = StockAuthClient.ehttp
            .makePost('/user/recover', userInfo);
        return lastValueFrom(observer$);
    }
    confirm(userInfo) {
        StockAuthClient.logger.debug('AuthService:confirm');
        const observer$ = StockAuthClient.ehttp
            .makePost('/user/confirm', userInfo);
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=auth.js.map