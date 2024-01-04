"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewRoutes = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-misused-promises */
const express_1 = tslib_1.__importDefault(require("express"));
const review_model_1 = require("../models/review.model");
const item_routes_1 = require("./item.routes");
const log4js_1 = require("log4js");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
/**
 * Logger for review routes
 */
const reviewRoutesLogger = (0, log4js_1.getLogger)('routes/reviewRoutes');
/**
 * Express router for review routes
 */
exports.reviewRoutes = express_1.default.Router();
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
exports.reviewRoutes.post('/create/:companyIdParam', async (req, res, next) => {
    const review = req.body.review;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    review.companyId = queryId;
    const count = (await review_model_1.reviewMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 })[0]?.urId) || 0;
    review.urId = (0, stock_universal_server_1.makeUrId)(count);
    const newFaq = new review_model_1.reviewMain(review);
    let errResponse;
    await newFaq.save()
        .catch(err => {
        reviewRoutesLogger.error('create - err: ', err);
        errResponse = {
            success: false,
            status: 403
        };
        if (err && err.errors) {
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
        }
        else {
            errResponse.err = `we are having problems connecting to our databases, 
        try again in a while`;
        }
        return errResponse;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    return next();
}, item_routes_1.addReview);
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
exports.reviewRoutes.get('/getone/:id/:companyIdParam', async (req, res) => {
    const { id } = req.params;
    const { companyIdParam } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, companyIdParam]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const review = await review_model_1.reviewLean
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOne({ _id: id, companyId: companyIdParam })
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
exports.reviewRoutes.get('/getall/:id/:companyIdParam', async (req, res) => {
    const { companyIdParam } = req.params;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const reviews = await review_model_1.reviewLean
        .find({ itemId: req.params.id, companyId: companyIdParam })
        .skip(offset)
        .limit(limit)
        .lean();
    return res.status(200).send(reviews);
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
exports.reviewRoutes.delete('/deleteone/:id/:itemId/:rating/:companyIdParam', async (req, res, next) => {
    const { id } = req.params;
    const { companyIdParam } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, companyIdParam]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const deleted = await review_model_1.reviewMain.findOneAndDelete({ _id: id, companyId: companyIdParam });
    if (Boolean(deleted)) {
        return next();
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
}, item_routes_1.removeReview);
//# sourceMappingURL=review.routes.js.map