/* eslint-disable @typescript-eslint/no-misused-promises */

import { Tuser, requireActiveCompany, user, userAboutSelect, userLean } from '@open-stock/stock-auth-server';
import {
  Icustomrequest,
  IdataArrayResponse,
  IinvoiceRelated,
  IpaymentRelated,
  Isuccess,
  Iuser
} from '@open-stock/stock-universal';
import { fileMetaLean, makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { paymentMethodDelegator, trackOrder } from '../controllers/payment.controller';
import { itemLean } from '../models/item.model';
import { orderLean, orderMain } from '../models/order.model';
import { paymentRelatedLean } from '../models/printables/paymentrelated/paymentrelated.model';
import { receiptLean } from '../models/printables/receipt.model';
import { invoiceRelatedLean } from '../models/printables/related/invoicerelated.model';
import {
  deleteAllPayOrderLinked,
  makePaymentRelatedPdct,
  relegatePaymentRelatedCreation,
  updatePaymentRelated
} from './paymentrelated/paymentrelated';
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
orderRoutes.post('/makeorder/:companyIdParam', async(req, res) => {
  // const { userId } = (req as Icustomrequest).user;
  // const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  // const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  /* const isValid = verifyObjectId(companyIdParam);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  } */
  const { order, payment, bagainCred, paymentRelated, invoiceRelated, userObj } = req.body;
  const companyId = order.companyId || companyIdParam ? companyIdParam : 'superAdmin';

  order.companyId = companyId;
  payment.companyId = companyId;
  paymentRelated.companyId = companyId;
  invoiceRelated.companyId = companyId;
  let userDoc: Tuser;

  if (!userObj._id) {
    const found = await userLean.findOne({ phone: userObj.phone }).lean();

    if (found) {
      userDoc = found;
    } else {
      const count = await user
        .find({ }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });

      userObj.urId = makeUrId(Number(count[0]?.urId || '0'));
      const newUser = new user(userObj);
      let savedErr: string;

      userDoc = await newUser.save().catch(err => {
        orderRoutesLogger.error('save error', err);
        savedErr = err;

        return null;
      });
      if (savedErr) {
        return res.status(500).send({ success: false });
      }
    }
  } else {
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
  invoiceRelated.billingUserPhoto = (typeof userDoc.profilePic === 'string') ? userDoc.profilePic : (userDoc.profilePic)?.url;
  const done = await paymentMethodDelegator(
    paymentRelated,
    invoiceRelated,
    order.paymentMethod,
    order,
    payment,
    userDoc._id,
    companyIdParam,
    bagainCred
  );

  return res.status(done.status).send({ success: done.success, data: done });
});

orderRoutes.post('/paysubscription/:companyIdParam', requireAuth, async(req, res) => {
  // const { userId } = (req as Icustomrequest).user;
  const { companyId } = (req as Icustomrequest).user;
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
  const done = await paymentMethodDelegator(
    paymentRelated,
    invoiceRelated,
    order.paymentMethod,
    order,
    payment,
    companyId,
    companyId,
    bagainCred,
    'subscription'
  );

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
orderRoutes.post('/create/:companyIdParam', requireAuth, async(req, res) => {
  const { order, paymentRelated, invoiceRelated } = req.body;
  const { companyId } = (req as Icustomrequest).user;
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
  const invoiceRelatedRes = await relegateInvRelatedCreation(invoiceRelated as Required<IinvoiceRelated>, companyId, extraNotifDesc, true);

  orderRoutesLogger.debug('Order route - invoiceRelatedRes', invoiceRelatedRes);
  if (!invoiceRelatedRes.success) {
    return res.status(invoiceRelatedRes.status || 403).send(invoiceRelatedRes);
  }
  order.invoiceRelated = invoiceRelatedRes.id;

  const newOrder = new orderMain(order);
  let errResponse: Isuccess;
  const saved = await newOrder.save()
    .catch(err => {
      orderRoutesLogger.error('create - err: ', err);
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
orderRoutes.put('/update/:companyIdParam', requireAuth, async(req, res) => {
  const { updatedOrder, paymentRelated } = req.body;
  const { companyId } = (req as Icustomrequest).user;
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
    .findOneAndUpdate({ _id, companyId: queryId });

  if (!order) {
    return res.status(404).send({ success: false });
  }
  order.deliveryDate = updatedOrder.deliveryDate || order.deliveryDate;
  await updatePaymentRelated(paymentRelated, queryId);
  let errResponse: Isuccess;
  const updated = await order.save()
    .catch(err => {
      orderRoutesLogger.error('update - err: ', err);
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
orderRoutes.get('/getone/:id/:companyIdParam', requireAuth, async(req, res) => {
  const { id } = req.params;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectIds([id, queryId]);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const order = await orderLean
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
          path: 'photos', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
        }]
      }]
    });
  let returned;

  if (order) {
    returned = makePaymentRelatedPdct(
      order.paymentRelated as Required<IpaymentRelated>,
      order.invoiceRelated as Required<IinvoiceRelated>,
      (order.invoiceRelated as IinvoiceRelated)
        .billingUserId as unknown as Iuser,
      order
    );
  }

  return res.status(200).send(returned);
});

orderRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('orders', 'read'), async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectId(queryId);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const all = await Promise.all([
    orderLean
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
            path: 'photos', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
          }]
        }]
      }),
    orderLean.countDocuments({ companyId: queryId })
  ]);
  const returned = all[0]
    .map(val => makePaymentRelatedPdct(
      val.paymentRelated as Required<IpaymentRelated>,
      val.invoiceRelated as Required<IinvoiceRelated>,
      (val.invoiceRelated as IinvoiceRelated)
        .billingUserId as unknown as Iuser,
      val
    ));
  const response: IdataArrayResponse = {
    count: all[1],
    data: returned
  };

  return res.status(200).send(response);
});

