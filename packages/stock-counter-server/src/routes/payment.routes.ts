import {
  addParentToLocals,
  appendUserToReqIfTokenExist,
  constructFiltersFromBody,
  handleMongooseErr, lookupSubFieldInvoiceRelatedFilter, mainLogger, makePredomFilter
} from '@open-stock/stock-universal-server';

/**
 * Express routes for payment related operations.
 * @remarks
 * This file contains the implementation of the payment routes for the stock-counter-server application.
 * The payment routes include creating a payment, updating a payment, and getting a payment by ID.
 * @packageDocumentation
 */

import express, { response } from 'express';
import { Tpayment, paymentLean, paymentMain } from '../models/payment.model';
import { paymentRelatedLean } from '../models/printables/paymentrelated/paymentrelated.model';
// import { paymentInstallsLean } from '../models/printables/paymentrelated/paymentsinstalls.model';
import { invoiceRelatedMain } from '../models/printables/related/invoicerelated.model';
import {
  deleteAllPayOrderLinked, makePaymentInstall,
  makePaymentRelatedPdct,
  relegatePaymentRelatedCreation,
  updatePaymentRelated
} from './paymentrelated/paymentrelated';
// import * as url from 'url';
import {
  companySubscriptionLean, companySubscriptionMain,
  populateTrackEdit, populateTrackView, requireActiveCompany, requireSuperAdmin
} from '@open-stock/stock-auth-server';
import {
  IcustomRequest, IdataArrayResponse,
  IdeleteMany,
  IdeleteOne,
  IfilterAggResponse, IfilterProps,
  IinvoiceRelated, Ipayment, IpaymentRelated, Ireceipt, Iuser
} from '@open-stock/stock-universal';
import {
  makeCompanyBasedQuery,
  offsetLimitRelegator, requireAuth, roleAuthorisation, verifyObjectId, verifyObjectIds
} from '@open-stock/stock-universal-server';
import { Error } from 'mongoose';
import { userWalletMain } from '../models/printables/wallet/user-wallet.model';
import { waitingWalletPayMain } from '../models/printables/wallet/waiting-wallet-pay.model';
import { pesapalPaymentInstance } from '../stock-counter-server';
import { populateInvoiceRelated, populatePaymentRelated } from '../utils/query';
import { relegateInvRelatedCreation } from './printables/related/invoicerelated';

/**
 * Express router for payment routes.
 */
export const paymentRoutes = express.Router();

/** paymentRoutes
 * .post('/braintreeclenttoken', requireAuth, async (req: IcustomRequest<never, unknown>, res) => {
  const token = await brainTreeInstance.generateToken();
  return res.status(200).send({ token, success: true });
});**/

paymentRoutes.post(
  '/add',
  requireAuth,
  async(req: IcustomRequest<never, {
    payment: Ipayment;
    paymentRelated: Required<IpaymentRelated>; invoiceRelated: Required<IinvoiceRelated>; }>, res) => {
    let { payment } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const isValid = verifyObjectId(filter.companyId);

    if (!isValid) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    payment.companyId = filter.companyId;
    const { paymentRelated, invoiceRelated } = req.body;

    if (!payment) {
      payment = {
        paymentRelated: ''
      } as Ipayment;
    }
    const extraNotifDesc = 'Newly created order';
    const paymentRelatedRes = await relegatePaymentRelatedCreation(
      res,
      paymentRelated,
      invoiceRelated,
      'order',
      extraNotifDesc,
      filter.companyId
    );

    if (!paymentRelatedRes.success) {
      return res.status(paymentRelatedRes.status || 403).send(paymentRelatedRes);
    }
    payment.paymentRelated = paymentRelatedRes._id;

    const payments = invoiceRelated.payments.slice() as Ireceipt[];

    invoiceRelated.payments.length = 0;
    invoiceRelated.payments = [];
    const invoiceRelatedRes = await relegateInvRelatedCreation(
      res,
      invoiceRelated,
      filter.companyId,
      extraNotifDesc,
      true
    );

    if (!invoiceRelatedRes.success) {
      return res.status(invoiceRelatedRes.status || 403).send(invoiceRelatedRes);
    }
    payment.invoiceRelated = invoiceRelatedRes._id;

    if (payments && payments.length && invoiceRelatedRes._id) {
      await makePaymentInstall(res, payments[0], invoiceRelatedRes._id, filter.companyId, invoiceRelated.creationType);
    }
    const newPaymt = new paymentMain(payment);

    const savedRes = await newPaymt.save()
      .catch((err: Error) => err);

    if (savedRes instanceof Error) {
      const errResponse = handleMongooseErr(savedRes);

      return res.status(errResponse.status).send(errResponse);
    }

    addParentToLocals(res, savedRes._id, paymentMain.collection.collectionName, 'makeTrackEdit');

    return res.status(200).send({ success: true });
  }
);

