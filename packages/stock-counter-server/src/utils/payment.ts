/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/naming-convention */

import { companyMain } from '@open-stock/stock-auth-server';
import { createNotifications, makeNotfnBody } from '@open-stock/stock-notif-server';
import {
  Iactionwithall, Iinvoice, IinvoiceRelated, Iorder, Ipayment, IpaymentRelated, Ireceipt, Isuccess, TpayType
} from '@open-stock/stock-universal';
import { handleMongooseErr, mainLogger, verifyObjectId } from '@open-stock/stock-universal-server';
import { Error } from 'mongoose';
import { IpayDetails } from 'pesapal3';
import { orderMain } from '../models/order.model';
import { paymentMain } from '../models/payment.model';
import { invoiceMain } from '../models/printables/invoice.model';
import { paymentRelatedMain } from '../models/printables/paymentrelated/paymentrelated.model';
import { receiptMain } from '../models/printables/receipt.model';
import { invoiceRelatedMain } from '../models/printables/related/invoicerelated.model';
import { userWalletLean, userWalletMain } from '../models/printables/wallet/user-wallet.model';
import { promocodeLean, promocodeMain } from '../models/promocode.model';
import { makePaymentInstall, relegatePaymentRelatedCreation } from '../routes/paymentrelated/paymentrelated';
import { saveInvoice } from '../routes/printables/invoice.routes';
import { pesapalPaymentInstance } from '../stock-counter-server';

/** Interface for the response of the payOnDelivery function */
export interface IpayResponse extends Isuccess {

  /** The tracking ID for the PesaPal order */
  pesaPalorderTrackingId?: string;
}

export const payOnDelivery = (
  res,
  paymentRelated: Required<IpaymentRelated>,
  invoiceRelated: Required<IinvoiceRelated>,
  order: Iorder,
  payment: Ipayment,
  userId: string,
  companyId: string
): Promise<Isuccess> => {
  order.status = 'pending';

  return appendAll(res, paymentRelated, invoiceRelated, order, payment, userId, companyId, false);
};

export const payWithWallet = async(
  res,
  paymentRelated: Required<IpaymentRelated>,
  invoiceRelated: Required<IinvoiceRelated>,
  order: Iorder,
  payment: Ipayment,
  userId: string,
  companyId: string
): Promise<Isuccess> => {
  const userWallet = await userWalletLean.findOne({ user: userId }).lean();

  if (!userWallet) {
    return { success: false, status: 403, err: 'Insufficient Balance' };
  }

  if (userWallet.accountBalance < invoiceRelated.total) {
    return { success: false, status: 403, err: 'Insufficient Balance' };
  }

  order.status = 'paid';

  const updateRes = await userWalletMain
    .updateOne({ user: userId }, { $inc: { accountBalance: -invoiceRelated.total } })
    .catch((err: Error) => err);

  if (updateRes instanceof Error) {
    return { success: false, status: 500, err: 'Could not update user wallet' };
  }

  if (updateRes.modifiedCount === 0) {
    return { success: false, status: 500, err: 'Could not update user wallet' };
  }

  return appendAll(res, paymentRelated, invoiceRelated, order, payment, userId, companyId, true);
};

const appendAll = async(
  res,
  paymentRelated: Required<IpaymentRelated>,
  invoiceRelated: Required<IinvoiceRelated>,
  order: Iorder,
  payment: Ipayment,
  userId: string,
  companyId: string,
  paid = true
): Promise<Isuccess & {status: number; paymentRelated?: string; invoiceRelated?: string; order?: string}> => {
  mainLogger.debug('appendAll - userId:', userId);
  const saved = await addOrder(res, paymentRelated, invoiceRelated, order, userId, companyId);

  mainLogger.error('appendAll - saved:', saved);
  if (saved.success && saved.orderId) {
    payment.order = saved.orderId;
    payment.paymentRelated = saved.paymentRelated;
    payment.invoiceRelated = saved.invoiceRelated;

    await addPayment(payment, userId, paid);

    return {
      success: saved.success,
      status: saved.status,
      paymentRelated: saved.paymentRelated, invoiceRelated: saved.invoiceRelated, order: saved.orderId
    };
  } else {
    return {
      success: saved.success,
      status: saved.status,
      err: saved.err, paymentRelated: saved.paymentRelated, invoiceRelated: saved.invoiceRelated, order: saved.orderId
    };
  }
};


