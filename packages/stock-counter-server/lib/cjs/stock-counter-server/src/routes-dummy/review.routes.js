"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_counter_mocks_1 = require("../../../tests/stock-counter-mocks");
/**
 * Express router for review routes
 */
exports.reviewRoutesDummy = express_1.default.Router();
exports.reviewRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.reviewRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockReview)());
});
exports.reviewRoutesDummy.get('/getall/:id/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockReviews)(10));
});
exports.reviewRoutesDummy.delete('/deleteone/:id/:itemId/:rating/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=review.routes.js.map