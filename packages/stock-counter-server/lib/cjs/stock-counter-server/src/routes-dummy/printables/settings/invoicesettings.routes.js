"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceSettingRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const stock_counter_mocks_1 = require("../../../../../tests/stock-counter-mocks");
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
exports.invoiceSettingRoutesDummy.put('/updateimg/:companyIdParam', stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, stock_universal_server_1.deleteFiles, (req, res) => {
    res.status(200).send({ success: true });
});
exports.invoiceSettingRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockInvoiceSettings)());
});
exports.invoiceSettingRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    res.status(200).send([(0, stock_counter_mocks_1.createMockInvoiceSettings)()]);
});
exports.invoiceSettingRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.invoiceSettingRoutesDummy.post('/search/:limit/:offset/:companyIdParam', (req, res) => {
    res.status(200).send([(0, stock_counter_mocks_1.createMockInvoiceSettings)()]);
});
exports.invoiceSettingRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=invoicesettings.routes.js.map