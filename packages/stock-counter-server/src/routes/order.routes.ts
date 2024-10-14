import {
  appendUserToReqIfTokenExist, constructFiltersFromBody,
  generateUrId, handleMongooseErr, lookupSubFieldInvoiceRelatedFilter,
  mainLogger,
  makePredomFilter
} from '@open-stock/stock-universal-server';


import {
  Tuser, populateTrackEdit, populateTrackView, requireActiveCompany, user, userLean
} from '@open-stock/stock-auth-server';
import {
  IcustomRequest,
  IdataArrayResponse,
  IdeleteMany,
  IdeleteOne,
  IfilterAggResponse,
  IfilterProps,
  IinvoiceRelated,
  Iorder,
  Ipayment,
  IpaymentRelated, Iuser
} from '@open-stock/stock-universal';
import {
  addParentToLocals, makeCompanyBasedQuery,
  offsetLimitRelegator, requireAuth, roleAuthorisation, verifyObjectId,
  verifyObjectIds
} from '@open-stock/stock-universal-server';
import express from 'express';
import { Error } from 'mongoose';
import { Torder, orderLean, orderMain } from '../models/order.model';
import { paymentMethodDelegator, trackOrder } from '../utils/payment';
import { populateInvoiceRelated, populatePaymentRelated } from '../utils/query';
import {
  deleteAllPayOrderLinked,
  makePaymentRelatedPdct,
  relegatePaymentRelatedCreation,
  updatePaymentRelated
} from './paymentrelated/paymentrelated';
import { relegateInvRelatedCreation } from './printables/related/invoicerelated';

/**
 * Express router for handling order routes.
 */
export const orderRoutes = express.Router();