const addOrder = async(
  res,
  paymentRelated: Required<IpaymentRelated>,
  invoiceRelated: Required<IinvoiceRelated>,
  order: Iorder,
  userId: string,
  companyId: string
): Promise<Isuccess & {status: number; paymentRelated?: string; invoiceRelated?: string; orderId?: string}> => {
  mainLogger.info('addOrder');
  const extraNotifDesc = 'New Order';

  paymentRelated.orderStatus = 'pending';
  const paymentRelatedId = await relegatePaymentRelatedCreation(
    res,
    paymentRelated,
    invoiceRelated,
    'order',
    extraNotifDesc,
    companyId
  );

  mainLogger.error('addOrder - paymentRelatedId', paymentRelatedId);
  if (!paymentRelatedId.success) {
    return { success: false, status: 403, paymentRelated: paymentRelatedId._id };
  }
  order.paymentRelated = paymentRelatedId._id;
  const invoice = {
    invoiceRelated: '',
    dueDate: order.deliveryDate
  };

  const payments = invoiceRelated.payments.slice() as Ireceipt[];

  invoiceRelated.payments.length = 0;
  invoiceRelated.payments = [];

  const invoiceRelatedId = await saveInvoice(res, invoice as Iinvoice, invoiceRelated, companyId);

  mainLogger.error('invoiceRelatedId', invoiceRelatedId);

  if (!invoiceRelatedId.success) {
    return { success: false, status: 403, invoiceRelated: invoiceRelatedId._id };
  }
  order.invoiceRelated = invoiceRelatedId._id;

  if (payments && payments.length && invoiceRelatedId._id) {
    await makePaymentInstall(res, payments[0], invoiceRelatedId._id, companyId, 'solo');
  }


  const newOrder = new orderMain(order);
  const savedRes = await newOrder.save().catch((err: Error) => err);

  if (savedRes instanceof Error) {
    const errResponse = handleMongooseErr(savedRes);

    return errResponse;
  }

  const title = 'New Order';
  const notifnBody = 'Request for item made';
  const actions: Iactionwithall[] = [
    {
      action: 'view',
      title: 'See Order',
      operation: '',
      url: `order/${savedRes._id}`
    }
  ];
  const body = {
    notification: makeNotfnBody(userId, title, notifnBody, 'orders', actions, savedRes._id),
    filters: {
      orders: true
    }
  };

  // body.options.orders = true; // TODO
  await createNotifications(body);


  return {
    success: true,
    status: 200,
    orderId: savedRes._id,
    paymentRelated: (order).paymentRelated,
    invoiceRelated: invoiceRelatedId._id
  };
};

/**
 * Adds a payment to the database
 * @param payment - The payment information
 * @param userId - The user ID
 * @param paid - Whether the payment has been made
 */
const addPayment = async(
  payment: Ipayment,
  userId: string,
  paid = false
) => {
  mainLogger.info('addPayment');

  const newProd = new paymentMain(payment);
  const savedRes = await newProd.save().catch((err: Error) => err);

  if (savedRes instanceof Error) {
    const errResponse = handleMongooseErr(savedRes);

    return errResponse;
  }

  if (paid) {
    const title = 'New Payment';
    const notifnBody = 'Payment for item made';
    const actions: Iactionwithall[] = [
      {
        action: 'view',
        title: 'See Payment',
        operation: '',
        url: `payment/${savedRes._id}`
      }
    ];
    const body = {
      notification: makeNotfnBody(userId, title, notifnBody, 'payments', actions, savedRes._id),
      filters: {
        orders: true
      }
    };

    // body.notification.payments = true; // TODO
    await createNotifications(body);
  }

  return true;
};


