/**
 * The API router for handling API routes.
 */
export declare const apiRouter: import("express-serve-static-core").Router;
/**
 * Middleware function to require authentication using passport and JWT strategy.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export declare const requireAuth: any;
