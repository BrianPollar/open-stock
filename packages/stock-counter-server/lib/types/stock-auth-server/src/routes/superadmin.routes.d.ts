/**
 * This file contains the authentication routes for the stock-auth-server package.
 * It exports the superAdminRoutes router and userLoginRelegator function.
 * It also imports various controllers and models from the same package and other packages.
 * @packageDocumentation
 */
/**
 * Router for super admin routes.
 */
export declare const superAdminRoutes: any;
/**
 * Middleware function to check if the current user is a super admin.
 * If the user is not a super admin, it returns a 401 Unauthorized response.
 * Otherwise, it calls the next middleware function.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function to be called.
 * @returns {void}
 */
export declare const requireSuperAdmin: (req: any, res: any, next: any) => any;
