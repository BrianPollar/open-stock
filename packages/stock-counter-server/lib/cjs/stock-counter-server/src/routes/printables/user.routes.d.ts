/**
 * Router for authentication routes.
 */
export declare const authRoutes: any;
/**
 * Handles the user login request.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response with the user information and token.
 */
export declare const userLoginRelegator: (req: Request, res: Response) => Promise<any>;
