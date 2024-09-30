import { IcustomRequest, TroleAuth, TroleAuthProp } from '@open-stock/stock-universal';
import { NextFunction, Response } from 'express';
export interface IstrategyCred {
    google?: {
        GOOGLE_CLIENT_ID: string;
        GOOGLE_CLIENT_SECRET: string;
    };
    facebook?: {
        FACEBOOK_CLIENT_ID: string;
        FACEBOOK_CLIENT_SECRET: string;
    };
}
/**
 * Runs the Passport configuration for JWT authentication.
 * @param jwtSecret - The secret key used to sign and verify JWT tokens.
 */
export declare const runPassport: (jwtSecret: any, strategys?: IstrategyCred) => void;
/**
 * Middleware function for role-based authorization.
 * @param nowRole - The current role to check.
 * @param permProp - The permission property to check within the role.
 * @returns A middleware function that checks the user's permissions
 * and authorizes access based on the role and permission property.
 */
export declare const roleAuthorisation: (nowRole: TroleAuth, permProp: TroleAuthProp, mayBeProfile?: boolean) => (req: IcustomRequest<never, unknown>, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
/**
 * Retrieves the token from the request.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export declare const getToken: (req: IcustomRequest<never, unknown>, res: any, next: any) => any;
/**
   * Middleware function to append the user information to the request if the token exists.
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @param {NextFunction} next - The next middleware function.
   * @returns {void}
   */
export declare const appendUserToReqIfTokenExist: (req: IcustomRequest<never, unknown>, res: any, next: any) => any;
export declare const canFilterDeepProps: () => void;
