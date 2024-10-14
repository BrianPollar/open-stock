"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deliverycityRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const mongoose_1 = require("mongoose");
const deliverycity_model_1 = require("../models/deliverycity.model");
/**
 * Express router for deliverycity routes
 */
exports.deliverycityRoutes = express_1.default.Router();
exports.deliverycityRoutes.post('/add', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryCitys', 'create'), async (req, res) => {
    const deliverycity = req.body.deliverycity;
    const newDeliverycity = new deliverycity_model_1.deliverycityMain(deliverycity);
    const savedRes = await newDeliverycity.save()
        .catch((err) => err);
    if (savedRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, savedRes._id, deliverycity_model_1.deliverycityMain.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: true });
});
exports.deliverycityRoutes.get('/one/:urIdOr_id', stock_universal_server_1.appendUserToReqIfTokenExist, async (req, res) => {
    const { urIdOr_id } = req.params;
    const filterwithId = (0, stock_universal_server_1.verifyObjectId)(urIdOr_id) ? { _id: urIdOr_id } : { urId: urIdOr_id };
    const deliverycity = await deliverycity_model_1.deliverycityLean
        .findOne({ ...filterwithId })
        .lean();
    if (!deliverycity) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    (0, stock_universal_server_1.addParentToLocals)(res, deliverycity._id, deliverycity_model_1.deliverycityMain.collection.collectionName, 'trackDataView');
    return res.status(200).send(deliverycity);
});
exports.deliverycityRoutes.get('/all/:offset/:limit', stock_universal_server_1.appendUserToReqIfTokenExist, async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const all = await Promise.all([
        deliverycity_model_1.deliverycityLean
            .find({ isDeleted: false })
            .skip(offset)
            .limit(limit)
            .lean(),
        deliverycity_model_1.deliverycityLean.countDocuments({})
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, deliverycity_model_1.deliverycityMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.deliverycityRoutes.put('/update', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryCitys', 'update'), async (req, res) => {
    const updatedCity = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([updatedCity._id]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deliverycity = await deliverycity_model_1.deliverycityMain
        .findOne({ _id: updatedCity._id, ...(0, stock_universal_server_1.makePredomFilter)(req) })
        .lean();
    if (!deliverycity) {
        return res.status(404).send({ success: false });
    }
    const updateRes = await deliverycity_model_1.deliverycityMain.updateOne({
        _id: updatedCity._id
    }, {
        $set: {
            name: updatedCity.name || deliverycity.name,
            shippingCost: updatedCity.shippingCost || deliverycity.shippingCost,
            currency: updatedCity.currency || deliverycity.currency,
            deliversInDays: updatedCity.deliversInDays || deliverycity.deliversInDays,
            isDeleted: updatedCity.isDeleted || deliverycity.isDeleted
        }
    })
        .catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, updatedCity._id, deliverycity_model_1.deliverycityMain.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: true });
});
exports.deliverycityRoutes.delete('/delete/one/:_id', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryCitys', 'delete'), async (req, res) => {
    const { _id } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // const deleted = await deliverycityMain.findOneAndDelete({ _id });
    const updateRes = await deliverycity_model_1.deliverycityMain
        .updateOne({ _id, ...(0, stock_universal_server_1.makePredomFilter)(req) }, { $set: { isDeleted: true } })
        .catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, _id, deliverycity_model_1.deliverycityMain.collection.collectionName, 'trackDataDelete');
    return res.status(200).send({ success: true });
});
exports.deliverycityRoutes.put('/delete/many', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryCitys', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([..._ids]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const updateRes = await deliverycity_model_1.deliverycityMain
        .updateMany({ _id: { $in: _ids } }, {
        $set: { isDeleted: true }
    }).catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    for (const val of _ids) {
        (0, stock_universal_server_1.addParentToLocals)(res, val, deliverycity_model_1.deliverycityMain.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=deliverycity.routes.js.map