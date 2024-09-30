/* eslint-disable @typescript-eslint/dot-notation */
import { populateCompany, populatePhotos } from '@open-stock/stock-auth-server';
import { makeRandomString } from '@open-stock/stock-universal';
import { verifyObjectId } from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { itemLean } from '../models/item.model';
import { makeCartCookie, makeCompareListCookie, makeRecentCookie, makeSettingsCookie, makeWishListCookie } from '../utils/cookies';
/** Logger for the cookiesRoutes module */
const cookiesRoutesLogger = tracer.colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
        // eslint-disable-next-line no-console
        console.log(data.output);
        const logDir = path.join(process.cwd() + '/openstockLog/');
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
export const cookiesRoutes = express.Router();
cookiesRoutes.get('/getsettings/:userId', (req, res, next) => {
    let stnCookie = req.signedCookies['settings'];
    if (!stnCookie) {
        stnCookie = {
            cartEnabled: true,
            recentEnabled: true,
            wishListEnabled: true,
            compareListEnabled: true,
            userCookieId: makeRandomString(32, 'combined')
        };
        req.body.stnCookie = stnCookie;
        return next();
    }
    cookiesRoutesLogger.info('getsettings - stnCookie: ', stnCookie);
    return res.send(stnCookie);
}, makeSettingsCookie);
cookiesRoutes.put('/updatesettings/:userId', (req, res, next) => {
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
}, makeSettingsCookie);
cookiesRoutes.put('/addcartitem/:userId', (req, res, next) => {
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
cookiesRoutes.put('/addrecentitem/:userId', (req, res, next) => {
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
}, makeRecentCookie);
cookiesRoutes.put('/addwishlistitem/:userId', (req, res, next) => {
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
}, makeWishListCookie);
cookiesRoutes.put('/addcomparelistitems/:userId', (req, res, next) => {
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
}, makeCompareListCookie);
cookiesRoutes.put('/deletecartitem/:_id', (req, res, next) => {
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
    cookiesRoutesLogger.info('deletecartitem - cartCookie', cartCookie);
    return next();
}, makeCartCookie);
cookiesRoutes.put('/deletewishlistitem/:_id', (req, res, next) => {
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
    cookiesRoutesLogger.info('deletewishlistitem - wishListCookie', wishListCookie);
    return next();
}, makeWishListCookie);
cookiesRoutes.put('/deletecomparelistitem', (req, res, next) => {
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
    cookiesRoutesLogger.info('deletecomparelistitem - compareListCookie', compareListCookie);
    return next();
}, makeCompareListCookie);
cookiesRoutes.put('/clearcart', (req, res) => {
    res.clearCookie('cart');
    return res.status(200).send({ success: true });
});
cookiesRoutes.put('/clearwishlist', (req, res) => {
    res.clearCookie('wishList');
    return res.status(200).send({ success: true });
});
cookiesRoutes.put('/clearcomparelist', (req, res) => {
    res.clearCookie('compareList');
    return res.status(200).send({ success: true });
});
cookiesRoutes.get('/appendtocart', async (req, res) => {
    const cartCookie = req.signedCookies.cart;
    cookiesRoutesLogger.info('appendtocart - cartCookie: ', cartCookie);
    const modified = cartCookie?.map(c => c.cartItemId);
    if (modified && modified.length > 0) {
        for (const _id of modified) {
            const isValid = verifyObjectId(_id);
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
        .find({ _id: { $in: modified } })
        .populate([populatePhotos(), populateCompany()])
        .lean();
    const newProds = items
        .filter(item => item.companyId)
        .map(p => ({
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
        .find({ _id: { $in: recentCookie } })
        .populate([populatePhotos(), populateCompany()])
        .lean();
    return res.status(200).send(items.filter(item => item.companyId));
});
cookiesRoutes.get('/appendtowishlist', async (req, res) => {
    const wishListCookie = req.signedCookies['wishList'];
    cookiesRoutesLogger.info('appendtowishlist - recentCookie: ', wishListCookie);
    if (wishListCookie && wishListCookie.length > 0) {
        for (const id of wishListCookie) {
            const isValid = verifyObjectId(id);
            if (!isValid) {
                res.clearCookie('wishList');
                return res.status(404).send({ success: false, err: 'not found' });
            }
        }
    }
    else {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const items = await itemLean
        .find({ _id: { $in: wishListCookie } })
        .populate([populatePhotos(), populateCompany()])
        .lean();
    return res.status(200).send(items.filter(item => item.companyId));
});
cookiesRoutes.get('/appendtocomparelist', async (req, res) => {
    const compareListCookie = req.signedCookies['compareList'];
    cookiesRoutesLogger.info('appendtocomparelist - recentCookie: ', compareListCookie);
    if (compareListCookie && compareListCookie.length > 0) {
        for (const id of compareListCookie) {
            const isValid = verifyObjectId(id);
            if (!isValid) {
                res.clearCookie('wishList');
                return res.status(404).send({ success: false, err: 'not found' });
            }
        }
    }
    else {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const items = await itemLean
        .find({ _id: { $in: compareListCookie } })
        .populate([populatePhotos(), populateCompany()])
        .lean();
    return res.status(200).send(items.filter(item => item.companyId));
});
//# sourceMappingURL=cookies.routes.js.map