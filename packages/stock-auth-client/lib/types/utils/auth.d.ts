import { Iauthresponse, TuserType } from '@open-stock/stock-universal';
export declare class AuthController {
    confirmEnabled: boolean;
    isLoggedIn: boolean;
    constructor();
    /**
     * The authenticateJwt() method is used to authenticate the JSON Web Token (JWT) for the user.
     * It makes a GET request to the '/user/authexpress' endpoint and returns the response.
     * @returns A promise that resolves to the response from the server.
     */
    authenticateJwt(): Promise<void>;
    googleLogin(): Promise<Iauthresponse>;
    facebookLogin(): Promise<Iauthresponse>;
    login<T = 'eUser'>(userInfo: {
        emailPhone: string;
        password: string;
        userType?: TuserType<T>;
    }): Promise<Iauthresponse>;
    signup<T = 'eUser'>(userInfo: {
        emailPhone: string;
        password: string;
        firstName: string;
        lastName: string;
        userType: TuserType<T>;
    }): Promise<Iauthresponse>;
    /**
     * The recover() method is used for password recovery.
     * It takes a userInfo object containing the email/phone of the user.
     * It makes a POST request to the '/user/recover/{emailPhone}' endpoint with the user information and
     * returns the response as a promise of type Iauthresponse.
     * @param userInfo An object containing the email/phone of the user.
     * @returns A promise that resolves to the response from the server.
     */
    recover(userInfo: {
        emailPhone: string;
    }): Promise<Iauthresponse>;
    confirm(userInfo: {
        _id: string;
        verifycode: string;
        useField: 'phone' | 'email';
        verificationMean?: 'link' | 'code';
        password?: string;
    }): Promise<Iauthresponse>;
    /**
     * The socialLogin() method is used for social login.
     * It takes a userInfo object containing the social login information.
     * It makes a POST request to the '/user/sociallogin' endpoint with the social login details and
     * returns the response as a promise of type Iauthresponse.
     * @param userInfo An object containing the social login information.
     * @returns A promise that resolves to the response from the server.
     */
    socialLogin(userInfo: any): Promise<Iauthresponse>;
}