orderRoutes.get('/getmyorders/:offset/:limit/:companyIdParam', requireAuth, async(req, res) => {
  const { userId } = (req as unknown as Icustomrequest).user;
  const isValid = verifyObjectId(userId);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
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
        path: 'items.item', model: itemLean,
        populate: [{
          path: 'photos', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
        }]
      }]
    });
  const returned = orders
    .map(val => makePaymentRelatedPdct(
      val.paymentRelated as Required<IpaymentRelated>,
      val.invoiceRelated as Required<IinvoiceRelated>,
      (val.invoiceRelated as IinvoiceRelated)
        .billingUserId as unknown as Iuser,
      val
    ));

  return res.status(200).send(returned);
});

orderRoutes.put('/deleteone/:companyIdParam', requireAuth, async(req, res) => {
  const { id, paymentRelated, invoiceRelated, creationType, where } = req.body;
  const { companyId } = (req as Icustomrequest).user;
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
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
});

orderRoutes.put('/appendDelivery/:orderId/:status/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('orders', 'update'), async(req, res) => {
  const { orderId } = req.params;
  const { companyId } = (req as Icustomrequest).user;
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
  let errResponse: Isuccess;

  await order.save().catch(err => {
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

orderRoutes.post('/search/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('orders', 'read'), async(req, res) => {
  const { searchterm, searchKey } = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectId(queryId);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const all = await Promise.all([
    orderLean
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
            path: 'photos', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
          }]
        }]
      }),
    orderLean.countDocuments({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
  ]);
  const returned = all[0]
    .map(val => makePaymentRelatedPdct(
      val.paymentRelated as Required<IpaymentRelated>,
      val.invoiceRelated as Required<IinvoiceRelated>,
      (val.invoiceRelated as IinvoiceRelated)
        .billingUserId as unknown as Iuser,
      val
    ));
  const response: IdataArrayResponse = {
    count: all[1],
    data: returned
  };

  return res.status(200).send(response);
});

orderRoutes.put('/deletemany/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('orders', 'delete'), async(req, res) => {
  const { credentials } = req.body;
  const { companyId } = (req as Icustomrequest).user;
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
    .deleteMany({ _id: { $in: ids } });**/
  const promises = credentials
    .map(async val => {
      await deleteAllPayOrderLinked(val.paymentRelated, val.invoiceRelated, val.creationType, val.where, queryId);

      return new Promise(resolve => resolve(true));
    });

  await Promise.all(promises);

  return res.status(200).send({ success: true });
});

orderRoutes.get('/trackorder/:refereceId', async(req, res) => {
  const response = await trackOrder(req.params.refereceId) as any;

  if (!response.success) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  return res.status(200).send({ success: true, orderStatus: response.orderStatus });
});
