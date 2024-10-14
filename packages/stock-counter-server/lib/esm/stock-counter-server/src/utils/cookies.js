import { mainLogger } from '@open-stock/stock-universal-server';
import { registerCart, registerCompareList, registerRecents, registerWishList } from './user-behavoiur';
export const makeTourerCookie = (req, res, next) => {
    const tourer = req.body.tourer;
    mainLogger.info('Tourer cookie - tourer: ', tourer);
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
export const makeSettingsCookie = (req, res) => {
    const stnCookie = req.body.stnCookie;
    mainLogger.info('Setting cookie - stnCookie: ', stnCookie);
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
export const makeCartCookie = async (req, res) => {
    const { cartItemId } = req.body;
    const { userId } = req.params;
    const stnCookie = req.signedCookies['settings'];
    await registerCart(cartItemId, stnCookie.userCookieId, userId);
    const cartCookie = req.body.cartCookie;
    mainLogger.info('Cart cookie - cartCookie: ', cartCookie);
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
export const makeRecentCookie = async (req, res) => {
    const recentCookie = req.body.recentCookie;
    const { userId } = req.params;
    const stnCookie = req.signedCookies['settings'];
    const recentItemId = req.body.recentItemId;
    await registerRecents(recentItemId, stnCookie.userCookieId, userId);
    mainLogger.info('Recent Cookie - recentCookie: ', recentCookie);
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
export const makeWishListCookie = async (req, res) => {
    const wishListCookie = req.body.wishListCookie;
    const { userId } = req.params;
    const stnCookie = req.signedCookies['settings'];
    const wishListItemId = req.body.wishListItemId;
    await registerWishList(wishListItemId, stnCookie.userCookieId, userId);
    mainLogger.info('WishListCookie Cookie - wishListCookie: ', wishListCookie);
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
export const makeCompareListCookie = async (req, res) => {
    const compareListCookie = req.body.compareListCookie;
    const { userId } = req.params;
    const stnCookie = req.signedCookies['settings'];
    const compareLisItemId = req.body.compareLisItemId;
    await registerCompareList(compareLisItemId, stnCookie.userCookieId, userId);
    mainLogger.info('CompareListCookie Cookie - compareListCookie: ', compareListCookie);
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
//# sourceMappingURL=cookies.js.map