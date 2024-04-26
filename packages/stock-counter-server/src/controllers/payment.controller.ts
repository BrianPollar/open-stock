/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/naming-convention */

import { companyMain } from '@open-stock/stock-auth-server';
import { makeNotfnBody } from '@open-stock/stock-notif-server';
import { Iactionwithall, Iinvoice, IinvoiceRelated, Iorder, Ipayment, IpaymentRelated, Ireceipt, Isuccess, TpayType } from '@open-stock/stock-universal';
import { stringifyMongooseErr, verifyObjectId } from '@open-stock/stock-universal-server';
import { getLogger } from 'log4js';
import { IpayDetails, IsubmitOrderRes } from 'pesapal3';
import { orderMain } from '../models/order.model';
import { paymentMain } from '../models/payment.model';
import { paymentRelatedMain } from '../models/printables/paymentrelated/paymentrelated.model';
import { promocodeLean } from '../models/promocode.model';
import { makePaymentInstall, relegatePaymentRelatedCreation } from '../routes/paymentrelated/paymentrelated';
import { saveInvoice } from '../routes/printables/invoice.routes';
import { pesapalPaymentInstance } from '../stock-counter-server';

/** Interface for the response of the payOnDelivery function */
export interface IpayResponse extends Isuccess {
  /** The tracking ID for the PesaPal order */
  pesaPalorderTrackingId?: string;
}

/** Logger for the payment controller */
const paymentControllerLogger = getLogger('paymentController');

/**
 * Allows payment on delivery
 * @param paymentRelated - The payment related information
 * @param invoiceRelated - The invoice related information
 * @param order - The order information
 * @param payment - The payment information
 * @param userId - The user ID
 * @param locaLMailHandler - The email handler
 * @returns A promise that resolves to an Isuccess object
 */
export const payOnDelivery = async(
  paymentRelated: Required<IpaymentRelated>,
  invoiceRelated: Required<IinvoiceRelated>,
  order: Iorder,
  payment: Ipayment,
  userId: string,
  companyId: string
): Promise<Isuccess> => {
  order.status = 'pending';
  return appendAll(paymentRelated, invoiceRelated, order, payment, userId, companyId, false);
};

/**
 * Appends all payment related information
 * @param paymentRelated - The payment related information
 * @param invoiceRelated - The invoice related information
 * @param order - The order information
 * @param payment - The payment information
 * @param userId - The user ID
 * @param paid - Whether the payment has been made
 * @returns A promise that resolves to an Isuccess object with additional properties
 */
const appendAll = async(
  paymentRelated: Required<IpaymentRelated>,
  invoiceRelated: Required<IinvoiceRelated>,
  order: Iorder,
  payment: Ipayment,
  userId: string,
  companyId: string,
  paid = true
): Promise<Isuccess & {status: number; paymentRelated?}> => {
  paymentControllerLogger.debug('appendAll - userId:', userId);
  const saved = await addOrder(paymentRelated, invoiceRelated, order, userId, companyId);
  paymentControllerLogger.error('appendAll - saved:', saved);
  if (saved.success) {
    payment.order = (saved as {_id: string})._id;
    payment.paymentRelated = (saved as { paymentRelated: string}).paymentRelated;
    payment.invoiceRelated = (saved as unknown as { invoiceRelated: string}).invoiceRelated;

    await addPayment(payment, userId, paid);
    return { success: saved.success, status: saved.status, paymentRelated: (saved as {paymentRelated: string}).paymentRelated };
  } else {
    return { success: saved.success, status: saved.status, err: (saved as Isuccess).err };
  }
};

/**
 * Adds an order to the database
 * @param paymentRelated - The payment related information
 * @param invoiceRelated - The invoice related information
 * @param order - The order information
 * @param userId - The user ID
 * @returns A promise that resolves to an Isuccess object with additional properties
 */
