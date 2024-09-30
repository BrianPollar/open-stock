/**
 * @fileoverview This file contains the routes for notifications in the server.
 * It exports an express Router instance with the following routes:
 * - POST /create: creates a new notification.
 * - GET /getmynotifn: gets all notifications for the authenticated user that have not been viewed.
 * - GET /getmyavailnotifn: gets all available notifications for the authenticated user.
 * - GET /one/:_id: gets a single notification by id.
 * - DELETE /delete/one/:_id: deletes a single notification by id.
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
import { offsetLimitRelegator, requireAuth, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import { mainnotificationLean, mainnotificationMain } from '../models/mainnotification.model';
import { notifSettingLean, notifSettingMain } from '../models/notifsetting.model';
import { subscriptionLean, subscriptionMain } from '../models/subscriptions.model';
import { createNotifStn, updateNotifnViewed } from '../utils/notifications';
/**
 * Router for handling notification routes.
 */
export const notifnRoutes = express.Router();
notifnRoutes.get('/getmynotifn/:offset/:limit', requireAuth, async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { userId } = req.user;
    const { companyId } = req.user;
    const isValid = verifyObjectId(companyId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const all = await Promise.all([
        mainnotificationLean
            .find({ userId, active: true, viewed: { $nin: [userId] } })
            .skip(offset)
            .limit(limit)
            .lean()
            .sort({ createdAt: -1 }),
        mainnotificationLean.countDocuments({ userId, active: true, viewed: { $nin: [userId] } })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
});
notifnRoutes.get('/getmyavailnotifn/:offset/:limit', requireAuth, async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const isValid = verifyObjectId(companyId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const all = await Promise.all([
        mainnotificationLean
            .find({ active: true })
            .skip(offset)
            .limit(limit)
            .lean()
            .sort({ name: 'asc' }),
        mainnotificationLean.countDocuments({ active: true })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
});
notifnRoutes.get('/one/:_id', requireAuth, async (req, res) => {
    const { companyId } = req.user;
    const { _id } = req.params;
    const isValid = verifyObjectIds([_id, companyId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const notifs = await mainnotificationLean
        .findOne({ _id })
        .lean()
        .sort({ name: 'asc' });
    if (!notifs) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    return res.status(200).send(notifs);
});
notifnRoutes.delete('/delete/one/:_id', requireAuth, async (req, res) => {
    const _id = req.params._id;
    const { companyId } = req.user;
    const isValid = verifyObjectIds([_id, companyId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // const deleted = await mainnotificationMain.findOneAndRemove({ _id, });
    const deleted = await mainnotificationMain
        .updateOne({ _id }, { $set: { isDeleted: true } });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
notifnRoutes.post('/subscription', requireAuth, async (req, res) => {
    const { companyId } = req.user;
    const { userId, permissions } = req.user;
    const isValid = verifyObjectIds([companyId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const subscription = req.body;
    let sub = await subscriptionLean
        .findOne({ userId });
    if (sub) {
        sub.subscription = subscription.subscription;
    }
    else {
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
    let errResponse;
    await sub.save().catch(err => {
        errResponse = {
            success: false,
            status: 403
        };
        if (err && err.errors) {
            errResponse.err = stringifyMongooseErr(err.errors);
        }
        else {
            errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`;
        }
        return err;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    return res.status(200).send({ success: true });
});
notifnRoutes.post('/updateviewed', requireAuth, async (req, res) => {
    const user = req.user;
    const { companyId } = req.user;
    const { _id } = req.body;
    const isValid = verifyObjectIds([_id, companyId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    await updateNotifnViewed(user, _id);
    return res.status(200).send({ success: true });
});
notifnRoutes.get('/unviewedlength', requireAuth, async (req, res) => {
    const { companyId } = req.user;
    const isValid = verifyObjectId(companyId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { userId, permissions } = req.user;
    let filter;
    if (permissions.users &&
        !permissions.orders &&
        !permissions.payments &&
        !permissions.items) {
        filter = { userId };
    }
    else {
        filter = {
            orders: permissions.orders,
            payments: permissions.payments,
            users: permissions.users,
            items: permissions.items
        };
    }
    const notifsCount = await mainnotificationLean
        .find({ viewed: { $nin: [userId] }, ...filter })
        .count();
    return res.status(200).send({ count: notifsCount });
});
notifnRoutes.put('/clearall', requireAuth, async (req, res) => {
    const { companyId } = req.user;
    //
    //
    const { userId } = req.user;
    const all = await mainnotificationLean.find({
        userId, active: true, companyId
    });
    const promises = all.map(async (val) => {
        val.active = false;
        let error;
        const saved = await val.save().catch(err => {
            error = err;
            return null;
        });
        if (error) {
            return new Promise((resolve, reject) => reject(error));
        }
        else {
            return new Promise(resolve => resolve({ success: Boolean(saved) }));
        }
    });
    let errResponse;
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
notifnRoutes.post('/createstn', async (req, res) => {
    const { stn } = req.body;
    const { companyId } = req.user;
    stn.companyId = companyId;
    const response = await createNotifStn(stn);
    return res.status(response.status).send({ success: response.success });
});
notifnRoutes.put('/updatestn', async (req, res) => {
    const { stn } = req.body;
    const _id = stn?._id;
    const isValid = verifyObjectIds([_id]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const notifStn = await notifSettingMain.findById(_id);
    if (!notifStn) {
        return res.status(404).send({ success: false });
    }
    notifStn['invoices'] = stn.invoices || notifStn['invoices'];
    notifStn['payments'] = stn.payments || notifStn['payments'];
    notifStn['orders'] = stn.orders || notifStn['orders'];
    notifStn['jobCards'] = stn.jobCards || notifStn['jobCards'];
    notifStn['users'] = stn.users || notifStn['users'];
    let errResponse;
    await notifStn.save().catch(err => {
        errResponse = {
            success: false,
            status: 403
        };
        if (err && err.errors) {
            errResponse.err = stringifyMongooseErr(err.errors);
        }
        else {
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
notifnRoutes.post('/getstn', requireAuth, async (req, res) => {
    const { companyId } = req.user;
    //
    //
    const stns = await notifSettingLean
        .find({ companyId })
        .lean();
    return res.status(200).send({ stns });
});
//# sourceMappingURL=notification.routes.js.map