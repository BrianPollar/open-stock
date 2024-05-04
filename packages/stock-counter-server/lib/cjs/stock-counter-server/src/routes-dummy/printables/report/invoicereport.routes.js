"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoicesReportRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_counter_mocks_1 = require("../../../../../mocks/stock-counter-mocks");
/**
 * Express router for invoices report routes.
 */
exports.invoicesReportRoutesDummy = express_1.default.Router();
exports.invoicesReportRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.invoicesReportRoutesDummy.get('/getone/:urId/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockInvoiceReport)());
});
exports.invoicesReportRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockInvoiceReports)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.invoicesReportRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.invoicesReportRoutesDummy.post('/search/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockInvoiceReports)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.invoicesReportRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=invoicereport.routes.js.map