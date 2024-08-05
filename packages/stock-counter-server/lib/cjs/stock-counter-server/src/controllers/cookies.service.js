"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCompareListCookie = exports.makeWishListCookie = exports.makeRecentCookie = exports.makeCartCookie = exports.makeSettingsCookie = exports.makeTourerCookie = void 0;
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const user_behavoiur_controller_1 = require("./user-behavoiur.controller");
/** Logger for the cookie service */
const cookieServiceLogger = tracer.colorConsole({
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
 * Creates a tourer cookie.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns The next middleware function.
 */
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
/**
 * Creates a settings cookie.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response object with a status of 200 and the stnCookie.
 */
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
        expires: new Date(new Date().setMonth(new Date().getMonth() + 3)), // TODO have global setting for this
        secure: true,
        httpOnly: false,
        sameSite: 'none',
        signed: true
    });
    return res.status(200).send(stnCookie);
};
exports.makeSettingsCookie = makeSettingsCookie;
/**
 * Creates a cart cookie.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response object with a status of 200 and a success message.
 */
const makeCartCookie = async (req, res) => {
    const { cartItemId } = req.body;
    const { userId } = req.params;
    const stnCookie = req.signedCookies['settings'];
    await (0, user_behavoiur_controller_1.registerCart)(cartItemId, stnCookie.userCookieId, userId);
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
/**
 * Creates a recent cookie.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response object with a status of 200 and a success message.
 */
const makeRecentCookie = async (req, res) => {
    const recentCookie = req.body.recentCookie;
    const { userId } = req.params;
    const stnCookie = req.signedCookies['settings'];
    const recentItemId = req.body.recentItemId;
    await (0, user_behavoiur_controller_1.registerRecents)(recentItemId, stnCookie.userCookieId, userId);
    cookieServiceLogger.info('Recent Cookie - recentCookie: ', recentCookie);
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
/**
 * Creates a recent cookie.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response object with a status of 200 and a success message.
 */
const makeWishListCookie = async (req, res) => {
    const wishListCookie = req.body.wishListCookie;
    const { userId } = req.params;
    const stnCookie = req.signedCookies['settings'];
    const wishListItemId = req.body.wishListItemId;
    await (0, user_behavoiur_controller_1.registerWishList)(wishListItemId, stnCookie.userCookieId, userId);
    cookieServiceLogger.info('WishListCookie Cookie - wishListCookie: ', wishListCookie);
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
/**
 * Creates a recent cookie.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response object with a status of 200 and a success message.
 */
const makeCompareListCookie = async (req, res) => {
    const compareListCookie = req.body.compareListCookie;
    const { userId } = req.params;
    const stnCookie = req.signedCookies['settings'];
    const compareLisItemId = req.body.compareLisItemId;
    await (0, user_behavoiur_controller_1.registerCompareList)(compareLisItemId, stnCookie.userCookieId, userId);
    cookieServiceLogger.info('CompareListCookie Cookie - compareListCookie: ', compareListCookie);
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
//# sourceMappingURL=cookies.service.js.map