// import * as CryptoJs from 'crypto-js';
import { Iauthresponse, TuserType } from '@open-stock/stock-universal';
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

/**
 * The AuthController class provides methods for user authentication, login, signup, password recovery, and social login.
 */
export class AuthController {
  /**
   * A boolean flag indicating whether the user confirmation feature is enabled or not.
   */
  confirmEnabled = false;

  /**
   * A boolean flag indicating whether a user is currently logged in or not.
   */
  isLoggedIn = false;

  constructor() { }

  /**
   * The authenticateJwt() method is used to authenticate the JSON Web Token (JWT) for the user.
   * It makes a GET request to the '/user/authexpress' endpoint and returns the response.
   * @returns A promise that resolves to the response from the server.
   */
  async authenticateJwt() {
    StockAuthClient.logger.debug('AuthService:AuthService:authenticateJwt::');
    const observer$ = StockAuthClient.ehttp
      .makeGet('/user/authexpress');

    return lastValueFrom(observer$) ;
  }

  /**
   * The testGoogle() method is used for testing Google authentication.
   * It takes a userInfo object containing the URL for Google authentication and makes a GET request to that URL.
   * It returns the response as a promise of type Iauthresponse.
   * @param userInfo An object containing the URL for Google authentication.
   * @returns A promise that resolves to the response from the server.
   */
  async testGoogle(userInfo:
    {
      url: string;
    }): Promise<Iauthresponse> {
    StockAuthClient.logger.debug('AuthService:testGoogle:: - loginUrl : %s', userInfo.url);
    const observer$ = StockAuthClient.ehttp
      .makeGet(userInfo.url);

    return lastValueFrom(observer$) as Promise<Iauthresponse>;
  }

  /**
   * The login() method is used for user login.
   * It takes a userInfo object containing the login URL, email/phone, and password.
   * The password is encrypted using the MD5 algorithm before sending it to the server.
   * It makes a POST request to the login URL with the login credentials and returns the response as a promise of type Iauthresponse.
   * @param userInfo An object containing the login URL, email/phone, and password.
   * @returns A promise that resolves to the response from the server.
   */
  async login(userInfo:
    {
      url: string;
      emailPhone: string;
      password: string;
    }): Promise<Iauthresponse> {
    StockAuthClient.logger.debug('AuthService:login:: - loginUrl : %s', userInfo.url);
    const observer$ = StockAuthClient.ehttp
      .makePost(userInfo.url, { emailPhone: userInfo.emailPhone, passwd: userInfo.password });

    return lastValueFrom(observer$) as Promise<Iauthresponse>;
  }

  /**
   * The signup() method is used for user registration.
   * It takes a userInfo object containing the email/phone, password, first name, and last name.
   * The password is encrypted using the MD5 algorithm.
   * It makes a POST request to the '/user/signup' endpoint with the registration details and returns the response as a promise of type Iauthresponse.
   * @param userInfo An object containing the email/phone, password, first name, and last name.
   * @returns A promise that resolves to the response from the server.
   */
  async signup(userInfo:
    {
      url: string;
      emailPhone: string;
      password: string;
      firstName: string;
      lastName: string;
      userType: TuserType;
    }): Promise<Iauthresponse> {
    const details = {
      emailPhone:
        userInfo.emailPhone,
      passwd: userInfo.password,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      userType: userInfo.userType
    };

    StockAuthClient.logger.debug('AuthService:signup:: - signupUrl : %s, email: %email', userInfo.url, userInfo.emailPhone);
    const observer$ = StockAuthClient.ehttp
      .makePost(userInfo.url, details);

    return lastValueFrom(observer$) as Promise<Iauthresponse>;
  }

  /**
   * The recover() method is used for password recovery.
   * It takes a userInfo object containing the email/phone of the user.
   * It makes a POST request to the '/user/recover/{emailPhone}' endpoint with the user information and returns the response as a promise of type Iauthresponse.
   * @param userInfo An object containing the email/phone of the user.
   * @returns A promise that resolves to the response from the server.
   */
  async recover(userInfo:
    { url: string; emailPhone: string }): Promise<Iauthresponse> {
    StockAuthClient.logger
      .debug('AuthService:recover:: - recoveryUrl : %s', userInfo.url);
    const observer$ = StockAuthClient.ehttp
      .makePost(userInfo.url, userInfo);

    return lastValueFrom(observer$) as Promise<Iauthresponse>;
  }

  /**
   * The confirm() method is used for confirming user information.
   * It takes a userInfo object containing the user information and a route string indicating the route to be used for confirmation.
   * It makes a POST request to the '/user/{route}' endpoint with the user information and returns the response as a promise of type Iauthresponse.
   * @param userInfo An object containing the user information.
   * @param route A string indicating the route to be used for confirmation.
   * @returns A promise that resolves to the response from the server.
   */
  async confirm(
    userInfo,
    verifyUrl: string
  ): Promise<Iauthresponse> {
    StockAuthClient.logger.debug('AuthService:confirm:: - verifyUrl : %s', verifyUrl);
    const observer$ = StockAuthClient.ehttp
      .makePost(verifyUrl, userInfo);

    return lastValueFrom(observer$) as Promise<Iauthresponse>;
  }

  /**
   * The socialLogin() method is used for social login.
   * It takes a userInfo object containing the social login information.
   * It makes a POST request to the '/user/sociallogin' endpoint with the social login details and returns the response as a promise of type Iauthresponse.
   * @param userInfo An object containing the social login information.
   * @returns A promise that resolves to the response from the server.
   */
  async socialLogin(userInfo): Promise<Iauthresponse> {
    const loginUrl = '/user/sociallogin';

    StockAuthClient.logger.debug('AuthService:confirm:: - verifyUrl : %s', loginUrl);
    const observer$ = StockAuthClient.ehttp
      .makePost(loginUrl, userInfo);

    return lastValueFrom(observer$) as Promise<Iauthresponse>;
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

