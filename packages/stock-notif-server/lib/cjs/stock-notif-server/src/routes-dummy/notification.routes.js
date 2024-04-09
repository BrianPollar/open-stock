"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifnRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_notif_mocks_1 = require("../../../tests/stock-notif-mocks");
/**
 * Router for handling notification routes.
 */
exports.notifnRoutesDummy = express_1.default.Router();
exports.notifnRoutesDummy.get('/getmynotifn/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: 10,
        data: (0, stock_notif_mocks_1.createMockNotifs)(10)
    };
    res.status(200).send(response);
});
exports.notifnRoutesDummy.get('/getmyavailnotifn/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: 10,
        data: (0, stock_notif_mocks_1.createMockNotifs)(10)
    };
    res.status(200).send(response);
});
exports.notifnRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_notif_mocks_1.createMockNotif)());
});
exports.notifnRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.notifnRoutesDummy.post('/subscription/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.notifnRoutesDummy.post('/updateviewed/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.notifnRoutesDummy.get('/unviewedlength/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.notifnRoutesDummy.put('/clearall/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
// settings
exports.notifnRoutesDummy.post('/createstn/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.notifnRoutesDummy.put('/updatestn', (req, res) => {
    res.status(200).send({ success: true });
});
// settings
exports.notifnRoutesDummy.post('/getstn', (req, res) => {
    res.status(200).send([]);
});
//# sourceMappingURL=notification.routes.js.map