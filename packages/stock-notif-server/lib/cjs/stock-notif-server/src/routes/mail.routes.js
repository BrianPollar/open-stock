"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailPackageRoutes = void 0;
const tslib_1 = require("tslib");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const log4js_1 = require("log4js");
/** Logger for mailPackage routes */
const mailPackageRoutesLogger = (0, log4js_1.getLogger)('routes/mailPackageRoutes');
/**
 * Router for handling mailPackage-related routes.
 */
exports.mailPackageRoutes = express_1.default.Router();
exports.mailPackageRoutes.post('/sendmail', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users', 'create'), (req, res) => {
    return res.status(200).send({ success: true, status: 200 });
});
//# sourceMappingURL=mail.routes.js.map