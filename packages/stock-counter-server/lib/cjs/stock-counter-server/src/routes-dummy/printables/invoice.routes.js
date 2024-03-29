"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_counter_mocks_1 = require("../../../../tests/stock-counter-mocks");
/**
 * Router for handling invoice routes.
 */
exports.invoiceRoutesDummy = express_1.default.Router();
exports.invoiceRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.invoiceRoutesDummy.put('/update/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.invoiceRoutesDummy.get('/getone/:invoiceId/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockInvoice)());
});
exports.invoiceRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockInvoices)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.invoiceRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.invoiceRoutesDummy.post('/search/:limit/:offset/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockInvoices)(Number(req.params.limit)));
});
exports.invoiceRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
// payments
exports.invoiceRoutesDummy.post('/createpayment/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.invoiceRoutesDummy.put('/updatepayment/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.invoiceRoutesDummy.get('/getonepayment/:urId/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockReceipt)());
});
exports.invoiceRoutesDummy.get('/getallpayments/:companyIdParam', (req, res) => {
    const response = {
        count: 10,
        data: (0, stock_counter_mocks_1.createMockReceipts)(10)
    };
    res.status(200).send(response);
});
exports.invoiceRoutesDummy.put('/deleteonepayment/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.invoiceRoutesDummy.put('/deletemanypayments/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=invoice.routes.js.map