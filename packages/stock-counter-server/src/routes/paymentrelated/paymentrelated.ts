import {
  Iactionwithall,
  IinvoiceRelated,
  Imainnotification,
  IpaymentRelated,
  Ireceipt,
  Isuccess,
  Iuser,
  TnotifType,
  TpaymentRelatedType
} from '@open-stock/stock-universal';
import { makeUrId, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import { orderMain } from '../../models/order.model';
import { paymentMain } from '../../models/payment.model';
import { paymentRelatedLean, paymentRelatedMain } from '../../models/printables/paymentrelated/paymentrelated.model';
import {
  deleteManyInvoiceRelated,
  makeInvoiceRelatedPdct,
  updateInvoiceRelatedPayments
} from '../printables/related/invoicerelated';
import { getLogger } from 'log4js';
import { createNotifications, smsHandler } from '@open-stock/stock-notif-server';
import { user } from '@open-stock/stock-auth-server';
import { receiptMain } from '../../models/printables/receipt.model';

/** Logger for PaymentRelated routes */
const paymentRelatedLogger = getLogger('routes/PaymentRelated');

/**
 * Updates a payment related object in the database.
 * @param paymentRelated - The payment related object to update.
 * @returns A success object with an optional ID field.
 */
export const updatePaymentRelated = async(
  paymentRelated: Required<IpaymentRelated>
): Promise<Isuccess & { id?: string }> => {
  console.log('okay here 111111', paymentRelated);
  const isValid = verifyObjectId(paymentRelated.paymentRelated);
  if (!isValid) {
    return { success: false, err: 'unauthourised', status: 401 };
  }

  const related = await paymentRelatedMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .findByIdAndUpdate(paymentRelated.paymentRelated);
  if (!related) {
    return { success: true, status: 200 };
  }
  // related.items = paymentRelated.items || related.items;
  related['orderDate'] = paymentRelated.orderDate || related['orderDate'];
  related['paymentDate'] = paymentRelated.paymentDate || related['paymentDate'];
  // related.payments = paymentRelated.payments || related.payments;
  related['billingAddress'] = paymentRelated.billingAddress || related['billingAddress'];
  related['shippingAddress'] = paymentRelated.shippingAddress || related['shippingAddress'];
  // related.tax = paymentRelated.tax || related.tax;
  related['currency'] = paymentRelated.currency || related['currency'];
  // related.user = paymentRelated.user || related.user;
  related['isBurgain'] = paymentRelated.isBurgain || related['isBurgain'];
  related['shipping'] = paymentRelated.shipping || related['shipping'];
  related['manuallyAdded'] = paymentRelated.manuallyAdded || related['manuallyAdded'];
  related['paymentMethod'] = paymentRelated.paymentMethod || related['paymentMethod'];
  // related.status = paymentRelated.status || related.status;

  let errResponse: Isuccess;
  const saved = await related.save()
    .catch(err => {
      paymentRelatedLogger.debug('updatePaymentRelated - err: ', err);
      errResponse = {
        status: 403,
        success: false
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
    return errResponse;
  } else {
    return { success: true, status: 200, id: (saved as any)._id };
  }
};

/**
 * Creates a payment related object in the database and creates an invoice related object if necessary.
 * @param paymentRelated - The payment related object to create.
 * @param invoiceRelated - The invoice related object to create.
 * @param type - The type of object being created (either 'payment' or 'order').
 * @param extraNotifDesc - A description to include in the notification.
 * @param notifRedirectUrl - The URL to redirect to when the notification is clicked.
 * @returns A success object with an optional ID field.
 */
export const relegatePaymentRelatedCreation = async(
  paymentRelated: Required<IpaymentRelated>,
  invoiceRelated: Required<IinvoiceRelated>,
  type: 'payment' | 'order', // say payment or order
  extraNotifDesc: string,
  notifRedirectUrl: string
): Promise<Isuccess & {id?: string}> => {
  console.log('FUCK HERE 11111111', paymentRelated);
  const isValid = verifyObjectId(paymentRelated.paymentRelated);
  let found;
  if (isValid) {
    found = await paymentRelatedLean
      .findById(paymentRelated.paymentRelated).lean().select({ urId: 1 });
  }
  if (!found || paymentRelated.creationType === 'solo') {
    const count = await paymentRelatedMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
      .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    paymentRelated.urId = makeUrId(Number(count[0]?.urId || '0'));

    let errResponse: Isuccess;
    const newPayRelated = new paymentRelatedMain(paymentRelated);
    const saved = await newPayRelated.save().catch(err => {
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
      return errResponse;
    }

    // const relatedId = await relegateInvRelatedCreation(invoiceRelated, extraNotifDesc, true);

    let route: string;
    let title = '';
    let accessor: string;
    let notifType: TnotifType;

    if (type === 'order') {
      route = 'orders';
      title = 'Order Made';
      accessor = 'orders';
      notifType = 'orders';
    } else {
      route = 'payments';
      title = 'Payment Made';
      accessor = 'payments';
      notifType = 'payments';
    }

    if (smsHandler.stn && smsHandler.stn[accessor]) {
      const actions: Iactionwithall[] = [{
        operation: 'view',
        url: notifRedirectUrl + route,
        action: '',
        title
      }];

      const notification: Imainnotification = {
        actions,
        userId: invoiceRelated.billingUserId,
        title,
        body: extraNotifDesc,
        icon: '',
        notifType,
        // photo: string;
        expireAt: '200000'
      };

      const capableUsers = await user.find({})
        .lean().select({ permissions: 1 });
      const ids: string[] = [];

      if (type === 'order') {
        for (const cuser of capableUsers) {
          if (cuser.permissions.orders) {
            ids.push(cuser._id);
          }
        }
      } else {
        for (const cuser of capableUsers) {
          if (cuser.permissions.payments) {
            ids.push(cuser._id);
          }
        }
      }

      const notifFilters = { id: { $in: ids } };
      await createNotifications({
        options: notification,
        filters: notifFilters
      });
    }
    return { success: true, status: 200, id: (saved as any)._id };
    /** return {
      paymentRelated: saved._id as string
      // invoiceRelated: relatedId
    };*/
  } else {
    await updatePaymentRelated(paymentRelated);
    // await updateInvoiceRelated(invoiceRelated);
    return { success: true, status: 200, id: (paymentRelated.paymentRelated as any)._id };
    /** return {
      paymentRelated: paymentRelated.paymentRelated
      // invoiceRelated: invoiceRelated.invoiceRelated
    };*/
  }
};

/** */
export const makePaymentRelatedPdct = (
  paymentRelated: Required<IpaymentRelated>,
  invoiceRelated: Required<IinvoiceRelated>,
  // eslint-disable-next-line @typescript-eslint/no-shadow
  user: Iuser,
  meta
) => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: meta._id,
  // createdAt: meta.createdAt,
  updatedAt: meta.updatedAt,
  paymentRelated: paymentRelated._id,
  urId: paymentRelated.urId,
  // items: paymentRelated.items,
  orderDate: paymentRelated.orderDate,
  paymentDate: paymentRelated.paymentDate,
  // payments: paymentRelated.payments,
  billingAddress: paymentRelated.billingAddress,
  shippingAddress: paymentRelated.shippingAddress,
  // tax: paymentRelated.tax,
  currency: paymentRelated.currency,
  // user: paymentRelated.user,
  isBurgain: paymentRelated.isBurgain,
  shipping: paymentRelated.shipping,
  manuallyAdded: paymentRelated.manuallyAdded,
  paymentMethod: paymentRelated.paymentMethod,
  // status: paymentRelated.status,
  ...makeInvoiceRelatedPdct(invoiceRelated, user)
});

/** */
export const deleteManyPaymentRelated = async(ids: string[]): Promise<Isuccess> => {
  console.log('this is called deleteManyPaymentRelated');
  const isValid = verifyObjectIds(ids);
  if (!isValid) {
    return { success: false, status: 402, err: 'unauthourised' };
  }
  console.log('passed isValid in deleteManyPaymentRelated');

  const deletedMany = await paymentRelatedMain
  // eslint-disable-next-line @typescript-eslint/naming-convention
    .deleteMany({ _id: { $in: ids } });
  if (Boolean(deletedMany)) {
    return { success: Boolean(deletedMany), status: 200 };
  } else {
    return { success: Boolean(deletedMany), status: 403, err: 'could not delete selected documents, try again in a while' };
  }
};

/** */
export const deleteAllPayOrderLinked = async(
  paymentRelated: string,
  invoiceRelated: string,
  creationType: TpaymentRelatedType,
  where: 'payment' | 'order'
) => {
  console.log('let shoot payment creationType here', creationType, where);
  await deleteManyPaymentRelated([paymentRelated]);
  await deleteManyInvoiceRelated([invoiceRelated]);
  if (creationType !== 'solo') {
    await paymentMain.deleteOne({ paymentRelated });
    await orderMain.deleteOne({ paymentRelated });
  } else if (where === 'payment') {
    await paymentMain.deleteOne({ paymentRelated });
  } else if (where === 'order') {
    await orderMain.deleteOne({ paymentRelated });
  }
};

// .catch(err => {});
/** */
export const makePaymentInstall = async(receipt: Ireceipt, relatedId: string) => {
  // const pInstall = invoiceRelated.payments[0] as IpaymentInstall;
  if (receipt) {
    console.log('ARRRRRRIVING FINE');
    let errResponse: Isuccess;
    receipt.invoiceRelated = relatedId;
    const newInstal = new receiptMain(receipt);
    const savedPinstall = await newInstal.save().catch(err => {
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

    console.log('maybe getting err res here', errResponse);

    if (errResponse) {
      return errResponse;
    }

    await updateInvoiceRelatedPayments(savedPinstall as unknown as Ireceipt);

    return { success: true };
  }
  return { success: true };
};
