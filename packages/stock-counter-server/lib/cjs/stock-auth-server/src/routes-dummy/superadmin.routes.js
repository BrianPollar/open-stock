"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.superAdminRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_auth_mocks_1 = require("../../../mocks/stock-auth-mocks");
/**
 * Router for super admin routes.
 */
exports.superAdminRoutesDummy = express_1.default.Router();
exports.superAdminRoutesDummy.post('/login', (req, res) => {
    const nowResponse = {
        success: true,
        user: (0, stock_auth_mocks_1.createMockCompany)(),
        token: 'token'
    };
    return res.status(200).send(nowResponse);
});
//# sourceMappingURL=superadmin.routes.js.map