paymentRoutes.put(
  '/update',
  requireAuth,
  async(req: IcustomRequest<never, { updatedPayment: Ipayment;paymentRelated: Required<IpaymentRelated> }>, res) => {
    const { filter } = makeCompanyBasedQuery(req);
    const { updatedPayment, paymentRelated } = req.body;

    updatedPayment.companyId = filter.companyId;
    paymentRelated.companyId = filter.companyId;

    const { _id } = updatedPayment;
    const isValid = verifyObjectIds([_id, filter.companyId]);

    if (!isValid) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }

    const payment = await paymentMain
      .findOne({ _id, ...filter })
      .lean();

    if (!payment) {
      return res.status(404).send({ success: false });
    }

    await updatePaymentRelated(paymentRelated, filter.companyId);


    const updateRes = await paymentMain.updateOne({
      _id, ...filter
    }, {
      $set: {
        order: updatedPayment.order || payment.order,
        isDeleted: updatedPayment.isDeleted || payment.isDeleted
      }
    })
      .catch((err: Error) => err);

    if (updateRes instanceof Error) {
      const errResponse = handleMongooseErr(updateRes);

      return res.status(errResponse.status).send(errResponse);
    }

    addParentToLocals(res, _id, paymentMain.collection.collectionName, 'makeTrackEdit');

    return res.status(200).send({ success: true });
  }
);

paymentRoutes.get('/one/:_id', requireAuth, async(req: IcustomRequest<{ _id: string }, null>, res) => {
  const { _id } = req.params;
  const { filter } = makeCompanyBasedQuery(req);
  const payment = await paymentLean
    .findOne({ _id, ...filter })
    .lean()
    .populate([populatePaymentRelated(), populateInvoiceRelated(true), populateTrackEdit(), populateTrackView()]);

  if (!payment) {
    return res.status(404).send({ success: false, err: 'not found' });
  }

  const returned = makePaymentRelatedPdct(
      payment.paymentRelated as Required<IpaymentRelated>,
      payment.invoiceRelated as Required<IinvoiceRelated>,
      (payment.invoiceRelated as IinvoiceRelated)
        .billingUserId as unknown as Iuser,
      payment
  );

  addParentToLocals(res, payment._id, paymentMain.collection.collectionName, 'trackDataView');

  return res.status(200).send(returned);
});

