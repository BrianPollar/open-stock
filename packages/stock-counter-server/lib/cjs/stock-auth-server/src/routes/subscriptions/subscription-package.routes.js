"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionPackageRoutes = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-misused-promises */
const subscription_package_model_1 = require("@open-stock/stock-auth-server/src/models/subscriptions/subscription-package.model");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const log4js_1 = require("log4js");
const superadmin_routes_1 = require("../superadmin.routes");
/** Logger for subscriptionPackage routes */
const subscriptionPackageRoutesLogger = (0, log4js_1.getLogger)('routes/subscriptionPackageRoutes');
/**
 * Router for handling subscriptionPackage-related routes.
 */
exports.subscriptionPackageRoutes = express_1.default.Router();
exports.subscriptionPackageRoutes.post('/create', stock_universal_server_1.requireAuth, superadmin_routes_1.requireSuperAdmin, async (req, res) => {
    const { subscriptionPackages } = req.body;
    const newPkg = new subscription_package_model_1.subscriptionPackageMain(subscriptionPackages);
    await newPkg.save();
    return res.status(200).send({ success: true, status: 200 });
});
exports.subscriptionPackageRoutes.post('/uodateone', stock_universal_server_1.requireAuth, superadmin_routes_1.requireSuperAdmin, async (req, res) => {
    const { subscriptionPackage } = req.body;
    const subPackage = await subscription_package_model_1.subscriptionPackageLean
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndUpdate({ _id: subscriptionPackage._id });
    subPackage.name = subscriptionPackage.name || subPackage.name;
    subPackage.ammount = subscriptionPackage.ammount || subPackage.ammount;
    subPackage.duration = subscriptionPackage.duration || subPackage.duration;
    subPackage.active = subscriptionPackage.active || subPackage.active;
    subPackage.features = subscriptionPackage.features || subPackage.features;
    await subPackage.save();
    return res.status(200).send({ success: true, status: 200 });
});
exports.subscriptionPackageRoutes.get('/getall', async (req, res) => {
    const { companyId } = req.user;
    const subscriptionPackages = await subscription_package_model_1.subscriptionPackageLean
        .find({ companyId })
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