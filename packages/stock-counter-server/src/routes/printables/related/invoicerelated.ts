import { user } from '@open-stock/stock-auth-server';
import { getCurrentNotificationSettings } from '@open-stock/stock-notif-server';
import {
  // Iactionwithall,
  IinvoiceRelated,
  Iitem,
  Ireceipt,
  Isuccess,
  Iuser,
  TestimateStage,
  TinvoiceType
  // TnotifType
} from '@open-stock/stock-universal';
import { stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import { getLogger } from 'log4js';
import { deliveryNoteLean, deliveryNoteMain } from '../../../models/printables/deliverynote.model';
import { estimateLean, estimateMain } from '../../../models/printables/estimate.model';
import { invoiceLean, invoiceMain } from '../../../models/printables/invoice.model';
import { receiptMain } from '../../../models/printables/receipt.model';
import { invoiceRelatedLean, invoiceRelatedMain } from '../../../models/printables/related/invoicerelated.model';
// import { pesapalNotifRedirectUrl } from '../../../stock-counter-local';

/**
 * Logger for the 'InvoiceRelated' routes.
 */
const invoiceRelatedLogger = getLogger('routes/InvoiceRelated');

/**
 * Updates the payments related to an invoice.
 *
 * @param payment - The payment object to be added.
 * @param queryId - The ID of the company.
 * @returns A promise that resolves to an object containing the success status and the ID of the saved payment.
 */
export const updateInvoiceRelatedPayments = async(payment: Ireceipt, queryId: string): Promise<Isuccess & { id?: string }> => {
  const isValid = verifyObjectId(payment.invoiceRelated);
  if (!isValid) {
    return { success: false, status: 401, err: 'unauthourised' };
  }

  const related = await invoiceRelatedMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .findOneAndUpdate({ _id: payment.invoiceRelated, companyId: queryId });
  if (!related) {
    return { success: false, err: 'invoice related not found' };
  }

  const payments = related.payments || [];
  payments.push(payment._id as string & Ireceipt);
  related.payments = payments;
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
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return { success: true, id: (saved as { _id: string})._id };
  }
};

/**
 * Updates an invoice related document.
 * @param invoiceRelated - The updated invoice related document.
 * @returns A promise that resolves with a success status and an optional ID.
 */
/**
 * Updates the invoice related information.
 * @param invoiceRelated - The updated invoice related data.
 * @param queryId - The query ID.
 * @returns A promise that resolves to an object containing the success status and the updated invoice related ID.
 */
export const updateInvoiceRelated = async(invoiceRelated: Required<IinvoiceRelated>, queryId: string): Promise<Isuccess& { id?: string }> => {
  const isValid = verifyObjectId(invoiceRelated.invoiceRelated);
  if (!isValid) {
    return { success: false, status: 401, err: 'unauthourised' };
  }

  const related = await invoiceRelatedMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .findOneAndUpdate({ _id: invoiceRelated.invoiceRelated, companyId: queryId });
  if (!related) {
    return { success: false, err: 'invoice related not found' };
  }

  // start with id
  if (typeof Number(related.billingUserId) !== 'number') {
    related.billingUserId = invoiceRelated.billingUserId || related.billingUserId;
  }

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
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return { success: true, id: (saved as unknown as { _id: string})._id };
  }
};

/**
 * Relocates an invoice related document.
 * @param invoiceRelated - The invoice related document to relocate.
 * @param extraNotifDesc - A description for the notification.
 * @param localMailHandler - The email handler to use for sending notifications.
 * @param bypassNotif - Whether to bypass sending notifications.
 * @returns A promise that resolves with a success status and an optional ID.
 */
