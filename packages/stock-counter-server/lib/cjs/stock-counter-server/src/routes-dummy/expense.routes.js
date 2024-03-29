"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_counter_mocks_1 = require("../../../tests/stock-counter-mocks");
/**
 * Router for handling expense routes.
 */
exports.expenseRoutesDummy = express_1.default.Router();
exports.expenseRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.expenseRoutesDummy.put('/update/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.expenseRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockExpense)());
});
exports.expenseRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockExpenses)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.expenseRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.expenseRoutesDummy.post('/search/:limit/:offset/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockExpenses)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.expenseRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=expense.routes.js.map