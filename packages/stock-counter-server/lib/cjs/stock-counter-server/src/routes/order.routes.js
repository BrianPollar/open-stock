"use strict";
/* eslint-disable @typescript-eslint/no-misused-promises */
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const log4js_1 = require("log4js");
const payment_controller_1 = require("../controllers/payment.controller");
const item_model_1 = require("../models/item.model");
const order_model_1 = require("../models/order.model");
const paymentrelated_model_1 = require("../models/printables/paymentrelated/paymentrelated.model");
const receipt_model_1 = require("../models/printables/receipt.model");
const invoicerelated_model_1 = require("../models/printables/related/invoicerelated.model");
const paymentrelated_1 = require("./paymentrelated/paymentrelated");
const invoicerelated_1 = require("./printables/related/invoicerelated");
/** Logger for order routes */
const orderRoutesLogger = (0, log4js_1.getLogger)('routes/orderRoutes');
/**
 * Express router for handling order routes.
 */
exports.orderRoutes = express_1.default.Router();
/**
 * Route for creating an order
 * @name POST /makeorder
 * @function
 * @memberof module:routes/orderRoutes
 * @inner
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise} - Promise representing the result of the operation
 */
exports.orderRoutes.post('/makeorder/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { userId } = req.user;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { order, payment, bagainCred, paymentRelated, invoiceRelated } = req.body;
    order.companyId = queryId;
    payment.companyId = queryId;
    paymentRelated.companyId = queryId;
    invoiceRelated.companyId = queryId;
    const done = await (0, payment_controller_1.paymentMethodDelegator)(paymentRelated, invoiceRelated, order.paymentMethod, order, payment, userId, companyId, bagainCred);
    return res.status(done.status).send({ success: done.success, data: done });
});
exports.orderRoutes.post('/paysubscription/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    // const { userId } = (req as Icustomrequest).user;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { order, payment, bagainCred, paymentRelated, invoiceRelated } = req.body;
    order.companyId = queryId;
    payment.companyId = queryId;
    paymentRelated.companyId = queryId;
    invoiceRelated.companyId = queryId;
    const done = await (0, payment_controller_1.paymentMethodDelegator)(paymentRelated, invoiceRelated, order.paymentMethod, order, payment, companyId, companyId, bagainCred, 'subscription');
    return res.status(done.status).send({ success: done.success, data: done });
});
/**
 * Route for creating an order
 * @name POST /create
 * @function
 * @memberof module:routes/orderRoutes
 * @inner
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise} - Promise representing the result of the operation
 */