/**
   * Handles payments based on the payment method.
   * @param res - The response object.
   * @param paymentRelated - The payment related information.
   * @param invoiceRelated - The invoice related information.
   * @param type - The payment method type.
   * @param order - The order information.
   * @param payment - The payment information.
   * @param userId - The user ID.
   * @param companyId - The company ID.
   * @param burgain - The burgain information.
   * @param payType - The payment type ('nonSubscription' or 'subscription').
   * @returns A promise that resolves to an object containing the success status and the payment ID, if successful.
   */
export const paymentMethodDelegator = async(
  res,
  paymentRelated: Required<IpaymentRelated>,
  invoiceRelated: Required<IinvoiceRelated>,
  type: string,
  order: Iorder,
  payment: Ipayment,
  userId: string,
  companyId: string,
  burgain: {
    state: boolean;
    code: string;
  },
  payType: TpayType = 'nonSubscription'
): Promise<IpayResponse & {status?: number; errmsg?: string}> => {
  paymentRelated.payType = payType;
  invoiceRelated.payType = payType;
  mainLogger.debug('paymentMethodDelegator: type - ', type);
  if (burgain.state) {
    const bgainCode = await promocodeLean
      .findOne({
        code: burgain.code,
        state: 'virgin',
        items: order.items
      }).lean();

    if (bgainCode) {
      const updateRes = await promocodeMain.updateOne({
        code: burgain.code,
        state: 'virgin',
        items: order.items
      }, { $set: { state: 'inOperation' } }).catch((err: Error) => err);

      if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);

        return errResponse;
      }

      (invoiceRelated.payments[0] as Ireceipt).amount = bgainCode.amount;
      (invoiceRelated.payments[0] as Ireceipt).amount = bgainCode.amount;
      paymentRelated.isBurgain = true;
    } else {
      return { success: false, status: 403, errmsg: 'could not complete transaction, wrong promo code' };
    }
  }

  let response: Isuccess;

  switch (type) {
    case 'pesapal':{
      response = await relegatePesapalPayment(
        res,
        paymentRelated,
        invoiceRelated,
        type,
        order,
        payment,
        userId,
        companyId
      );
      break;
    }
    case 'wallet': {
      response = await payWithWallet(res, paymentRelated, invoiceRelated, order, payment, userId, companyId);
      break;
    }
    default:
      response = await payOnDelivery(res, paymentRelated, invoiceRelated, order, payment, userId, companyId);
      break;
  }

  mainLogger.debug('paymentMethodDelegator - response', response);

  if (burgain.state) {
    const bgainCode = await promocodeLean
      .findOne({
        code: burgain.code,
        state: 'inOperation',
        items: order.items
      }).lean();

    let state: string;

    if (bgainCode) {
      if (response.success) {
        state = 'expired';
      } else {
        state = 'virgin';
      }
      await promocodeMain.updateOne({
        code: burgain.code,
        state: 'inOperation',
        items: order.items
      }, {
        $set: { state }
      }).catch((err: Error) => err);
    }
  }

  return response;
};

