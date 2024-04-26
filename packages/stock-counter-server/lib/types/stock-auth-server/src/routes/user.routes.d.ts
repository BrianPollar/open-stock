/**
 * Router for authentication routes.
 */
export declare const userAuthRoutes: any;
/**
 * Handles the user login request.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response with the user information and token.
 */
export declare const userLoginRelegator: (req: Request, res: Response) => Promise<any>;
export declare const addUser: (req: any, res: any, next: any) => Promise<any>;
export declare const updateUserBulk: (req: any, res: any, next: any) => Promise<any>;
