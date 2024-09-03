import { user } from '@open-stock/stock-auth-server';
import { createNotifications, getCurrentNotificationSettings } from '@open-stock/stock-notif-server';
import {
  Iactionwithall,
  // Iactionwithall,
  IinvoiceRelated,
  Iitem,
  Imainnotification,
  Ireceipt,
  Isuccess, Iuser,
  TestimateStage,
  TinvoiceType,
  // TnotifType
  TnotifType
} from '@open-stock/stock-universal';
import { addParentToLocals, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { itemMain } from '../../../models/item.model';
import { deliveryNoteLean, deliveryNoteMain } from '../../../models/printables/deliverynote.model';
import { estimateLean, estimateMain } from '../../../models/printables/estimate.model';
import { invoiceLean, invoiceMain } from '../../../models/printables/invoice.model';
import { receiptMain } from '../../../models/printables/receipt.model';
import { invoiceRelatedLean, invoiceRelatedMain } from '../../../models/printables/related/invoicerelated.model';
// import { pesapalNotifRedirectUrl } from '../../../stock-counter-local';

/**
 * Logger for the 'InvoiceRelated' routes.
 */
const invoiceRelatedLogger = tracer.colorConsole({
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
    .findByIdAndUpdate(payment.invoiceRelated);

  if (!related) {
    return { success: false, err: 'invoice related not found' };
  }

  const payments = related.payments || [];

  payments.push(payment._id as string & Ireceipt);
  related.payments = payments;
  const total = await getPaymentsTotal(related.payments as string[]);

  // if is not yet paid update neccesary fields
  if (related.status !== 'paid' && total >= related.total) {
    await updateItemsInventory(related);
    await updateCustomerDueAmount(related.billingUserId, related.total, true);
    related.status = 'paid';
    related.balanceDue = 0;
  }
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
export const updateInvoiceRelated = async(res, invoiceRelated: Required<IinvoiceRelated>, queryId: string): Promise<Isuccess& { id?: string }> => {
  const isValid = verifyObjectId(invoiceRelated.invoiceRelated);

  if (!isValid) {
    return { success: false, status: 401, err: 'unauthourised' };
  }

  // !!
  const related = await invoiceRelatedMain
    .findById(invoiceRelated.invoiceRelated)
    .lean();

  if (!related) {
    return { success: false, err: 'invoice related not found' };
  }

  // start with id
  if (typeof Number(related.billingUserId) !== 'number') {
    related.billingUserId = invoiceRelated.billingUserId || related.billingUserId;
  }

  invoiceRelated = transFormInvoiceRelatedOnStatus(related, invoiceRelated);

  const oldTotal = related.total;
  const oldStatus = related.status;

  let errResponse: Isuccess;
  const saved = await invoiceRelatedMain.updateOne({
    _id: invoiceRelated.invoiceRelated
  }, {
    $set: {
      creationType: invoiceRelated.creationType || related.creationType,
      estimateId: invoiceRelated.estimateId || related.estimateId,
      invoiceId: invoiceRelated.invoiceId || related.invoiceId,
      billingUser: invoiceRelated.billingUser || related.billingUser,
      items: invoiceRelated.items || related.items,
      fromDate: invoiceRelated.fromDate || related.fromDate,
      toDate: invoiceRelated.toDate || related.toDate,
      status: invoiceRelated.status || related.status,
      stage: invoiceRelated.stage || related.stage,
      cost: invoiceRelated.cost || related.cost,
      paymentMade: invoiceRelated.paymentMade || related.paymentMade,
      tax: invoiceRelated.tax || related.tax,
      balanceDue: invoiceRelated.balanceDue || related.balanceDue,
      subTotal: invoiceRelated.subTotal || related.subTotal,
      total: invoiceRelated.total || related.total,
      isDeleted: invoiceRelated.isDeleted || related.isDeleted

    }
  })
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

      return err;
    });

  if (errResponse) {
    return errResponse;
  } else {
    const foundRelated = await invoiceRelatedMain
      .findById(invoiceRelated.invoiceRelated)
      .lean();

    if (oldStatus !== (foundRelated as IinvoiceRelated).status && (foundRelated as IinvoiceRelated).status === 'paid') {
      await updateCustomerDueAmount((foundRelated as IinvoiceRelated).billingUserId, oldTotal, true);
      await updateItemsInventory((foundRelated as IinvoiceRelated));
    } else if ((foundRelated as IinvoiceRelated).status !== 'paid') {
      await updateCustomerDueAmount((foundRelated as IinvoiceRelated).billingUserId, oldTotal, true);
      await updateCustomerDueAmount((foundRelated as IinvoiceRelated).billingUserId, (foundRelated as IinvoiceRelated).total, false);
    }

    addParentToLocals(res, related._id, 'invoicerelateds', 'makeTrackEdit');


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
  res,
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

      return err;
    });

    if (saved && saved._id) {
      addParentToLocals(res, saved._id, 'invoicerelateds', 'makeTrackEdit');
    }

    if (errResponse) {
      return errResponse;
    }

    await updateCustomerDueAmount(newInvRelated.billingUserId, newInvRelated.total, false);

    invoiceRelatedLogger.error('AFTER SAVE');

    let route: string;
    let title = '';
    let notifType: TnotifType;
    const stn = await getCurrentNotificationSettings(queryId) as any;

    if (!bypassNotif && stn?.invoices) {
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
        // url: pesapalNotifRedirectUrl + route,
        url: route,
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
        if (cuser.permissions.invoices) {
          ids.push(cuser._id);
        }
      }

      const notifFilters = { id: { $in: ids } };

      await createNotifications({
        notification,
        filters: notifFilters
      });
    }

    return { success: true, id: (saved as {_id: string})._id };
  } else {
    await updateInvoiceRelated(res, invoiceRelated, queryId);

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
  let names = user.salutation ? user.salutation + ' ' + user.fname + ' ' + user.lname : user.fname + ' ' + user.lname;

  if (user.userDispNameFormat) {
    switch (user.userDispNameFormat) {
      case 'firstLast':
        names = user.salutation ? user.salutation + ' ' + user.fname + ' ' + user.lname : user.fname + ' ' + user.lname;
        break;
      case 'lastFirst':
        names = user.salutation ? user.salutation + ' ' + user.lname + ' ' + user.fname : user.lname + ' ' + user.fname;
        break;
      case 'companyName':
        names = user.companyName;
        break;
    }
  }

  return {
    _id: invoiceRelated._id,
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
    ecommerceSale: invoiceRelated.ecommerceSale,
    ecommerceSalePercentage: invoiceRelated.ecommerceSalePercentage,
    currency: invoiceRelated.currency,
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

  /* const deleted = await invoiceRelatedMain
    .deleteMany({ _id: { $in: ids }, companyId: queryId })
    .catch(err => {
      invoiceRelatedLogger.debug('deleteManyInvoiceRelated - err: ', err);

      return null;
    }); */

  const deleted = await invoiceRelatedMain
    .updateMany({ _id: { $in: ids }, companyId: queryId }, {
      $set: { isDeleted: true }
    })
    .catch(err => {
      invoiceRelatedLogger.debug('deleteManyInvoiceRelated - err: ', err);

      return null;
    });

  let deleted2 = true;

  if (deleted) {
    /* deleted2 = await receiptMain
      .deleteMany({ invoiceRelated: { $in: ids } })
      .catch(err => {
        invoiceRelatedLogger.error('deletemany Pinstalls - err: ', err);

        return null;
      }); */

    deleted2 = await receiptMain
      .updateMany({ invoiceRelated: { $in: ids } }, {
        $set: { isDeleted: true }
      })
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
    /* await estimateMain.deleteOne({ invoiceRelated, companyId: queryId }); */

    await estimateMain.updateOne({ invoiceRelated, companyId: queryId }, {
      $set: { isDeleted: true }
    });
  } else if (from === 'invoice') {
    changedStage = 'estimate';

    /* await invoiceMain.deleteOne({ invoiceRelated, companyId: queryId }); */

    await invoiceMain.updateOne({ invoiceRelated, companyId: queryId }, {
      $set: { isDeleted: true }
    });
  } else if (from === 'deliverynote') {
    /* await deliveryNoteMain.deleteOne({ invoiceRelated, companyId: queryId }); */
    await deliveryNoteMain.updateOne({ invoiceRelated, companyId: queryId }, {
      $set: { isDeleted: true }
    });
    changedStage = 'invoice';
  } else if (from === 'receipt') {
    /* await receiptMain.deleteOne({ invoiceRelated, companyId: queryId }); */
    await receiptMain.updateOne({ invoiceRelated, companyId: queryId }, {
      $set: { isDeleted: true }
    });
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
  } */
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
  const related = await invoiceRelatedMain
    .findOne({ _id: id, companyId: queryId })
    .lean();

  if (!related) {
    return false;
  }
  related.stage = stage;
  await invoiceRelatedMain.updateOne({
    _id: id, companyId: queryId
  }, {
    $set: { stage }
  });

  return true;
};


/**
   * Updates the inventory of items in the invoice related document.
   * If the invoice related document is not found, or if any of the items
   * in the document do not have enough stock, the function returns false.
   * Otherwise it returns true.
   * @param related - The ID of the invoice related document to update,
   *                  or the document itself.
   * @returns A boolean indicating whether the update was successful.
   */
export const updateItemsInventory = async(related: string | IinvoiceRelated) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  let relatedObj: IinvoiceRelated;

  if (typeof related === 'string') {
    relatedObj = await invoiceRelatedMain.findOne({ _id: related }).lean();
    if (!relatedObj) {
      return false;
    }
  } else {
    relatedObj = related;
  }

  const allPromises = relatedObj.items.map(async(item) => {
    const product = await itemMain.findOne({ _id: item });

    if (!product) {
      return false;
    }
    if (product.numbersInstock > 0) {
      product.numbersInstock--; // TODO if sales on e-commerce fail undo this
      product.soldCount++; // TODO if sales on e-commerce fail undo this
      await product.save();
    }

    return true;
  });

  await Promise.all(allPromises);

  return true;
};


