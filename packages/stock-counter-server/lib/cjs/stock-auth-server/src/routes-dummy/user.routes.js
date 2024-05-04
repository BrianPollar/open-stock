"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAuthRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_auth_mocks_1 = require("../../../mocks/stock-auth-mocks");
/**
 * Router for authentication routes.
 */
exports.userAuthRoutesDummy = express_1.default.Router();
exports.userAuthRoutesDummy.get('/authexpress/:companyIdParam', (req, res) => {
    const nowResponse = {
        success: true,
        user: (0, stock_auth_mocks_1.createMockUser)(),
        token: 'token'
    };
    return res.status(200).send(nowResponse);
});
exports.userAuthRoutesDummy.post('/login', (req, res) => {
    const nowResponse = {
        success: true,
        user: (0, stock_auth_mocks_1.createMockUser)(),
        token: 'token'
    };
    return res.status(200).send(nowResponse);
});
exports.userAuthRoutesDummy.post('/signup', (req, res) => {
    const response = {
        status: 200,
        success: true,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _id: '_id',
        phone: '077477484999'
    };
    res.status(200).send(response);
});
exports.userAuthRoutesDummy.post('recover', (req, res) => {
    const response = {
        success: true,
        message: 'Recovery email sent',
        type: '_link'
    };
    res.status(200).send(response);
});
exports.userAuthRoutesDummy.post('/confirm', (req, res) => {
    const response = {
        success: true,
        msg: 'Password reset successful',
        user: (0, stock_auth_mocks_1.createMockUser)()
    };
    res.status(200).send(response);
});
exports.userAuthRoutesDummy.put('/resetpaswd', (req, res) => {
    const response = {
        success: true,
        msg: 'Password reset successful',
        user: (0, stock_auth_mocks_1.createMockUser)()
    };
    res.status(200).send(response);
});
exports.userAuthRoutesDummy.post('/manuallyverify/:userId/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.userAuthRoutesDummy.post('/sociallogin', (req, res) => {
    const response = {
        success: true,
        user: (0, stock_auth_mocks_1.createMockUser)()
    };
    res.status(200).send(response);
});
exports.userAuthRoutesDummy.put('/updateprofile/:formtype/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.userAuthRoutesDummy.post('/updateprofileimg/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.userAuthRoutesDummy.put('/updatepermissions/:userId/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.userAuthRoutesDummy.put('/blockunblock/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.userAuthRoutesDummy.put('/addupdateaddr/:userId/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.userAuthRoutesDummy.get('/getoneuser/:urId/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_auth_mocks_1.createMockUser)());
});
exports.userAuthRoutesDummy.get('/getusers/:where/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_auth_mocks_1.createMockUsers)(req.params.limit)
    };
    res.status(200).send(response);
});
exports.userAuthRoutesDummy.post('/adduser/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.userAuthRoutesDummy.post('/adduserimg/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.userAuthRoutesDummy.put('/updateuserbulk/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.userAuthRoutesDummy.post('/updateuserbulkimg/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.userAuthRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.userAuthRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.userAuthRoutesDummy.put('/deleteimages/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=user.routes.js.map