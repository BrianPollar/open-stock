/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { makeCartCookie, makeRecentCookie, makeSettingsCookie } from '../controllers/cookies.service';
import { itemLean } from '../models/item.model';
import { getLogger } from 'log4js';
import { verifyObjectId } from '@open-stock/stock-universal-server';
/** Logger for the cookiesRoutes module */
const cookiesRoutesLogger = getLogger('routes/cookiesRoutes');
/** Express router for handling cookie-related requests */
export const cookiesRoutes = express.Router();
/**
 * GET request handler for retrieving settings cookie.
 * If the cookie does not exist, a default cookie is created and returned.
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
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
/**
 * PUT request handler for updating settings cookie.
 * The existing settings cookie is cleared and replaced with the new cookie.
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
cookiesRoutes.put('/updatesettings', (req, res, next) => {
    res.clearCookie('settings');
    const stnCookie = req.body.settings;
    req.body.stnCookie = stnCookie;
    cookiesRoutesLogger.info('updatesettings - stnCookie: ', stnCookie);
    return next();
}, makeSettingsCookie);
/**
 * PUT request handler for adding an item to the cart cookie.
 * If the cart cookie does not exist, a new empty array is created.
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
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
/**
 * PUT request handler for adding an item to the recent cookie.
 * If the recent cookie does not exist, a new empty array is created.
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
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
/**
 * PUT request handler for deleting an item from the cart cookie.
 * If the cart cookie does not exist, a success response is returned.
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
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
/**
 * PUT request handler for clearing the cart cookie.
 * The cart cookie is cleared and a success response is returned.
 * @param req - Express request object
 * @param res - Express response object
 */
cookiesRoutes.put('/clearcart', (req, res) => {
    res.clearCookie('cart');
    return res.status(200).send({ success: true });
});
/**
 * GET request handler for appending items in the cart cookie to the response.
 * The cart cookie is verified and the corresponding items are retrieved from the database.
 * @param req - Express request object
 * @param res - Express response object
 */
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
/**
 * GET request handler for appending items in the recent cookie to the response.
 * The recent cookie is verified and the corresponding items are retrieved from the database.
 * @param req - Express request object
 * @param res - Express response object
 */
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