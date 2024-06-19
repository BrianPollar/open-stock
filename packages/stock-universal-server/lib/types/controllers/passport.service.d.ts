import { TroleAuth, TroleAuthProp } from '@open-stock/stock-universal';
/**
 * Runs the Passport configuration for JWT authentication.
 * @param jwtSecret - The secret key used to sign and verify JWT tokens.
 */
export declare const runPassport: (jwtSecret: any) => void;
/**
 * Middleware function for role-based authorization.
 * @param nowRole - The current role to check.
 * @param permProp - The permission property to check within the role.
 * @returns A middleware function that checks the user's permissions and authorizes access based on the role and permission property.
 */
export declare const roleAuthorisation: (nowRole: TroleAuth, permProp: TroleAuthProp, mayBeProfile?: boolean) => (req: any, res: any, next: any) => any;
/**
 * Retrieves the token from the request.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export declare const getToken: (req: any, res: any, next: any) => any;
/**
 * Represents an array of super admin roles.
 */
export declare const roleSuperAdmin: {
    name: string;
}[];
