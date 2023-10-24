import { Iauthresponse } from '@open-stock/stock-universal';
/** The
 * AuthController  class
 * is responsible for handling
 *  authentication-related operations.
 *  It contains various methods for
 * authenticating users, logging in, signing up,
 * recovering passwords, confirming user information,
 *  and performing social logins.  */
/** */
export declare class AuthController {
    /** The  confirmEnabled  property
     * is a boolean flag indicating
     * whether the user confirmation
     *  feature is enabled or not. */
    confirmEnabled: boolean;
    /** The
     * isLoggedIn  property is a boolean
     * flag indicating whether a user is
     * currently logged in or not.  */
    isLoggedIn: boolean;
    constructor();
    /** The  authenticateJwt()  method is used to authenticate the JSON Web Token (JWT) for the user. It makes a GET request to the '/auth/authexpress' endpoint and returns the response.  */
    authenticateJwt(): Promise<unknown>;
    /** The  testGoogle()  method is used for testing Google authentication. It takes a  userInfo  object containing the URL for Google authentication and makes a GET request to that URL. It returns the response as a promise of type  Iauthresponse */
    testGoogle(userInfo: {
        url: string;
    }): Promise<Iauthresponse>;
    /** The  login()  method is used for user login. It takes a  userInfo  object containing the login URL, email/phone, and password. The password is encrypted using the MD5 algorithm before sending it to the server. It makes a POST request to the login URL with the login credentials and returns the response as a promise of type  Iauthresponse */
    login(userInfo: {
        url: string;
        emailPhone: string;
        password: string;
    }): Promise<Iauthresponse>;
    /** The  signup()  method is used for user registration. It takes a  userInfo  object containing the email/phone, password, first name, and last name. The password is encrypted using the MD5 algorithm. It makes a POST request to the '/auth/signup' endpoint with the registration details and returns the response as a promise of type  Iauthresponse .*/
    signup(userInfo: {
        emailPhone: string;
        password: string;
        firstName: string;
        lastName: string;
    }): Promise<Iauthresponse>;
    /** The  recover()  method is used for password recovery. It takes a  userInfo  object containing the email/phone of the user. It makes a POST request to the '/auth/recover/{emailPhone}' endpoint with the user information and returns the response as a promise of type  Iauthresponse .  */
    recover(userInfo: {
        emailPhone: string;
    }): Promise<Iauthresponse>;
    /** The  confirm()  method is used for confirming user information. It takes a  userInfo  object containing the user information and a  route  string indicating the route to be used for confirmation. It makes a POST request to the '/auth/{route}' endpoint with the user information and returns the response as a promise of type  Iauthresponse .  */
    confirm(userInfo: any, route: string): Promise<Iauthresponse>;
    /** The  socialLogin()  method is used for social login. It takes a  userInfo  object containing the social login information. It makes a POST request to the '/auth/sociallogin' endpoint with the social login details and returns the response as a promise of type  Iauthresponse .*/
    socialLogin(userInfo: any): Promise<Iauthresponse>;
    /** The  networkError()  method is a helper method that returns an error object indicating that there is no internet access.*/
    networkError(): {
        success: boolean;
        err: string;
    };
}
