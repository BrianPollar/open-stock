import { populateTrackEdit, populateTrackView, requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord } from '@open-stock/stock-auth-server';
import { IdataArrayResponse, IinvoiceRelated, Isuccess, Iuser, TestimateStage } from '@open-stock/stock-universal';
import { addParentToLocals, makeCompanyBasedQuery, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr } from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import { filter } from 'rxjs';
import * as tracer from 'tracer';
import { estimateLean, estimateMain } from '../../models/printables/estimate.model';
import { invoiceRelatedLean, invoiceRelatedMain } from '../../models/printables/related/invoicerelated.model';
import { populateBillingUser, populateInvoiceRelated, populatePayments } from '../../utils/query';
import { deleteAllLinked, makeInvoiceRelatedPdct, relegateInvRelatedCreation } from './related/invoicerelated';

/** Logger for estimate routes */
const estimateRoutesogger = tracer.colorConsole({
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
    .find({ ...filter, estimateId: { $exists: true, $ne: null } }).sort({ _id: -1 }).limit(1).lean().select({ estimateId: 1 });
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
  res,
  estimateId: number,
  stage: TestimateStage,
  queryId: string,
  invoiceId?: number
) => {
  const estimate = await estimateMain
    .findOne({ estimateId, ...filter })
    .lean();

  if (!estimate) {
    return false;
  }

  let savedErr: string;

  await estimateMain.updateOne({
    estimateId, ...filter
  }, {
    $set: {
      stage,
      invoiceId: invoiceId || (estimate as IinvoiceRelated).invoiceId
    }
  }).catch(err => {
    estimateRoutesogger.error('save error', err);
    savedErr = err;

    return null;
  });
  if (savedErr) {
    return false;
  }

  addParentToLocals(res, estimate._id, estimateLean.collection.collectionName, 'makeTrackEdit');

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
estimateRoutes.post('/create/:companyIdParam', requireAuth, requireActiveCompany, requireCanUseFeature('quotation'), roleAuthorisation('estimates', 'create'), async(req, res, next) => {
  const { estimate, invoiceRelated } = req.body;
  const { filter } = makeCompanyBasedQuery(req);

  estimate.companyId = filter.companyId;
  invoiceRelated.companyId = filter.companyId;
  invoiceRelated.estimateId = await makeEstimateId(filter.companyId);
  const extraNotifDesc = 'Newly created estimate';
  const invoiceRelatedRes = await relegateInvRelatedCreation(res, invoiceRelated, filter.companyId, extraNotifDesc);

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

      return err;
    });

  if (errResponse) {
    return res.status(403).send(errResponse);
  }

  if (saved && saved._id) {
    addParentToLocals(res, saved._id, estimateLean.collection.collectionName, 'makeTrackEdit');
  }

  return next();
}, requireUpdateSubscriptionRecord('quotation'));

/**
 * Gets an estimate and its associated invoice related object by estimate ID.
 * @param req The request object.
 * @param res The response object.
 * @returns The invoice related object associated with the estimate.
 */
estimateRoutes.get('/getone/:estimateId/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('estimates', 'read'), async(req, res) => {
  const { estimateId } = req.params;
  const { filter } = makeCompanyBasedQuery(req);
  const invoiceRelated = await invoiceRelatedLean
    .findOne({ estimateId, ...filter })
    .lean()
    .populate([populatePayments(), populateBillingUser(), populateTrackEdit(), populateTrackView()]);
  let returned;

  if (invoiceRelated) {
    returned = makeInvoiceRelatedPdct(
      invoiceRelated as Required<IinvoiceRelated>,
        (invoiceRelated as IinvoiceRelated)
          .billingUserId as unknown as Iuser
    );

    // addParentToLocals(res, invoiceRelated._id, estimateLean.collection.collectionName, 'trackDataView'); // TODO
  }

  return res.status(200).send(returned);
});

/**
 * Gets all estimates and their associated invoice related objects.
 * @param req The request object.
 * @param res The response object.
 * @returns An array of invoice related objects associated with the estimates.
 */
estimateRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('estimates', 'read'), async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const { filter } = makeCompanyBasedQuery(req);
  const all = await Promise.all([
    estimateLean
      .find(filter)
      .skip(offset)
      .limit(limit)
      .lean()
      .populate([populateInvoiceRelated(), populateTrackEdit(), populateTrackView()]),
    estimateLean.countDocuments(filter)
  ]);

  const returned = all[0]
    .map(val => makeInvoiceRelatedPdct(
      val.invoiceRelated as Required<IinvoiceRelated>,
      (val.invoiceRelated as IinvoiceRelated)
        .billingUserId as unknown as Iuser,
      null,
      {
        _id: val._id
      }
    ));
  const response: IdataArrayResponse = {
    count: all[1],
    data: returned
  };

  for (const val of all[0]) {
    addParentToLocals(res, val._id, estimateLean.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(response);
});

/**
 * Deletes an estimate and its associated invoice related object.
 * @param req The request object.
 * @param res The response object.
 * @returns A success object with a boolean indicating whether the operation was successful.
 */
estimateRoutes.put('/deleteone/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('estimates', 'delete'), async(req, res) => {
  const { id, invoiceRelated, creationType, stage } = req.body;
  const { filter } = makeCompanyBasedQuery(req);
  const deleted = await deleteAllLinked(invoiceRelated, creationType, stage, 'estimate', filter.companyId);

  if (Boolean(deleted)) {
    addParentToLocals(res, id, estimateLean.collection.collectionName, 'trackDataDelete');

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
estimateRoutes.post('/search/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('estimates', 'read'), async(req, res) => {
  const { searchterm, searchKey } = req.body;
  const { filter } = makeCompanyBasedQuery(req);
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const all = await Promise.all([
    estimateLean
      .find({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
      .skip(offset)
      .limit(limit)
      .lean()
      .populate([populateInvoiceRelated(), populateTrackEdit(), populateTrackView()]),
    estimateLean.countDocuments({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
  ]);
  const returned = all[0]
    .map(val => makeInvoiceRelatedPdct(
val.invoiceRelated as Required<IinvoiceRelated>,
      (val.invoiceRelated as IinvoiceRelated)
        .billingUserId as unknown as Iuser
    ));
  const response: IdataArrayResponse = {
    count: all[1],
    data: returned
  };

  for (const val of all[0]) {
    addParentToLocals(res, val._id, estimateLean.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(response);
});

estimateRoutes.put('/deletemany/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('estimates', 'delete'), async(req, res) => {
  const { credentials } = req.body;
  const { filter } = makeCompanyBasedQuery(req);

  if (!credentials || credentials?.length < 1) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  /** await estimateMain
    .deleteMany({ _id: { $in: ids } });**/
  const promises = credentials
    .map(async val => {
      await deleteAllLinked(val.invoiceRelated, val.creationType, val.stage, 'estimate', filter.companyId);

      return new Promise(resolve => resolve(true));
    });

  await Promise.all(promises);

  for (const val of credentials) {
    addParentToLocals(res, val.id, estimateLean.collection.collectionName, 'trackDataDelete');
  }

  return res.status(200).send({ success: true });
});

