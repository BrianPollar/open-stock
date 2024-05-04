"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_counter_mocks_1 = require("../../../../mocks/stock-counter-mocks");
/**
 * Router for handling customer-related routes.
 */
exports.customerRoutesDummy = express_1.default.Router();
exports.customerRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.customerRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockCustomer)());
});
exports.customerRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockCustomers)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.customerRoutesDummy.put('/update/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.customerRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.customerRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=customer.routes.js.map