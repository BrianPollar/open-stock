/**
 * Defines the routes for creating, retrieving, updating and deleting receipts.
 * @remarks
 * This file contains the following routes:
 * - POST /create - creates a new receipt
 * - GET /getone/:urId - retrieves a single receipt by its unique identifier (urId)
 * - GET /getall/:offset/:limit - retrieves all receipts with pagination
 * - PUT /deleteone - deletes a single receipt and its related documents
 * - POST /search/:offset/:limit - searches for receipts based on a search term and key
 */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { Icustomrequest, IdataArrayResponse, IinvoiceRelated, Iuser } from '@open-stock/stock-universal';
import {
  makeUrId,
  offsetLimitRelegator,
  requireAuth,
  roleAuthorisation,
  verifyObjectId,
  verifyObjectIds
} from '@open-stock/stock-universal-server';
import express from 'express';
// import { paymentInstallsLean } from '../../models/printables/paymentrelated/paymentsinstalls.model';
import { requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord, userLean } from '@open-stock/stock-auth-server';
import { receiptLean, receiptMain } from '../../models/printables/receipt.model';
import { invoiceRelatedLean } from '../../models/printables/related/invoicerelated.model';
import { makePaymentInstall } from '../paymentrelated/paymentrelated';
import { deleteAllLinked, makeInvoiceRelatedPdct, relegateInvRelatedCreation, updateInvoiceRelated } from './related/invoicerelated';

/**
 * Router for handling receipt routes.
 */
export const receiptRoutes = express.Router();

receiptRoutes.post('/create/:companyIdParam', requireAuth, requireActiveCompany, requireCanUseFeature('receipt'), roleAuthorisation('receipts', 'create'), async(req, res, next) => {
  const { receipt, invoiceRelated } = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectId(queryId);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  receipt.companyId = queryId;
  invoiceRelated.companyId = queryId;
  const count = await receiptMain
  // eslint-disable-next-line @typescript-eslint/naming-convention
    .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
  receipt.urId = makeUrId(Number(count[0]?.urId || '0'));
  const extraNotifDesc = 'Newly created receipt';
  const invoiceRelatedRes = await relegateInvRelatedCreation(invoiceRelated, queryId, extraNotifDesc);
  if (!invoiceRelatedRes.success) {
    return res.status(invoiceRelatedRes.status).send(invoiceRelatedRes);
  }

  receipt.invoiceRelated = invoiceRelatedRes.id;
  await makePaymentInstall(receipt, invoiceRelatedRes.id, queryId);
  // const newReceipt = new receiptMain(receipt);
  /* let errResponse: Isuccess;
  const saved = await newReceipt.save()
    .catch(err => {
      receiptRoutesLogger.error('create - err: ', err);
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
  await updateInvoiceRelated(invoiceRelated);*/
  return next();
}, requireUpdateSubscriptionRecord('receipt'));

receiptRoutes.get('/getone/:urId/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('receipts', 'read'), async(req, res) => {
  const { urId } = req.params;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectId(queryId);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const receipt = await receiptLean
    .findOne({ urId, queryId })
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
  let returned;
  if (receipt) {
    const relateds = makeInvoiceRelatedPdct(
      receipt.invoiceRelated as Required<IinvoiceRelated>,
      (receipt.invoiceRelated as IinvoiceRelated)
        .billingUserId as unknown as Iuser);
    // ensure reciepts are properly being populated
    returned = { ...receipt, ...relateds };
  }
  return res.status(200).send(returned);
});

receiptRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('receipts', 'read'), async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectId(queryId);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const all = await Promise.all([
    receiptLean
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
      }),
    receiptLean.countDocuments({ companyId: queryId })
  ]);
  const returned = all[0]
    .map(val => {
      const related = makeInvoiceRelatedPdct(val.invoiceRelated as Required<IinvoiceRelated>,
      (val.invoiceRelated as IinvoiceRelated)
        .billingUserId as unknown as Iuser);
      return { ...val, ...related };
    });
  const response: IdataArrayResponse = {
    count: all[1],
    data: returned
  };
  return res.status(200).send(response);
});

receiptRoutes.put('/deleteone/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('receipts', 'delete'), async(req, res) => {
  const { id, invoiceRelated, creationType, stage } = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectIds([id, queryId]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const deleted = await deleteAllLinked(invoiceRelated, creationType, stage, 'receipt', queryId);
  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
});

receiptRoutes.post('/search/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('receipts', 'read'), async(req, res) => {
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
    receiptLean
      .find({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
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
      }),
    receiptLean.countDocuments({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
  ]);
  const returned = all[0]
    .map(val => makeInvoiceRelatedPdct(val.invoiceRelated as Required<IinvoiceRelated>,
      (val.invoiceRelated as IinvoiceRelated)
        .billingUserId as unknown as Iuser));
  const response: IdataArrayResponse = {
    count: all[1],
    data: returned
  };
  return res.status(200).send(response);
});

receiptRoutes.put('/update/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('receipts', 'update'), async(req, res) => {
  const { updatedReceipt, invoiceRelated } = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  updatedReceipt.companyId = queryId;
  invoiceRelated.companyId = queryId;
  const isValid = verifyObjectIds([updatedReceipt._id, queryId]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const found = await receiptMain.findOneAndUpdate({ _id: updatedReceipt._id, companyId: queryId });
  if (!found) {
    return res.status(404).send({ success: false, status: 404, err: 'not found' });
  }
  found.paymentMode = updatedReceipt.paymentMode || found.paymentMode;
  let savedErr: string;
  await found.save().catch(err => {
    receiptRoutes.error('save error', err);
    savedErr = err;
    return null;
  });
  if (savedErr) {
    return res.status(500).send({ success: false });
  }
  await updateInvoiceRelated(invoiceRelated, queryId);
  return res.status(200).send({ success: true });
});

receiptRoutes.put('/deletemany/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('receipts', 'delete'), async(req, res) => {
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
  /** await receiptMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .deleteMany({ _id: { $in: ids } });**/
  const promises = credentials
    .map(async val => {
      await deleteAllLinked(val.invoiceRelated, val.creationType, val.stage, 'receipt', queryId);
      return new Promise(resolve => resolve(true));
    });
  await Promise.all(promises);
  return res.status(200).send({ success: true });
});
