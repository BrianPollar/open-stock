/**
 * @fileoverview This file contains the routes for notifications in the server.
 * It exports an express Router instance with the following routes:
 * - POST /create: creates a new notification.
 * - GET /getmynotifn: gets all notifications for the authenticated user that have not been viewed.
 * - GET /getmyavailnotifn: gets all available notifications for the authenticated user.
 * - GET /getone/:id: gets a single notification by id.
 * - DELETE /deleteone/:id: deletes a single notification by id.
 * - POST /subscription: creates or updates a subscription for the authenticated user.
 * - POST /updateviewed: updates the viewed status of a notification for the authenticated user.
 * - GET /unviewedlength: gets the count of unviewed notifications for the authenticated user.
 * - PUT /clearall: clears all notifications for the authenticated user.
 * - POST /createstn: creates a new notification setting.
 * @requires express
 * @requires ../controllers/notifications.controller
 * @requires ../models/mainnotification.model
 * @requires ../models/subscriptions.model
 * @requires ../models/notifsetting.model
 * @requires @open-stock/stock-universal
 * @requires @open-stock/stock-universal-server
 */
/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { updateNotifnViewed } from '../controllers/notifications.controller';
import { mainnotificationLean, mainnotificationMain } from '../models/mainnotification.model';
import { subscriptionLean, subscriptionMain } from '../models/subscriptions.model';
import { notifSettingLean, notifSettingMain } from '../models/notifsetting.model';
import { Icustomrequest, Isuccess } from '@open-stock/stock-universal';
import { requireAuth, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';


/**
 * Router for handling notification routes.
 */
export const notifnRoutes = express.Router();

// TODO for now, we are not using this route
/* notifnRoutes.post('/create', async(req, res) => {
  await createNotifications(req.body);
  return res.status(200).send({ success: true });
});*/

notifnRoutes.get('/getmynotifn/:companyIdParam', requireAuth, async(req, res) => {
  const { userId } = (req as unknown as Icustomrequest).user;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectId(queryId);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const notifs = await mainnotificationLean
    .find({ userId, active: true, viewed: { $nin: [userId] }, companyId: queryId })
    .lean()
    .sort({ name: 'asc' });
  return res.status(200).send(notifs);
});

notifnRoutes.get('/getmyavailnotifn/:companyIdParam', requireAuth, async(req, res) => {
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const notifs = await mainnotificationLean
    .find({ active: true, companyId: queryId })
    .lean()
    .sort({ name: 'asc' });
  return res.status(200).send(notifs);
});

notifnRoutes.get('/getone/:id/:companyIdParam', requireAuth, async(req, res) => {
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const { id } = req.params;
  const isValid = verifyObjectIds([id, queryId]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const notifs = await mainnotificationLean
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .findOne({ _id: id, companyId: queryId })
    .lean()
    .sort({ name: 'asc' });
  return res.status(200).send(notifs);
});

notifnRoutes.delete('/deleteone/:id/:companyIdParam', requireAuth, async(req, res) => {
  const id = req.params.id;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectIds([id, queryId]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const deleted = await mainnotificationMain.findOneAndRemove({ _id: id, companyId: queryId });
  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
});

notifnRoutes.post('/subscription/:companyIdParam', requireAuth, async(req, res) => {
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const { userId, permissions } = (req as Icustomrequest).user;
  const isValid = verifyObjectIds([queryId]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const subscription = req.body;
  let sub = await subscriptionLean
    .findOne({ userId, companyId: queryId });
  if (sub) {
    sub.subscription = subscription.subscription;
  } else {
    const newSub = {
      subscription,
      userId,
      orders: permissions.orders,
      payments: permissions.payments,
      users: permissions.users,
      items: permissions.items,
      faqs: permissions.faqs,
      buyer: permissions.buyer
    };
    sub = new subscriptionMain(newSub);
  }

  let errResponse: Isuccess;
  await sub.save().catch(err => {
    errResponse = {
      success: false,
      status: 403
    };
    if (err && err.errors) {
      errResponse.err = stringifyMongooseErr(err.errors);
    } else {
      errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`;
    }
    return errResponse;
  });

  if (errResponse) {
    return res.status(403).send(errResponse);
  }

  res.status(200).send({ success: true });
});

notifnRoutes.post('/updateviewed/:companyIdParam', requireAuth, async(req, res) => {
  const user = (req as Icustomrequest).user;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const { id } = req.body;
  const isValid = verifyObjectIds([id, queryId]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  await updateNotifnViewed(user, id); // TODO check if this is working
  return res.status(200).send({ success: true });
});

notifnRoutes.get('/unviewedlength/:companyIdParam', requireAuth, async(req, res) => {
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const { userId, permissions } = (req as Icustomrequest).user;
  let filter;
  if (permissions.users &&
    !permissions.orders &&
    !permissions.payments &&
    !permissions.items) {
    filter = { userId };
  } else {
    filter = {
      orders: permissions.orders,
      payments: permissions.payments,
      users: permissions.users,
      items: permissions.items
    };
  }
  const notifsCount = await mainnotificationLean
    .find({ companyId: queryId, viewed: { $nin: [userId] }, ...filter })
    .count();
  return res.status(200).send({ count: notifsCount });
});

notifnRoutes.put('/clearall/:companyIdParam', requireAuth, async(req, res) => {
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  // TODO  chck if this is working
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const { userId } = (req as Icustomrequest).user;

  const all = await mainnotificationLean.find({
    userId, active: true, companyId
  });
  const promises = all.map(async val => {
    val.active = false;
    let error;
    const saved = await val.save().catch(err => {
      error = err;
      return null;
    });
    if (error) {
      return new Promise((resolve, reject) => reject(error));
    } else {
      return new Promise(resolve => resolve({ success: true }));
    }
  });

  let errResponse: Isuccess;
  await Promise.all(promises).catch(() => {
    errResponse = {
      success: false,
      status: 403,
      err: 'could clear all notifications, try again in a while'
    };
  });

  if (errResponse) {
    return res.status(403).send(errResponse);
  }

  return res.status(200).send({ success: true });
});


// settings
notifnRoutes.post('/createstn/:companyIdParam', async(req, res) => {
  const { stn } = req.body;
  const { companyIdParam } = req.params;
  stn.companyId = companyIdParam;
  const notifMain = new notifSettingMain(stn);

  let errResponse: Isuccess;
  await notifMain.save().catch(err => {
    errResponse = {
      success: false,
      status: 403
    };
    if (err && err.errors) {
      errResponse.err = stringifyMongooseErr(err.errors);
    } else {
      errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`;
    }
    return errResponse;
  });

  if (errResponse) {
    return res.status(403).send(errResponse);
  }

  return res.status(200).send({ success: true });
});

notifnRoutes.put('/updatestn', async(req, res) => {
  const { stn } = req.body;
  const id = stn?._id;
  const isValid = verifyObjectIds([id]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const notifStn = await notifSettingMain.findById(id);
  if (!notifStn) {
    return res.status(404).send({ success: false });
  }
  notifStn['invoices'] = stn.invoices || notifStn['invoices'];
  notifStn['payments'] = stn.payments || notifStn['payments'];
  notifStn['orders'] = stn.orders || notifStn['orders'];
  notifStn['jobCards'] = stn.jobCards || notifStn['jobCards'];
  notifStn['users'] = stn.users || notifStn['users'];

  let errResponse: Isuccess;
  await notifStn.save().catch(err => {
    errResponse = {
      success: false,
      status: 403
    };
    if (err && err.errors) {
      errResponse.err = stringifyMongooseErr(err.errors);
    } else {
      errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`;
    }
    return errResponse;
  });

  if (errResponse) {
    return res.status(403).send(errResponse);
  }

  return res.status(200).send({ success: true });
});

// settings
notifnRoutes.post('/getstn', requireAuth, async(req, res) => {
  const { companyId } = (req as Icustomrequest).user;
  // const { companyIdParam } = req.params;
  // const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const stns = await notifSettingLean
    .find({ companyId })
    .lean();
  return res.status(200).send({ stns });
});

