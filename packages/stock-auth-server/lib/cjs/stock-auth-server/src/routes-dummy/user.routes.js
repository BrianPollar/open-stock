"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_auth_mocks_1 = require("../../../tests/stock-auth-mocks");
/**
 * Router for authentication routes.
 */
exports.authRoutesDummy = express_1.default.Router();
exports.authRoutesDummy.get('/authexpress/:companyIdParam', (req, res) => {
    const nowResponse = {
        success: true,
        user: (0, stock_auth_mocks_1.createMockUser)(),
        token: 'token'
    };
    return res.status(200).send(nowResponse);
});
exports.authRoutesDummy.post('/login', (req, res) => {
    const nowResponse = {
        success: true,
        user: (0, stock_auth_mocks_1.createMockUser)(),
        token: 'token'
    };
    return res.status(200).send(nowResponse);
});
exports.authRoutesDummy.post('/signup', (req, res) => {
    const response = {
        status: 200,
        success: true,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _id: '_id',
        phone: '077477484999'
    };
    res.status(200).send(response);
});
exports.authRoutesDummy.post('recover', (req, res) => {
    const response = {
        success: true,
        message: 'Recovery email sent',
        type: '_link'
    };
    res.status(200).send(response);
});
exports.authRoutesDummy.post('/confirm', (req, res) => {
    const response = {
        success: true,
        msg: 'Password reset successful',
        user: (0, stock_auth_mocks_1.createMockUser)()
    };
    res.status(200).send(response);
});
exports.authRoutesDummy.put('/resetpaswd', (req, res) => {
    const response = {
        success: true,
        msg: 'Password reset successful',
        user: (0, stock_auth_mocks_1.createMockUser)()
    };
    res.status(200).send(response);
});
exports.authRoutesDummy.post('/manuallyverify/:userId/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.authRoutesDummy.post('/sociallogin', (req, res) => {
    const response = {
        success: true,
        user: (0, stock_auth_mocks_1.createMockUser)()
    };
    res.status(200).send(response);
});
exports.authRoutesDummy.put('/updateprofile/:formtype/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.authRoutesDummy.post('/updateprofileimg/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.authRoutesDummy.put('/updatepermissions/:userId/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.authRoutesDummy.put('/blockunblock/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.authRoutesDummy.put('/addupdateaddr/:userId/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.authRoutesDummy.get('/getoneuser/:urId/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.authRoutesDummy.get('/getusers/:where/:offset/:limit/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.authRoutesDummy.post('/adduser/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.authRoutesDummy.post('/adduserimg/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.authRoutesDummy.put('/updateuserbulk/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.authRoutesDummy.post('/updateuserbulkimg/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.authRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.authRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.authRoutesDummy.put('/deleteimages/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=user.routes.js.map