"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewRoutes = void 0;
const tslib_1 = require("tslib");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_2 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const review_model_1 = require("../models/review.model");
const item_routes_1 = require("./item.routes");
/**
 * Express router for review routes
 */
exports.reviewRoutes = express_1.default.Router();
exports.reviewRoutes.post('/add', async (req, res, next) => {
    const review = req.body;
    review.companyId = 'superAdmin';
    review.urId = await (0, stock_universal_server_2.generateUrId)(review_model_1.reviewMain);
    const newReview = new review_model_1.reviewMain(review);
    const savedRes = await newReview.save()
        .catch((err) => err);
    if (savedRes instanceof Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, savedRes._id, review_model_1.reviewMain.collection.collectionName, 'makeTrackEdit');
    return next();
}, item_routes_1.addReview);
exports.reviewRoutes.get('/one/:urIdOr_id', async (req, res) => {
    const { urIdOr_id } = req.params;
    const filterwithId = (0, stock_universal_server_1.verifyObjectId)(urIdOr_id) ? { _id: urIdOr_id } : { urId: urIdOr_id };
    const review = await review_model_1.reviewLean
        .findOne({ ...filterwithId, ...(0, stock_universal_server_1.makePredomFilter)(req) })
        .lean();
    if (!review) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    (0, stock_universal_server_1.addParentToLocals)(res, review._id, review_model_1.reviewMain.collection.collectionName, 'trackDataView');
    return res.status(200).send(review);
});
exports.reviewRoutes.get('/all/:_id/:offset/:limit', async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_2.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const all = await Promise.all([
        review_model_1.reviewLean
            .find({ itemId: req.params._id, ...(0, stock_universal_server_1.makePredomFilter)(req) })
            .skip(offset)
            .limit(limit)
            .lean(),
        review_model_1.reviewLean.countDocuments({ itemId: req.params._id })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, review_model_1.reviewMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.reviewRoutes.post('/filter', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('items', 'read'), async (req, res) => {
    const { propSort, returnEmptyArr } = req.body;
    const { offset, limit } = (0, stock_universal_server_2.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const filter = (0, stock_universal_server_1.constructFiltersFromBody)(req);
    const aggCursor = review_model_1.reviewLean.aggregate([
        {
            $match: {
                $and: [
                    // { status: 'pending' },
                    ...filter
                ]
            }
        },
        ...(0, stock_universal_server_1.lookupTrackEdit)(),
        ...(0, stock_universal_server_1.lookupTrackView)(),
        ...(0, stock_universal_server_2.lookupFacet)(offset, limit, propSort, returnEmptyArr)
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
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, review_model_1.reviewMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.reviewRoutes.get('/getratingcount/:_id/:rating', async (req, res) => {
    const { id, rating } = req.params;
    const review = await review_model_1.reviewLean
        .find({ itemId: id, rating })
        .lean();
    return res.status(200).send({ count: review.length });
});
exports.reviewRoutes.delete('/delete/one/:_id/:itemId/:rating', async (req, res, next) => {
    const { _id } = req.params;
    // const deleted = await reviewMain.findOneAndDelete({ _id });
    const updateRes = await review_model_1.reviewMain.updateOne({ _id }, { $set: { isDeleted: true } })
        .catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, _id, review_model_1.reviewMain.collection.collectionName, 'trackDataDelete');
    return next();
}, item_routes_1.removeReview);
//# sourceMappingURL=review.routes.js.map