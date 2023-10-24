/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { makeCartCookie, makeRecentCookie, makeSettingsCookie } from '../controllers/cookies.service';
import { itemLean } from '../models/item.model';
import { getLogger } from 'log4js';
import { verifyObjectId } from '@open-stock/stock-universal-server';
/** */
const cookiesRoutesLogger = getLogger('routes/cookiesRoutes');
/** */
export const cookiesRoutes = express.Router();
cookiesRoutes.get('/getsettings', (req, res, next) => {
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
}, makeSettingsCookie);
cookiesRoutes.put('/updatesettings', (req, res, next) => {
    res.clearCookie('settings');
    const stnCookie = req.body.settings;
    req.body.stnCookie = stnCookie;
    cookiesRoutesLogger.info('updatesettings - stnCookie: ', stnCookie);
    return next();
}, makeSettingsCookie);
cookiesRoutes.put('/addcartitem', (req, res, next) => {
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
}, makeCartCookie);
cookiesRoutes.put('/addrecentitem', (req, res, next) => {
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
}, makeRecentCookie);
cookiesRoutes.put('/deletecartitem/:id', (req, res, next) => {
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
}, makeCartCookie);
cookiesRoutes.put('/clearcart', (req, res) => {
    res.clearCookie('cart');
    return res.status(200).send({ success: true });
});
cookiesRoutes.get('/appendtocart', async (req, res) => {
    const cartCookie = req.signedCookies.cart;
    cookiesRoutesLogger.info('appendtocart - cartCookie: ', cartCookie);
    const modified = cartCookie?.map(c => c.cartItemId);
    if (modified && modified.length > 0) {
        for (const id of modified) {
            const isValid = verifyObjectId(id);
            if (!isValid) {
                res.clearCookie('cart');
                return res.status(404).send({ success: false, err: 'not found' });
            }
        }
    }
    else {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const items = await itemLean
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({ _id: { $in: modified } })
        .lean();
    const newProds = items.map(p => ({
        item: p,
        totalCostwithNoShipping: cartCookie.find(m => m.cartItemId === p._id)?.totalCostwithNoShipping
    }));
    return res.status(200).send(newProds);
});
cookiesRoutes.get('/appendtorecent', async (req, res) => {
    const recentCookie = req.signedCookies['recent'];
    cookiesRoutesLogger.info('appendtorecent - recentCookie: ', recentCookie);
    if (recentCookie && recentCookie.length > 0) {
        for (const id of recentCookie) {
            const isValid = verifyObjectId(id);
            if (!isValid) {
                res.clearCookie('recent');
                return res.status(404).send({ success: false, err: 'not found' });
            }
        }
    }
    else {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const items = await itemLean
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({ _id: { $in: recentCookie } })
        .lean();
    return res.status(200).send(items);
});
//# sourceMappingURL=cookies.routes.js.map