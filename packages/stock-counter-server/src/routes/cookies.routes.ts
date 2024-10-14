/* eslint-disable @typescript-eslint/dot-notation */

import { populateCompany, populatePhotos } from '@open-stock/stock-auth-server';
import { IcustomRequest, makeRandomString } from '@open-stock/stock-universal';
import { mainLogger, verifyObjectId } from '@open-stock/stock-universal-server';
import express from 'express';
import { itemLean } from '../models/item.model';
import {
  makeCartCookie, makeCompareListCookie, makeRecentCookie, makeSettingsCookie, makeWishListCookie
} from '../utils/cookies';

/**
 * Express router for cookies routes.
 */
export const cookiesRoutes = express.Router();

cookiesRoutes.get('/getsettings/:userId', (req: IcustomRequest<never, any>, res, next) => {
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
  mainLogger.info('getsettings - stnCookie: ', stnCookie);

  return res.send(stnCookie);
}, makeSettingsCookie);

cookiesRoutes.put('/updatesettings/:userId', (req: IcustomRequest<never, { settings; stnCookie }>, res, next) => {
  res.clearCookie('settings');
  const stn = req.body.settings;
  const stnCookie = {
    cartEnabled: stn.cartEnabled,
    recentEnabled: stn.recentEnabled,
    wishListEnabled: stn.wishListEnabled,
    compareListEnabled: stn.compareListEnabled
  };

  req.body.stnCookie = stnCookie;
  mainLogger.info('updatesettings - stnCookie: ', stnCookie);

  return next();
}, makeSettingsCookie);

cookiesRoutes.put(
  '/addcartitem/:userId',
  (req: IcustomRequest<never, { cartItemId; totalCostwithNoShipping; cartCookie }>, res, next) => {
    const { cartItemId, totalCostwithNoShipping } = req.body;
    let cartCookie = req.signedCookies.cart;

    if (!cartCookie) {
      cartCookie = [];
    }
    cartCookie.push({ cartItemId, totalCostwithNoShipping });
    res.clearCookie('cart');
    req.body.cartCookie = cartCookie;
    mainLogger.info('addcartitem - cartCookie: ', cartCookie);

    return next();
  },
  makeCartCookie
);

cookiesRoutes.put('/addrecentitem/:userId', (req: IcustomRequest<never, { recentItemId; recentCookie }>, res, next) => {
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
  mainLogger.info('addrecentitem - recentCookie: ', recentCookie);

  return next();
}, makeRecentCookie);


cookiesRoutes.put(
  '/addwishlistitem/:userId',
  (req: IcustomRequest<never, { wishListItemId; wishListCookie }>, res, next) => {
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
    mainLogger.info('addwishlistitem - wishListCookie: ', wishListCookie);

    return next();
  },
  makeWishListCookie
);


cookiesRoutes.put(
  '/addcomparelistitems/:userId',
  (req: IcustomRequest<never, { compareLisItemId; compareListCookie }>, res, next) => {
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
    mainLogger.info('addcompareListitem - compareListCookie: ', compareListCookie);

    return next();
  },
  makeCompareListCookie
);

cookiesRoutes.put('/deletecartitem/:_id', (req: IcustomRequest<{ _id: string}, { cartCookie }>, res, next) => {
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
  mainLogger.info('deletecartitem - cartCookie', cartCookie);

  return next();
}, makeCartCookie);


cookiesRoutes.put('/deletewishlistitem/:_id', (req: IcustomRequest<{ _id: string}, { wishListCookie }>, res, next) => {
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
  mainLogger.info('deletewishlistitem - wishListCookie', wishListCookie);

  return next();
}, makeWishListCookie);

cookiesRoutes.put(
  '/deletecomparelistitem',
  (req: IcustomRequest<never, { compareLisItemId: string; compareListCookie}>, res, next) => {
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
    mainLogger.info('deletecomparelistitem - compareListCookie', compareListCookie);

    return next();
  },
  makeCompareListCookie
);

