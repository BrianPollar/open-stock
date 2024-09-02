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
/**
   * Adds a new user with the provided values and optional files.
   * @param {object} req - Express Request object.
   * @param {object} res - Express Response object.
   * @param {function} next - Express NextFunction object.
   * @returns {Promise<void>}
   */
export declare const addUser: (req: any, res: any, next: any) => Promise<any>;
/**
   * Updates the user's profile with the provided values and optional files.
   * @param companyId - The ID of the company
   * @param vals The values to update the user's profile with.
   * @param files Optional files to upload with the user.
   * @returns A success object indicating whether the user was updated successfully.
   */
export declare const updateUserBulk: (req: any, res: any, next: any) => Promise<any>;
