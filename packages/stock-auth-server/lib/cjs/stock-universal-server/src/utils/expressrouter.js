"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = exports.apiRouter = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-var-requires */
const express_1 = tslib_1.__importDefault(require("express"));
const passport = require('passport');
/**
 * The API router for handling API routes.
 */
exports.apiRouter = express_1.default.Router();
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
exports.requireAuth = passport
    .authenticate('jwt', { session: false });
//# sourceMappingURL=expressrouter.js.map