const addOrder = async(
  paymentRelated: Required<IpaymentRelated>,
  invoiceRelated: Required<IinvoiceRelated>,
  order: Iorder,
  userId: string,
  companyId: string
) => {
  paymentControllerLogger.info('addOrder');
  const extraNotifDesc = 'New Order';
  const paymentRelatedId = await relegatePaymentRelatedCreation(
    paymentRelated, invoiceRelated, 'order', extraNotifDesc, companyId);
  paymentControllerLogger.error('addOrder - paymentRelatedId', paymentRelatedId);
  if (!paymentRelatedId.success) {
    return paymentRelatedId;
  }
  order.paymentRelated = paymentRelatedId.id;
  const invoice = {
    invoiceRelated: '',
    dueDate: order.deliveryDate
  };

  const payments = invoiceRelated.payments.slice();
  invoiceRelated.payments.length = 0;
  invoiceRelated.payments = [];

  const invoiceRelatedId = await saveInvoice(invoice as Iinvoice, invoiceRelated, companyId);
  paymentControllerLogger.error('invoiceRelatedId', invoiceRelatedId);

  if (!invoiceRelatedId.success) {
    return invoiceRelatedId;
  }
  order.invoiceRelated = invoiceRelatedId.id;

  if (payments && payments.length) {
    await makePaymentInstall(payments as unknown as Ireceipt, invoiceRelatedId.id, companyId);
  }

  let errResponse: Isuccess;
  const newOrder = new orderMain(order);
  const withId = await newOrder.save().catch(err => {
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
    return {
      status: 403,
      ...errResponse
    };
  }

  const title = 'New Order';
  const notifnBody = 'Request for item made';
  const actions: Iactionwithall[] = [
    {
      action: 'view',
      title: 'See Order',
      operation: '',
      url: `order/${(withId as unknown as Iorder)._id}`
    }
  ];
  const body = {
    options: makeNotfnBody(userId, title, notifnBody, 'orders', actions, (withId as unknown as Iorder)._id),
    filters: {
      orders: true
    }
  };
  body.options.orders = true;
  // await createNotifications(body);
  // eslint-disable-next-line @typescript-eslint/naming-convention
  return { success: true, status: 200, _id: (withId as unknown as Iorder)._id, paymentRelated: (order).paymentRelated, invoiceRelated: invoiceRelatedId };
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
  paymentControllerLogger.info('addPayment');
  let errResponse: Isuccess;
  const newProd = new paymentMain(payment);
  const withId = await newProd.save().catch(err => {
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
    return {
      status: 403,
      ...errResponse
    };
  }

  if (paid) {
    const title = 'New Payment';
    const notifnBody = 'Payment for item made';
    const actions: Iactionwithall[] = [
      {
        action: 'view',
        title: 'See Payment',
        operation: '',
        url: `payment/${(withId as unknown as Ipayment)._id}`
      }
    ];
    const body = {
      options: makeNotfnBody(userId, title, notifnBody, 'payments', actions, (withId as unknown as Ipayment)._id),
      filters: {
        orders: true
      }
    };
    body.options.payments = true;
    // await createNotifications(body);
  }
  return true;
};


export const paymentMethodDelegator = async(
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
  paymentControllerLogger.debug('paymentMethodDelegator: type - ', type);
  if (burgain.state) {
    const bgainCode = await promocodeLean
      .findOneAndUpdate({
        code: burgain.code,
        state: 'virgin',
        items: order.items
      });
    if (bgainCode) {
      bgainCode.state = 'inOperation';
      let errResponse: Isuccess;
      await bgainCode.save().catch(err => {
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
        return {
          success: false,
          status: 403,
          errmsg: errResponse.err
        };
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
    default:
      response = await payOnDelivery(paymentRelated, invoiceRelated, order, payment, userId, companyId);
      break;
  }

  paymentControllerLogger.debug('paymentMethodDelegator - response', response);

  if (burgain.state) {
    const bgainCode = await promocodeLean
      .findOneAndUpdate({
        code: burgain.code,
        state: 'inOperation',
        items: order.items
      });
    if (bgainCode) {
      if (response.success) {
        bgainCode.state = 'expired';
      } else {
        bgainCode.state = 'virgin';
      }
      await bgainCode.save().catch(err => {
        if (err && err.errors) {
          response.err = stringifyMongooseErr(err.errors);
        } else {
          response.err = `we are having problems connecting to our databases, 
          try again in a while`;
        }
        return response;
      });
    }
  }
  return response;
};

/**
 * Submits a Pesapal payment order.
 * @param paymentRelated - The required payment related information.
 * @param invoiceRelated - The required invoice related information.
 * @param type - The type of payment.
 * @param order - The order details.
 * @param payment - The payment details.
 * @param userId - The ID of the user.
 * @param companyId - The ID of the company.
 * @param burgain - The burgain details.
 * @returns A promise that resolves to an object containing the success status, status code, and the Pesapal order response.
 */
export const relegatePesapalPayment = async(
  paymentRelated: Required<IpaymentRelated>,
  invoiceRelated: Required<IinvoiceRelated>,
  type: string,
  order: Iorder,
  payment: Ipayment,
  userId: string,
  companyId: string
) => {
  const company = await companyMain.findById(paymentRelated.companyId);
  if (!company) {
    return { success: false, status: 401, err: 'user must be of a company' };
  }
  const appended = await appendAll(paymentRelated, invoiceRelated, order, payment, userId, companyId);
  const payDetails = {
    id: appended.paymentRelated,
    currency: paymentRelated.currency || 'UGA',
    amount: (paymentRelated.payments[0] as Ireceipt).amount,
    description: 'Complet payments for the selected products',
    callback_url: pesapalPaymentInstance.config.pesapalCallbackUrl,
    cancellation_url: '',
    notification_id: '',
    billing_address: {
      email_address: paymentRelated.shippingAddress.email,
      phone_number: paymentRelated.shippingAddress.phoneNumber.toString(),
      country_code: 'UG',
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

  const response = await pesapalPaymentInstance.submitOrder(payDetails, invoiceRelated._id, 'Complete product payment') as IsubmitOrderRes;
  const isValid = verifyObjectId(appended.paymentRelated);
  if (!isValid) {
    return { success: false, status: 401, pesapalOrderRes: null, paymentRelated: null };
  }

  const related = await paymentRelatedMain.findById(appended.paymentRelated);
  if (related) {
    related.pesaPalorderTrackingId = response.pesaPalOrderRes.order_tracking_id;
    let errResponse: Isuccess;
    await related.save().catch(err => {
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
      return {
        status: 403,
        ...errResponse
      };
    }
  }
  return { success: true, status: 200, pesapalOrderRes: response, paymentRelated: appended.paymentRelated };
};
