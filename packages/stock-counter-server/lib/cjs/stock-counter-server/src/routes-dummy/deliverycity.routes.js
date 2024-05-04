"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deliverycityRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_counter_mocks_1 = require("../../../mocks/stock-counter-mocks");
/**
 * Express router for deliverycity routes
 */
exports.deliverycityRoutesDummy = express_1.default.Router();
exports.deliverycityRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.deliverycityRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockDeliveryCity)());
});
exports.deliverycityRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockDeliveryCitys)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.deliverycityRoutesDummy.put('/update/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.deliverycityRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.deliverycityRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=deliverycity.routes.js.map