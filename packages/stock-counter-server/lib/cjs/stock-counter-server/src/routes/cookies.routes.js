"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookiesRoutes = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/no-misused-promises */
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_1 = require("@open-stock/stock-universal");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const cookies_service_1 = require("../controllers/cookies.service");
const item_model_1 = require("../models/item.model");
/** Logger for the cookiesRoutes module */
const cookiesRoutesLogger = tracer.colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
        // eslint-disable-next-line no-console
        console.log(data.output);
        const logDir = path_1.default.join(process.cwd() + '/openstockLog/');
        fs.mkdir(logDir, { recursive: true }, (err) => {
            if (err) {
                if (err) {
                    // eslint-disable-next-line no-console
                    console.log('data.output err ', err);
                }
            }
        });
        fs.appendFile(logDir + '/counter-server.log', data.rawoutput + '\n', err => {
            if (err) {
                // eslint-disable-next-line no-console
                console.log('raw.output err ', err);
            }
        });
    }
});
/**
 * Express router for cookies routes.
 */
exports.cookiesRoutes = express_1.default.Router();
/**
 * GET request handler for retrieving settings cookie.
 * If the cookie does not exist, a default cookie is created and returned.
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
exports.cookiesRoutes.get('/getsettings/:userId', (req, res, next) => {
    let stnCookie = req.signedCookies['settings'];
    console.log('SIGNED COOKIES ', req.signedCookies);
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
    cookiesRoutesLogger.info('getsettings - stnCookie: ', stnCookie);
    return res.send(stnCookie);
}, cookies_service_1.makeSettingsCookie);
/**
 * PUT request handler for updating settings cookie.
 * The existing settings cookie is cleared and replaced with the new cookie.
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
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
    cookiesRoutesLogger.info('updatesettings - stnCookie: ', stnCookie);
    return next();
}, cookies_service_1.makeSettingsCookie);
/**
 * PUT request handler for adding an item to the cart cookie.
 * If the cart cookie does not exist, a new empty array is created.
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
exports.cookiesRoutes.put('/addcartitem/:userId', (req, res, next) => {
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
/**
 * PUT request handler for adding an item to the recent cookie.
 * If the recent cookie does not exist, a new empty array is created.
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
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
    cookiesRoutesLogger.info('addrecentitem - recentCookie: ', recentCookie);
    return next();
}, cookies_service_1.makeRecentCookie);
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
    cookiesRoutesLogger.info('addwishlistitem - wishListCookie: ', wishListCookie);
    return next();
}, cookies_service_1.makeWishListCookie);
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
    cookiesRoutesLogger.info('addcompareListitem - compareListCookie: ', compareListCookie);
    return next();
}, cookies_service_1.makeCompareListCookie);
/**
 * PUT request handler for deleting an item from the cart cookie.
 * If the cart cookie does not exist, a success response is returned.
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
exports.cookiesRoutes.put('/deletecartitem/:id', (req, res, next) => {
    const stnCookie = req.signedCookies['settings'];
    if (!stnCookie) {
        return res.status(401).send({ success: false, err: 'unauthourised' });
    }
    const cartItemId = req.params.id;
    let cartCookie = req.signedCookies.cart;
    if (!cartCookie) {
        return res.status(200).send({ success: true });
    }
    cartCookie = cartCookie.filter(c => c !== cartItemId);
    res.clearCookie('cart');
    req.body.cartCookie = cartCookie;
    cookiesRoutesLogger.info('deletecartitem - cartCookie', cartCookie);
    return next();
}, cookies_service_1.makeCartCookie);
exports.cookiesRoutes.put('/deletewishlistitem/:id', (req, res, next) => {
    const stnCookie = req.signedCookies['settings'];
    if (!stnCookie) {
        return res.status(401).send({ success: false, err: 'unauthourised' });
    }
    const wishListItemId = req.params.id;
    let wishListCookie = req.signedCookies.wishList;
    if (!wishListCookie) {
        return res.status(200).send({ success: true });
    }
    wishListCookie = wishListCookie.filter(c => c !== wishListItemId);
    res.clearCookie('wishList');
    req.body.wishListCookie = wishListCookie;
    cookiesRoutesLogger.info('deletewishlistitem - wishListCookie', wishListCookie);
    return next();
}, cookies_service_1.makeWishListCookie);
exports.cookiesRoutes.put('/deletecomparelistitem', (req, res, next) => {
    const stnCookie = req.signedCookies['settings'];
    if (!stnCookie) {
        return res.status(401).send({ success: false, err: 'unauthourised' });
    }
    const { compareLisItemIds } = req.body;
    let compareListCookie = req.signedCookies.compareList;
    if (!compareListCookie) {
        return res.status(200).send({ success: true });
    }
    compareListCookie = compareListCookie.filter(c => c !== compareLisItemIds);
    res.clearCookie('compareList');
    req.body.compareListCookie = compareListCookie;
    cookiesRoutesLogger.info('deletecomparelistitem - compareListCookie', compareListCookie);
    return next();
}, cookies_service_1.makeCompareListCookie);
/**
 * PUT request handler for clearing the cart cookie.
 * The cart cookie is cleared and a success response is returned.
 * @param req - Express request object
 * @param res - Express response object
 */
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
/**
 * GET request handler for appending items in the cart cookie to the response.
 * The cart cookie is verified and the corresponding items are retrieved from the database.
 * @param req - Express request object
 * @param res - Express response object
 */
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
        .find({ _id: { $in: modified } })
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .populate({ path: 'companyId', model: stock_auth_server_1.companyLean,
        populate: [{
                path: 'owner', model: stock_auth_server_1.userLean,
                populate: [{
                        path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                    }],
                transform: (doc) => ({ _id: doc._id, email: doc.email, phone: doc.phone, profilePic: doc.profilePic })
            }
        ],
        transform: (doc) => {
            if (doc.blocked) {
                return null;
            }
            else {
                return { _id: doc._id, displayName: doc.displayName, owner: doc.owner };
            }
        }
    })
        .lean();
    const newProds = items
        .filter(item => item.companyId)
        .map(p => ({
        item: p,
        totalCostwithNoShipping: cartCookie.find(m => m.cartItemId === p._id)?.totalCostwithNoShipping
    }));
    return res.status(200).send(newProds);
});
/**
 * GET request handler for appending items in the recent cookie to the response.
 * The recent cookie is verified and the corresponding items are retrieved from the database.
 * @param req - Express request object
 * @param res - Express response object
 */
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
        .find({ _id: { $in: recentCookie } })
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .populate({ path: 'companyId', model: stock_auth_server_1.companyLean,
        populate: [{
                path: 'owner', model: stock_auth_server_1.userLean,
                populate: [{
                        path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                    }],
                transform: (doc) => ({ _id: doc._id, email: doc.email, phone: doc.phone, profilePic: doc.profilePic })
            }
        ],
        transform: (doc) => {
            if (doc.blocked) {
                return null;
            }
            else {
                return { _id: doc._id, displayName: doc.displayName, owner: doc.owner };
            }
        }
    })
        .lean();
    return res.status(200).send(items.filter(item => item.companyId));
});
exports.cookiesRoutes.get('/appendtowishlist', async (req, res) => {
    const wishListCookie = req.signedCookies['wishList'];
    cookiesRoutesLogger.info('appendtowishlist - recentCookie: ', wishListCookie);
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
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .populate({ path: 'companyId', model: stock_auth_server_1.companyLean,
        populate: [{
                path: 'owner', model: stock_auth_server_1.userLean,
                populate: [{
                        path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                    }],
                transform: (doc) => ({ _id: doc._id, email: doc.email, phone: doc.phone, profilePic: doc.profilePic })
            }
        ],
        transform: (doc) => {
            if (doc.blocked) {
                return null;
            }
            else {
                return { _id: doc._id, displayName: doc.displayName, owner: doc.owner };
            }
        }
    })
        .lean();
    return res.status(200).send(items.filter(item => item.companyId));
});
exports.cookiesRoutes.get('/appendtocomparelist', async (req, res) => {
    const compareListCookie = req.signedCookies['compareList'];
    cookiesRoutesLogger.info('appendtocomparelist - recentCookie: ', compareListCookie);
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
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .populate({ path: 'companyId', model: stock_auth_server_1.companyLean,
        populate: [{
                path: 'owner', model: stock_auth_server_1.userLean,
                populate: [{
                        path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                    }],
                transform: (doc) => ({ _id: doc._id, email: doc.email, phone: doc.phone, profilePic: doc.profilePic })
            }
        ],
        transform: (doc) => {
            if (doc.blocked) {
                return null;
            }
            else {
                return { _id: doc._id, displayName: doc.displayName, owner: doc.owner };
            }
        }
    })
        .lean();
    return res.status(200).send(items.filter(item => item.companyId));
});
//# sourceMappingURL=cookies.routes.js.map