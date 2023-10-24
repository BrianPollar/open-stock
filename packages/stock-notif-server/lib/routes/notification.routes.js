/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { createNotifications, updateNotifnViewed } from '../controllers/notifications.controller';
import { mainnotificationLean, mainnotificationMain } from '../models/mainnotification.model';
import { subscriptionLean, subscriptionMain } from '../models/subscriptions.model';
import { notifSettingLean, notifSettingMain } from '../models/notifsetting.model';
import { requireAuth, stringifyMongooseErr, verifyObjectId } from '@open-stock/stock-universal-server';
/** */
export const notifnRoutes = express.Router();
notifnRoutes.post('/create', async (req, res) => {
    await createNotifications(req.body);
    return res.status(200).send({ success: true });
});
notifnRoutes.get('/getmynotifn', requireAuth, async (req, res) => {
    const { userId } = req.user;
    const notifs = await mainnotificationLean
        .find({ userId, active: true, viewed: { $nin: [userId] } })
        .lean()
        .sort({ name: 'asc' });
    return res.status(200).send(notifs);
});
notifnRoutes.get('/getmyavailnotifn', requireAuth, async (req, res) => {
    const notifs = await mainnotificationLean
        .find({ active: true })
        .lean()
        .sort({ name: 'asc' });
    return res.status(200).send(notifs);
});
notifnRoutes.get('/getone/:id', async (req, res) => {
    const { id } = req.params;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const notifs = await mainnotificationLean
        .findById(id)
        .lean()
        .sort({ name: 'asc' });
    return res.status(200).send(notifs);
});
notifnRoutes.delete('/deleteone/:id', async (req, res) => {
    const id = req.params.id;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await mainnotificationMain.findByIdAndRemove(id);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
notifnRoutes.post('/subscription', requireAuth, async (req, res) => {
    const { userId, permissions } = req.user;
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
        return errResponse;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    res.status(200).send({ success: true });
});
notifnRoutes.post('/updateviewed', requireAuth, async (req, res) => {
    const user = req.user;
    const { id } = req.body;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    await updateNotifnViewed(user, id);
    return res.status(200).send({ success: true });
});
notifnRoutes.get('/unviewedlength', requireAuth, async (req, res) => {
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
    const { userId } = req.user;
    const all = await mainnotificationLean.find({
        userId, active: true
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
            return new Promise(resolve => resolve({ success: true }));
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
    const notifMain = new notifSettingMain(stn);
    let errResponse;
    await notifMain.save().catch(err => {
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
notifnRoutes.put('/updatestn', async (req, res) => {
    const { stn } = req.body;
    const id = stn?._id;
    const isValid = verifyObjectId(id);
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
notifnRoutes.post('/getstn', async (req, res) => {
    const stns = await notifSettingLean
        .find({})
        .lean();
    return res.status(200).send({ stns });
});
//# sourceMappingURL=notification.routes.js.map