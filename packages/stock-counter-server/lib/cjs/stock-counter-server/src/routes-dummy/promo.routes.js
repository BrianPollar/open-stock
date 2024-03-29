"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promocodeRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
/**
 * Router for handling promo code routes.
 */
exports.promocodeRoutesDummy = express_1.default.Router();
exports.promocodeRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.promocodeRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
    res.status(200).send({});
});
exports.promocodeRoutesDummy.get('/getonebycode/:code/:companyIdParam', (req, res) => {
    res.status(200).send({});
});
exports.promocodeRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: []
    };
    res.status(200).send(response);
});
exports.promocodeRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=promo.routes.js.map