cookiesRoutes.put('/clearcart', (req: IcustomRequest<never, unknown>, res) => {
  res.clearCookie('cart');

  return res.status(200).send({ success: true });
});

cookiesRoutes.put('/clearwishlist', (req: IcustomRequest<never, unknown>, res) => {
  res.clearCookie('wishList');

  return res.status(200).send({ success: true });
});

cookiesRoutes.put('/clearcomparelist', (req: IcustomRequest<never, unknown>, res) => {
  res.clearCookie('compareList');

  return res.status(200).send({ success: true });
});

cookiesRoutes.get('/appendtocart', async(req: IcustomRequest<never, null>, res) => {
  const cartCookie: {cartItemId: string; totalCostwithNoShipping: number}[] = req.signedCookies.cart;

  mainLogger.info('appendtocart - cartCookie: ', cartCookie);
  const modified = cartCookie?.map(c => c.cartItemId);

  if (modified && modified.length > 0) {
    for (const _id of modified) {
      const isValid = verifyObjectId(_id);

      if (!isValid) {
        res.clearCookie('cart');

        return res.status(404).send({ success: false, err: 'not found' });
      }
    }
  } else {
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
      totalCostwithNoShipping: cartCookie.find(m=> m.cartItemId === p._id)?.totalCostwithNoShipping
    }));

  return res.status(200).send(newProds);
});

cookiesRoutes.get('/appendtorecent', async(req: IcustomRequest<never, null>, res) => {
  const recentCookie = req.signedCookies['recent'];

  mainLogger.info('appendtorecent - recentCookie: ', recentCookie);
  if (recentCookie && recentCookie.length > 0) {
    for (const id of recentCookie) {
      const isValid = verifyObjectId(id);

      if (!isValid) {
        res.clearCookie('recent');

        return res.status(404).send({ success: false, err: 'not found' });
      }
    }
  } else {
    return res.status(404).send({ success: false, err: 'not found' });
  }
  const items = await itemLean
    .find({ _id: { $in: recentCookie } })
    .populate([populatePhotos(), populateCompany()])
    .lean();

  return res.status(200).send(items.filter(item => item.companyId));
});


cookiesRoutes.get('/appendtowishlist', async(req: IcustomRequest<never, null>, res) => {
  const wishListCookie = req.signedCookies['wishList'];

  mainLogger.info('appendtowishlist - recentCookie: ', wishListCookie);
  if (wishListCookie && wishListCookie.length > 0) {
    for (const id of wishListCookie) {
      const isValid = verifyObjectId(id);

      if (!isValid) {
        res.clearCookie('wishList');

        return res.status(404).send({ success: false, err: 'not found' });
      }
    }
  } else {
    return res.status(404).send({ success: false, err: 'not found' });
  }
  const items = await itemLean
    .find({ _id: { $in: wishListCookie } })
    .populate([populatePhotos(), populateCompany()])
    .lean();

  return res.status(200).send(items.filter(item => item.companyId));
});

cookiesRoutes.get('/appendtocomparelist', async(req: IcustomRequest<never, null>, res) => {
  const compareListCookie = req.signedCookies['compareList'];

  mainLogger.info('appendtocomparelist - recentCookie: ', compareListCookie);
  if (compareListCookie && compareListCookie.length > 0) {
    for (const id of compareListCookie) {
      const isValid = verifyObjectId(id);

      if (!isValid) {
        res.clearCookie('wishList');

        return res.status(404).send({ success: false, err: 'not found' });
      }
    }
  } else {
    return res.status(404).send({ success: false, err: 'not found' });
  }
  const items = await itemLean
    .find({ _id: { $in: compareListCookie } })
    .populate([populatePhotos(), populateCompany()])
    .lean();

  return res.status(200).send(items.filter(item => item.companyId));
});
