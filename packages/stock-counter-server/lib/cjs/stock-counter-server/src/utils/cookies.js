"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCompareListCookie = exports.makeWishListCookie = exports.makeRecentCookie = exports.makeCartCookie = exports.makeSettingsCookie = exports.makeTourerCookie = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const user_behavoiur_1 = require("./user-behavoiur");
const makeTourerCookie = (req, res, next) => {
    const tourer = req.body.tourer;
    stock_universal_server_1.mainLogger.info('Tourer cookie - tourer: ', tourer);
    res.cookie('tourer', tourer, {
        // maxAge: 5000,
        // expires works the same as the maxAge
        expires: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        secure: true,
        httpOnly: false,
        sameSite: 'none' // lax
    });
    return next();
};
exports.makeTourerCookie = makeTourerCookie;
const makeSettingsCookie = (req, res) => {
    const stnCookie = req.body.stnCookie;
    stock_universal_server_1.mainLogger.info('Setting cookie - stnCookie: ', stnCookie);
    if (!stnCookie.cartEnabled) {
        res.clearCookie('cart');
    }
    if (!stnCookie.recentEnabled) {
        res.clearCookie('recent');
    }
    res.cookie('settings', stnCookie, {
        // maxAge: 5000,
        // expires works the same as the maxAge
        expires: new Date(new Date().setMonth(new Date().getMonth() + 3)), // TODO have global setting for this
        secure: true,
        httpOnly: false,
        sameSite: 'none',
        signed: true
    });
    return res.status(200).send(stnCookie);
};
exports.makeSettingsCookie = makeSettingsCookie;
const makeCartCookie = async (req, res) => {
    const { cartItemId } = req.body;
    const { userId } = req.params;
    const stnCookie = req.signedCookies['settings'];
    await (0, user_behavoiur_1.registerCart)(cartItemId, stnCookie.userCookieId, userId);
    const cartCookie = req.body.cartCookie;
    stock_universal_server_1.mainLogger.info('Cart cookie - cartCookie: ', cartCookie);
    res.cookie('cart', cartCookie, {
        // maxAge: 5000,
        // expires works the same as the maxAge
        expires: new Date(new Date().setMonth(new Date().getMonth() + 2)),
        secure: true,
        httpOnly: false,
        sameSite: 'none',
        signed: true
    });
    return res.status(200).send({ success: true });
};
exports.makeCartCookie = makeCartCookie;
const makeRecentCookie = async (req, res) => {
    const recentCookie = req.body.recentCookie;
    const { userId } = req.params;
    const stnCookie = req.signedCookies['settings'];
    const recentItemId = req.body.recentItemId;
    await (0, user_behavoiur_1.registerRecents)(recentItemId, stnCookie.userCookieId, userId);
    stock_universal_server_1.mainLogger.info('Recent Cookie - recentCookie: ', recentCookie);
    res.cookie('recent', recentCookie, {
        // maxAge: 5000,
        // expires works the same as the maxAge
        expires: new Date(new Date().setMonth(new Date().getMonth() + 2)),
        secure: true,
        httpOnly: false,
        sameSite: 'none',
        signed: true
    });
    return res.status(200).send({ success: true });
};
exports.makeRecentCookie = makeRecentCookie;
const makeWishListCookie = async (req, res) => {
    const wishListCookie = req.body.wishListCookie;
    const { userId } = req.params;
    const stnCookie = req.signedCookies['settings'];
    const wishListItemId = req.body.wishListItemId;
    await (0, user_behavoiur_1.registerWishList)(wishListItemId, stnCookie.userCookieId, userId);
    stock_universal_server_1.mainLogger.info('WishListCookie Cookie - wishListCookie: ', wishListCookie);
    res.cookie('wishList', wishListCookie, {
        // maxAge: 5000,
        // expires works the same as the maxAge
        expires: new Date(new Date().setMonth(new Date().getMonth() + 2)),
        secure: true,
        httpOnly: false,
        sameSite: 'none',
        signed: true
    });
    return res.status(200).send({ success: true });
};
exports.makeWishListCookie = makeWishListCookie;
const makeCompareListCookie = async (req, res) => {
    const compareListCookie = req.body.compareListCookie;
    const { userId } = req.params;
    const stnCookie = req.signedCookies['settings'];
    const compareLisItemId = req.body.compareLisItemId;
    await (0, user_behavoiur_1.registerCompareList)(compareLisItemId, stnCookie.userCookieId, userId);
    stock_universal_server_1.mainLogger.info('CompareListCookie Cookie - compareListCookie: ', compareListCookie);
    res.cookie('compareList', compareListCookie, {
        // maxAge: 5000,
        // expires works the same as the maxAge
        expires: new Date(new Date().setMonth(new Date().getMonth() + 2)),
        secure: true,
        httpOnly: false,
        sameSite: 'none',
        signed: true
    });
    return res.status(200).send({ success: true });
};
exports.makeCompareListCookie = makeCompareListCookie;
//# sourceMappingURL=cookies.js.map