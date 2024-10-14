import {
  populateTrackEdit, populateTrackView, requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord
} from '@open-stock/stock-auth-server';
import {
  IcustomRequest, IdataArrayResponse,
  IdeleteMany,
  IdeleteOne,
  Iestimate, IfilterAggResponse, IfilterProps, IinvoiceRelated, Iuser, TestimateStage
} from '@open-stock/stock-universal';
import {
  addParentToLocals, constructFiltersFromBody,
  generateUrId,
  handleMongooseErr, lookupSubFieldInvoiceRelatedFilter, makeCompanyBasedQuery,
  offsetLimitRelegator, requireAuth, roleAuthorisation, verifyObjectId
} from '@open-stock/stock-universal-server';
import express from 'express';
import { Error } from 'mongoose';
import { Testimate, estimateLean, estimateMain } from '../../models/printables/estimate.model';
import { invoiceRelatedMain } from '../../models/printables/related/invoicerelated.model';
import { populateInvoiceRelated } from '../../utils/query';
import { deleteAllLinked, makeInvoiceRelatedPdct, relegateInvRelatedCreation } from './related/invoicerelated';

/**
 * Generates a new estimate ID by finding the highest existing estimate ID and incrementing it by 1.
 * @returns The new estimate ID.
 */
/**
 * Generates a new estimate ID based on the given query ID.
 * @param companyId The query ID used to filter the invoices.
 * @returns The new estimate ID.
 */
const makeEstimateId = async(companyId: string) => {
  const count = await invoiceRelatedMain
    .find({ companyId, estimateId: { $exists: true, $ne: null } })
    .sort({ _id: -1 }).limit(1).lean().select({ estimateId: 1 });
  let incCount = count[0]?.estimateId || 0;

  return ++incCount;
};

export const updateEstimateUniv = async(
  res,
  estimateId: number,
  stage: TestimateStage,
  companyId: string
) => {
  const estimate = await estimateMain
    .findOne({ estimateId, companyId })
    .lean();

  if (!estimate) {
    return false;
  }

  const updateRes = await estimateMain.updateOne({
    estimateId, companyId
  }, {
    $set: {
      stage
      // invoiceId: invoiceId || (estimate as IinvoiceRelated).invoiceId // TODO
    }
  }).catch((err: Error) => err);

  if (updateRes instanceof Error) {
    handleMongooseErr(updateRes);

    return false;
  }

  addParentToLocals(res, estimate._id, estimateLean.collection.collectionName, 'makeTrackEdit');

  return true;
};

/** Router for estimate routes */
export const estimateRoutes = express.Router();

estimateRoutes.post(
  '/add',
  requireAuth,
  requireActiveCompany,
  requireCanUseFeature('quotation'),
  roleAuthorisation('estimates', 'create'),
  async(req: IcustomRequest<never, { estimate: Iestimate; invoiceRelated: Required<IinvoiceRelated> }>, res, next) => {
    const { estimate, invoiceRelated } = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    estimate.companyId = filter.companyId;
    estimate.urId = await generateUrId(estimateMain);
    invoiceRelated.companyId = filter.companyId;
    invoiceRelated.estimateId = await makeEstimateId(filter.companyId);
    const extraNotifDesc = 'Newly created estimate';
    const invoiceRelatedRes = await relegateInvRelatedCreation(res, invoiceRelated, filter.companyId, extraNotifDesc);

    if (!invoiceRelatedRes.success) {
      return res.status(invoiceRelatedRes.status || 403).send(invoiceRelatedRes);
    }
    estimate.invoiceRelated = invoiceRelatedRes._id;
    const newEstimate = new estimateMain(estimate);


    /**
   * Saves a new estimate and returns a response object.
   * @param {Estimate} newEstimate - The new estimate to be saved.
   * @returns {Promise<{success: boolean, status: number, err?: string}>} - A promise that
   * resolves to an object with success, status, and err properties.
   */
    const savedRes = await newEstimate.save()
      .catch((err: Error) => err);

    if (savedRes instanceof Error) {
      const errResponse = handleMongooseErr(savedRes);

      return res.status(errResponse.status).send(errResponse);
    }

    addParentToLocals(res, savedRes._id, estimateLean.collection.collectionName, 'makeTrackEdit');

    return next();
  },
  requireUpdateSubscriptionRecord('quotation')
);

