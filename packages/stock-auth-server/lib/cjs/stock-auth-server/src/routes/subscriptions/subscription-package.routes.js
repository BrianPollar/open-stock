"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionPackageRoutes = void 0;
const tslib_1 = require("tslib");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const mongoose_1 = require("mongoose");
const subscription_package_model_1 = require("../../models/subscriptions/subscription-package.model");
const superadmin_routes_1 = require("../superadmin.routes");
/**
 * Router for handling subscriptionPackage-related routes.
 */
exports.subscriptionPackageRoutes = express_1.default.Router();
exports.subscriptionPackageRoutes.post('/create', stock_universal_server_1.requireAuth, superadmin_routes_1.requireSuperAdmin, async (req, res) => {
    stock_universal_server_1.mainLogger.info('Create subscription');
    const subscriptionPackages = req.body;
    const newPkg = new subscription_package_model_1.subscriptionPackageMain(subscriptionPackages);
    const savedRes = await newPkg.save().catch((err) => {
        stock_universal_server_1.mainLogger.error('save error', err);
        return err;
    });
    if (savedRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    if (savedRes._id) {
        (0, stock_universal_server_1.addParentToLocals)(res, savedRes._id, subscription_package_model_1.subscriptionPackageMain.collection.collectionName, 'makeTrackEdit');
    }
    return res.status(200).send({ success: true, status: 200 });
});
exports.subscriptionPackageRoutes.put('/updateone', stock_universal_server_1.requireAuth, superadmin_routes_1.requireSuperAdmin, async (req, res) => {
    stock_universal_server_1.mainLogger.info('Update subscription');
    const subscriptionPackage = req.body;
    const subPackage = await subscription_package_model_1.subscriptionPackageMain
        .findOne({ _id: subscriptionPackage._id })
        .lean();
    if (!subPackage) {
        return res.status(404).send({ success: false });
    }
    const updateRes = await subscription_package_model_1.subscriptionPackageMain.updateOne({
        _id: subscriptionPackage._id
    }, {
        name: subscriptionPackage.name || subPackage.name,
        ammount: subscriptionPackage.ammount || subPackage.ammount,
        duration: subscriptionPackage.duration || subPackage.duration,
        active: subscriptionPackage.active || subPackage.active,
        features: subscriptionPackage.features || subPackage.features
    }).catch((err) => {
        stock_universal_server_1.mainLogger.error('save error', err);
        return err;
    });
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, subscriptionPackage._id, subscription_package_model_1.subscriptionPackageMain.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: true, status: 200 });
});
exports.subscriptionPackageRoutes.get('/all', async (req, res) => {
    stock_universal_server_1.mainLogger.info('Get all subscription');
    const subscriptionPackages = await subscription_package_model_1.subscriptionPackageLean
        .find({ ...(0, stock_universal_server_1.makePredomFilter)(req) })
        .lean();
    for (const val of subscriptionPackages) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, subscription_package_model_1.subscriptionPackageMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(subscriptionPackages);
});
exports.subscriptionPackageRoutes.put('/delete/one/:_id', stock_universal_server_1.requireAuth, async (req, res) => {
    const { _id } = req.params;
    const updateRes = await subscription_package_model_1.subscriptionPackageMain.updateOne({ _id }, { $set: { isDeleted: true } })
        .catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, _id, subscription_package_model_1.subscriptionPackageMain.collection.collectionName, 'trackDataDelete');
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=subscription-package.routes.js.map