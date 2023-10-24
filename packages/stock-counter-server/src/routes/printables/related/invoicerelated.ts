import { Iactionwithall, IinvoiceRelated, Imainnotification, Ireceipt, Isuccess, Iuser, TestimateStage, TinvoiceType, TnotifType } from '@open-stock/stock-universal';
import { stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import { deliveryNoteLean, deliveryNoteMain } from '../../../models/printables/deliverynote.model';
import { estimateLean, estimateMain } from '../../../models/printables/estimate.model';
import { invoiceLean, invoiceMain } from '../../../models/printables/invoice.model';
import { receiptMain } from '../../../models/printables/receipt.model';
import { invoiceRelatedLean, invoiceRelatedMain } from '../../../models/printables/related/invoicerelated.model';
import { getLogger } from 'log4js';
import { EmailHandler, createNotifications } from '@open-stock/stock-notif-server';
import { user } from '@open-stock/stock-auth-server';

/** Logger for the InvoiceRelated routes */
const invoiceRelatedLogger = getLogger('routes/InvoiceRelated');

/**
 * Updates the payments for an invoice related document.
 * @param payment - The payment to add to the invoice related document.
 * @returns A promise that resolves with a success status and an optional ID.
 */
export const updateInvoiceRelatedPayments = async(payment: Ireceipt): Promise<Isuccess & { id?: string }> => {
  const isValid = verifyObjectId(payment.invoiceRelated);
  if (!isValid) {
    return { success: false, status: 401, err: 'unauthourised' };
  }

  const related = await invoiceRelatedMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .findByIdAndUpdate(payment.invoiceRelated);
  if (!related) {
    return { success: false, err: 'invoice related not found' };
  }

  const payments = related.payments || [];
  payments.push(payment._id as any);
  related.payments = payments;
  console.log('okay got you pice of shit', payments);
  let errResponse: Isuccess;
  const saved = await related.save()
    .catch(err => {
      invoiceRelatedLogger.error('updateInvoiceRelatedPayments - err: ', err);
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
  } else {
    return { success: true, id: (saved as any)._id };
  }
};

/**
 * Updates an invoice related document.
 * @param invoiceRelated - The updated invoice related document.
 * @returns A promise that resolves with a success status and an optional ID.
 */
export const updateInvoiceRelated = async(invoiceRelated: Required<IinvoiceRelated>): Promise<Isuccess& { id?: string }> => {
  console.log('surely the update happens', invoiceRelated);
  const isValid = verifyObjectId(invoiceRelated.invoiceRelated);
  if (!isValid) {
    return { success: false, status: 401, err: 'unauthourised' };
  }

  const related = await invoiceRelatedMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .findByIdAndUpdate(invoiceRelated.invoiceRelated);
  if (!related) {
    return { success: false, err: 'invoice related not found' };
  }

  // start with id
  if (typeof Number(related.billingUserId) !== 'number') {
    related.billingUserId = invoiceRelated.billingUserId || related.billingUserId;
  }

  console.log('ofcours making changes');

  related.creationType = invoiceRelated.creationType || related.creationType;
  related.estimateId = invoiceRelated.estimateId || related.estimateId;
  related.invoiceId = invoiceRelated.invoiceId || related.invoiceId;
  related.billingUser = invoiceRelated.billingUser || related.billingUser;
  related.items = invoiceRelated.items || related.items;
  related.fromDate = invoiceRelated.fromDate || related.fromDate;
  related.toDate = invoiceRelated.toDate || related.toDate;
  related.status = invoiceRelated.status || related.status;
  related.stage = invoiceRelated.stage || related.stage;
  related.cost = invoiceRelated.cost || related.cost;
  related.paymentMade = invoiceRelated.paymentMade || related.paymentMade;
  related.tax = invoiceRelated.tax || related.tax;
  related.balanceDue = invoiceRelated.balanceDue || related.balanceDue;
  related.subTotal = invoiceRelated.subTotal || related.subTotal;
  related.total = invoiceRelated.total || related.total;

  let errResponse: Isuccess;
  const saved = await related.save()
    .catch(err => {
      invoiceRelatedLogger.error('updateInvoiceRelated - err: ', err);
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
  } else {
    return { success: true, id: (saved as any)._idd };
  }
};

/**
 * Relocates an invoice related document.
 * @param invoiceRelated - The invoice related document to relocate.
 * @param extraNotifDesc - A description for the notification.
 * @param notifRedirectUrl - The URL to redirect to after the notification is clicked.
 * @param localMailHandler - The email handler to use for sending notifications.
 * @param bypassNotif - Whether to bypass sending notifications.
 * @returns A promise that resolves with a success status and an optional ID.
 */
export const relegateInvRelatedCreation = async(
  invoiceRelated: Required<IinvoiceRelated>,
  extraNotifDesc: string,
  notifRedirectUrl: string,
  localMailHandler: EmailHandler,
  bypassNotif = false
): Promise<Isuccess & { id?: string }> => {
  console.log('222222222', invoiceRelated);
  invoiceRelatedLogger.debug('relegateInvRelatedCreation - invoiceRelated', invoiceRelated);
  const isValid = verifyObjectId(invoiceRelated.invoiceRelated);
  let found;
  if (isValid) {
    found = await invoiceRelatedLean
      .findById(invoiceRelated.invoiceRelated).lean().select({ urId: 1 });
  }

  console.log('33333333', found);
  if (!found || invoiceRelated.creationType === 'solo') {
    console.log('111111111');
    const newInvRelated = new invoiceRelatedMain(invoiceRelated);
    let errResponse: Isuccess;
    const saved = await newInvRelated.save().catch(err => {
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

    invoiceRelatedLogger.error('AFTER SAVE');

    let route: string;
    let title = '';
    let notifType: TnotifType;

    if (!bypassNotif && localMailHandler?.stn.invoices) {
      switch (invoiceRelated.stage) {
        case 'estimate':
          route = 'estimates';
          title = 'New Estimate';
          notifType = 'invoices';
          break;
        case 'invoice':
          route = 'invoices';
          title = 'New Invoice';
          notifType = 'invoices';
          break;
        case 'deliverynote':
          route = 'deliverynotes';
          title = 'New Delivery Note';
          notifType = 'invoices';
          break;
        case 'receipt':
          route = 'receipt';
          title = 'New Reciept';
          notifType = 'invoices';
          break;
      }

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

      for (const cuser of capableUsers) {
        if (cuser.permissions.printables) {
          ids.push(cuser._id);
        }
      }

      const notifFilters = { id: { $in: ids } };
      await createNotifications({
        options: notification,
        filters: notifFilters
      });
    }

    return { success: true, id: (saved as any)._id };
  } else {
    await updateInvoiceRelated(invoiceRelated);
    return { success: true, id: invoiceRelated.invoiceRelated };
  }
};

// eslint-disable-next-line @typescript-eslint/no-shadow
/** */
export const makeInvoiceRelatedPdct = (invoiceRelated: Required<IinvoiceRelated>, user: Iuser, createdAt?: Date, extras = {}) => {
  console.log(';taht billing user SHIIIIIIIIIIT', user);
  let names = user.salutation + ' ' + user.fname + ' ' + user.lname;
  if (user.userDispNameFormat) {
    switch (user.userDispNameFormat) {
      case 'firstLast':
        names = user.salutation + ' ' + user.fname + ' ' + user.lname;
        break;
      case 'lastFirst':
        names = user.salutation + ' ' + user.lname + ' ' + user.fname;
        break;
      case 'companyName':
        names = user.companyName;
        break;
    }
  }
  return {
    invoiceRelated: invoiceRelated._id,
    creationType: invoiceRelated.creationType,
    invoiceId: invoiceRelated.invoiceId,
    estimateId: invoiceRelated.estimateId,
    billingUser: user.salutation + ' ' + user.fname + ' ' + user.lname,
    extraCompanyDetails: user.extraCompanyDetails,
    items: invoiceRelated.items.map(pdct => {
      if (typeof pdct.item === 'string' || !pdct.item) {
        return pdct;
      } else {
        return {
          amount: pdct.amount,
          quantity: pdct.amount,
          rate: pdct.rate,
          itemName: (pdct.item as any).name,
          item: (pdct.item as any)._id
        };
      }
    }),
    billingUserId: user.urId,
    stage: invoiceRelated.stage,
    fromDate: invoiceRelated.fromDate,
    toDate: invoiceRelated.toDate,
    status: invoiceRelated.status,
    cost: invoiceRelated.cost,
    // paymentMade: invoiceRelated.paymentMade,
    tax: invoiceRelated.tax,
    balanceDue: invoiceRelated.balanceDue,
    subTotal: invoiceRelated.subTotal,
    total: invoiceRelated.total,
    billingUserPhoto: user.photo,
    createdAt: createdAt || invoiceRelated.createdAt,
    payments: invoiceRelated.payments,
    ...extras
  };
};

/** */
export const deleteManyInvoiceRelated = async(ids: string[]) => {
  console.log('called deleteManyInvoiceRelated', ids);
  const isValid = verifyObjectIds(ids);
  if (!isValid) {
    return { success: false, statu: 401, err: 'unauthourised' };
  }
  console.log('passed isValid in deleteManyInvoiceRelated');

  const deleted = await invoiceRelatedMain
  // eslint-disable-next-line @typescript-eslint/naming-convention
    .deleteMany({ _id: { $in: ids } })
    .catch(err => {
      invoiceRelatedLogger.debug('deleteManyInvoiceRelated - err: ', err);
      return null;
    });

  let deleted2 = true;
  if (deleted) {
    deleted2 = await receiptMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
      .deleteMany({ invoiceRelated: { $in: ids } })
      .catch(err => {
        invoiceRelatedLogger.error('deletemany Pinstalls - err: ', err);
        return null;
      });
  }
  if (Boolean(deleted) && Boolean(deleted2)) {
    return { success: true, status: 200 };
  } else {
    return { success: false, status: 403, err: 'could not delete selected documents, try again in a while' };
  }
};


/** */
export const deleteAllLinked = async(invoiceRelated: string, creationType: TinvoiceType, stage: TestimateStage, from: TestimateStage) => {
  console.log('passed you know what', creationType, stage, from);
  if (stage !== from) {
    return;
  }

  let changedStage: TestimateStage;

  if (from === 'estimate') {
    await estimateMain.deleteOne({ invoiceRelated });
  } else if (from === 'invoice') {
    changedStage = 'estimate';
    await invoiceMain.deleteOne({ invoiceRelated });
  } else if (from === 'deliverynote') {
    console.log('deleting deli note');
    await deliveryNoteMain.deleteOne({ invoiceRelated });
    changedStage = 'invoice';
  } else if (from === 'receipt') {
    console.log('deleting receipt');
    await receiptMain.deleteOne({ invoiceRelated });
    changedStage = 'deliverynote';
  }

  if (creationType === 'solo' || (creationType === 'chained' && stage === 'estimate')) {
    await deleteManyInvoiceRelated([invoiceRelated]);
  } else {
    await updateRelatedStage(invoiceRelated, changedStage);
    if (creationType === 'halfChained') {
      if (stage === 'invoice') {
        const exist = await estimateLean.findOne({ invoiceRelated });
        if (!exist) {
          await deleteManyInvoiceRelated([invoiceRelated]);
        }
      }
      if (stage === 'deliverynote') {
        const exist = await invoiceLean.findOne({ invoiceRelated });
        if (!exist) {
          await deleteManyInvoiceRelated([invoiceRelated]);
        }
      } else if (stage === 'receipt') {
        const exist = await deliveryNoteLean.findOne({ invoiceRelated });
        if (!exist) {
          await deleteManyInvoiceRelated([invoiceRelated]);
        }
      }
    }
  }

  /* if (creationType !== 'solo') {
    await Promise.all([
      estimateMain.deleteOne({ invoiceRelated }),
      invoiceMain.deleteOne({ invoiceRelated }),
      deliveryNoteMain.deleteOne({ invoiceRelated }),
      receiptMain.deleteOne({ invoiceRelated })
    ]);
  }*/
};

const updateRelatedStage = async(id: string, stage: TestimateStage) => {
  const related = await invoiceRelatedMain.findByIdAndUpdate(id);
  if (!related) {
    return false;
  }
  related.stage = stage;
  await related.save();
  return true;
};