estimateRoutes.get(
  '/one/:urIdOr_id',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('estimates', 'read'),
  async(req: IcustomRequest<{ urIdOr_id: string }, null>, res) => {
    const { urIdOr_id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const filterwithId = verifyObjectId(urIdOr_id) ? { _id: urIdOr_id } : { urId: urIdOr_id };
    const estimate = await estimateLean
      .findOne({ ...filterwithId, ...filter })
      .lean()
      .populate([populateInvoiceRelated(), populateTrackEdit(), populateTrackView()]);

    if (!estimate || !estimate.invoiceRelated) {
      return res.status(404).send({ success: false, err: 'not found' });
    }

    const returned = makeInvoiceRelatedPdct(
      estimate.invoiceRelated as Required<IinvoiceRelated>,
        (estimate.invoiceRelated as IinvoiceRelated)
          .billingUserId as unknown as Iuser,
        estimate.createdAt,
        { _id: estimate._id,
          urId: estimate.urId
        }
    );

    // addParentToLocals(res, invoiceRelated._id, estimateLean.collection.collectionName, 'trackDataView'); // TODO

    return res.status(200).send(returned);
  }
);

estimateRoutes.get(
  '/all/:offset/:limit',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('estimates', 'read'),
  async(req: IcustomRequest<{ offset: string; limit: string }, null>, res) => {
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
      .filter(val => val && val.invoiceRelated)
      .map(val => makeInvoiceRelatedPdct(
      val.invoiceRelated as Required<IinvoiceRelated>,
      (val.invoiceRelated as IinvoiceRelated)?.billingUserId as unknown as Iuser,
      // eslint-disable-next-line no-undefined
      undefined,
      {
        _id: val._id
      }
      ));
    const response: IdataArrayResponse<IinvoiceRelated> = {
      count: all[1],
      data: returned
    };

    for (const val of all[0]) {
      addParentToLocals(res, val._id, estimateLean.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

estimateRoutes.put(
  '/delete/one',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('estimates', 'delete'),
  async(req: IcustomRequest<never, IdeleteOne>, res) => {
    const { _id } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const found = await estimateLean.findOne({ _id }).lean();

    if (!found) {
      return res.status(404).send({ success: false, err: 'not found' });
    }
    const updateRes = await deleteAllLinked(found.invoiceRelated as string, 'estimate', filter.companyId);

    if (updateRes instanceof Error) {
      const errResponse = handleMongooseErr(updateRes);

      return res.status(errResponse.status).send(errResponse);
    }

    addParentToLocals(res, _id, estimateLean.collection.collectionName, 'trackDataDelete');

    return res.status(200).send({ success: true });
  }
);

estimateRoutes.post(
  '/filter',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('estimates', 'read'),
  async(req: IcustomRequest<never, IfilterProps>, res) => {
    const { propSort, returnEmptyArr } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);

    const aggCursor = estimateLean
      .aggregate<IfilterAggResponse<Testimate>>([
        ...lookupSubFieldInvoiceRelatedFilter(constructFiltersFromBody(req), offset, limit, propSort, returnEmptyArr)
      ]);
    const dataArr: IfilterAggResponse<Testimate>[] = [];

    for await (const data of aggCursor) {
      dataArr.push(data);
    }

    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;

    const returned = all
      .filter(val => val && val.invoiceRelated)
      .map(val => makeInvoiceRelatedPdct(
      val.invoiceRelated as Required<IinvoiceRelated>,
      (val.invoiceRelated as IinvoiceRelated)?.billingUserId as unknown as Iuser
      ));
    const response: IdataArrayResponse<IinvoiceRelated> = {
      count,
      data: returned
    };

    for (const val of all) {
      addParentToLocals(res, val._id, estimateLean.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

estimateRoutes.put(
  '/delete/many',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('estimates', 'delete'),
  async(req: IcustomRequest<never, IdeleteMany>, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    const promises = _ids
      .map(async val => {
        const found = await estimateLean.findOne({ _id: val }).lean();

        if (found) {
          await deleteAllLinked(found.invoiceRelated as string, 'estimate', filter.companyId);
        }

        return new Promise(resolve => resolve(found?._id));
      });

    const filterdExist = await Promise.all(promises) as string[];

    for (const val of filterdExist.filter(value => value)) {
      addParentToLocals(res, val, estimateLean.collection.collectionName, 'trackDataDelete');
    }

    return res.status(200).send({ success: true });
  }
);

