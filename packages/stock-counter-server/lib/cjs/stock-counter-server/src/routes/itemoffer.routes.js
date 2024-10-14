"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemOfferRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const mongoose_1 = require("mongoose");
const itemoffer_model_1 = require("../models/itemoffer.model");
const query_1 = require("../utils/query");
/**
 * Router for item offers.
 */
exports.itemOfferRoutes = express_1.default.Router();
exports.itemOfferRoutes.post('/add', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_auth_server_1.requireCanUseFeature)('offer'), (0, stock_universal_server_1.roleAuthorisation)('offers', 'create'), async (req, res, next) => {
    const { itemoffer } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    itemoffer.companyId = filter.companyId;
    itemoffer.urId = await (0, stock_universal_server_1.generateUrId)(itemoffer_model_1.itemOfferMain);
    const newDecoy = new itemoffer_model_1.itemOfferMain(itemoffer);
    const savedRes = await newDecoy.save()
        .catch((err) => err);
    if (savedRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, savedRes._id, itemoffer_model_1.itemOfferMain.collection.collectionName, 'makeTrackEdit');
    return next();
}, (0, stock_auth_server_1.requireUpdateSubscriptionRecord)('offer'));
exports.itemOfferRoutes.get('/all/:type/:offset/:limit', stock_universal_server_1.appendUserToReqIfTokenExist, async (req, res) => {
    const { type } = req.params;
    const query = {};
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    let filter = {};
    if (type !== 'all') {
        filter = { type, ...query };
    }
    const all = await Promise.all([
        itemoffer_model_1.itemOfferLean
            .find({ ...filter, ...(0, stock_universal_server_1.makePredomFilter)(req) })
            .skip(offset)
            .limit(limit)
            .populate([(0, query_1.populateItems)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()])
            .lean(),
        itemoffer_model_1.itemOfferLean.countDocuments({ ...filter, ...(0, stock_universal_server_1.makePredomFilter)(req) })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, itemoffer_model_1.itemOfferMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.itemOfferRoutes.post('/filter', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('offers', 'read'), async (req, res) => {
    const { propSort, returnEmptyArr } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const aggCursor = itemoffer_model_1.itemOfferLean
        .aggregate([
        ...(0, stock_universal_server_1.lookupSubFieldItemsRelatedFilter)((0, stock_universal_server_1.constructFiltersFromBody)(req), offset, limit, propSort, returnEmptyArr)
    ]);
    const dataArr = [];
    for await (const data of aggCursor) {
        dataArr.push(data);
    }
    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;
    const response = {
        count,
        data: all
    };
    for (const val of all) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, itemoffer_model_1.itemOfferMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.itemOfferRoutes.get('/one/:urIdOr_id', stock_universal_server_1.appendUserToReqIfTokenExist, async (req, res) => {
    const { urIdOr_id } = req.params;
    const filterwithId = (0, stock_universal_server_1.verifyObjectId)(urIdOr_id) ? { _id: urIdOr_id } : { urId: urIdOr_id };
    const offer = await itemoffer_model_1.itemOfferLean
        .findOne({ ...filterwithId, ...(0, stock_universal_server_1.makePredomFilter)(req) })
        .populate([(0, query_1.populateItems)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()])
        .lean();
    if (!offer) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    (0, stock_universal_server_1.addParentToLocals)(res, offer._id, itemoffer_model_1.itemOfferMain.collection.collectionName, 'trackDataView');
    return res.status(200).send(offer);
});
exports.itemOfferRoutes.delete('/delete/one/:_id', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('offers', 'delete'), async (req, res) => {
    const { _id } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    // const deleted = await itemOfferMain.findOneAndDelete({ _id, });
    const updateRes = await itemoffer_model_1.itemOfferMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } })
        .catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, _id, itemoffer_model_1.itemOfferMain.collection.collectionName, 'trackDataDelete');
    return res.status(200).send({ success: true });
});
exports.itemOfferRoutes.put('/delete/many', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('offers', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const updateRes = await itemoffer_model_1.itemOfferMain
        .updateMany({ _id: { $in: _ids }, ...filter }, {
        $set: { isDeleted: true }
    })
        .catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    for (const val of _ids) {
        (0, stock_universal_server_1.addParentToLocals)(res, val, itemoffer_model_1.itemOfferMain.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=itemoffer.routes.js.map