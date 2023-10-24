/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { reviewLean, reviewMain } from '../models/review.model';
import { addReview, removeReview } from './item.routes';
import { getLogger } from 'log4js';
import { makeUrId, offsetLimitRelegator, stringifyMongooseErr, verifyObjectId } from '@open-stock/stock-universal-server';
/** */
const reviewRoutesLogger = getLogger('routes/reviewRoutes');
/** */
export const reviewRoutes = express.Router();
reviewRoutes.post('/create', async (req, res, next) => {
    const review = req.body.review;
    const count = (await reviewMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 })[0]?.urId) || 0;
    review.urId = makeUrId(count);
    const newFaq = new reviewMain(review);
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
            errResponse.err = stringifyMongooseErr(err.errors);
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
}, addReview);
reviewRoutes.get('/getone/:id', async (req, res) => {
    const { id } = req.params;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const review = await reviewLean
        .findById(id)
        .lean();
    return res.status(200).send(review);
});
reviewRoutes.get('/getall/:id', async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const reviews = await reviewLean
        .find({ itemId: req.params.id })
        .skip(offset)
        .limit(limit)
        .lean();
    return res.status(200).send(reviews);
});
reviewRoutes.delete('/deleteone/:id/:itemId/:rating', async (req, res, next) => {
    const { id } = req.params;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await reviewMain.findByIdAndDelete(id);
    if (Boolean(deleted)) {
        return next();
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
}, removeReview);
//# sourceMappingURL=review.routes.js.map