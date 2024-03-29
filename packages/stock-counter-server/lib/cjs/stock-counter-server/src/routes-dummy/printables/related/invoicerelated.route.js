"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceRelateRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_counter_mocks_1 = require("../../../../../tests/stock-counter-mocks");
/**
 * Router for handling invoice related routes.
 */
exports.invoiceRelateRoutesDummy = express_1.default.Router();
exports.invoiceRelateRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockInvoiceRelated)());
});
exports.invoiceRelateRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockInvoiceRelateds)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.invoiceRelateRoutesDummy.post('/search/:offset/:limit/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockInvoiceRelateds)(Number(req.params.limit)));
});
exports.invoiceRelateRoutesDummy.put('/update/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=invoicerelated.route.js.map