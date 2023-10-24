/* eslint-disable @typescript-eslint/no-var-requires */
import express from 'express';
const passport = require('passport');

// This function exports an Express router object.
/** */
export const apiRouter = express.Router();

// This function exports a middleware function that requires authentication.
//
// **Note:** The `jwt` strategy is used to authenticate requests.
//
// **Note:** The `session` option is set to `false` to prevent the creation of a session cookie.
/** */
export const requireAuth = passport
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
export const makeUrId = (lastPosition: number) => (++lastPosition).toString();
