"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionPackageRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_counter_mocks_1 = require("../../../../mocks/stock-counter-mocks");
exports.subscriptionPackageRoutesDummy = express_1.default.Router();
exports.subscriptionPackageRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    return res.status(200).send({ success: true, status: 200 });
});
exports.subscriptionPackageRoutesDummy.get('/getall', (req, res) => {
    const subscriptionPackages = (0, stock_counter_mocks_1.createMockSubscriptionPackages)(10);
    return res.status(200).send(subscriptionPackages);
});
exports.subscriptionPackageRoutesDummy.put('/deleteone/:id', (req, res) => {
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=subscription-package.routes.js.map