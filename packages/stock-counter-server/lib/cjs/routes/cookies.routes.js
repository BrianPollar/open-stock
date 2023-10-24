"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookiesRoutes = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/no-misused-promises */
const express_1 = tslib_1.__importDefault(require("express"));
const cookies_service_1 = require("../controllers/cookies.service");
const item_model_1 = require("../models/item.model");
const log4js_1 = require("log4js");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
/** */
const cookiesRoutesLogger = (0, log4js_1.getLogger)('routes/cookiesRoutes');
/** */
exports.cookiesRoutes = express_1.default.Router();
exports.cookiesRoutes.get('/getsettings', (req, res, next) => {
    let stnCookie = req.signedCookies['settings'];
    if (!stnCookie) {
        stnCookie = {
            cartEnabled: true,
            recentEnabled: true
        };
        req.body.stnCookie = stnCookie;
        return next();
    }
    cookiesRoutesLogger.info('getsettings - stnCookie: ', stnCookie);
    return res.send(stnCookie);
}, cookies_service_1.makeSettingsCookie);
exports.cookiesRoutes.put('/updatesettings', (req, res, next) => {
    res.clearCookie('settings');
    const stnCookie = req.body.settings;
    req.body.stnCookie = stnCookie;
    cookiesRoutesLogger.info('updatesettings - stnCookie: ', stnCookie);
    return next();
}, cookies_service_1.makeSettingsCookie);
exports.cookiesRoutes.put('/addcartitem', (req, res, next) => {
    const { cartItemId, totalCostwithNoShipping } = req.body;
    let cartCookie = req.signedCookies.cart;
    if (!cartCookie) {
        cartCookie = [];
    }
    cartCookie.push({ cartItemId, totalCostwithNoShipping });
    res.clearCookie('cart');
    req.body.cartCookie = cartCookie;
    cookiesRoutesLogger.info('addcartitem - cartCookie: ', cartCookie);
    return next();
}, cookies_service_1.makeCartCookie);
exports.cookiesRoutes.put('/addrecentitem', (req, res, next) => {
    const recentItemId = req.body.recentItemId;
    let recentCookie = req.signedCookies.recent;
    if (!recentCookie) {
        recentCookie = [];
    }
    recentCookie.push(recentItemId);
    res.clearCookie('recent');
    req.body.recentCookie = recentCookie;
    cookiesRoutesLogger.info('addrecentitem - recentCookie: ', recentCookie);
    return next();
}, cookies_service_1.makeRecentCookie);
exports.cookiesRoutes.put('/deletecartitem/:id', (req, res, next) => {
    const cartItemId = req.params.id;
    let cartCookie = req.signedCookies.cart;
    if (!cartCookie) {
        return res.status(200).send({ success: true });
    }
    cartCookie = cartCookie.filter(c => c === cartItemId);
    res.clearCookie('cart');
    req.body.cartCookie = cartCookie;
    cookiesRoutesLogger.info('deletecartitem - cartCookie', cartCookie);
    return next();
}, cookies_service_1.makeCartCookie);
exports.cookiesRoutes.put('/clearcart', (req, res) => {
    res.clearCookie('cart');
    return res.status(200).send({ success: true });
});
exports.cookiesRoutes.get('/appendtocart', async (req, res) => {
    const cartCookie = req.signedCookies.cart;
    cookiesRoutesLogger.info('appendtocart - cartCookie: ', cartCookie);
    const modified = cartCookie?.map(c => c.cartItemId);
    if (modified && modified.length > 0) {
        for (const id of modified) {
            const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
            if (!isValid) {
                res.clearCookie('cart');
                return res.status(404).send({ success: false, err: 'not found' });
            }
        }
    }
    else {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const items = await item_model_1.itemLean
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({ _id: { $in: modified } })
        .lean();
    const newProds = items.map(p => ({
        item: p,
        totalCostwithNoShipping: cartCookie.find(m => m.cartItemId === p._id)?.totalCostwithNoShipping
    }));
    return res.status(200).send(newProds);
});
exports.cookiesRoutes.get('/appendtorecent', async (req, res) => {
    const recentCookie = req.signedCookies['recent'];
    cookiesRoutesLogger.info('appendtorecent - recentCookie: ', recentCookie);
    if (recentCookie && recentCookie.length > 0) {
        for (const id of recentCookie) {
            const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
            if (!isValid) {
                res.clearCookie('recent');
                return res.status(404).send({ success: false, err: 'not found' });
            }
        }
    }
    else {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const items = await item_model_1.itemLean
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({ _id: { $in: recentCookie } })
        .lean();
    return res.status(200).send(items);
});
//# sourceMappingURL=cookies.routes.js.map