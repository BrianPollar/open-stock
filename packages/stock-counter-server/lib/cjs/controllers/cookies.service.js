"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRecentCookie = exports.makeCartCookie = exports.makeSettingsCookie = exports.makeTourerCookie = void 0;
const log4js_1 = require("log4js");
/** */
const cookieServiceLogger = (0, log4js_1.getLogger)('controllers/CookieService');
/** */
const makeTourerCookie = (req, res, next) => {
    const tourer = req.body.tourer;
    cookieServiceLogger.info('Tourer cookie - tourer: ', tourer);
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
/** */
const makeSettingsCookie = (req, res) => {
    const stnCookie = req.body.stnCookie;
    cookieServiceLogger.info('Setting cookie - stnCookie: ', stnCookie);
    if (!stnCookie.cartEnabled) {
        res.clearCookie('cart');
    }
    if (!stnCookie.recentEnabled) {
        res.clearCookie('recent');
    }
    res.cookie('settings', stnCookie, {
        // maxAge: 5000,
        // expires works the same as the maxAge
        expires: new Date(new Date().setMonth(new Date().getMonth() + 3)),
        secure: true,
        httpOnly: false,
        sameSite: 'none',
        signed: true
    });
    return res.status(200).send(stnCookie);
};
exports.makeSettingsCookie = makeSettingsCookie;
/** */
const makeCartCookie = (req, res) => {
    const cartCookie = req.body.cartCookie;
    cookieServiceLogger.info('Cart cookie - cartCookie: ', cartCookie);
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
/** */
const makeRecentCookie = (req, res) => {
    const recentCookie = req.body.recentCookie;
    cookieServiceLogger.info('Recent Cookie - recentCookie: ', recentCookie);
    // const keyObj = {};
    /** recentCookie.forEach(val => {
      keyObj[val] = val;
    });
    console.log('stringiFied', keyObj);
     **/
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
//# sourceMappingURL=cookies.service.js.map