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
import { offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId } from '@open-stock/stock-universal-server';
import { userAboutSelect, userLean } from '@open-stock/stock-auth-server';
import { pesapalPaymentInstance } from '../stock-counter-server';
import { receiptLean } from '../models/printables/receipt.model';
/** Logger for order routes */
const orderRoutesLogger = getLogger('routes/orderRoutes');
/** Express router for order routes */
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
orderRoutes.post('/makeorder', requireAuth, async (req, res) => {
    const { userId } = req.user;
    const { order, payment, bagainCred, paymentRelated, invoiceRelated } = req.body;
    const done = await paymentMethodDelegator(pesapalPaymentInstance, paymentRelated, invoiceRelated, order.paymentMethod, order, payment, userId, bagainCred, req.app.locals.stockCounterServer.notifRedirectUrl, req.app.locals.stockCounterServer.locaLMailHandler);
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
orderRoutes.post('/create', requireAuth, async (req, res) => {
    const { order, paymentRelated, invoiceRelated } = req.body;
    const extraNotifDesc = 'Newly created order';
    const paymentRelatedRes = await relegatePaymentRelatedCreation(paymentRelated, invoiceRelated, 'order', extraNotifDesc, req.app.locals.stockCounterServernotifRedirectUrl);
    orderRoutesLogger.debug('Order route - paymentRelatedRes', paymentRelatedRes);
    if (!paymentRelatedRes.success) {
        return res.status(paymentRelatedRes.status || 403).send(paymentRelatedRes);
    }
    order.paymentRelated = paymentRelatedRes.id;
    const invoiceRelatedRes = await relegateInvRelatedCreation(invoiceRelated, extraNotifDesc, req.app.locals.stockCounterServer.notifRedirectUrl, req.app.locals.stockCounterServer.locaLMailHandler, true);
    orderRoutesLogger.debug('Order route - invoiceRelatedRes', invoiceRelatedRes);
    if (!invoiceRelatedRes.success) {
        return res.status(invoiceRelatedRes.status || 403).send(invoiceRelatedRes);
    }
    order.invoiceRelated = invoiceRelatedRes.id;
    console.log('past all okay', order.invoiceRelated);
    const newOrder = new orderMain(order);
    let errResponse;
    const saved = await newOrder.save()
        .catch(err => {
        console.log('create order here ', err);
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
orderRoutes.put('/update', requireAuth, async (req, res) => {
    const { updatedOrder, paymentRelated } = req.body;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedOrder;
    const isValid = verifyObjectId(_id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const order = await orderMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findByIdAndUpdate(_id);
    if (!order) {
        return res.status(404).send({ success: false });
    }
    order.deliveryDate = updatedOrder.deliveryDate || order.deliveryDate;
    await updatePaymentRelated(paymentRelated);
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
orderRoutes.get('/getone/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const order = await orderLean
        .findById(id)
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
                path: 'items.item', model: itemLean
            }]
    });
    let returned;
    if (order) {
        returned = makePaymentRelatedPdct(order.paymentRelated, order.invoiceRelated, order.invoiceRelated
            .billingUserId, order);
    }
    return res.status(200).send(returned);
});
orderRoutes.get('/getall/:offset/:limit', requireAuth, roleAuthorisation('orders'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const orders = await orderLean
        .find({})
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
                path: 'items.item', model: itemLean
            }]
    });
    const returned = orders
        .map(val => makePaymentRelatedPdct(val.paymentRelated, val.invoiceRelated, val.invoiceRelated
        .billingUserId, val));
    return res.status(200).send(returned);
});
orderRoutes.get('/getmyorders', requireAuth, async (req, res) => {
    const { userId } = req.user;
    const orders = await orderLean
        .find({ user: userId })
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
                path: 'items.item', model: itemLean
            }]
    });
    const returned = orders
        .map(val => makePaymentRelatedPdct(val.paymentRelated, val.invoiceRelated, val.invoiceRelated
        .billingUserId, val));
    return res.status(200).send(returned);
});
orderRoutes.put('/deleteone', requireAuth, async (req, res) => {
    const { id, paymentRelated, invoiceRelated, creationType, where } = req.body;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await deleteAllPayOrderLinked(paymentRelated, invoiceRelated, creationType, where);
    // await orderMain.findByIdAndDelete(id);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
orderRoutes.put('/appendDelivery/:orderId/:status', requireAuth, roleAuthorisation('orders'), async (req, res) => {
    const { orderId } = req.params;
    const isValid = verifyObjectId(orderId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const order = await orderMain.findByIdAndUpdate(orderId);
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
orderRoutes.post('/search/:limit/:offset', requireAuth, roleAuthorisation('orders'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const orders = await orderLean
        .find({ [searchKey]: { $regex: searchterm, $options: 'i' } })
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
                path: 'items.item', model: itemLean
            }]
    });
    const returned = orders
        .map(val => makePaymentRelatedPdct(val.paymentRelated, val.invoiceRelated, val.invoiceRelated
        .billingUserId, val));
    return res.status(200).send(returned);
});
orderRoutes.put('/deletemany', requireAuth, roleAuthorisation('orders'), async (req, res) => {
    const { credentials } = req.body;
    if (!credentials || credentials?.length < 1) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    /** await orderMain
      // eslint-disable-next-line @typescript-eslint/naming-convention
      .deleteMany({ _id: { $in: ids } });**/
    const promises = credentials
        .map(async (val) => {
        await deleteAllPayOrderLinked(val.paymentRelated, val.invoiceRelated, val.creationType, val.where);
        return new Promise(resolve => resolve(true));
    });
    await Promise.all(promises);
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=order.routes.js.map