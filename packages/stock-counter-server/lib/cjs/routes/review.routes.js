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
/** */
const reviewRoutesLogger = (0, log4js_1.getLogger)('routes/reviewRoutes');
/** */
exports.reviewRoutes = express_1.default.Router();
exports.reviewRoutes.post('/create', async (req, res, next) => {
    const review = req.body.review;
    const count = (await review_model_1.reviewMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 })[0]?.urId) || 0;
    review.urId = (0, stock_universal_server_1.makeUrId)(count);
    const newFaq = new review_model_1.reviewMain(review);
    let errResponse;
    // const saved =
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
exports.reviewRoutes.get('/getone/:id', async (req, res) => {
    const { id } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const review = await review_model_1.reviewLean
        .findById(id)
        .lean();
    return res.status(200).send(review);
});
exports.reviewRoutes.get('/getall/:id', async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const reviews = await review_model_1.reviewLean
        .find({ itemId: req.params.id })
        .skip(offset)
        .limit(limit)
        .lean();
    return res.status(200).send(reviews);
});
exports.reviewRoutes.delete('/deleteone/:id/:itemId/:rating', async (req, res, next) => {
    const { id } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await review_model_1.reviewMain.findByIdAndDelete(id);
    if (Boolean(deleted)) {
        return next();
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
}, item_routes_1.removeReview);
//# sourceMappingURL=review.routes.js.map