orderRoutes.post(
  '/makeorder',
  appendUserToReqIfTokenExist,
  async(req: IcustomRequest<never, {
    order: Iorder;
    payment: Ipayment;
    bagainCred;
    paymentRelated: Partial<IpaymentRelated>;
    invoiceRelated: Partial<IinvoiceRelated>;
    userObj: Partial<Iuser>; }>, res) => {
    const { order, payment, bagainCred, paymentRelated, invoiceRelated, userObj } = req.body;
    const companyId = order.companyId || '';

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
        userObj.urId = await generateUrId(user);
        const newUser = new user(userObj);

        const saveRes = await newUser.save().catch((err: Error) => err);

        if (saveRes instanceof Error) {
          const errResponse = handleMongooseErr(saveRes);

          return res.status(errResponse.status).send(errResponse);
        }

        userDoc = saveRes;

        if (userDoc && userDoc._id) {
          addParentToLocals(res, userDoc._id, user.collection.collectionName, 'makeTrackEdit');
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
    // eslint-disable-next-line max-len
    invoiceRelated.billingUserPhoto = (typeof userDoc.profilePic === 'string') ? userDoc.profilePic : (userDoc.profilePic)?.url;
    const done = await paymentMethodDelegator(
      res,
      paymentRelated as Required<IpaymentRelated>,
      invoiceRelated as Required<IinvoiceRelated>,
      order.paymentMethod,
      order,
      payment,
      userDoc._id,
      companyId,
      bagainCred
    );

    return res.status(done.status || 403).send({ success: done.success, data: done });
  }
);

orderRoutes.post(
  '/paysubscription',
  requireAuth,
  async(req: IcustomRequest<never, {
    order: Iorder; payment: Ipayment;
    bagainCred; paymentRelated: Required<IpaymentRelated>;
    invoiceRelated: Required<IinvoiceRelated>; userObj: Partial<Iuser>; }>, res) => {
    if (!req.user) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // const { userId } = req.user;
    const { companyId } = req.user;

    const { order, payment, bagainCred, paymentRelated, invoiceRelated } = req.body;

    order.companyId = companyId;
    payment.companyId = companyId;
    paymentRelated.companyId = companyId;
    invoiceRelated.companyId = companyId;
    const done = await paymentMethodDelegator(
      res,
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

    return res.status(done.status || 403).send({ success: done.success, data: done });
  }
);

orderRoutes.post(
  '/add',
  requireAuth,
  async(req: IcustomRequest<never, {
    order: Iorder; payment: Ipayment;
    paymentRelated: Required<IpaymentRelated>;
    invoiceRelated: Required<IinvoiceRelated>; userObj: Partial<Iuser>; }>, res) => {
    if (!req.user) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { order, paymentRelated, invoiceRelated } = req.body;
    const { companyId } = req.user;

    order.companyId = companyId;
    paymentRelated.companyId = companyId;
    invoiceRelated.companyId = companyId;
    const extraNotifDesc = 'Newly created order';
    const paymentRelatedRes = await relegatePaymentRelatedCreation(
      res,
      paymentRelated,
      invoiceRelated,
      'order',
      extraNotifDesc,
      companyId
    );

    mainLogger.debug('Order route - paymentRelatedRes', paymentRelatedRes);
    if (!paymentRelatedRes.success) {
      return res.status(paymentRelatedRes.status || 403).send(paymentRelatedRes);
    }
    order.paymentRelated = paymentRelatedRes._id;
    const invoiceRelatedRes = await relegateInvRelatedCreation(res, invoiceRelated, companyId, extraNotifDesc, true);

    mainLogger.debug('Order route - invoiceRelatedRes', invoiceRelatedRes);
    if (!invoiceRelatedRes.success) {
      return res.status(invoiceRelatedRes.status || 403).send(invoiceRelatedRes);
    }
    order.invoiceRelated = invoiceRelatedRes._id;

    const newOrder = new orderMain(order);

    const savedRes = await newOrder.save()
      .catch((err: Error) => err);

    if (savedRes instanceof Error) {
      const errResponse = handleMongooseErr(savedRes);

      return res.status(errResponse.status).send(errResponse);
    }

    addParentToLocals(res, savedRes._id, orderMain.collection.collectionName, 'makeTrackEdit');

    return res.status(200).send({ success: true });
  }
);

orderRoutes.put(
  '/update',
  requireAuth,
  async(req: IcustomRequest<never, { updatedOrder: Iorder; paymentRelated: Required<IpaymentRelated> }>, res) => {
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

    const updateRes = await orderMain.updateOne({
      _id, filter
    }, {
      $set: {
        deliveryDate: updatedOrder.deliveryDate || order.deliveryDate,
        isDeleted: updatedOrder.isDeleted || order.isDeleted
      }
    })
      .catch((err: Error) => err);

    if (updateRes instanceof Error) {
      const errResponse = handleMongooseErr(updateRes);

      return res.status(errResponse.status).send(errResponse);
    }

    addParentToLocals(res, _id, orderMain.collection.collectionName, 'makeTrackEdit');

    return res.status(200).send({ success: true });
  }
);

orderRoutes.get('/one/:_id', requireAuth, async(req: IcustomRequest<{ _id: string }, null>, res) => {
  const { _id } = req.params;
  const { filter } = makeCompanyBasedQuery(req);
  const order = await orderLean
    .findOne({ _id, ...filter })
    .lean()
    .populate([populatePaymentRelated(), populateInvoiceRelated(true), populateTrackEdit(), populateTrackView()]);

  if (!order) {
    return res.status(404).send({ success: false, err: 'not found' });
  }

  const returned = makePaymentRelatedPdct(
      order.paymentRelated as Required<IpaymentRelated>,
      order.invoiceRelated as Required<IinvoiceRelated>,
      (order.invoiceRelated as IinvoiceRelated)
        .billingUserId as unknown as Iuser,
      order
  );

  addParentToLocals(res, order._id, orderMain.collection.collectionName, 'trackDataView');

  return res.status(200).send(returned);
});

orderRoutes.get(
  '/all/:offset/:limit',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('orders', 'read'),
  async(req: IcustomRequest<{ offset: string; limit: string }, null>, res) => {
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
      .map(val => makePaymentRelatedPdct(
      val.paymentRelated as Required<IpaymentRelated>,
      val.invoiceRelated as Required<IinvoiceRelated>,
      (val.invoiceRelated as IinvoiceRelated)
        .billingUserId as unknown as Iuser,
      val
      ));
    const response: IdataArrayResponse<IpaymentRelated> = {
      count: all[1],
      data: returned
    };

    for (const val of returned) {
      addParentToLocals(res, val._id, orderMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

orderRoutes.get(
  '/getmyorders/:offset/:limit',
  requireAuth,
  async(req: IcustomRequest<never, null>, res) => {
    if (!req.user) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
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
      .map(val => makePaymentRelatedPdct(
      val.paymentRelated as Required<IpaymentRelated>,
      val.invoiceRelated as Required<IinvoiceRelated>,
      (val.invoiceRelated as IinvoiceRelated)
        .billingUserId as unknown as Iuser,
      val
      ));

    for (const val of orders) {
      addParentToLocals(res, val._id, orderMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(returned);
  }
);

orderRoutes.put(
  '/delete/one',
  requireAuth,
  async(req: IcustomRequest<never, IdeleteOne>, res) => {
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
    const deleted = await deleteAllPayOrderLinked(
      found.paymentRelated as string,
      found.invoiceRelated as string,
      'order',
      filter.companyId
    );

    // await orderMain.findByIdAndDelete(id);
    if (deleted?.success) {
      addParentToLocals(res, _id, orderMain.collection.collectionName, 'trackDataDelete');

      return res.status(200).send({ success: true });
    } else {
      return res.status(405).send({ success: false, err: 'could not find item to remove' });
    }
  }
);

orderRoutes.put(
  '/appendDelivery/:orderId/:status',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('orders', 'update'),
  async(req: IcustomRequest<never, unknown>, res) => {
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


    const updateRes = await orderMain.updateOne({
      _id: orderId, ...filter
    }, {
      $set: {

      }
    }).catch((err: Error) => err);

    if (updateRes instanceof Error) {
      const errResponse = handleMongooseErr(updateRes);

      return res.status(errResponse.status).send(errResponse);
    }

    addParentToLocals(res, order._id, orderMain.collection.collectionName, 'makeTrackEdit');

    return res.status(200).send({ success: true });
  }
);

orderRoutes.post(
  '/filter',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('orders', 'read'),
  async(req: IcustomRequest<never, IfilterProps>, res) => {
    const { propSort, returnEmptyArr } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);

    const aggCursor = orderLean
      .aggregate<IfilterAggResponse<Torder>>([
        ...lookupSubFieldInvoiceRelatedFilter(constructFiltersFromBody(req), offset, limit, propSort, returnEmptyArr)
      ]);
    const dataArr: IfilterAggResponse<Torder>[] = [];

    for await (const data of aggCursor) {
      dataArr.push(data);
    }

    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;

    const returned = all
      .map(val => makePaymentRelatedPdct(
      val.paymentRelated as Required<IpaymentRelated>,
      val.invoiceRelated as Required<IinvoiceRelated>,
      (val.invoiceRelated as IinvoiceRelated)
        .billingUserId as unknown as Iuser,
      val
      ));
    const response: IdataArrayResponse<IpaymentRelated> = {
      count,
      data: returned
    };

    for (const val of all) {
      addParentToLocals(res, val._id, orderMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

orderRoutes.put(
  '/delete/many',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('orders', 'delete'),
  async(req: IcustomRequest<never, IdeleteMany>, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    const promises = _ids
      .map(async _id => {
        const found = await orderLean.findOne({ _id }).lean();

        if (found) {
          await deleteAllPayOrderLinked(
            found.paymentRelated as string,
            found.invoiceRelated as string,
            'order',
            filter.companyId
          );
        }

        return new Promise(resolve => resolve(found?._id));
      });

    const filterdExist = await Promise.all(promises) as string[];

    for (const val of filterdExist.filter(value => value)) {
      addParentToLocals(res, val, orderMain.collection.collectionName, 'trackDataDelete');
    }

    return res.status(200).send({ success: true });
  }
);

orderRoutes.get('/trackorder/:refereceId', async(req: IcustomRequest<{ refereceId: string }, null>, res) => {
  const response = await trackOrder(req.params.refereceId) as any;

  if (!response.success) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  return res.status(200).send({ success: true, orderStatus: response.orderStatus });
});
