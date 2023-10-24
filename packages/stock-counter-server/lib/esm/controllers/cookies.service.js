import { getLogger } from 'log4js';
/** */
const cookieServiceLogger = getLogger('controllers/CookieService');
/** */
export const makeTourerCookie = (req, res, next) => {
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
/** */
export const makeSettingsCookie = (req, res) => {
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
/** */
export const makeCartCookie = (req, res) => {
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
/** */
export const makeRecentCookie = (req, res) => {
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
//# sourceMappingURL=cookies.service.js.map