export const relegateInvRelatedCreation = async(
  invoiceRelated: Required<IinvoiceRelated>,
  queryId: string,
  extraNotifDesc: string,
  bypassNotif = false
): Promise<Isuccess & { id?: string }> => {
  invoiceRelatedLogger.debug('relegateInvRelatedCreation - invoiceRelated', invoiceRelated);
  invoiceRelated.companyId = queryId;
  const isValid = verifyObjectId(invoiceRelated.invoiceRelated);
  let found;
  if (isValid) {
    found = await invoiceRelatedLean
      .findById(invoiceRelated.invoiceRelated).lean().select({ urId: 1 });
  }

  if (!found || invoiceRelated.creationType === 'solo') {
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

    /* let route: string;
    let title = '';
    let notifType: TnotifType;*/
    const stn = await getCurrentNotificationSettings();

    if (!bypassNotif && stn.invoices) {
      /* switch (invoiceRelated.stage) {
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
      }*/
      /* const actions: Iactionwithall[] = [{
        operation: 'view',
        url: pesapalNotifRedirectUrl + route,
        action: '',
        title
      }];*

      /* const notification: Imainnotification = {
        actions,
        userId: invoiceRelated.billingUserId,
        title,
        body: extraNotifDesc,
        icon: '',
        notifType,
        // photo: string;
        expireAt: '200000'
      };*/

      const capableUsers = await user.find({})
        .lean().select({ permissions: 1 });
      const ids: string[] = [];

      for (const cuser of capableUsers) {
        if (cuser.permissions.invoices) {
          ids.push(cuser._id);
        }
      }

      // const notifFilters = { id: { $in: ids } };
      /* await createNotifications({
        options: notification,
        filters: notifFilters
      });*/
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    return { success: true, id: (saved as {_id: string})._id };
  } else {
    await updateInvoiceRelated(invoiceRelated, queryId);
    return { success: true, id: invoiceRelated.invoiceRelated };
  }
};

// eslint-disable-next-line @typescript-eslint/no-shadow

/**
 * Creates an invoice related product based on the provided data.
 * @param invoiceRelated - The required invoice related data.
 * @param user - The user data.
 * @param createdAt - The optional creation date.
 * @param extras - Additional properties to include in the invoice related product.
 * @returns The created invoice related product.
 */
export const makeInvoiceRelatedPdct = (invoiceRelated: Required<IinvoiceRelated>, user: Iuser, createdAt?: Date, extras = {}) => {
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
    companyId: invoiceRelated.companyId,
    invoiceRelated: invoiceRelated._id,
    creationType: invoiceRelated.creationType,
    invoiceId: invoiceRelated.invoiceId,
    estimateId: invoiceRelated.estimateId,
    billingUser: names,
    extraCompanyDetails: user.extraCompanyDetails,
    items: invoiceRelated.items.map(pdct => {
      if (typeof pdct.item === 'string' || !pdct.item) {
        return pdct;
      } else {
        return {
          amount: pdct.amount,
          quantity: pdct.amount,
          rate: pdct.rate,
          itemName: (pdct.item as Iitem).name,
          item: (pdct.item as Iitem)._id
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
    billingUserPhoto: user.profilePic,
    createdAt: createdAt || invoiceRelated.createdAt,
    payments: invoiceRelated.payments,
    ...extras
  };
};


/**
 * Deletes multiple invoice-related documents.
 * @param companyId - The ID of the company
   * @param ids - An array of string IDs representing the documents to be deleted.
 * @param queryId - The ID of the company associated with the documents.
 * @returns A promise that resolves to an object indicating the success status and any error information.
 */
export const deleteManyInvoiceRelated = async(ids: string[], queryId: string) => {
  const isValid = verifyObjectIds([...ids, ...[queryId]]);
  if (!isValid) {
    return { success: false, statu: 401, err: 'unauthourised' };
  }

  const deleted = await invoiceRelatedMain
  // eslint-disable-next-line @typescript-eslint/naming-convention
    .deleteMany({ _id: { $in: ids }, companyId: queryId })
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


/**
 * Deletes all linked documents based on the provided parameters.
 *
 * @param invoiceRelated - The identifier of the related invoice.
 * @param creationType - The type of creation (solo, chained, halfChained).
 * @param stage - The current stage of the document.
 * @param from - The previous stage of the document.
 * @param queryId - The identifier of the query.
 * @returns A promise that resolves to an object indicating the success of the deletion operation.
 */
export const deleteAllLinked = async(invoiceRelated: string, creationType: TinvoiceType, stage: TestimateStage, from: TestimateStage, queryId: string) => {
  if (stage !== from) {
    return { success: false, err: 'cant make delete now, ' + stage + 'is linked some where else' };
  }

  let changedStage: TestimateStage;

  if (from === 'estimate') {
    await estimateMain.deleteOne({ invoiceRelated, companyId: queryId });
  } else if (from === 'invoice') {
    changedStage = 'estimate';
    await invoiceMain.deleteOne({ invoiceRelated, companyId: queryId });
  } else if (from === 'deliverynote') {
    await deliveryNoteMain.deleteOne({ invoiceRelated, companyId: queryId });
    changedStage = 'invoice';
  } else if (from === 'receipt') {
    await receiptMain.deleteOne({ invoiceRelated, companyId: queryId });
    changedStage = 'deliverynote';
  }

  let response: Isuccess = {
    success: false,
    err: 'cant make delete now, ' + stage + 'is linked some where else'
  };

  if (creationType === 'solo' || (creationType === 'chained' && stage === 'estimate')) {
    response = await deleteManyInvoiceRelated([invoiceRelated], queryId);
  } else {
    await updateRelatedStage(invoiceRelated, changedStage, queryId);
    if (creationType === 'halfChained') {
      if (stage === 'invoice') {
        const exist = await estimateLean.findOne({ invoiceRelated });
        if (!exist) {
          response = await deleteManyInvoiceRelated([invoiceRelated], queryId);
        }
      }
      if (stage === 'deliverynote') {
        const exist = await invoiceLean.findOne({ invoiceRelated });
        if (!exist) {
          response = await deleteManyInvoiceRelated([invoiceRelated], queryId);
        }
      } else if (stage === 'receipt') {
        const exist = await deliveryNoteLean.findOne({ invoiceRelated });
        if (!exist) {
          response = await deleteManyInvoiceRelated([invoiceRelated], queryId);
        }
      }
    }
  }

  return response;

  /* if (creationType !== 'solo') {
    await Promise.all([
      estimateMain.deleteOne({ invoiceRelated }),
      invoiceMain.deleteOne({ invoiceRelated }),
      deliveryNoteMain.deleteOne({ invoiceRelated }),
      receiptMain.deleteOne({ invoiceRelated })
    ]);
  }*/
};

/**
 * Updates the stage of a related invoice.
 * @param id - The ID of the invoice related document.
 * @param stage - The new stage value to set.
 * @param queryId - The ID of the company to query.
 * @returns A boolean indicating whether the update was successful.
 */
const updateRelatedStage = async(id: string, stage: TestimateStage, queryId: string) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const related = await invoiceRelatedMain.findOneAndUpdate({ _id: id, companyId: queryId });
  if (!related) {
    return false;
  }
  related.stage = stage;
  await related.save();
  return true;
};
