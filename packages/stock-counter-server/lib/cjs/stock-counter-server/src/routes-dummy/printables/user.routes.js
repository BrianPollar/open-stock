"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
// import { notifConfig } from '../../config/notif.config';
// import { createNotifications, NotificationController } from '../controllers/notifications.controller';
/**
 * Router for authentication routes.
 */
exports.authRoutesDummy = express_1.default.Router();
exports.authRoutesDummy.get('/authexpress/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.authRoutesDummy.post('/login', (req, res) => {
    res.status(200).send({ success: true });
});
exports.authRoutesDummy.post('/signup', (req, res) => {
    res.status(200).send({ success: true });
});
exports.authRoutesDummy.post('recover', (req, res) => {
    res.status(200).send({ success: true });
});
exports.authRoutesDummy.post('/confirm', (req, res) => {
    res.status(200).send({ success: true });
});
exports.authRoutesDummy.put('/resetpaswd', (req, res) => {
    res.status(200).send({ success: true });
});
exports.authRoutesDummy.post('/manuallyverify/:userId/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.authRoutesDummy.post('/sociallogin', (req, res) => {
    res.status(200).send({ success: true });
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
    const response = {
        count: req.params.limit,
        data: []
    };
    res.status(200).send(response);
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