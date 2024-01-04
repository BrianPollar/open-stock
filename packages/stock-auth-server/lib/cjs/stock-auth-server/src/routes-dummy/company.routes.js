"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyAuthRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_auth_mocks_1 = require("../../../tests/stock-auth-mocks");
exports.companyAuthRoutesDummy = express_1.default.Router();
exports.companyAuthRoutesDummy.get('/authexpress/:companyIdParam', (req, res) => {
    const nowResponse = {
        success: true,
        user: (0, stock_auth_mocks_1.createMockCompany)(),
        token: 'token'
    };
    return res.status(200).send(nowResponse);
});
exports.companyAuthRoutesDummy.post('recover', (req, res) => {
    const response = {
        success: true,
        message: 'Recovery email sent',
        type: '_link'
    };
    res.status(200).send(response);
});
exports.companyAuthRoutesDummy.post('/confirm', (req, res) => {
    const response = {
        success: true,
        msg: 'Password reset successful',
        user: (0, stock_auth_mocks_1.createMockUser)()
    };
    res.status(200).send(response);
});
exports.companyAuthRoutesDummy.put('/resetpaswd', (req, res) => {
    const response = {
        success: true,
        msg: 'Password reset successful',
        user: (0, stock_auth_mocks_1.createMockUser)()
    };
    res.status(200).send(response);
});
exports.companyAuthRoutesDummy.post('/updateprofileimg/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.companyAuthRoutesDummy.put('/blockunblock/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.companyAuthRoutesDummy.post('/addcompanyimg/:companyIdParam', (req, res) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    res.status(200).send({ success: true, _id: 'id' });
});
exports.companyAuthRoutesDummy.put('/updatecompanybulk/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.companyAuthRoutesDummy.post('/updatecompanybulkimg/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.companyAuthRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.companyAuthRoutesDummy.put('/deleteimages/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=company.routes.js.map