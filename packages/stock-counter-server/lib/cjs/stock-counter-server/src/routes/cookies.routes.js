"use strict";
/* eslint-disable @typescript-eslint/dot-notation */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookiesRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_1 = require("@open-stock/stock-universal");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const item_model_1 = require("../models/item.model");
const cookies_1 = require("../utils/cookies");
/**
 * Express router for cookies routes.
 */
exports.cookiesRoutes = express_1.default.Router();
exports.cookiesRoutes.get('/getsettings/:userId', (req, res, next) => {
    let stnCookie = req.signedCookies['settings'];
    if (!stnCookie) {
        stnCookie = {
            cartEnabled: true,
            recentEnabled: true,
            wishListEnabled: true,
            compareListEnabled: true,
            userCookieId: (0, stock_universal_1.makeRandomString)(32, 'combined')
        };
        req.body.stnCookie = stnCookie;
        return next();
    }
    stock_universal_server_1.mainLogger.info('getsettings - stnCookie: ', stnCookie);
    return res.send(stnCookie);
}, cookies_1.makeSettingsCookie);
exports.cookiesRoutes.put('/updatesettings/:userId', (req, res, next) => {
    res.clearCookie('settings');
    const stn = req.body.settings;
    const stnCookie = {
        cartEnabled: stn.cartEnabled,
        recentEnabled: stn.recentEnabled,
        wishListEnabled: stn.wishListEnabled,
        compareListEnabled: stn.compareListEnabled
    };
    req.body.stnCookie = stnCookie;
    stock_universal_server_1.mainLogger.info('updatesettings - stnCookie: ', stnCookie);
    return next();
}, cookies_1.makeSettingsCookie);
exports.cookiesRoutes.put('/addcartitem/:userId', (req, res, next) => {
    const { cartItemId, totalCostwithNoShipping } = req.body;
    let cartCookie = req.signedCookies.cart;
    if (!cartCookie) {
        cartCookie = [];
    }
    cartCookie.push({ cartItemId, totalCostwithNoShipping });
    res.clearCookie('cart');
    req.body.cartCookie = cartCookie;
    stock_universal_server_1.mainLogger.info('addcartitem - cartCookie: ', cartCookie);
    return next();
}, cookies_1.makeCartCookie);
exports.cookiesRoutes.put('/addrecentitem/:userId', (req, res, next) => {
    const stnCookie = req.signedCookies['settings'];
    if (!stnCookie) {
        return res.status(401).send({ success: false, err: 'unauthourised' });
    }
    const recentItemId = req.body.recentItemId;
    let recentCookie = req.signedCookies.recent;
    if (!recentCookie) {
        recentCookie = [];
    }
    recentCookie.push(recentItemId);
    res.clearCookie('recent');
    req.body.recentCookie = recentCookie;
    stock_universal_server_1.mainLogger.info('addrecentitem - recentCookie: ', recentCookie);
    return next();
}, cookies_1.makeRecentCookie);
exports.cookiesRoutes.put('/addwishlistitem/:userId', (req, res, next) => {
    const stnCookie = req.signedCookies['settings'];
    if (!stnCookie) {
        return res.status(401).send({ success: false, err: 'unauthourised' });
    }
    const wishListItemId = req.body.wishListItemId;
    let wishListCookie = req.signedCookies.wishList;
    if (!wishListCookie) {
        wishListCookie = [];
    }
    wishListCookie.push(wishListItemId);
    res.clearCookie('wishList');
    req.body.wishListCookie = wishListCookie;
    stock_universal_server_1.mainLogger.info('addwishlistitem - wishListCookie: ', wishListCookie);
    return next();
}, cookies_1.makeWishListCookie);
exports.cookiesRoutes.put('/addcomparelistitems/:userId', (req, res, next) => {
    const stnCookie = req.signedCookies['settings'];
    if (!stnCookie) {
        return res.status(401).send({ success: false, err: 'unauthourised' });
    }
    const compareLisItemId = req.body.compareLisItemId;
    let compareListCookie = req.signedCookies.compareList;
    if (!compareListCookie) {
        compareListCookie = [];
    }
    compareListCookie.push(compareLisItemId);
    res.clearCookie('compareList');
    req.body.compareListCookie = compareListCookie;
    stock_universal_server_1.mainLogger.info('addcompareListitem - compareListCookie: ', compareListCookie);
    return next();
}, cookies_1.makeCompareListCookie);
exports.cookiesRoutes.put('/deletecartitem/:_id', (req, res, next) => {
    const stnCookie = req.signedCookies['settings'];
    if (!stnCookie) {
        return res.status(401).send({ success: false, err: 'unauthourised' });
    }
    const cartItemId = req.params._id;
    let cartCookie = req.signedCookies.cart;
    if (!cartCookie) {
        return res.status(200).send({ success: true });
    }
    cartCookie = cartCookie.filter(c => c !== cartItemId);
    res.clearCookie('cart');
    req.body.cartCookie = cartCookie;
    stock_universal_server_1.mainLogger.info('deletecartitem - cartCookie', cartCookie);
    return next();
}, cookies_1.makeCartCookie);
exports.cookiesRoutes.put('/deletewishlistitem/:_id', (req, res, next) => {
    const stnCookie = req.signedCookies['settings'];
    if (!stnCookie) {
        return res.status(401).send({ success: false, err: 'unauthourised' });
    }
    const wishListItemId = req.params._id;
    let wishListCookie = req.signedCookies.wishList;
    if (!wishListCookie) {
        return res.status(200).send({ success: true });
    }
    wishListCookie = wishListCookie.filter(c => c !== wishListItemId);
    res.clearCookie('wishList');
    req.body.wishListCookie = wishListCookie;
    stock_universal_server_1.mainLogger.info('deletewishlistitem - wishListCookie', wishListCookie);
    return next();
}, cookies_1.makeWishListCookie);
exports.cookiesRoutes.put('/deletecomparelistitem', (req, res, next) => {
    const stnCookie = req.signedCookies['settings'];
    if (!stnCookie) {
        return res.status(401).send({ success: false, err: 'unauthourised' });
    }
    const { compareLisItemId } = req.body;
    let compareListCookie = req.signedCookies.compareList;
    if (!compareListCookie) {
        return res.status(200).send({ success: true });
    }
    compareListCookie = compareListCookie.filter(c => c !== compareLisItemId);
    res.clearCookie('compareList');
    req.body.compareListCookie = compareListCookie;
    stock_universal_server_1.mainLogger.info('deletecomparelistitem - compareListCookie', compareListCookie);
    return next();
}, cookies_1.makeCompareListCookie);
exports.cookiesRoutes.put('/clearcart', (req, res) => {
    res.clearCookie('cart');
    return res.status(200).send({ success: true });
});
exports.cookiesRoutes.put('/clearwishlist', (req, res) => {
    res.clearCookie('wishList');
    return res.status(200).send({ success: true });
});
exports.cookiesRoutes.put('/clearcomparelist', (req, res) => {
    res.clearCookie('compareList');
    return res.status(200).send({ success: true });
});
exports.cookiesRoutes.get('/appendtocart', async (req, res) => {
    const cartCookie = req.signedCookies.cart;
    stock_universal_server_1.mainLogger.info('appendtocart - cartCookie: ', cartCookie);
    const modified = cartCookie?.map(c => c.cartItemId);
    if (modified && modified.length > 0) {
        for (const _id of modified) {
            const isValid = (0, stock_universal_server_1.verifyObjectId)(_id);
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
        .find({ _id: { $in: modified } })
        .populate([(0, stock_auth_server_1.populatePhotos)(), (0, stock_auth_server_1.populateCompany)()])
        .lean();
    const newProds = items
        .filter(item => item.companyId)
        .map(p => ({
        item: p,
        totalCostwithNoShipping: cartCookie.find(m => m.cartItemId === p._id)?.totalCostwithNoShipping
    }));
    return res.status(200).send(newProds);
});
exports.cookiesRoutes.get('/appendtorecent', async (req, res) => {
    const recentCookie = req.signedCookies['recent'];
    stock_universal_server_1.mainLogger.info('appendtorecent - recentCookie: ', recentCookie);
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
        .find({ _id: { $in: recentCookie } })
        .populate([(0, stock_auth_server_1.populatePhotos)(), (0, stock_auth_server_1.populateCompany)()])
        .lean();
    return res.status(200).send(items.filter(item => item.companyId));
});
exports.cookiesRoutes.get('/appendtowishlist', async (req, res) => {
    const wishListCookie = req.signedCookies['wishList'];
    stock_universal_server_1.mainLogger.info('appendtowishlist - recentCookie: ', wishListCookie);
    if (wishListCookie && wishListCookie.length > 0) {
        for (const id of wishListCookie) {
            const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
            if (!isValid) {
                res.clearCookie('wishList');
                return res.status(404).send({ success: false, err: 'not found' });
            }
        }
    }
    else {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const items = await item_model_1.itemLean
        .find({ _id: { $in: wishListCookie } })
        .populate([(0, stock_auth_server_1.populatePhotos)(), (0, stock_auth_server_1.populateCompany)()])
        .lean();
    return res.status(200).send(items.filter(item => item.companyId));
});
exports.cookiesRoutes.get('/appendtocomparelist', async (req, res) => {
    const compareListCookie = req.signedCookies['compareList'];
    stock_universal_server_1.mainLogger.info('appendtocomparelist - recentCookie: ', compareListCookie);
    if (compareListCookie && compareListCookie.length > 0) {
        for (const id of compareListCookie) {
            const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
            if (!isValid) {
                res.clearCookie('wishList');
                return res.status(404).send({ success: false, err: 'not found' });
            }
        }
    }
    else {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const items = await item_model_1.itemLean
        .find({ _id: { $in: compareListCookie } })
        .populate([(0, stock_auth_server_1.populatePhotos)(), (0, stock_auth_server_1.populateCompany)()])
        .lean();
    return res.status(200).send(items.filter(item => item.companyId));
});
//# sourceMappingURL=cookies.routes.js.map