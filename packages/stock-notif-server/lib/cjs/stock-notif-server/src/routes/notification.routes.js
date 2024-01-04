"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifnRoutes = void 0;
const tslib_1 = require("tslib");
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
const express_1 = tslib_1.__importDefault(require("express"));
const notifications_controller_1 = require("../controllers/notifications.controller");
const mainnotification_model_1 = require("../models/mainnotification.model");
const subscriptions_model_1 = require("../models/subscriptions.model");
const notifsetting_model_1 = require("../models/notifsetting.model");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
/**
 * Router for handling notification routes.
 */
exports.notifnRoutes = express_1.default.Router();
// TODO for now, we are not using this route
/* notifnRoutes.post('/create', async(req, res) => {
  await createNotifications(req.body);
  return res.status(200).send({ success: true });
});*/
exports.notifnRoutes.get('/getmynotifn/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { userId } = req.user;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const notifs = await mainnotification_model_1.mainnotificationLean
        .find({ userId, active: true, viewed: { $nin: [userId] }, companyId: queryId })
        .lean()
        .sort({ name: 'asc' });
    return res.status(200).send(notifs);
});
exports.notifnRoutes.get('/getmyavailnotifn/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const notifs = await mainnotification_model_1.mainnotificationLean
        .find({ active: true, companyId: queryId })
        .lean()
        .sort({ name: 'asc' });
    return res.status(200).send(notifs);
});
exports.notifnRoutes.get('/getone/:id/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const { id } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const notifs = await mainnotification_model_1.mainnotificationLean
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOne({ _id: id, companyId: queryId })
        .lean()
        .sort({ name: 'asc' });
    return res.status(200).send(notifs);
});
exports.notifnRoutes.delete('/deleteone/:id/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const id = req.params.id;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const deleted = await mainnotification_model_1.mainnotificationMain.findOneAndRemove({ _id: id, companyId: queryId });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.notifnRoutes.post('/subscription/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const { userId, permissions } = req.user;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const subscription = req.body;
    let sub = await subscriptions_model_1.subscriptionLean
        .findOne({ userId, companyId: queryId });
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
        sub = new subscriptions_model_1.subscriptionMain(newSub);
    }
    let errResponse;
    await sub.save().catch(err => {
        errResponse = {
            success: false,
            status: 403
        };
        if (err && err.errors) {
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
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
exports.notifnRoutes.post('/updateviewed/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const user = req.user;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const { id } = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    await (0, notifications_controller_1.updateNotifnViewed)(user, id); // TODO check if this is working
    return res.status(200).send({ success: true });
});
exports.notifnRoutes.get('/unviewedlength/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
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
    const notifsCount = await mainnotification_model_1.mainnotificationLean
        .find({ companyId: queryId, viewed: { $nin: [userId] }, ...filter })
        .count();
    return res.status(200).send({ count: notifsCount });
});
exports.notifnRoutes.put('/clearall/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    // TODO  chck if this is working
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const { userId } = req.user;
    const all = await mainnotification_model_1.mainnotificationLean.find({
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
exports.notifnRoutes.post('/createstn/:companyIdParam', async (req, res) => {
    const { stn } = req.body;
    const { companyIdParam } = req.params;
    stn.companyId = companyIdParam;
    const notifMain = new notifsetting_model_1.notifSettingMain(stn);
    let errResponse;
    await notifMain.save().catch(err => {
        errResponse = {
            success: false,
            status: 403
        };
        if (err && err.errors) {
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
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
exports.notifnRoutes.put('/updatestn', async (req, res) => {
    const { stn } = req.body;
    const id = stn?._id;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const notifStn = await notifsetting_model_1.notifSettingMain.findById(id);
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
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
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
exports.notifnRoutes.post('/getstn', stock_universal_server_1.requireAuth, async (req, res) => {
    const { companyId } = req.user;
    // const { companyIdParam } = req.params;
    // const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const stns = await notifsetting_model_1.notifSettingLean
        .find({ companyId })
        .lean();
    return res.status(200).send({ stns });
});
//# sourceMappingURL=notification.routes.js.map