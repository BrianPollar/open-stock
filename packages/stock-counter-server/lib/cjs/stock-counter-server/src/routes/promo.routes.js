"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promocodeRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_1 = require("@open-stock/stock-universal");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const mongoose_1 = require("mongoose");
const promocode_model_1 = require("../models/promocode.model");
/**
 * Router for handling promo code routes.
 */
exports.promocodeRoutes = express_1.default.Router();
exports.promocodeRoutes.post('/create', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('items', 'create'), async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { items, amount, roomId } = req.body;
    const { companyId } = req.user;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const code = (0, stock_universal_1.makeRandomString)(8, 'combined');
    const urId = await (0, stock_universal_server_1.generateUrId)(promocode_model_1.promocodeMain);
    const promocode = {
        urId,
        companyId,
        code,
        amount,
        items,
        roomId,
        expireAt: new Date().toString()
    };
    const newpromocode = new promocode_model_1.promocodeMain(promocode);
    const savedRes = await newpromocode.save()
        .catch((err) => err);
    if (savedRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, savedRes._id, promocode_model_1.promocodeMain.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: true, code });
});
exports.promocodeRoutes.get('/one/:urIdOr_id', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('items', 'read'), async (req, res) => {
    const { urIdOr_id } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const filterwithId = (0, stock_universal_server_1.verifyObjectId)(urIdOr_id) ? { _id: urIdOr_id } : { urId: urIdOr_id };
    const promocode = await promocode_model_1.promocodeLean
        .findOne({ ...filterwithId, ...filter })
        .lean();
    if (!promocode) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    (0, stock_universal_server_1.addParentToLocals)(res, promocode._id, promocode_model_1.promocodeMain.collection.collectionName, 'trackDataView');
    return res.status(200).send(promocode);
});
exports.promocodeRoutes.get('/getonebycode/:code', async (req, res) => {
    const { code } = req.params;
    const promocode = await promocode_model_1.promocodeLean
        .findOne({ code })
        .lean();
    if (promocode) {
        (0, stock_universal_server_1.addParentToLocals)(res, promocode._id, promocode_model_1.promocodeMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(promocode);
});
exports.promocodeRoutes.get('/all/:offset/:limit', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('items', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const all = await Promise.all([
        promocode_model_1.promocodeLean
            .find(filter)
            .skip(offset)
            .limit(limit)
            .lean(),
        promocode_model_1.promocodeLean.countDocuments(filter)
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, promocode_model_1.promocodeMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.promocodeRoutes.post('/filter', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('items', 'read'), async (req, res) => {
    const { propSort, returnEmptyArr } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const filter = (0, stock_universal_server_1.constructFiltersFromBody)(req);
    const aggCursor = promocode_model_1.promocodeLean.aggregate([
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
        ...(0, stock_universal_server_1.lookupFacet)(offset, limit, propSort, returnEmptyArr)
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
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, promocode_model_1.promocodeMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.promocodeRoutes.delete('/delete/one/:_id', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('items', 'delete'), async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { _id } = req.params;
    const { companyId } = req.user;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id, companyId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // const deleted = await promocodeMain.findOneAndDelete({ _id, });
    const updateRes = await promocode_model_1.promocodeMain.updateOne({ _id }, { $set: { isDeleted: true } })
        .catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, _id, promocode_model_1.promocodeMain.collection.collectionName, 'trackDataDelete');
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=promo.routes.js.map