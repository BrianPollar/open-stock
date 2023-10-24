"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeUrId = exports.requireAuth = exports.apiRouter = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-var-requires */
const express_1 = tslib_1.__importDefault(require("express"));
const passport = require('passport');
// This function exports an Express router object.
/** */
exports.apiRouter = express_1.default.Router();
// This function exports a middleware function that requires authentication.
//
// **Note:** The `jwt` strategy is used to authenticate requests.
//
// **Note:** The `session` option is set to `false` to prevent the creation of a session cookie.
/** */
exports.requireAuth = passport
    .authenticate('jwt', { session: false });
// This function exports a function that generates a unique ID.
//
// **Parameters:**
//
// * `lastPosition`: The last position in the sequence of IDs.
//
// **Returns:**
//
// A string representing the next ID in the sequence.
/** */
const makeUrId = (lastPosition) => (++lastPosition).toString();
exports.makeUrId = makeUrId;
//# sourceMappingURL=expressrouter.constant.js.map