export const relegatePesapalPayment = async(
  res,
  paymentRelated: Required<IpaymentRelated>,
  invoiceRelated: Required<IinvoiceRelated>,
  type: string,
  order: Iorder,
  payment: Ipayment,
  userId: string,
  companyId: string
) => {
  mainLogger.debug('relegatePesapalPayment', paymentRelated);
  const isValidCompanyId = verifyObjectId(paymentRelated.companyId);

  if (isValidCompanyId) {
    const company = await companyMain.findById(paymentRelated.companyId);

    if (!company) {
      // return { success: false, status: 401, err: 'user must be of a company' };
    }
  }

  const appended = await appendAll(res, paymentRelated, invoiceRelated, order, payment, userId, companyId);

  if (!appended.paymentRelated) {
    return { success: false, status: 403, errmsg: 'could not complete transaction' };
  }
  const payDetails = {
    id: appended.paymentRelated.toString(),
    currency: paymentRelated.currency || 'UGX',
    amount: (paymentRelated.payments[0] as Ireceipt).amount,
    description: 'Complete payments for the selected products',
    callback_url: pesapalPaymentInstance.config.pesapalCallbackUrl,
    cancellation_url: '',
    notification_id: '',
    billing_address: {
      email_address: paymentRelated.shippingAddress.email,
      phone_number: paymentRelated.shippingAddress.phoneNumber,
      // TODO
      country_code: (paymentRelated.shippingAddress as any).countryCode || 'UG',
      first_name: paymentRelated.shippingAddress.firstName,
      middle_name: '',
      last_name: paymentRelated.shippingAddress.lastName,
      line_1: paymentRelated.shippingAddress.addressLine1,
      line_2: paymentRelated.shippingAddress.addressLine2,
      city: paymentRelated.shippingAddress.city,
      state: paymentRelated.shippingAddress.state,
      // postal_code: paymentRelated.shippingAddress,
      zip_code: paymentRelated.shippingAddress.zipcode.toString()
    }
  } as unknown as IpayDetails;

  mainLogger.debug('b4 pesapalPaymentInstance.submitOrder', appended.paymentRelated.toString());
  const response = await pesapalPaymentInstance.submitOrder(
    payDetails,
    appended.paymentRelated.toString(),
    'Complete product payment'
  );

  if (!response.success || !response.pesaPalOrderRes?.order_tracking_id) {
    const deteils = {
      paymentRelated: appended.paymentRelated,
      invoiceRelated: appended.invoiceRelated,
      order: appended.order
    };

    await deleteCreatedDocsOnFailure(deteils);

    return response;
  }
  mainLogger.debug('pesapalPaymentInstance.submitOrder', response);
  const isValid = verifyObjectId(appended.paymentRelated.toString());

  if (!isValid) {
    return { success: false, status: 401, pesapalOrderRes: null, paymentRelated: null };
  }

  const related = await paymentRelatedMain.findById(appended.paymentRelated.toString());

  mainLogger.info('after paymentRelatedMain.findById');
  if (related) {
    related.pesaPalorderTrackingId = response.pesaPalOrderRes.order_tracking_id;


    const saveRes = await related.save().catch((err: Error) => err);

    if (saveRes instanceof Error) {
      const errResponse = handleMongooseErr(saveRes);

      return errResponse;
    }
  }

  return {
    success: true,
    status: 200,
    pesapalOrderRes: response.pesaPalOrderRes,
    paymentRelated: appended.paymentRelated.toString() };
};

/**
 * Deletes all created documents on a failed payment creation.
 * @param paymentRelated - The ID of the payment related document created.
 * @param invoiceRelated - The ID of the invoice related document created.
 * @param order - The ID of the order created.
 * @returns A promise that resolves to a boolean indicating the success of the deletion.
 */
const deleteCreatedDocsOnFailure = async({
  paymentRelated,
  invoiceRelated,
  order
}: {paymentRelated?: string;
  invoiceRelated?: string;
  order?: string;
}) => {
  if (invoiceRelated) {
    await invoiceRelatedMain.deleteOne({ _id: invoiceRelated });
    await invoiceMain.deleteOne({ invoiceRelated });
    await receiptMain.deleteOne({ invoiceRelated });
  }
  if (paymentRelated) {
    await paymentRelatedMain.deleteOne({ _id: paymentRelated });
    await paymentMain.deleteOne({ paymentRelated });
  }

  if (order) {
    await orderMain.deleteOne({ _id: order });
  }

  return true;
};

/**
   * Tracks the status of a payment.
   * @param refereceId - The tracking ID of the payment.
   * @returns A promise that resolves to an object containing the success status and the order status.
   */
export const trackOrder = async(refereceId: string) => {
  const paymentRelated = await paymentRelatedMain
    .findOne({ pesaPalorderTrackingId: refereceId }).lean();

  if (!paymentRelated) {
    return { success: false };
  }

  return { success: true, orderStatus: paymentRelated.orderStatus };
};
