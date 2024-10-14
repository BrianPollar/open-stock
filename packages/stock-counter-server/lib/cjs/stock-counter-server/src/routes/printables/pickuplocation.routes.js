"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickupLocationRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const mongoose_1 = require("mongoose");
const pickuplocation_model_1 = require("../../models/printables/pickuplocation.model");
/**
 * Express router for pickup location routes
 */
exports.pickupLocationRoutes = express_1.default.Router();
exports.pickupLocationRoutes.post('/add', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryCitys', 'create'), async (req, res) => {
    const pickupLocation = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    pickupLocation.companyId = filter.companyId;
    const newPickupLocation = new pickuplocation_model_1.pickupLocationMain(pickupLocation);
    const savedRes = await newPickupLocation.save()
        .catch((err) => err);
    if (savedRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, savedRes._id, pickuplocation_model_1.pickupLocationMain.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: true });
});
exports.pickupLocationRoutes.put('/update', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryCitys', 'update'), async (req, res) => {
    const updatedPickupLocation = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    updatedPickupLocation.companyId = filter.companyId;
    const pickupLocation = await pickuplocation_model_1.pickupLocationMain
        .findOne({ _id: updatedPickupLocation._id, ...filter })
        .lean();
    if (!pickupLocation) {
        return res.status(404).send({ success: false });
    }
    const updateRes = await pickuplocation_model_1.pickupLocationMain.updateOne({
        _id: updatedPickupLocation._id, ...filter
    }, {
        $set: {
            name: updatedPickupLocation.name || pickupLocation.name,
            contact: updatedPickupLocation.contact || pickupLocation.contact,
            isDeleted: updatedPickupLocation.isDeleted || pickupLocation.isDeleted
        }
    })
        .catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, pickupLocation._id, pickuplocation_model_1.pickupLocationMain.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: true });
});
exports.pickupLocationRoutes.get('/one/:_id', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryCitys', 'read'), async (req, res) => {
    const { _id } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const pickupLocation = await pickuplocation_model_1.pickupLocationLean
        .findOne({ _id, ...filter })
        .lean();
    if (!pickupLocation) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    (0, stock_universal_server_1.addParentToLocals)(res, pickupLocation._id, pickuplocation_model_1.pickupLocationMain.collection.collectionName, 'trackDataView');
    return res.status(200).send(pickupLocation);
});
exports.pickupLocationRoutes.get('/all/:offset/:limit', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryCitys', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const all = await Promise.all([
        pickuplocation_model_1.pickupLocationLean
            .find({ ...filter })
            .skip(offset)
            .limit(limit)
            .lean(),
        pickuplocation_model_1.pickupLocationLean.countDocuments({ ...filter })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, pickuplocation_model_1.pickupLocationMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.pickupLocationRoutes.delete('/delete/one/:_id', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryCitys', 'delete'), async (req, res) => {
    const { _id } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    // const deleted = await pickupLocationMain.findOneAndDelete({ _id, ...filter });
    const updateRes = await pickuplocation_model_1.pickupLocationMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } })
        .catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, _id, pickuplocation_model_1.pickupLocationMain.collection.collectionName, 'trackDataDelete');
    return res.status(200).send({ success: true });
});
exports.pickupLocationRoutes.post('/filter', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryCitys', 'read'), async (req, res) => {
    const { propSort, returnEmptyArr } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const aggCursor = pickuplocation_model_1.pickupLocationLean.aggregate([
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
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, pickuplocation_model_1.pickupLocationMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.pickupLocationRoutes.put('/delete/many', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryCitys', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const updateRes = await pickuplocation_model_1.pickupLocationMain
        .updateMany({ _id: { $in: _ids }, ...filter }, {
        $set: { isDeleted: true }
    })
        .catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    for (const val of _ids) {
        (0, stock_universal_server_1.addParentToLocals)(res, val, pickuplocation_model_1.pickupLocationMain.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=pickuplocation.routes.js.map