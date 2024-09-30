import { IcustomRequest } from '@open-stock/stock-universal';
import { NextFunction, Response } from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { registerCart, registerCompareList, registerRecents, registerWishList } from './user-behavoiur';

/** Logger for the cookie service */
const cookieServiceLogger = tracer.colorConsole({
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

export const makeTourerCookie = (
  req: IcustomRequest<never, { tourer}>,
  res: Response,
  next: NextFunction
) => {
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

export const makeSettingsCookie = (
  req: IcustomRequest<never, { stnCookie}>,
  res: Response
) => {
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

export const makeCartCookie = async(
  req: IcustomRequest<never, { cartItemId; cartCookie}>,
  res: Response
) => {
  const { cartItemId } = req.body;
  const { userId } = req.params;
  const stnCookie = req.signedCookies['settings'];

  await registerCart(cartItemId, stnCookie.userCookieId, userId);
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

export const makeRecentCookie = async(
  req: IcustomRequest<never, { recentCookie; recentItemId}>,
  res: Response
) => {
  const recentCookie = req.body.recentCookie;
  const { userId } = req.params;
  const stnCookie = req.signedCookies['settings'];
  const recentItemId = req.body.recentItemId;

  await registerRecents(recentItemId, stnCookie.userCookieId, userId);
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

export const makeWishListCookie = async(
  req: IcustomRequest<never, { wishListCookie; wishListItemId}>,
  res: Response
) => {
  const wishListCookie = req.body.wishListCookie;
  const { userId } = req.params;
  const stnCookie = req.signedCookies['settings'];
  const wishListItemId = req.body.wishListItemId;

  await registerWishList(wishListItemId, stnCookie.userCookieId, userId);
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

export const makeCompareListCookie = async(
  req: IcustomRequest<never, { compareListCookie; compareLisItemId }>,
  res: Response
) => {
  const compareListCookie = req.body.compareListCookie;
  const { userId } = req.params;
  const stnCookie = req.signedCookies['settings'];
  const compareLisItemId = req.body.compareLisItemId;

  await registerCompareList(compareLisItemId, stnCookie.userCookieId, userId);
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
