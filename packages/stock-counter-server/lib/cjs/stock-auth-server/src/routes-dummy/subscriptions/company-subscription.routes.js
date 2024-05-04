"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companySubscriptionRoutesDummy = void 0;
const tslib_1 = require("tslib");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_counter_mocks_1 = require("../../../../mocks/stock-counter-mocks");
exports.companySubscriptionRoutesDummy = express_1.default.Router();
exports.companySubscriptionRoutesDummy.post('/subscribe/:companyIdParam', (req, res) => {
    return res.status(200).send({ success: true, status: 200 });
});
exports.companySubscriptionRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    const { offset } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const companySubscriptions = (0, stock_counter_mocks_1.createMockCompanySubscriptions)(offset);
    const response = {
        count: req.params.limit,
        data: companySubscriptions
    };
    return res.status(200).send(response);
});
exports.companySubscriptionRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=company-subscription.routes.js.map