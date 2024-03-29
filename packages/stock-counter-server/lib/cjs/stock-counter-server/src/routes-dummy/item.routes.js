"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_counter_mocks_1 = require("../../../tests/stock-counter-mocks");
/**
 * Express router for item routes.
 */
exports.itemRoutesDummy = express_1.default.Router();
exports.itemRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.itemRoutesDummy.put('/update/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.itemRoutesDummy.post('/updateimg/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.itemRoutesDummy.put('/like/:itemId/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.itemRoutesDummy.put('/unlike/:itemId/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.itemRoutesDummy.get('/getone/:urId/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockItem)());
});
exports.itemRoutesDummy.get('/filtergeneral/:prop/:val/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockItems)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.itemRoutesDummy.get('/filterrandom/:prop/:val/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockItems)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.itemRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockItems)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.itemRoutesDummy.get('/gettrending/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockItems)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
// newly posted
exports.itemRoutesDummy.get('/getnew/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockItems)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
// new not used
exports.itemRoutesDummy.get('/getbrandnew/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockItems)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
// new not used
exports.itemRoutesDummy.get('/getused/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockItems)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
// filterprice
exports.itemRoutesDummy.get('/filterprice/max/:priceFilterValue/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockItems)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.itemRoutesDummy.get('/filterprice/min/:priceFilterValue/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockItems)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.itemRoutesDummy.get('/filterprice/eq/:priceFilterMinValue/:priceFilterMaxValue/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockItems)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.itemRoutesDummy.get('/filterstars/:starVal/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockItems)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.itemRoutesDummy.get('/discount/:discountValue/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockItems)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.itemRoutesDummy.post('/getsponsored/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockSponsoreds)(10));
});
exports.itemRoutesDummy.get('/getoffered/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockItemOffers)(10));
});
exports.itemRoutesDummy.put('/addsponsored/:id/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.itemRoutesDummy.put('/updatesponsored/:id/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.itemRoutesDummy.delete('/deletesponsored/:id/:spnsdId/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.itemRoutesDummy.put('/deleteone/:id/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.itemRoutesDummy.put('/deleteimages/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.itemRoutesDummy.post('/search/:limit/:offset/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockItems)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.itemRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=item.routes.js.map