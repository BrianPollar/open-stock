import express from 'express';
import { Icustomrequest, IinvoiceRelated, Isuccess, Iuser, TestimateStage } from '@open-stock/stock-universal';
import { offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectIds } from '@open-stock/stock-universal-server';
import { estimateLean, estimateMain } from '../../models/printables/estimate.model';
import { invoiceRelatedLean, invoiceRelatedMain } from '../../models/printables/related/invoicerelated.model';
import { deleteAllLinked, makeInvoiceRelatedPdct, relegateInvRelatedCreation } from './related/invoicerelated';
import { getLogger } from 'log4js';
import { userLean } from '@open-stock/stock-auth-server';
import { receiptLean } from '../../models/printables/receipt.model';

/** Logger for estimate routes */
const estimateRoutesogger = getLogger('routes/estimateRoutes');

/**
 * Generates a new estimate ID by finding the highest existing estimate ID and incrementing it by 1.
 * @returns The new estimate ID.
 */
/**
 * Generates a new estimate ID based on the given query ID.
 * @param queryId The query ID used to filter the invoices.
 * @returns The new estimate ID.
 */
const makeEstimateId = async(queryId: string) => {
  const count = await invoiceRelatedMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .find({ companyId: queryId, estimateId: { $exists: true, $ne: null } }).sort({ _id: -1 }).limit(1).lean().select({ estimateId: 1 });
  let incCount = count[0]?.estimateId || 0;
  return ++incCount;
};

/**
 * Updates the estimate with the specified ID and sets the stage and invoice ID.
 * @param estimateId - The ID of the estimate to update.
 * @param stage - The stage to set for the estimate.
 * @param queryId - The query ID associated with the estimate.
 * @param invoiceId - The invoice ID to set for the estimate (optional).
 * @returns A boolean indicating whether the estimate was successfully updated.
 */
export const updateEstimateUniv = async(
  estimateId: number,
  stage: TestimateStage,
  queryId: string,
  invoiceId?: number) => {
  const estimate = await estimateMain
    .findOneAndUpdate({ estimateId, companyId: queryId });
  if (!estimate) {
    return false;
  }
  if (invoiceId) {
    (estimate as IinvoiceRelated).invoiceId = invoiceId;
  }
  (estimate as IinvoiceRelated).stage = stage;
  await estimate.save();
  return true;
};

/** Router for estimate routes */
export const estimateRoutes = express.Router();

/**
 * Creates a new estimate and invoice related object.
 * @param req The request object.
 * @param res The response object.
 * @returns A success object with a boolean indicating whether the operation was successful.
 */
estimateRoutes.post('/create/:companyIdParam', requireAuth, roleAuthorisation('printables', 'create'), async(req, res) => {
  const { estimate, invoiceRelated } = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  estimate.companyId = queryId;
  invoiceRelated.companyId = queryId;
  invoiceRelated.estimateId = await makeEstimateId(companyId);
  const extraNotifDesc = 'Newly created estimate';
  const invoiceRelatedRes = await relegateInvRelatedCreation(invoiceRelated, extraNotifDesc, companyId);
  if (!invoiceRelatedRes.success) {
    return res.status(invoiceRelatedRes.status).send(invoiceRelatedRes);
  }
  estimate.invoiceRelated = invoiceRelatedRes.id;
  const newEstimate = new estimateMain(estimate);
  let errResponse: Isuccess;
  /**
   * Saves a new estimate and returns a response object.
   * @param {Estimate} newEstimate - The new estimate to be saved.
   * @returns {Promise<{success: boolean, status: number, err?: string}>} - A promise that resolves to an object with success, status, and err properties.
   */
  const saved = await newEstimate.save()
    .catch(err => {
      estimateRoutesogger.error('create - err: ', err);
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
  return res.status(200).send({ success: Boolean(saved) });
});

/**
 * Gets an estimate and its associated invoice related object by estimate ID.
 * @param req The request object.
 * @param res The response object.
 * @returns The invoice related object associated with the estimate.
 */
estimateRoutes.get('/getone/:estimateId/:companyIdParam', requireAuth, roleAuthorisation('printables', 'read'), async(req, res) => {
  const { estimateId } = req.params;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  estimateId.companyId = queryId;
  const invoiceRelated = await invoiceRelatedLean
    .findOne({ estimateId, companyId: queryId })
    .lean()
    .populate({ path: 'billingUserId', model: userLean })
    .populate({ path: 'payments', model: receiptLean });
  let returned;
  if (invoiceRelated) {
    returned = makeInvoiceRelatedPdct(
      invoiceRelated as Required<IinvoiceRelated>,
        (invoiceRelated as IinvoiceRelated)
          .billingUserId as unknown as Iuser);
  }
  return res.status(200).send(returned);
});

/**
 * Gets all estimates and their associated invoice related objects.
 * @param req The request object.
 * @param res The response object.
 * @returns An array of invoice related objects associated with the estimates.
 */
estimateRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, roleAuthorisation('printables', 'read'), async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const estimates = await estimateLean
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
  const returned = estimates
    .map(val => makeInvoiceRelatedPdct(val.invoiceRelated as Required<IinvoiceRelated>,
      (val.invoiceRelated as IinvoiceRelated)
        .billingUserId as unknown as Iuser));
  return res.status(200).send(returned);
});

/**
 * Deletes an estimate and its associated invoice related object.
 * @param req The request object.
 * @param res The response object.
 * @returns A success object with a boolean indicating whether the operation was successful.
 */
estimateRoutes.put('/deleteone/:companyIdParam', requireAuth, async(req, res) => {
  const { id, invoiceRelated, creationType, stage } = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectIds([id, queryId]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const deleted = await deleteAllLinked(invoiceRelated, creationType, stage, 'estimate', companyId);
  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
});

/**
 * Searches for estimates by a given search term and search key.
 * @param req The request object.
 * @param res The response object.
 * @returns An array of invoice related objects associated with the matching estimates.
 */
estimateRoutes.post('/search/:limit/:offset/:companyIdParam', requireAuth, roleAuthorisation('printables', 'read'), async(req, res) => {
  const { searchterm, searchKey } = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const estimates = await estimateLean
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
  const returned = estimates
    .map(val => makeInvoiceRelatedPdct(val.invoiceRelated as Required<IinvoiceRelated>,
      (val.invoiceRelated as IinvoiceRelated)
        .billingUserId as unknown as Iuser));
  return res.status(200).send(returned);
});

estimateRoutes.put('/deletemany/:companyIdParam', requireAuth, roleAuthorisation('printables', 'delete'), async(req, res) => {
  const { credentials } = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  if (!credentials || credentials?.length < 1) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  /** await estimateMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .deleteMany({ _id: { $in: ids } });**/
  const promises = credentials
    .map(async val => {
      await deleteAllLinked(val.invoiceRelated, val.creationType, val.stage, 'estimate', queryId);
      return new Promise(resolve => resolve(true));
    });
  await Promise.all(promises);
  return res.status(200).send({ success: true });
});

