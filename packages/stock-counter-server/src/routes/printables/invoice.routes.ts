import express from 'express';
import { Icustomrequest, Iinvoice, IinvoiceRelated, Ireceipt, Isuccess, Iuser } from '@open-stock/stock-universal';
import { makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import { invoiceLean, invoiceMain } from '../../models/printables/invoice.model';
import { invoiceRelatedLean, invoiceRelatedMain } from '../../models/printables/related/invoicerelated.model';
import {
  deleteAllLinked,
  makeInvoiceRelatedPdct,
  relegateInvRelatedCreation, updateInvoiceRelated, updateInvoiceRelatedPayments
} from './related/invoicerelated';
import { getLogger } from 'log4js';
import { userLean } from '@open-stock/stock-auth-server';
import { receiptLean, receiptMain } from '../../models/printables/receipt.model';

/** Logger for invoice routes */
const invoiceRoutesLogger = getLogger('routes/invoiceRoutes');

/**
 * Generates a new invoice ID based on the given query ID.
 * @param queryId The query ID used to generate the invoice ID.
 * @returns A Promise that resolves to the generated invoice ID.
 */
const makeinvoiceId = async(queryId: string): Promise<number> => {
  const count = await invoiceRelatedMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .find({ companyId: queryId, invoiceId: { $exists: true, $ne: null } }).sort({ _id: -1 }).limit(1).lean().select({ invoiceId: 1 });
  let incCount = count[0]?.invoiceId || 0;
  return ++incCount;
};

/**
 * Saves an invoice along with its related information.
 * @param invoice - The invoice to be saved.
 * @param invoiceRelated - The related information of the invoice.
 * @param queryId - The ID of the company associated with the invoice.
 * @returns A promise that resolves to an object containing the success status,
 *          the ID of the saved invoice, and the ID of the related information.
 */
export const saveInvoice = async(
  invoice: Iinvoice,
  invoiceRelated: Required<IinvoiceRelated>,
  queryId: string
): Promise<Isuccess & { id?: string; invoiceRelatedId?: string }> => {
  invoice.companyId = queryId;
  invoiceRelated.companyId = queryId;
  invoiceRelated.invoiceId = await makeinvoiceId(queryId);
  const extraNotifDesc = 'Newly created invoice';
  const relatedId = await relegateInvRelatedCreation(invoiceRelated, extraNotifDesc, queryId);
  if (!relatedId.success) {
    return relatedId;
  }

  invoice.invoiceRelated = relatedId.id;
  invoice.companyId = queryId;
  const newInvoice = new invoiceMain(invoice);
  let errResponse: Isuccess;
  const saved = await newInvoice.save()
    .catch(err => {
      invoiceRoutesLogger.error('create - err: ', err);
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
      ...errResponse
    };
  }
  // await updateInvoiceRelated(invoiceRelated); // !! WHY CALL THIS
  // eslint-disable-next-line @typescript-eslint/naming-convention
  return { success: true, status: 200, id: (saved as {_id: string})._id, invoiceRelatedId: relatedId.id };
};

/**
 * Router for handling invoice routes.
 */
export const invoiceRoutes = express.Router();

/**
 * Endpoint for creating a new invoice.
 * @param req - The request object.
 * @param res - The response object.
 * @returns A response indicating the success status of the operation.
 */
invoiceRoutes.post('/create/:companyIdParam', requireAuth, roleAuthorisation('printables', 'create'), async(req, res) => {
  const { invoice, invoiceRelated } = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  invoice.companyId = queryId;
  invoiceRelated.companyId = queryId;
  const response = await saveInvoice(invoice, invoiceRelated, queryId);

  return res.status(response.status).send({ success: response.success });
});

/**
 * Endpoint for updating an existing invoice.
 * @param req - The request object.
 * @param res - The response object.
 * @returns A response indicating the success status of the operation.
 */
invoiceRoutes.put('/update/:companyIdParam', requireAuth, roleAuthorisation('printables', 'update'), async(req, res) => {
  const { updatedInvoice, invoiceRelated } = req.body.invoice;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  updatedInvoice.companyId = queryId;
  invoiceRelated.companyId = queryId;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { _id } = updatedInvoice;
  const isValid = verifyObjectIds([_id, queryId]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const invoice = await invoiceMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .findOneAndUpdate({ _id, companyId: queryId });
  if (!invoice) {
    return res.status(404).send({ success: false });
  }
  invoice.dueDate = updatedInvoice.dueDate || invoice.dueDate;
  await updateInvoiceRelated(invoiceRelated, queryId);
  let errResponse: Isuccess;
  const updated = await invoice.save()
    .catch(err => {
      invoiceRoutesLogger.error('update - err: ', err);
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
 * Endpoint for retrieving a single invoice by ID.
 * @param req - The request object.
 * @param res - The response object.
 * @returns A response containing the requested invoice and its related information.
 */
invoiceRoutes.get('/getone/:invoiceId/:companyIdParam', requireAuth, roleAuthorisation('printables', 'read'), async(req, res) => {
  const { invoiceId } = req.params;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const invoiceRelated = await invoiceRelatedLean
    .findOne({ invoiceId, companyId: queryId })
    .lean()
    .populate({ path: 'billingUserId', model: userLean })
    .populate({ path: 'payments', model: invoiceRelatedLean });
  let returned;
  if (invoiceRelated) {
    returned = makeInvoiceRelatedPdct(
      invoiceRelated as Required<IinvoiceRelated>,
      (invoiceRelated as IinvoiceRelated)
        .billingUserId as unknown as Iuser);
  }
  return res.status(200).send(returned);
});


invoiceRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, roleAuthorisation('printables', 'read'), async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const invoices = await invoiceLean
    .find({ companyId: queryId })
    .skip(offset)
    .limit(limit)
    .lean()
    .populate({
      path: 'invoiceRelated', model: invoiceRelatedLean,
      populate: [{
        path: 'billingUserId', model: userLean
      },
      {
        path: 'payments', model: receiptLean
      }]
    });
  const returned = invoices
    .map(val => makeInvoiceRelatedPdct(val.invoiceRelated as Required<IinvoiceRelated>,
      (val.invoiceRelated as IinvoiceRelated)
        .billingUserId as unknown as Iuser));
  return res.status(200).send(returned);
});

invoiceRoutes.put('/deleteone/:companyIdParam', requireAuth, roleAuthorisation('printables', 'delete'), async(req, res) => {
  const { id, invoiceRelated, creationType, stage } = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectIds([id, queryId]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const deleted = await deleteAllLinked(invoiceRelated, creationType, stage, 'invoice', queryId);
  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
});

invoiceRoutes.post('/search/:limit/:offset/:companyIdParam', requireAuth, roleAuthorisation('printables', 'read'), async(req, res) => {
  const { searchterm, searchKey } = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const invoices = await invoiceLean
    .find({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
    .lean()
    .skip(offset)
    .limit(limit)
    .populate({
      path: 'invoiceRelated', model: invoiceRelatedLean,
      populate: [{
        path: 'billingUserId', model: userLean
      },
      {
        path: 'payments', model: receiptLean
      }]
    });
  const returned = invoices
    .map(val => makeInvoiceRelatedPdct(val.invoiceRelated as Required<IinvoiceRelated>,
      (val.invoiceRelated as IinvoiceRelated)
        .billingUserId as unknown as Iuser));
  return res.status(200).send(returned);
});

invoiceRoutes.put('/deletemany/:companyIdParam', requireAuth, roleAuthorisation('printables', 'delete'), async(req, res) => {
  const { credentials } = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  if (!credentials || credentials?.length < 1) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  /** await invoiceMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .deleteMany({ _id: { $in: ids } });**/
  const promises = credentials
    .map(async val => {
      await deleteAllLinked(val.invoiceRelated, val.creationType, val.stage, 'invoice', queryId);
      return new Promise(resolve => resolve(true));
    });
  await Promise.all(promises);
  return res.status(200).send({ success: true });
});

// payments
invoiceRoutes.post('/createpayment/:companyIdParam', requireAuth, roleAuthorisation('printables', 'create'), async(req, res) => {
  const pay = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  pay.companyId = queryId;
  const count = await receiptLean
  // eslint-disable-next-line @typescript-eslint/naming-convention
    .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
  pay.urId = makeUrId(Number(count[0]?.urId || '0'));

  const newInvoicePaym = new receiptMain(pay);
  let errResponse: Isuccess;
  const saved = await newInvoicePaym.save().catch(err => {
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

  await updateInvoiceRelatedPayments(saved as unknown as Ireceipt, queryId);
  return res.status(200).send({ success: true });
});

invoiceRoutes.put('/updatepayment/:companyIdParam', requireAuth, roleAuthorisation('printables', 'update'), async(req, res) => {
  const pay = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  pay.companyId = queryId;
  const isValid = verifyObjectId(pay._id);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const foundPay = await receiptMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .findByIdAndUpdate(pay._id);
  if (!foundPay) {
    return res.status(404).send({ success: false });
  }
  foundPay.amount = pay.amount || foundPay.amount;
  let errResponse: Isuccess;
  await foundPay.save().catch(err => {
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

invoiceRoutes.get('/getonepayment/:urId/:companyIdParam', requireAuth, roleAuthorisation('printables', 'read'), async(req, res) => {
  const { urId } = req.params;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const invoicePay = await receiptLean
    .findOne({ urId, queryId })
    .lean();
  return res.status(200).send(invoicePay);
});

invoiceRoutes.get('/getallpayments/:companyIdParam', requireAuth, roleAuthorisation('printables', 'read'), async(req, res) => {
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const invoicePays = await receiptLean
    .find({ companyId: queryId })
    .lean();
  return res.status(200).send(invoicePays);
});

invoiceRoutes.put('/deleteonepayment/:companyIdParam', requireAuth, roleAuthorisation('printables', 'delete'), async(req, res) => {
  const { id, invoiceRelated, creationType, stage } = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectIds([id, queryId]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const deleted = await deleteAllLinked(invoiceRelated, creationType, stage, 'invoice', queryId);
  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
});

invoiceRoutes.put('/deletemanypayments/:companyIdParam', requireAuth, roleAuthorisation('printables', 'delete'), async(req, res) => {
  const { ids } = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectIds([...ids, ...[queryId]]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const deleted = await receiptMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .deleteMany({ _id: { $in: ids }, companyId: queryId })
    .catch(err => {
      invoiceRoutesLogger.error('deletemanypayments - err: ', err);
      return null;
    });
  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
  }
});
