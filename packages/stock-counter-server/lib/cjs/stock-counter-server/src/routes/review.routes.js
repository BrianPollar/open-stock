"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewRoutes = void 0;
const tslib_1 = require("tslib");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const review_model_1 = require("../models/review.model");
const item_routes_1 = require("./item.routes");
/**
 * Logger for review routes
 */
const reviewRoutesLogger = tracer.colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
        // eslint-disable-next-line no-console
        console.log(data.output);
        const logDir = path_1.default.join(process.cwd() + '/openstockLog/');
        fs.mkdir(logDir, { recursive: true }, (err) => {
            if (err) {
                if (err) {
                    // eslint-disable-next-line no-console
                    console.log('data.output err ', err);
                }
            }
        });
        fs.appendFile(logDir + '/counter-server.log', data.rawoutput + '\n', err => {
            if (err) {
                // eslint-disable-next-line no-console
                console.log('raw.output err ', err);
            }
        });
    }
});
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
    review.companyId = 'superAdmin';
    const count = (await review_model_1.reviewMain
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 })[0]?.urId) || 0;
    review.urId = (0, stock_universal_server_1.makeUrId)(count);
    const newReview = new review_model_1.reviewMain(review);
    let errResponse;
    await newReview.save()
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
    const review = await review_model_1.reviewLean
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
exports.reviewRoutes.get('/getall/:id/:offset/:limit/:companyIdParam', async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const all = await Promise.all([
        review_model_1.reviewLean
            .find({ itemId: req.params.id })
            .skip(offset)
            .limit(limit)
            .lean(),
        review_model_1.reviewLean.countDocuments({ itemId: req.params.id })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
});
exports.reviewRoutes.get('/getratingcount/:id/:rating', async (req, res) => {
    const { id, rating } = req.params;
    const review = await review_model_1.reviewLean
        .find({ itemId: id, rating })
        .lean();
    return res.status(200).send({ count: review.length });
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
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const deleted = await review_model_1.reviewMain.findOneAndDelete({ _id: id });
    if (Boolean(deleted)) {
        return next();
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
}, item_routes_1.removeReview);
//# sourceMappingURL=review.routes.js.map