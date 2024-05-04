/**
 * Router for authentication routes.
 */
export declare const userAuthRoutes: any;
/**
 * Handles the login and registration process for superadmin users.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @returns A Promise that resolves to void.
 */
export declare const signupFactorRelgator: (req: any, res: any, next: any) => Promise<any>;
/**
 * Handles the user login request.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response with the user information and token.
 */
export declare const userLoginRelegator: (req: Request, res: Response, next: any) => Promise<any>;
export declare const addUser: (req: any, res: any, next: any) => Promise<any>;
export declare const updateUserBulk: (req: any, res: any, next: any) => Promise<any>;
