"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffRoutesDummy = void 0;
const tslib_1 = require("tslib");
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
exports.staffRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockStaffs)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.staffRoutesDummy.get('/getbyrole/:offset/:limit/:role/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockStaffs)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.staffRoutesDummy.post('/search/:limit/:offset/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockStaffs)(Number(req.params.limit))
    };
    res.status(200).send(response);
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