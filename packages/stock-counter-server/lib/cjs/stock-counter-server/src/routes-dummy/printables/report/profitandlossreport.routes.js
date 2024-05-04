"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profitAndLossReportRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_counter_mocks_1 = require("../../../../../mocks/stock-counter-mocks");
/**
 * Router for profit and loss report.
 */
exports.profitAndLossReportRoutesDummy = express_1.default.Router();
exports.profitAndLossReportRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.profitAndLossReportRoutesDummy.get('/getone/:urId/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockProfitAndLossReport)());
});
exports.profitAndLossReportRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockProfitAndLossReports)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.profitAndLossReportRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.profitAndLossReportRoutesDummy.post('/search/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockProfitAndLossReports)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.profitAndLossReportRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=profitandlossreport.routes.js.map