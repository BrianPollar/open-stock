"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionPackageRoutes = void 0;
const tslib_1 = require("tslib");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const subscription_package_model_1 = require("../../models/subscriptions/subscription-package.model");
const superadmin_routes_1 = require("../superadmin.routes");
/** Logger for subscriptionPackage routes */
const subscriptionPackageRoutesLogger = tracer.colorConsole({
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
        fs.appendFile(logDir + '/auth-server.log', data.rawoutput + '\n', err => {
            if (err) {
                // eslint-disable-next-line no-console
                console.log('raw.output err ', err);
            }
        });
    }
});
/**
 * Router for handling subscriptionPackage-related routes.
 */
exports.subscriptionPackageRoutes = express_1.default.Router();
exports.subscriptionPackageRoutes.post('/create', stock_universal_server_1.requireAuth, superadmin_routes_1.requireSuperAdmin, async (req, res) => {
    subscriptionPackageRoutesLogger.info('Create subscription');
    const subscriptionPackages = req.body;
    const newPkg = new subscription_package_model_1.subscriptionPackageMain(subscriptionPackages);
    let savedErr;
    const saved = await newPkg.save().catch(err => {
        subscriptionPackageRoutesLogger.error('save error', err);
        savedErr = err;
        return err;
    });
    if (savedErr) {
        return res.status(500).send({ success: false });
    }
    if (saved && saved._id) {
        (0, stock_universal_server_1.addParentToLocals)(res, saved._id, subscription_package_model_1.subscriptionPackageMain.collection.collectionName, 'makeTrackEdit');
    }
    return res.status(200).send({ success: true, status: 200 });
});
exports.subscriptionPackageRoutes.put('/updateone', stock_universal_server_1.requireAuth, superadmin_routes_1.requireSuperAdmin, async (req, res) => {
    subscriptionPackageRoutesLogger.info('Update subscription');
    const subscriptionPackage = req.body;
    const subPackage = await subscription_package_model_1.subscriptionPackageMain
        .findOne({ _id: subscriptionPackage._id })
        .lean();
    let savedErr;
    await subscription_package_model_1.subscriptionPackageMain.updateOne({
        _id: subscriptionPackage._id
    }, {
        name: subscriptionPackage.name || subPackage.name,
        ammount: subscriptionPackage.ammount || subPackage.ammount,
        duration: subscriptionPackage.duration || subPackage.duration,
        active: subscriptionPackage.active || subPackage.active,
        features: subscriptionPackage.features || subPackage.features
    }).catch(err => {
        subscriptionPackageRoutesLogger.error('save error', err);
        savedErr = err;
        return null;
    });
    if (savedErr) {
        return res.status(500).send({ success: false });
    }
    (0, stock_universal_server_1.addParentToLocals)(res, subscriptionPackage._id, subscription_package_model_1.subscriptionPackageMain.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: true, status: 200 });
});
exports.subscriptionPackageRoutes.get('/all', async (req, res) => {
    subscriptionPackageRoutesLogger.info('Get all subscription');
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
    // const deleted = await subscriptionPackageMain.findOneAndDelete({ _id });
    const deleted = await subscription_package_model_1.subscriptionPackageMain.updateOne({ _id }, { $set: { isDeleted: true } });
    if (Boolean(deleted)) {
        (0, stock_universal_server_1.addParentToLocals)(res, _id, subscription_package_model_1.subscriptionPackageMain.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
//# sourceMappingURL=subscription-package.routes.js.map