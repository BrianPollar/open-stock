import { appendUserToReqIfTokenExist, constructFiltersFromBody, generateUrId, lookupSubFieldInvoiceRelatedFilter, makePredomFilter } from '@open-stock/stock-universal-server';
import { populateTrackEdit, populateTrackView, requireActiveCompany, user, userLean } from '@open-stock/stock-auth-server';
import { addParentToLocals, makeCompanyBasedQuery, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { orderLean, orderMain } from '../models/order.model';
import { paymentMethodDelegator, trackOrder } from '../utils/payment';
import { populateInvoiceRelated, populatePaymentRelated } from '../utils/query';
import { deleteAllPayOrderLinked, makePaymentRelatedPdct, relegatePaymentRelatedCreation, updatePaymentRelated } from './paymentrelated/paymentrelated';
import { relegateInvRelatedCreation } from './printables/related/invoicerelated';
/** Logger for order routes */
const orderRoutesLogger = tracer.colorConsole({
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
/**
 * Express router for handling order routes.
 */
export const orderRoutes = express.Router();
orderRoutes.post('/makeorder', appendUserToReqIfTokenExist, async (req, res) => {
    const { order, payment, bagainCred, paymentRelated, invoiceRelated, userObj } = req.body;
    const companyId = order.companyId;
    order.companyId = companyId;
    payment.companyId = companyId;
    paymentRelated.companyId = companyId;
    invoiceRelated.companyId = companyId;
    let userDoc;
    if (!userObj._id) {
        const found = await userLean.findOne({ phone: userObj.phone }).lean();
        if (found) {
            userDoc = found;
        }
        else {
            userObj.urId = await generateUrId(user);
            const newUser = new user(userObj);
            let savedErr;
            userDoc = await newUser.save().catch(err => {
                orderRoutesLogger.error('save error', err);
                savedErr = err;
                return null;
            });
            if (savedErr) {
                return res.status(500).send({ success: false });
            }
            if (userDoc && userDoc._id) {
                addParentToLocals(res, userDoc._id, user.collection.collectionName, 'makeTrackEdit');
            }
        }
    }
    else {
        const isValid = verifyObjectId(userObj._id);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        const found = await userLean.findById(userObj._id).lean();
        if (!found) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        userDoc = found;
    }
    invoiceRelated.billingUser = userDoc.fname + ' ' + userDoc.lname;
    invoiceRelated.billingUserId = userDoc._id;
    // eslint-disable-next-line max-len
    invoiceRelated.billingUserPhoto = (typeof userDoc.profilePic === 'string') ? userDoc.profilePic : (userDoc.profilePic)?.url;
    const done = await paymentMethodDelegator(res, paymentRelated, invoiceRelated, order.paymentMethod, order, payment, userDoc._id, companyId, bagainCred);
    return res.status(done.status).send({ success: done.success, data: done });
});
orderRoutes.post('/paysubscription', requireAuth, async (req, res) => {
    // const { userId } = req.user;
    const { companyId } = req.user;
    const { order, payment, bagainCred, paymentRelated, invoiceRelated } = req.body;
    order.companyId = companyId;
    payment.companyId = companyId;
    paymentRelated.companyId = companyId;
    invoiceRelated.companyId = companyId;
    const done = await paymentMethodDelegator(res, paymentRelated, invoiceRelated, order.paymentMethod, order, payment, companyId, companyId, bagainCred, 'subscription');
    return res.status(done.status).send({ success: done.success, data: done });
});
orderRoutes.post('/add', requireAuth, async (req, res) => {
    const { order, paymentRelated, invoiceRelated } = req.body;
    const { companyId } = req.user;
    order.companyId = companyId;
    paymentRelated.companyId = companyId;
    invoiceRelated.companyId = companyId;
    const extraNotifDesc = 'Newly created order';
    const paymentRelatedRes = await relegatePaymentRelatedCreation(res, paymentRelated, invoiceRelated, 'order', extraNotifDesc, companyId);
    orderRoutesLogger.debug('Order route - paymentRelatedRes', paymentRelatedRes);
    if (!paymentRelatedRes.success) {
        return res.status(paymentRelatedRes.status || 403).send(paymentRelatedRes);
    }
    order.paymentRelated = paymentRelatedRes._id;
    const invoiceRelatedRes = await relegateInvRelatedCreation(res, invoiceRelated, companyId, extraNotifDesc, true);
    orderRoutesLogger.debug('Order route - invoiceRelatedRes', invoiceRelatedRes);
    if (!invoiceRelatedRes.success) {
        return res.status(invoiceRelatedRes.status || 403).send(invoiceRelatedRes);
    }
    order.invoiceRelated = invoiceRelatedRes._id;
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
        return err;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    if (saved && saved._id) {
        addParentToLocals(res, saved._id, orderMain.collection.collectionName, 'makeTrackEdit');
    }
    return res.status(200).send({ success: Boolean(saved) });
});
orderRoutes.put('/update', requireAuth, async (req, res) => {
    const { updatedOrder, paymentRelated } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    updatedOrder.companyId = filter.companyId;
    paymentRelated.companyId = filter.companyId;
    const { _id } = updatedOrder;
    const isValid = verifyObjectIds([_id, filter.companyId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const order = await orderMain
        .findOne({ _id, ...filter })
        .lean();
    if (!order) {
        return res.status(404).send({ success: false });
    }
    await updatePaymentRelated(paymentRelated, filter.companyId);
    let errResponse;
    const updated = await orderMain.updateOne({
        _id, filter
    }, {
        $set: {
            deliveryDate: updatedOrder.deliveryDate || order.deliveryDate,
            isDeleted: updatedOrder.isDeleted || order.isDeleted
        }
    })
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
    addParentToLocals(res, _id, orderMain.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: Boolean(updated) });
});
orderRoutes.get('/one/:_id', requireAuth, async (req, res) => {
    const { _id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const order = await orderLean
        .findOne({ _id, ...filter })
        .lean()
        .populate([populatePaymentRelated(), populateInvoiceRelated(true), populateTrackEdit(), populateTrackView()]);
    if (!order) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const returned = makePaymentRelatedPdct(order.paymentRelated, order.invoiceRelated, order.invoiceRelated
        .billingUserId, order);
    addParentToLocals(res, order._id, orderMain.collection.collectionName, 'trackDataView');
    return res.status(200).send(returned);
});
orderRoutes.get('/all/:offset/:limit', requireAuth, requireActiveCompany, roleAuthorisation('orders', 'read'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { filter } = makeCompanyBasedQuery(req);
    const all = await Promise.all([
        orderLean
            .find(filter)
            .skip(offset)
            .limit(limit)
            .lean()
            .populate([populatePaymentRelated(), populateInvoiceRelated(true), populateTrackEdit(), populateTrackView()]),
        orderLean.countDocuments(filter)
    ]);
    const returned = all[0]
        .map(val => makePaymentRelatedPdct(val.paymentRelated, val.invoiceRelated, val.invoiceRelated
        .billingUserId, val));
    const response = {
        count: all[1],
        data: returned
    };
    for (const val of returned) {
        addParentToLocals(res, val._id, orderMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
orderRoutes.get('/getmyorders/:offset/:limit', requireAuth, async (req, res) => {
    const { userId } = req.user;
    const isValid = verifyObjectId(userId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const orders = await orderLean
        .find({ user: userId, ...makePredomFilter(req) })
        .lean()
        .populate([populatePaymentRelated(), populateInvoiceRelated(true), populateTrackEdit(), populateTrackView()]);
    const returned = orders
        .map(val => makePaymentRelatedPdct(val.paymentRelated, val.invoiceRelated, val.invoiceRelated
        .billingUserId, val));
    for (const val of orders) {
        addParentToLocals(res, val._id, orderMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(returned);
});
orderRoutes.put('/delete/one', requireAuth, async (req, res) => {
    const { _id } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const isValid = verifyObjectIds([_id, filter.companyId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const found = await orderLean.findOne({ _id }).lean();
    if (!found) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const deleted = await deleteAllPayOrderLinked(found.paymentRelated, found.invoiceRelated, 'order', filter.companyId);
    // await orderMain.findByIdAndDelete(id);
    if (Boolean(deleted)) {
        addParentToLocals(res, _id, orderMain.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
orderRoutes.put('/appendDelivery/:orderId/:status', requireAuth, requireActiveCompany, roleAuthorisation('orders', 'update'), async (req, res) => {
    const { orderId } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const isValid = verifyObjectId(orderId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const order = await orderMain
        .findOne({ _id: orderId, ...filter })
        .lean();
    if (!order) {
        return res.status(404).send({ success: false });
    }
    let errResponse;
    await orderMain.updateOne({
        _id: orderId, ...filter
    }, {
        $set: {}
    }).catch(err => {
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
    addParentToLocals(res, order._id, orderMain.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: true });
});
orderRoutes.post('/filter', requireAuth, requireActiveCompany, roleAuthorisation('orders', 'read'), async (req, res) => {
    const { propSort } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);
    const aggCursor = orderLean
        .aggregate([
        ...lookupSubFieldInvoiceRelatedFilter(constructFiltersFromBody(req), propSort, offset, limit)
    ]);
    const dataArr = [];
    for await (const data of aggCursor) {
        dataArr.push(data);
    }
    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;
    const returned = all
        .map(val => makePaymentRelatedPdct(val.paymentRelated, val.invoiceRelated, val.invoiceRelated
        .billingUserId, val));
    const response = {
        count,
        data: returned
    };
    for (const val of all) {
        addParentToLocals(res, val._id, orderMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
orderRoutes.put('/delete/many', requireAuth, requireActiveCompany, roleAuthorisation('orders', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const promises = _ids
        .map(async (_id) => {
        const found = await orderLean.findOne({ _id }).lean();
        if (found) {
            await deleteAllPayOrderLinked(found.paymentRelated, found.invoiceRelated, 'order', filter.companyId);
        }
        return new Promise(resolve => resolve(found._id));
    });
    const filterdExist = await Promise.all(promises);
    for (const val of filterdExist) {
        addParentToLocals(res, val, orderMain.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
orderRoutes.get('/trackorder/:refereceId', async (req, res) => {
    const response = await trackOrder(req.params.refereceId);
    if (!response.success) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    return res.status(200).send({ success: true, orderStatus: response.orderStatus });
});
//# sourceMappingURL=order.routes.js.map