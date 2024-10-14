"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifnRoutes = void 0;
const tslib_1 = require("tslib");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const mongoose_1 = require("mongoose");
const mainnotification_model_1 = require("../models/mainnotification.model");
const notifsetting_model_1 = require("../models/notifsetting.model");
const subscriptions_model_1 = require("../models/subscriptions.model");
const notifications_1 = require("../utils/notifications");
/**
 * Router for handling notification routes.
 */
exports.notifnRoutes = express_1.default.Router();
exports.notifnRoutes.get('/getmynotifn/:offset/:limit', stock_universal_server_1.requireAuth, async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { userId } = req.user;
    const { companyId } = req.user;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const all = await Promise.all([
        mainnotification_model_1.mainnotificationLean
            .find({ userId, active: true, viewed: { $nin: [userId] } })
            .skip(offset)
            .limit(limit)
            .lean()
            .sort({ createdAt: -1 }),
        mainnotification_model_1.mainnotificationLean.countDocuments({ userId, active: true, viewed: { $nin: [userId] } })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
});
exports.notifnRoutes.get('/getmyavailnotifn/:offset/:limit', stock_universal_server_1.requireAuth, async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const all = await Promise.all([
        mainnotification_model_1.mainnotificationLean
            .find({ active: true })
            .skip(offset)
            .limit(limit)
            .lean()
            .sort({ name: 'asc' }),
        mainnotification_model_1.mainnotificationLean.countDocuments({ active: true })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
});
exports.notifnRoutes.get('/one/:_id', stock_universal_server_1.requireAuth, async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { companyId } = req.user;
    const { _id } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id, companyId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const notifs = await mainnotification_model_1.mainnotificationLean
        .findOne({ _id })
        .lean()
        .sort({ name: 'asc' });
    if (!notifs) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    return res.status(200).send(notifs);
});
exports.notifnRoutes.delete('/delete/one/:_id', stock_universal_server_1.requireAuth, async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const _id = req.params._id;
    const { companyId } = req.user;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id, companyId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // const deleted = await mainnotificationMain.findOneAndRemove({ _id, });
    const updateRes = await mainnotification_model_1.mainnotificationMain
        .updateOne({ _id }, { $set: { isDeleted: true } })
        .catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    return res.status(200).send({ success: true });
});
exports.notifnRoutes.post('/subscription', stock_universal_server_1.requireAuth, async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { companyId } = req.user;
    const { userId, permissions } = req.user;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([companyId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const subscription = req.body;
    let sub = await subscriptions_model_1.subscriptionLean
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
        sub = new subscriptions_model_1.subscriptionMain(newSub);
    }
    const savedRes = await sub.save().catch((err) => err);
    if (savedRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedRes);
        return res.status(403).send(errResponse);
    }
    return res.status(200).send({ success: true });
});
exports.notifnRoutes.post('/updateviewed', stock_universal_server_1.requireAuth, async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const user = req.user;
    const { companyId } = req.user;
    const { _id } = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id, companyId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    await (0, notifications_1.updateNotifnViewed)(user, _id);
    return res.status(200).send({ success: true });
});
exports.notifnRoutes.get('/unviewedlength', stock_universal_server_1.requireAuth, async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { companyId } = req.user;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyId);
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
    const notifsCount = await mainnotification_model_1.mainnotificationLean
        .find({ viewed: { $nin: [userId] }, ...filter })
        .count();
    return res.status(200).send({ count: notifsCount });
});
exports.notifnRoutes.put('/clearall', stock_universal_server_1.requireAuth, async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { companyId, userId } = req.user;
    const notifis = await mainnotification_model_1.mainnotificationLean.find({
        userId, active: true, companyId
    });
    const promises = notifis.map(async (val) => {
        val.active = false;
        const savedRes = await val.save().catch((err) => err);
        if (savedRes instanceof mongoose_1.Error) {
            const error = (0, stock_universal_server_1.handleMongooseErr)(savedRes);
            return new Promise((resolve, reject) => reject(error));
        }
        else {
            return new Promise(resolve => resolve({ success: true }));
        }
    });
    const all = await Promise.all(promises).catch((err) => err);
    if (all instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(all);
        return res.status(403).send(errResponse);
    }
    return res.status(200).send({ success: true });
});
// settings
exports.notifnRoutes.post('/createstn', async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { stn } = req.body;
    const { companyId } = req.user;
    stn.companyId = companyId;
    const response = await (0, notifications_1.createNotifStn)(stn);
    return res.status(response.status || response.success ? 200 : 403).send({ success: response.success });
});
exports.notifnRoutes.put('/updatestn', async (req, res) => {
    const { stn } = req.body;
    const _id = stn?._id;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const notifStn = await notifsetting_model_1.notifSettingMain.findById(_id).lean();
    if (!notifStn) {
        return res.status(404).send({ success: false });
    }
    const savedRes = await notifsetting_model_1.notifSettingMain.updateOne({
        _id
    }, {
        $set: {
            invoices: stn.invoices || notifStn.invoices,
            payments: stn.payments || notifStn.payments,
            orders: stn.orders || notifStn.orders,
            jobCards: stn.jobCards || notifStn.jobCards,
            users: stn.users || notifStn.users
        }
    }).catch((err) => err);
    if (savedRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedRes);
        return res.status(403).send(errResponse);
    }
    return res.status(200).send({ success: true });
});
// settings
exports.notifnRoutes.post('/getstn', stock_universal_server_1.requireAuth, async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { companyId } = req.user;
    const stns = await notifsetting_model_1.notifSettingLean
        .find({ companyId })
        .lean();
    return res.status(200).send({ stns });
});
//# sourceMappingURL=notification.routes.js.map