paymentRoutes.get(
  '/all/:offset/:limit',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('payments', 'read'),
  async(req: IcustomRequest<{ offset: string; limit: string }, null>, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { filter } = makeCompanyBasedQuery(req);
    const all = await Promise.all([
      paymentLean
        .find(filter)
        .skip(offset)
        .limit(limit)
        .lean()
        .populate([populatePaymentRelated(), populateInvoiceRelated(true), populateTrackEdit(), populateTrackView()]),
      paymentLean.countDocuments(filter)
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
      addParentToLocals(res, val._id, paymentMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

paymentRoutes.get(
  '/getmypayments/:offset/:limit',
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
    const all = await Promise.all([
      paymentLean
        .find({ user: userId, ...makePredomFilter(req) })
        .lean()
        .populate([populatePaymentRelated(), populateInvoiceRelated(true), populateTrackEdit(), populateTrackView()]),
      paymentLean.countDocuments({ user: userId, ...makePredomFilter(req) })
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

    return res.status(200).send(response);
  }
);

paymentRoutes.put(
  '/delete/one',
  requireAuth,
  requireSuperAdmin,
  async(req: IcustomRequest<never, IdeleteOne>, res) => {
    const { filter } = makeCompanyBasedQuery(req);
    const { _id } = req.body;
    const found = await paymentLean.findOne({ _id });

    if (!found) {
      return res.status(404).send({ success: false, err: 'not found' });
    }
    const updateRes = await deleteAllPayOrderLinked(
      found.paymentRelated as string,
      found.invoiceRelated as string,
      'payment',
      filter.companyId
    );

    if (updateRes instanceof Error) {
      const errResponse = handleMongooseErr(updateRes);

      return res.status(errResponse.status).send(errResponse);
    }

    addParentToLocals(res, _id, paymentMain.collection.collectionName, 'trackDataDelete');

    return res.status(200).send({ success: true });
  }
);

paymentRoutes.post(
  '/filter',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('payments', 'read'),
  async(req: IcustomRequest<never, IfilterProps>, res) => {
    const { propSort, returnEmptyArr } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);

    const aggCursor = paymentLean
      .aggregate<IfilterAggResponse<Tpayment>>([
        ...lookupSubFieldInvoiceRelatedFilter(constructFiltersFromBody(req), offset, limit, propSort, returnEmptyArr)
      ]);
    const dataArr: IfilterAggResponse<Tpayment>[] = [];

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
      addParentToLocals(res, val._id, paymentMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

paymentRoutes.put(
  '/delete/many',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('payments', 'delete'),
  async(req: IcustomRequest<never, IdeleteMany>, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    const promises = _ids
      .map(async _id => {
        const found = await paymentLean.findOne({ _id });

        if (found) {
          await deleteAllPayOrderLinked(
            found.paymentRelated as string,
            found.invoiceRelated as string,
            'payment',
            filter.companyId
          );
        }

        return new Promise(resolve => resolve(found?._id));
      });


    const filterdExist = await Promise.all(promises) as string[];

    for (const val of filterdExist.filter(value => value)) {
      addParentToLocals(res, val, paymentMain.collection.collectionName, 'trackDataDelete');
    }

    return res.status(200).send({ success: true });
  }
);

// get ipn
paymentRoutes.get('/ipn', async(req: IcustomRequest<never, null>, res) => {
  const currntUrl = new URL(req.url);
  // get access to URLSearchParams object
  const searchParams = currntUrl.searchParams;

  // get url parameters
  const orderTrackingId = searchParams.get('OrderTrackingId');
  const orderNotificationType = searchParams.get('OrderNotificationType');
  const orderMerchantReference = searchParams.get('OrderMerchantReference');

  mainLogger.info(
    'ipn - searchParams, %orderTrackingId:, %orderNotificationType:, %orderMerchantReference:',
    orderTrackingId,
    orderNotificationType,
    orderMerchantReference
  );

  const companySub = await companySubscriptionLean.findOne({ pesaPalorderTrackingId: orderTrackingId }).lean();

  if (companySub && orderTrackingId) {
    await updateCompanySubStatus(res, orderTrackingId);
    await companySub.save();

    return res.status(200).send({ success: true });
  }

  const related = await paymentRelatedLean.findOne({ pesaPalorderTrackingId: orderTrackingId }).lean();

  if (!pesapalPaymentInstance && !related) {
    return res.status(500).send({ success: false, err: 'internal server error' });
  }

  // return relegatePesaPalNotifications(orderTrackingId, orderNotificationType, orderMerchantReference);
  if (orderTrackingId) {
    const response = await pesapalPaymentInstance.getTransactionStatus(orderTrackingId);

    if ((response as { success: boolean }).success) {
      await updateInvoicerelatedStatus(res, orderTrackingId);
    }
  }

  return response;
});


paymentRoutes.get(
  '/paymentstatus/:orderTrackingId/:paymentRelated',
  appendUserToReqIfTokenExist,
  async(req: IcustomRequest<never, null>, res) => {
    const { orderTrackingId } = req.params;

    if (!pesapalPaymentInstance) {
      return res.status(403).send({ success: false, err: 'missing some info' });
    }
    const response = await pesapalPaymentInstance.getTransactionStatus(orderTrackingId);

    if ((response as {success: boolean}).success) {
      const resp = await updateInvoicerelatedStatus(res, orderTrackingId);

      return res.status(200).send({ success: resp.success });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return res.status(403).send({ success: (response as any).success, err: (response as any).err });
  }
);


paymentRoutes.get(
  '/subscriptiopaystatus/:orderTrackingId/:subscriptionId',
  async(req: IcustomRequest<{ subscriptionId: string; orderTrackingId: string }, null>, res) => {
    const { orderTrackingId } = req.params;

    if (!pesapalPaymentInstance) {
      return res.status(403).send({ success: false, err: 'missing some info' });
    }
    const response = await pesapalPaymentInstance.getTransactionStatus(orderTrackingId);

    if ((response as {success: boolean}).success) {
      const subscription = await companySubscriptionMain.findOne({ subscriptionId: req.params.subscriptionId });

      if (!subscription) {
        return res.status(403).send({ success: false, err: 'subscription not found' });
      }

      subscription.active = true;
      subscription.status = 'paid'; // TODO
      await subscription.save();

      // TODO update subscription no invoicerelated
      // const resp = await updateInvoicerelatedStatus(orderTrackingId);
      return res.status(200).send({ success: true });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return res.status(403).send({ success: (response as any).success, err: (response as any).err });
  }
);

paymentRoutes.get(
  '/walletpaystatus/:orderTrackingId/:waitingPayId',
  async(req: IcustomRequest<{ orderTrackingId: string; waitingPayId: string }, null>, res) => {
    const { waitingPayId, orderTrackingId } = req.params;

    const waitingPay = await waitingWalletPayMain.findById(waitingPayId);

    if (!waitingPay) {
      return res.status(403).send({ success: false, err: 'missing some info' });
    }
    const response = await pesapalPaymentInstance.getTransactionStatus(orderTrackingId);

    if ((response as {success: boolean}).success) {
      await waitingWalletPayMain.deleteOne({ _id: waitingPayId });

      const foundWallet = await userWalletMain.findOne({ _id: waitingPay.walletId });

      if (!foundWallet) {
        return res.status(403).send({ success: false, err: 'subscription not found' });
      }

      const updateRes = await userWalletMain.updateOne({
        _id: waitingPay.walletId
      }, {
        $inc: {
          accountBalance: waitingPay.amount
        }
      }).catch((err: Error) => err);

      if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);

        return res.status(errResponse.status).send(errResponse);
      }

      return res.status(200).send({ success: true });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return res.status(403).send({ success: (response as any).success, err: (response as any).err });
  }
);

export const updateInvoicerelatedStatus = async(res, orderTrackingId: string) => {
  const toUpdate = await invoiceRelatedMain
    .findOne({ pesaPalorderTrackingId: orderTrackingId })
    .lean();

  if (toUpdate) {
    const updateRes = await invoiceRelatedMain.updateOne({
      pesaPalorderTrackingId: orderTrackingId
    }, {
      $set: {
        status: 'paid'
      }
    }).catch((err: Error) => err);

    if (updateRes instanceof Error) {
      const errResponse = handleMongooseErr(updateRes);

      return errResponse;
    }

    addParentToLocals(res, toUpdate._id, paymentMain.collection.collectionName, 'makeTrackEdit');
  }

  return { success: true };
};


export const updateCompanySubStatus = async(res, orderTrackingId: string) => {
  const toUpdate = await companySubscriptionMain
    .findOne({ pesaPalorderTrackingId: orderTrackingId })
    .lean();

  if (toUpdate) {
    toUpdate.status = 'paid';


    const saveRes = await companySubscriptionMain.updateOne({
      pesaPalorderTrackingId: orderTrackingId
    }, {
      $set: {
        status: 'paid'
      }
    }).catch((err: Error) => err);

    if (saveRes instanceof Error) {
      const errResponse = handleMongooseErr(saveRes);

      return errResponse;
    }

    addParentToLocals(res, toUpdate._id, paymentMain.collection.collectionName, 'makeTrackEdit');
  }

  return { success: true };
};
