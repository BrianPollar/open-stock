"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_counter_mocks_1 = require("../../../mocks/stock-counter-mocks");
/**
 * Express router for handling order routes.
 */
exports.orderRoutesDummy = express_1.default.Router();
exports.orderRoutesDummy.post('/makeorder/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.orderRoutesDummy.post('/paysubscription/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.orderRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.orderRoutesDummy.put('/update/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.orderRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockOrder)());
});
exports.orderRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockOrders)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.orderRoutesDummy.get('/getmyorders/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockOrders)(10)
    };
    res.status(200).send(response);
});
exports.orderRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.orderRoutesDummy.put('/appendDelivery/:orderId/:status/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.orderRoutesDummy.post('/search/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockOrders)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.orderRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=order.routes.js.map