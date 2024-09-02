"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceSettingRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_counter_mocks_1 = require("../../../../../mocks/stock-counter-mocks");
/**
 * Router for invoice settings.
 */
exports.invoiceSettingRoutesDummy = express_1.default.Router();
exports.invoiceSettingRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.invoiceSettingRoutesDummy.post('/createimg/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.invoiceSettingRoutesDummy.put('/update/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.invoiceSettingRoutesDummy.post('/updateimg/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.invoiceSettingRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockInvoiceSettings)());
});
exports.invoiceSettingRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: [(0, stock_counter_mocks_1.createMockInvoiceSettings)()]
    };
    res.status(200).send(response);
});
exports.invoiceSettingRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.invoiceSettingRoutesDummy.post('/search/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: [(0, stock_counter_mocks_1.createMockInvoiceSettings)()]
    };
    res.status(200).send(response);
});
exports.invoiceSettingRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=invoicesettings.routes.js.map