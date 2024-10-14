import { addParentToLocals, constructFiltersFromBody, handleMongooseErr, lookupTrackEdit, lookupTrackView, makePredomFilter, requireAuth, roleAuthorisation, verifyObjectId } from '@open-stock/stock-universal-server';
import { requireActiveCompany } from '@open-stock/stock-auth-server';
import { generateUrId, lookupFacet, offsetLimitRelegator } from '@open-stock/stock-universal-server';
import express from 'express';
import { reviewLean, reviewMain } from '../models/review.model';
import { addReview, removeReview } from './item.routes';
/**
 * Express router for review routes
 */
export const reviewRoutes = express.Router();
reviewRoutes.post('/add', async (req, res, next) => {
    const review = req.body;
    review.companyId = 'superAdmin';
    review.urId = await generateUrId(reviewMain);
    const newReview = new reviewMain(review);
    const savedRes = await newReview.save()
        .catch((err) => err);
    if (savedRes instanceof Error) {
        const errResponse = handleMongooseErr(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    addParentToLocals(res, savedRes._id, reviewMain.collection.collectionName, 'makeTrackEdit');
    return next();
}, addReview);
reviewRoutes.get('/one/:urIdOr_id', async (req, res) => {
    const { urIdOr_id } = req.params;
    const filterwithId = verifyObjectId(urIdOr_id) ? { _id: urIdOr_id } : { urId: urIdOr_id };
    const review = await reviewLean
        .findOne({ ...filterwithId, ...makePredomFilter(req) })
        .lean();
    if (!review) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    addParentToLocals(res, review._id, reviewMain.collection.collectionName, 'trackDataView');
    return res.status(200).send(review);
});
reviewRoutes.get('/all/:_id/:offset/:limit', async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const all = await Promise.all([
        reviewLean
            .find({ itemId: req.params._id, ...makePredomFilter(req) })
            .skip(offset)
            .limit(limit)
            .lean(),
        reviewLean.countDocuments({ itemId: req.params._id })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        addParentToLocals(res, val._id, reviewMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
reviewRoutes.post('/filter', requireAuth, requireActiveCompany, roleAuthorisation('items', 'read'), async (req, res) => {
    const { propSort, returnEmptyArr } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);
    const filter = constructFiltersFromBody(req);
    const aggCursor = reviewLean.aggregate([
        {
            $match: {
                $and: [
                    // { status: 'pending' },
                    ...filter
                ]
            }
        },
        ...lookupTrackEdit(),
        ...lookupTrackView(),
        ...lookupFacet(offset, limit, propSort, returnEmptyArr)
    ]);
    const dataArr = [];
    for await (const data of aggCursor) {
        dataArr.push(data);
    }
    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;
    const staffsToReturn = all.filter(val => val.userId);
    const response = {
        count,
        data: staffsToReturn
    };
    for (const val of all) {
        addParentToLocals(res, val._id, reviewMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
reviewRoutes.get('/getratingcount/:_id/:rating', async (req, res) => {
    const { id, rating } = req.params;
    const review = await reviewLean
        .find({ itemId: id, rating })
        .lean();
    return res.status(200).send({ count: review.length });
});
reviewRoutes.delete('/delete/one/:_id/:itemId/:rating', async (req, res, next) => {
    const { _id } = req.params;
    // const deleted = await reviewMain.findOneAndDelete({ _id });
    const updateRes = await reviewMain.updateOne({ _id }, { $set: { isDeleted: true } })
        .catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    addParentToLocals(res, _id, reviewMain.collection.collectionName, 'trackDataDelete');
    return next();
}, removeReview);
//# sourceMappingURL=review.routes.js.map