"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSuperAdmin = exports.superAdminRoutes = void 0;
const tslib_1 = require("tslib");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const universial_1 = require("../utils/universial");
/**
 * Router for super admin routes.
 */
exports.superAdminRoutes = express_1.default.Router();
exports.superAdminRoutes.post('/login', (req, res) => {
    stock_universal_server_1.mainLogger.info('Login super admin');
    const secret = process.env['accessKey'];
    const password = req.body.password;
    if (password === secret) {
        const permissions = {
            companyAdminAccess: true
        };
        // delete user.password; //we do not want to send back password
        const userInfo = (0, universial_1.setUserInfo)('superAdmin', permissions, 'superAdmin', {
            active: false
        });
        const comapany = {
            name: 'Super Admin',
            displayName: 'Super Admin',
            dateOfEst: new Date().toString(),
            details: 'Super Cow Admin Powers',
            companyDispNameFormat: 'Super Admin',
            businessType: 'Super Admin',
            profilePic: null,
            profileCoverPic: null,
            websiteAddress: 'superadmin.eagleinfosolutions.com',
            pesapalCallbackUrl: 'Super Admin',
            pesapalCancellationUrl: 'Super Admin',
            photos: [],
            blockedReasons: null,
            left: false,
            dateLeft: null
        };
        const user = {
            comapany
        };
        const token = (0, universial_1.generateToken)(userInfo, '1d', stock_universal_server_1.stockUniversalConfig.authSecrets.jwtSecret);
        const nowResponse = {
            success: true,
            user,
            token
        };
        return res.status(200).send(nowResponse);
    }
    else {
        return res.status(401).send({ success: false, err: 'unauthourized' });
    }
});
const requireSuperAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).send({ success: false, err: 'unauthourized' });
    }
    const { userId } = req.user;
    if (userId !== 'superAdmin') {
        return res.status(401).send({ success: false, err: 'unauthourized' });
    }
    return next();
};
exports.requireSuperAdmin = requireSuperAdmin;
//# sourceMappingURL=superadmin.routes.js.map