"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickupLocationRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
/**
 * Express router for pickup location routes
 */
exports.pickupLocationRoutesDummy = express_1.default.Router();
exports.pickupLocationRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.pickupLocationRoutesDummy.put('/update/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.pickupLocationRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
    res.status(200).send({});
});
exports.pickupLocationRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: []
    };
    res.status(200).send(response);
});
exports.pickupLocationRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.pickupLocationRoutesDummy.post('/search/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: 0,
        data: []
    };
    res.status(200).send(response);
});
exports.pickupLocationRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=pickuplocation.routes.js.map