exports.orderRoutes.post('/create/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { order, paymentRelated, invoiceRelated } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    order.companyId = queryId;
    paymentRelated.companyId = queryId;
    invoiceRelated.companyId = queryId;
    const extraNotifDesc = 'Newly created order';
    const paymentRelatedRes = await (0, paymentrelated_1.relegatePaymentRelatedCreation)(paymentRelated, invoiceRelated, 'order', extraNotifDesc, queryId);
    orderRoutesLogger.debug('Order route - paymentRelatedRes', paymentRelatedRes);
    if (!paymentRelatedRes.success) {
        return res.status(paymentRelatedRes.status || 403).send(paymentRelatedRes);
    }
    order.paymentRelated = paymentRelatedRes.id;
    const invoiceRelatedRes = await (0, invoicerelated_1.relegateInvRelatedCreation)(invoiceRelated, companyId, extraNotifDesc, true);
    orderRoutesLogger.debug('Order route - invoiceRelatedRes', invoiceRelatedRes);
    if (!invoiceRelatedRes.success) {
        return res.status(invoiceRelatedRes.status || 403).send(invoiceRelatedRes);
    }
    order.invoiceRelated = invoiceRelatedRes.id;
    const newOrder = new order_model_1.orderMain(order);
    let errResponse;
    const saved = await newOrder.save()
        .catch(err => {
        orderRoutesLogger.error('create - err: ', err);
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
    return res.status(200).send({ success: Boolean(saved) });
});
/**
 * Route for updating an order
 * @name PUT /update
 * @function
 * @memberof module:routes/orderRoutes
 * @inner
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise} - Promise representing the result of the operation
 */
exports.orderRoutes.put('/update/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { updatedOrder, paymentRelated } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    updatedOrder.companyId = queryId;
    paymentRelated.companyId = queryId;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedOrder;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const order = await order_model_1.orderMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndUpdate({ _id, companyId: queryId });
    if (!order) {
        return res.status(404).send({ success: false });
    }
    order.deliveryDate = updatedOrder.deliveryDate || order.deliveryDate;
    await (0, paymentrelated_1.updatePaymentRelated)(paymentRelated, queryId);
    let errResponse;
    const updated = await order.save()
        .catch(err => {
        orderRoutesLogger.error('update - err: ', err);
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
    return res.status(200).send({ success: Boolean(updated) });
});
/**
 * Route for getting a single order
 * @name GET /getone/:id
 * @function
 * @memberof module:routes/orderRoutes
 * @inner
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise} - Promise representing the result of the operation
 */
exports.orderRoutes.get('/getone/:id/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const order = await order_model_1.orderLean
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOne({ _id: id, companyId: queryId })
        .lean()
        .populate({
        path: 'paymentRelated', model: paymentrelated_model_1.paymentRelatedLean
    })
        .populate({
        path: 'invoiceRelated', model: invoicerelated_model_1.invoiceRelatedLean,
        populate: [{
                path: 'billingUserId', model: stock_auth_server_1.userLean
            },
            {
                path: 'payments', model: receipt_model_1.receiptLean
            },
            {
                path: 'items.item', model: item_model_1.itemLean,
                populate: [{
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                    }]
            }]
    });
    let returned;
    if (order) {
        returned = (0, paymentrelated_1.makePaymentRelatedPdct)(order.paymentRelated, order.invoiceRelated, order.invoiceRelated
            .billingUserId, order);
    }
    return res.status(200).send(returned);
});
exports.orderRoutes.get('/getall/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('orders', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const all = await Promise.all([
        order_model_1.orderLean
            .find({ companyId: queryId })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate({ path: 'paymentRelated', model: paymentrelated_model_1.paymentRelatedLean })
            .populate({
            path: 'invoiceRelated', model: invoicerelated_model_1.invoiceRelatedLean,
            populate: [{
                    path: 'billingUserId', model: stock_auth_server_1.userLean
                },
                {
                    path: 'payments', model: receipt_model_1.receiptLean
                },
                {
                    path: 'items.item', model: item_model_1.itemLean,
                    populate: [{
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                        }]
                }]
        }),
        order_model_1.orderLean.countDocuments({ companyId: queryId })
    ]);
    const returned = all[0]
        .map(val => (0, paymentrelated_1.makePaymentRelatedPdct)(val.paymentRelated, val.invoiceRelated, val.invoiceRelated
        .billingUserId, val));
    const response = {
        count: all[1],
        data: returned
    };
    return res.status(200).send(response);
});
exports.orderRoutes.get('/getmyorders/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { userId } = req.user;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const orders = await order_model_1.orderLean
        .find({ user: userId, companyId: queryId })
        .lean()
        .populate({ path: 'paymentRelated', model: paymentrelated_model_1.paymentRelatedLean })
        .populate({
        path: 'invoiceRelated', model: invoicerelated_model_1.invoiceRelatedLean,
        populate: [{
                path: 'billingUserId', model: stock_auth_server_1.userLean
            },
            {
                path: 'payments', model: receipt_model_1.receiptLean
            },
            {
                path: 'items.item', model: item_model_1.itemLean,
                populate: [{
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                    }]
            }]
    });
    const returned = orders
        .map(val => (0, paymentrelated_1.makePaymentRelatedPdct)(val.paymentRelated, val.invoiceRelated, val.invoiceRelated
        .billingUserId, val));
    return res.status(200).send(returned);
});
exports.orderRoutes.put('/deleteone/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { id, paymentRelated, invoiceRelated, creationType, where } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await (0, paymentrelated_1.deleteAllPayOrderLinked)(paymentRelated, invoiceRelated, creationType, where, queryId);
    // await orderMain.findByIdAndDelete(id);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.orderRoutes.put('/appendDelivery/:orderId/:status/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('orders', 'update'), async (req, res) => {
    const { orderId } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(orderId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const order = await order_model_1.orderMain.findOneAndUpdate({ _id: orderId, companyId: queryId });
    if (!order) {
        return res.status(404).send({ success: false });
    }
    let errResponse;
    await order.save().catch(err => {
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
exports.orderRoutes.post('/search/:limit/:offset/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('orders', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const all = await Promise.all([
        order_model_1.orderLean
            .find({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
            .lean()
            .skip(offset)
            .limit(limit)
            .populate({ path: 'paymentRelated', model: item_model_1.itemLean,
            populate: [{
                    path: 'items', model: item_model_1.itemLean
                },
                {
                    path: 'user', select: stock_auth_server_1.userAboutSelect, model: stock_auth_server_1.userLean
                }]
        })
            .populate({
            path: 'invoiceRelated', model: invoicerelated_model_1.invoiceRelatedLean,
            populate: [{
                    path: 'billingUserId', model: stock_auth_server_1.userLean
                },
                {
                    path: 'payments', model: receipt_model_1.receiptLean
                },
                {
                    path: 'items.item', model: item_model_1.itemLean,
                    populate: [{
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                        }]
                }]
        }),
        order_model_1.orderLean.countDocuments({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
    ]);
    const returned = all[0]
        .map(val => (0, paymentrelated_1.makePaymentRelatedPdct)(val.paymentRelated, val.invoiceRelated, val.invoiceRelated
        .billingUserId, val));
    const response = {
        count: all[1],
        data: returned
    };
    return res.status(200).send(response);
});
exports.orderRoutes.put('/deletemany/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('orders', 'delete'), async (req, res) => {
    const { credentials } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    if (!credentials || credentials?.length < 1) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    /** await orderMain
      // eslint-disable-next-line @typescript-eslint/naming-convention
      .deleteMany({ _id: { $in: ids } });**/
    const promises = credentials
        .map(async (val) => {
        await (0, paymentrelated_1.deleteAllPayOrderLinked)(val.paymentRelated, val.invoiceRelated, val.creationType, val.where, queryId);
        return new Promise(resolve => resolve(true));
    });
    await Promise.all(promises);
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=order.routes.js.map