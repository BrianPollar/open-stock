"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_counter_mocks_1 = require("../../../tests/stock-counter-mocks");
/**
 * Express router for payment routes.
 */
exports.paymentRoutesDummy = express_1.default.Router();
exports.paymentRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.paymentRoutesDummy.put('/update/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.paymentRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockPayment)());
});
exports.paymentRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockPayments)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.paymentRoutesDummy.get('/getmypayments/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockPayments)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.paymentRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.paymentRoutesDummy.post('/search/:limit/:offset/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: []
    };
    res.status(200).send(response);
});
exports.paymentRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
// get ipn
exports.paymentRoutesDummy.get('/ipn', (req, res) => {
    res.status(200).send({ success: true });
});
exports.paymentRoutesDummy.get('/paymentstatus/:orderTrackingId/:paymentRelated', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=payment.routes.js.map