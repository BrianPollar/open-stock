/* eslint-disable @typescript-eslint/no-misused-promises */
import { IdataArrayResponse, Isuccess } from '@open-stock/stock-universal';
import { makeUrId, offsetLimitRelegator, stringifyMongooseErr } from '@open-stock/stock-universal-server';
import express from 'express';
import { getLogger } from 'log4js';
import { reviewLean, reviewMain } from '../models/review.model';
import { addReview, removeReview } from './item.routes';

/**
 * Logger for review routes
 */
const reviewRoutesLogger = getLogger('routes/reviewRoutes');

/**
 * Express router for review routes
 */
export const reviewRoutes = express.Router();

/**
 * Route for creating a new review
 * @name POST /create
 * @function
 * @memberof module:reviewRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing the review to be created
 * @param {Object} req.body.review - Review object to be created
 * @param {Object} res - Express response object
 * @param {Object} next - Express next middleware function
 * @returns {void}
 */
reviewRoutes.post('/create/:companyIdParam', async(req, res, next) => {
  const review = req.body.review;
  review.companyId = 'superAdmin';
  const count = (await reviewMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 })[0]?.urId) || 0;
  review.urId = makeUrId(count);
  const newFaq = new reviewMain(review);
  let errResponse: Isuccess;
  await newFaq.save()
    .catch(err => {
      reviewRoutesLogger.error('create - err: ', err);
      errResponse = {
        success: false,
        status: 403
      };
      if (err && err.errors) {
        errResponse.err = stringifyMongooseErr(err.errors);
      } else {
        errResponse.err = `we are having problems connecting to our databases, 
        try again in a while`;
      }
      return errResponse;
    });

  if (errResponse) {
    return res.status(403).send(errResponse);
  }
  return next();
}, addReview);

/**
 * Route for getting a single review by ID
 * @name GET /getone/:id
 * @function
 * @memberof module:reviewRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters containing the ID of the review to be retrieved
 * @param {string} req.params.id - ID of the review to be retrieved
 * @param {Object} res - Express response object
 * @returns {Object} Review object
 */
reviewRoutes.get('/getone/:id/:companyIdParam', async(req, res) => {
  const { id } = req.params;
  const review = await reviewLean
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .findOne({ _id: id })
    .lean();
  return res.status(200).send(review);
});

/**
 * Route for getting all reviews for a specific item
 * @name GET /getall/:id
 * @function
 * @memberof module:reviewRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters containing the ID of the item to retrieve reviews for
 * @param {string} req.params.id - ID of the item to retrieve reviews for
 * @param {Object} res - Express response object
 * @returns {Array} Array of review objects
 */
reviewRoutes.get('/getall/:id/:offset/:limit/:companyIdParam', async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const all = await Promise.all([
    reviewLean
      .find({ itemId: req.params.id })
      .skip(offset)
      .limit(limit)
      .lean(),
    reviewLean.countDocuments({ itemId: req.params.id })
  ]);
  const response: IdataArrayResponse = {
    count: all[1],
    data: all[0]
  };
  return res.status(200).send(response);
});

/**
 * Route for deleting a single review by ID
 * @name DELETE /deleteone/:id/:itemId/:rating
 * @function
 * @memberof module:reviewRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters containing the ID of the review to be deleted, the ID of the item the review belongs to, and the rating of the review
 * @param {string} req.params.id - ID of the review to be deleted
 * @param {string} req.params.itemId - ID of the item the review belongs to
 * @param {string} req.params.rating - Rating of the review to be deleted
 * @param {Object} res - Express response object
 * @param {Object} next - Express next middleware function
 * @returns {void}
 */
reviewRoutes.delete('/deleteone/:id/:itemId/:rating/:companyIdParam', async(req, res, next) => {
  const { id } = req.params;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const deleted = await reviewMain.findOneAndDelete({ _id: id });
  if (Boolean(deleted)) {
    return next();
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
}, removeReview);
