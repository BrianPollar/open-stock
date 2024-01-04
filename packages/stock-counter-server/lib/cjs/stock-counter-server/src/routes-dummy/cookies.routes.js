"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookiesRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
/**
 * Express router for cookies routes.
 */
exports.cookiesRoutesDummy = express_1.default.Router();
exports.cookiesRoutesDummy.get('/getsettings', (req, res) => {
    res.status(200).send({ success: true });
});
exports.cookiesRoutesDummy.put('/updatesettings', (req, res) => {
    res.status(200).send({ success: true });
});
exports.cookiesRoutesDummy.put('/addcartitem', (req, res) => {
    res.status(200).send({ success: true });
});
exports.cookiesRoutesDummy.put('/addrecentitem', (req, res) => {
    res.status(200).send({ success: true });
});
exports.cookiesRoutesDummy.put('/deletecartitem/:id', (req, res) => {
    res.status(200).send({ success: true });
});
exports.cookiesRoutesDummy.put('/clearcart', (req, res) => {
    res.status(200).send({ success: true });
});
exports.cookiesRoutesDummy.get('/appendtocart', (req, res) => {
    res.status(200).send([]);
});
exports.cookiesRoutesDummy.get('/appendtorecent', (req, res) => {
    res.status(200).send([]);
});
//# sourceMappingURL=cookies.routes.js.map