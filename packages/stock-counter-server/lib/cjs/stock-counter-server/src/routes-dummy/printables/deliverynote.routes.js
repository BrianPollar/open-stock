"use strict";
/* eslint-disable @typescript-eslint/no-misused-promises */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deliveryNoteRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_counter_mocks_1 = require("../../../../tests/stock-counter-mocks");
/**
 * Express router for delivery note routes.
 */
exports.deliveryNoteRoutesDummy = express_1.default.Router();
exports.deliveryNoteRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.deliveryNoteRoutesDummy.get('/getone/:urId/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockDeliverynote)());
});
exports.deliveryNoteRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockDeliverynotes)(Number(req.params.limit)));
});
exports.deliveryNoteRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.deliveryNoteRoutesDummy.post('/search/:limit/:offset/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockDeliverynotes)(Number(req.params.limit)));
});
exports.deliveryNoteRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=deliverynote.routes.js.map