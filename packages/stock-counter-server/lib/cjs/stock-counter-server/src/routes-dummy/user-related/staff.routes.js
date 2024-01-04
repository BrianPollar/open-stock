"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffRoutesDummy = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-misused-promises */
const express_1 = tslib_1.__importDefault(require("express"));
const stock_counter_mocks_1 = require("../../../../tests/stock-counter-mocks");
/**
 * Router for staff related routes.
 */
exports.staffRoutesDummy = express_1.default.Router();
exports.staffRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.staffRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockStaff)());
});
exports.staffRoutesDummy.get('/getbyrole/:offset/:limit/:role/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockStaffs)(Number(req.params.limit)));
});
exports.staffRoutesDummy.post('/search/:limit/:offset/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockStaffs)(Number(req.params.limit)));
});
exports.staffRoutesDummy.put('/update/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.staffRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.staffRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=staff.routes.js.map