"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemOfferRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_counter_mocks_1 = require("../../../tests/stock-counter-mocks");
/**
 * Router for item offers.
 */
exports.itemOfferRoutesDummy = express_1.default.Router();
exports.itemOfferRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.itemOfferRoutesDummy.get('/getall/:type/:offset/:limit/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockItemOffers)(Number(req.params.limit)));
});
exports.itemOfferRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockItemOffer)());
});
exports.itemOfferRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.itemOfferRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=itemoffer.routes.js.map