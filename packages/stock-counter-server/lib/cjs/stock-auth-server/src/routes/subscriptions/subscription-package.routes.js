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
    await newPkg.save().catch(err => {
        subscriptionPackageRoutesLogger.error('save error', err);
        savedErr = err;
        return null;
    });
    if (savedErr) {
        return res.status(500).send({ success: false });
    }
    return res.status(200).send({ success: true, status: 200 });
});
exports.subscriptionPackageRoutes.put('/updateone', stock_universal_server_1.requireAuth, superadmin_routes_1.requireSuperAdmin, async (req, res) => {
    const subscriptionPackage = req.body;
    const subPackage = await subscription_package_model_1.subscriptionPackageLean
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndUpdate({ _id: subscriptionPackage._id });
    subPackage.name = subscriptionPackage.name || subPackage.name;
    subPackage.ammount = subscriptionPackage.ammount || subPackage.ammount;
    subPackage.duration = subscriptionPackage.duration || subPackage.duration;
    subPackage.active = subscriptionPackage.active || subPackage.active;
    subPackage.features = subscriptionPackage.features || subPackage.features;
    let savedErr;
    await subPackage.save().catch(err => {
        subscriptionPackageRoutesLogger.error('save error', err);
        savedErr = err;
        return null;
    });
    if (savedErr) {
        return res.status(500).send({ success: false });
    }
    return res.status(200).send({ success: true, status: 200 });
});
exports.subscriptionPackageRoutes.get('/getall', async (req, res) => {
    const subscriptionPackages = await subscription_package_model_1.subscriptionPackageLean
        .find({})
        .lean();
    return res.status(200).send(subscriptionPackages);
});
exports.subscriptionPackageRoutes.put('/deleteone/:id', stock_universal_server_1.requireAuth, superadmin_routes_1.requireSuperAdmin, async (req, res) => {
    const { id } = req.params;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const deleted = await subscription_package_model_1.subscriptionPackageMain.findOneAndDelete({ _id: id });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
//# sourceMappingURL=subscription-package.routes.js.map