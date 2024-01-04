"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.salesReportRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_counter_mocks_1 = require("../../../../../tests/stock-counter-mocks");
/**
 * Express router for sales report routes.
 */
exports.salesReportRoutesDummy = express_1.default.Router();
exports.salesReportRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.salesReportRoutesDummy.get('/getone/:urId/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockSalesReport)());
});
exports.salesReportRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockSalesReports)(Number(req.params.limit)));
});
exports.salesReportRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.salesReportRoutesDummy.post('/search/:limit/:offset/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockSalesReports)(Number(req.params.limit)));
});
exports.salesReportRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=salesreport.routes.js.map