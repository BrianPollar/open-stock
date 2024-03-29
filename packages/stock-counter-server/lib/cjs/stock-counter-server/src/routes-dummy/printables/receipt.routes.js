"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiptRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_counter_mocks_1 = require("../../../../tests/stock-counter-mocks");
/**
 * Router for handling receipt routes.
 */
exports.receiptRoutesDummy = express_1.default.Router();
exports.receiptRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.receiptRoutesDummy.get('/getone/:urId/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockReceipt)());
});
exports.receiptRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockReceipts)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.receiptRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.receiptRoutesDummy.post('/search/:limit/:offset/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockReceipts)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.receiptRoutesDummy.put('/update/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.receiptRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=receipt.routes.js.map