export const canMakeReceipt = async(relatedId: string): Promise<boolean> => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const related = await invoiceRelatedMain.findOne({ _id: relatedId });

  if (!related) {
    return false;
  }

  const total = await getPaymentsTotal(related.payments as string[]);

  return total >= related.total;
};


export const getPaymentsTotal = async(payments: string[]) => {
  const paymentsPromises = payments.map(async(payment) => {
    const paymentDoc = await receiptMain.findOne({ _id: payment }).lean().select({ ammountRcievd: 1 });

    if (!paymentDoc) {
      return null;
    }

    return paymentDoc;
  });

  const allPromises = await Promise.all(paymentsPromises);

  return allPromises.reduce((total, payment) => total + payment.ammountRcievd, 0);
};

export const updateCustomerDueAmount = async(userId: string, amount: number, reduce: boolean) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const billingUser = await user.findOne({ _id: userId });

  if (!billingUser) {
    return false;
  }
  if (billingUser.amountDue > 0) {
    if (reduce) {
      if (billingUser.amountDue < amount) {
        billingUser.amountDue = 0;
      } else {
        billingUser.amountDue -= amount;
      }
    } else {
      billingUser.amountDue += amount;
    }
  }
  await billingUser.save();

  return false;
};

export const transFormInvoiceRelatedOnStatus = (oldRelated: IinvoiceRelated, newRelated: IinvoiceRelated) => {
  /* if (newRelated.status === oldRelated.status) {
    return newRelated;
  } */
  if (oldRelated.status === 'paid') {
    // cant change fro paid
    newRelated.status = 'paid';
    newRelated.balanceDue = 0;
  }

  return newRelated as Required<IinvoiceRelated>;
};

