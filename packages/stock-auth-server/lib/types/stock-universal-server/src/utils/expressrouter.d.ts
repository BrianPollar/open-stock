/**
 * The API router for handling API routes.
 */
export declare const apiRouter: any;
/**
 * Middleware function to require authentication using passport and JWT strategy.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export declare const requireAuth: any;
/**
 * Generates a unique ID based on the last position.
 * @param lastPosition The last position used to generate the ID.
 * @returns The generated unique ID as a string.
 */
export declare const makeUrId: (lastPosition: number) => string;
