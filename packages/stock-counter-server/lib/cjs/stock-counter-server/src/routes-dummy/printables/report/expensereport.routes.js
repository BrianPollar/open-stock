"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseReportRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_counter_mocks_1 = require("../../../../../mocks/stock-counter-mocks");
/**
 * Expense report routes.
 */
exports.expenseReportRoutesDummy = express_1.default.Router();
exports.expenseReportRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.expenseReportRoutesDummy.get('/getone/:urId/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockExpenseReport)());
});
exports.expenseReportRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockExpenseReports)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.expenseReportRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
    return res.status(200).send({ success: true });
});
exports.expenseReportRoutesDummy.post('/search/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockExpenseReports)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.expenseReportRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=expensereport.routes.js.map