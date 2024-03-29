"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemDecoyRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_counter_mocks_1 = require("../../../tests/stock-counter-mocks");
/**
 * Router for item decoy routes.
 */
exports.itemDecoyRoutesDummy = express_1.default.Router();
exports.itemDecoyRoutesDummy.post('/create/:how/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.itemDecoyRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockItemDecoys)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.itemDecoyRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockItemDecoy)());
});
exports.itemDecoyRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.itemDecoyRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=itemdecoy.routes.js.map