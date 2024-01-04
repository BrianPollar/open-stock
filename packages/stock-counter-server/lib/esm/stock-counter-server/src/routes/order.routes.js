/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { paymentMethodDelegator } from '../controllers/payment.controller';
import { orderLean, orderMain } from '../models/order.model';
import { paymentRelatedLean } from '../models/printables/paymentrelated/paymentrelated.model';
import { invoiceRelatedLean } from '../models/printables/related/invoicerelated.model';
import { itemLean } from '../models/item.model';
import { deleteAllPayOrderLinked, makePaymentRelatedPdct, relegatePaymentRelatedCreation, updatePaymentRelated } from './paymentrelated/paymentrelated';
import { getLogger } from 'log4js';
import { relegateInvRelatedCreation } from './printables/related/invoicerelated';
import { fileMetaLean, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import { userAboutSelect, userLean } from '@open-stock/stock-auth-server';
import { receiptLean } from '../models/printables/receipt.model';
/** Logger for order routes */
const orderRoutesLogger = getLogger('routes/orderRoutes');
/**
 * Express router for handling order routes.
 */
export const orderRoutes = express.Router();
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
orderRoutes.post('/makeorder/:companyIdParam', requireAuth, async (req, res) => {
    const { userId } = req.user;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectId(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { order, payment, bagainCred, paymentRelated, invoiceRelated } = req.body;
    order.companyId = queryId;
    payment.companyId = queryId;
    paymentRelated.companyId = queryId;
    invoiceRelated.companyId = queryId;
    const done = await paymentMethodDelegator(paymentRelated, invoiceRelated, order.paymentMethod, order, payment, userId, companyId, bagainCred);
    return res.status(done.status).send({ success: done.success, data: done });
});
orderRoutes.post('/paysubscription/:companyIdParam', requireAuth, async (req, res) => {
    // const { userId } = (req as Icustomrequest).user;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectId(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { order, payment, bagainCred, paymentRelated, invoiceRelated } = req.body;
    order.companyId = queryId;
    payment.companyId = queryId;
    paymentRelated.companyId = queryId;
    invoiceRelated.companyId = queryId;
    const done = await paymentMethodDelegator(paymentRelated, invoiceRelated, order.paymentMethod, order, payment, companyId, companyId, bagainCred, 'subscription');
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
orderRoutes.post('/create/:companyIdParam', requireAuth, async (req, res) => {
    const { order, paymentRelated, invoiceRelated } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectId(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    order.companyId = queryId;
    paymentRelated.companyId = queryId;
    invoiceRelated.companyId = queryId;
    const extraNotifDesc = 'Newly created order';
    const paymentRelatedRes = await relegatePaymentRelatedCreation(paymentRelated, invoiceRelated, 'order', extraNotifDesc, queryId);
    orderRoutesLogger.debug('Order route - paymentRelatedRes', paymentRelatedRes);
    if (!paymentRelatedRes.success) {
        return res.status(paymentRelatedRes.status || 403).send(paymentRelatedRes);
    }
    order.paymentRelated = paymentRelatedRes.id;
    const invoiceRelatedRes = await relegateInvRelatedCreation(invoiceRelated, companyId, extraNotifDesc, true);
    orderRoutesLogger.debug('Order route - invoiceRelatedRes', invoiceRelatedRes);
    if (!invoiceRelatedRes.success) {
        return res.status(invoiceRelatedRes.status || 403).send(invoiceRelatedRes);
    }
    order.invoiceRelated = invoiceRelatedRes.id;
    const newOrder = new orderMain(order);
    let errResponse;
    const saved = await newOrder.save()
        .catch(err => {
        orderRoutesLogger.error('create - err: ', err);
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
orderRoutes.put('/update/:companyIdParam', requireAuth, async (req, res) => {
    const { updatedOrder, paymentRelated } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    updatedOrder.companyId = queryId;
    paymentRelated.companyId = queryId;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedOrder;
    const isValid = verifyObjectIds([_id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const order = await orderMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndUpdate({ _id, companyId: queryId });
    if (!order) {
        return res.status(404).send({ success: false });
    }
    order.deliveryDate = updatedOrder.deliveryDate || order.deliveryDate;
    await updatePaymentRelated(paymentRelated, queryId);
    let errResponse;
    const updated = await order.save()
        .catch(err => {
        orderRoutesLogger.error('update - err: ', err);
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
orderRoutes.get('/getone/:id/:companyIdParam', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const order = await orderLean
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOne({ _id: id, companyId: queryId })
        .lean()
        .populate({
        path: 'paymentRelated', model: paymentRelatedLean
    })
        .populate({
        path: 'invoiceRelated', model: invoiceRelatedLean,
        populate: [{
                path: 'billingUserId', model: userLean
            },
            {
                path: 'payments', model: receiptLean
            },
            {
                path: 'items.item', model: itemLean,
                populate: [{
                        path: 'photos', model: fileMetaLean, transform: (doc) => doc.url
                    }]
            }]
    });
    let returned;
    if (order) {
        returned = makePaymentRelatedPdct(order.paymentRelated, order.invoiceRelated, order.invoiceRelated
            .billingUserId, order);
    }
    return res.status(200).send(returned);
});
orderRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, roleAuthorisation('orders', 'read'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectId(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const orders = await orderLean
        .find({ companyId: queryId })
        .skip(offset)
        .limit(limit)
        .lean()
        .populate({ path: 'paymentRelated', model: paymentRelatedLean })
        .populate({
        path: 'invoiceRelated', model: invoiceRelatedLean,
        populate: [{
                path: 'billingUserId', model: userLean
            },
            {
                path: 'payments', model: receiptLean
            },
            {
                path: 'items.item', model: itemLean,
                populate: [{
                        path: 'photos', model: fileMetaLean, transform: (doc) => doc.url
                    }]
            }]
    });
    const returned = orders
        .map(val => makePaymentRelatedPdct(val.paymentRelated, val.invoiceRelated, val.invoiceRelated
        .billingUserId, val));
    return res.status(200).send(returned);
});
orderRoutes.get('/getmyorders/:companyIdParam', requireAuth, async (req, res) => {
    const { userId } = req.user;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const orders = await orderLean
        .find({ user: userId, companyId: queryId })
        .lean()
        .populate({ path: 'paymentRelated', model: paymentRelatedLean })
        .populate({
        path: 'invoiceRelated', model: invoiceRelatedLean,
        populate: [{
                path: 'billingUserId', model: userLean
            },
            {
                path: 'payments', model: receiptLean
            },
            {
                path: 'items.item', model: itemLean,
                populate: [{
                        path: 'photos', model: fileMetaLean, transform: (doc) => doc.url
                    }]
            }]
    });
    const returned = orders
        .map(val => makePaymentRelatedPdct(val.paymentRelated, val.invoiceRelated, val.invoiceRelated
        .billingUserId, val));
    return res.status(200).send(returned);
});
orderRoutes.put('/deleteone/:companyIdParam', requireAuth, async (req, res) => {
    const { id, paymentRelated, invoiceRelated, creationType, where } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await deleteAllPayOrderLinked(paymentRelated, invoiceRelated, creationType, where, queryId);
    // await orderMain.findByIdAndDelete(id);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
orderRoutes.put('/appendDelivery/:orderId/:status/:companyIdParam', requireAuth, roleAuthorisation('orders', 'update'), async (req, res) => {
    const { orderId } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectId(orderId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const order = await orderMain.findOneAndUpdate({ _id: orderId, companyId: queryId });
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
orderRoutes.post('/search/:limit/:offset/:companyIdParam', requireAuth, roleAuthorisation('orders', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const orders = await orderLean
        .find({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
        .lean()
        .skip(offset)
        .limit(limit)
        .populate({ path: 'paymentRelated', model: itemLean,
        populate: [{
                path: 'items', model: itemLean
            },
            {
                path: 'user', select: userAboutSelect, model: userLean
            }]
    })
        .populate({
        path: 'invoiceRelated', model: invoiceRelatedLean,
        populate: [{
                path: 'billingUserId', model: userLean
            },
            {
                path: 'payments', model: receiptLean
            },
            {
                path: 'items.item', model: itemLean,
                populate: [{
                        path: 'photos', model: fileMetaLean, transform: (doc) => doc.url
                    }]
            }]
    });
    const returned = orders
        .map(val => makePaymentRelatedPdct(val.paymentRelated, val.invoiceRelated, val.invoiceRelated
        .billingUserId, val));
    return res.status(200).send(returned);
});
orderRoutes.put('/deletemany/:companyIdParam', requireAuth, roleAuthorisation('orders', 'delete'), async (req, res) => {
    const { credentials } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectId(queryId);
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
        await deleteAllPayOrderLinked(val.paymentRelated, val.invoiceRelated, val.creationType, val.where, queryId);
        return new Promise(resolve => resolve(true));
    });
    await Promise.all(promises);
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=order.routes.js.map