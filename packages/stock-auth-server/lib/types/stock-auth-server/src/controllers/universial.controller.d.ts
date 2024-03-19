import { Iauthresponse, IauthresponseObj, Iauthtoken, IcompanyPerm, Iuser, Iuserperm } from '@open-stock/stock-universal';
import { Document } from 'mongoose';
/**
 * Generates a JWT token with the provided authentication configuration, expiry date, and JWT secret.
 * @param authConfig - The authentication configuration.
 * @param expiryDate - The expiry date for the token.
 * @param jwtSecret - The JWT secret used for signing the token.
 * @returns The generated JWT token.
 */
export declare const generateToken: (authConfig: Iauthtoken, expiryDate: string | number, jwtSecret: string) => any;
/**
 * Sets the user information.
 * @param userId - The ID of the user.
 * @param permissions - The user's permissions.
 * @param companyId - The ID of the company.
 * @param companyPermissions - The company's permissions.
 * @returns The user information.
 */
export declare const setUserInfo: (userId: string, permissions: Iuserperm, companyId: string, companyPermissions: IcompanyPerm) => Iauthtoken;
/**
 * Validates the phone number of a user and performs necessary actions based on the case.
 * @param foundUser - The user object to validate.
 * @param nowCase - The current case, either 'password' or 'signup'.
 * @param verifycode - The verification code entered by the user.
 * @param newPassword - The new password to set (only applicable for 'password' case).
 * @returns A promise that resolves to an authentication response object.
 */
export declare const validatePhone: (foundUser: Iuser & Document, nowCase: string, verifycode: string, newPassword: string) => Promise<IauthresponseObj>;
/**
 * Validates the email for a user.
 * @param foundUser - The user object.
 * @param type - The type of validation (e.g., '_link', 'code').
 * @param nowCase - The current case (e.g., 'password', 'signup').
 * @param verifycode - The verification code or token.
 * @param newPassword - The new password (only applicable for 'password' case).
 * @returns A promise that resolves to an authentication response object.
 */
export declare const validateEmail: (foundUser: Iuser & Document, type: string, nowCase: string, verifycode: string, newPassword: string) => Promise<IauthresponseObj>;
/**
 * Sends a token to the user's phone for authentication.
 * @param foundUser - The user object.
 * @param enableValidationSMS - Flag indicating whether to enable SMS validation. Default is '1'.
 * @returns A promise that resolves to an authentication response object.
 */
export declare const sendTokenPhone: (foundUser: any, enableValidationSMS?: string) => Promise<Iauthresponse>;
/**
 * Sends a verification email to the specified user with a token or link.
 * @param foundUser - The user object to send the email to.
 * @param type - The type of verification to send ('token' or '_link').
 * @param appOfficialName - The official name of the app sending the email.
 * @returns A Promise that resolves to an Iauthresponse object.
 */
export declare const sendTokenEmail: (foundUser: Iuser, type: string, appOfficialName: string) => Promise<Iauthresponse>;
