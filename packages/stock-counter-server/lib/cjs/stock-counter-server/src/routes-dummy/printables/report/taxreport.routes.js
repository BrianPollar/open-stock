"use strict";
/* eslint-disable @typescript-eslint/no-misused-promises */
Object.defineProperty(exports, "__esModule", { value: true });
exports.taxReportRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_counter_mocks_1 = require("../../../../../tests/stock-counter-mocks");
/**
 * Router for tax report routes.
 */
exports.taxReportRoutesDummy = express_1.default.Router();
exports.taxReportRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.taxReportRoutesDummy.get('/getone/:urId/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockTaxReport)());
});
exports.taxReportRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockTaxReports)(Number(req.params.limit)));
});
exports.taxReportRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.taxReportRoutesDummy.post('/search/:limit/:offset/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockTaxReports)(Number(req.params.limit)));
});
exports.taxReportRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=taxreport.routes.js.map