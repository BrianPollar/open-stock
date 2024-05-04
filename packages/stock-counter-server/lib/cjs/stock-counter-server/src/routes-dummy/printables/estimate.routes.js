"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_counter_mocks_1 = require("../../../../mocks/stock-counter-mocks");
/** Router for estimate routes */
exports.estimateRoutesDummy = express_1.default.Router();
exports.estimateRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.estimateRoutesDummy.get('/getone/:estimateId/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockEstimate)());
});
exports.estimateRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockEstimates)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.estimateRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.estimateRoutesDummy.post('/search/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockEstimates)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.estimateRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=estimate.routes.js.map