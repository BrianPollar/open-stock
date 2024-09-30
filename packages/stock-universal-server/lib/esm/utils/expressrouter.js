/* eslint-disable @typescript-eslint/no-var-requires */
import express from 'express';
const passport = require('passport');
/**
 * The API router for handling API routes.
 */
export const apiRouter = express.Router();
// This function exports a middleware function that requires authentication.
//
// **Note:** The `jwt` strategy is used to authenticate requests.
//
// **Note:** The `session` option is set to `false` to prevent the creation of a session cookie.
/**
 * Middleware function to require authentication using passport and JWT strategy.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const requireAuth = passport
    .authenticate('jwt', { session: false });
//# sourceMappingURL=expressrouter.js.map