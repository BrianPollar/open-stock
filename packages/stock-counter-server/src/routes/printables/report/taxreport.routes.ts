

import { requireActiveCompany } from '@open-stock/stock-auth-server';
import {
  IcustomRequest, IdataArrayResponse,
  IdeleteMany, IfilterProps, ItaxReport
} from '@open-stock/stock-universal';
import {
  addParentToLocals, generateUrId,
  handleMongooseErr, makeCompanyBasedQuery, offsetLimitRelegator,
  requireAuth, roleAuthorisation, verifyObjectId
} from '@open-stock/stock-universal-server';
import express from 'express';
import { Error } from 'mongoose';
import { paymentLean } from '../../../models/payment.model';
import { estimateLean } from '../../../models/printables/estimate.model';
import { TtaxReport, taxReportLean, taxReportMain } from '../../../models/printables/report/taxreport.model';

/**
 * Router for tax report routes.
 */
export const taxReportRoutes = express.Router();

taxReportRoutes.post(
  '/add',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('reports', 'create'),
  async(req: IcustomRequest<never, {taxReport: ItaxReport}>, res) => {
    const taxReport = req.body.taxReport;
    const { filter } = makeCompanyBasedQuery(req);

    taxReport.companyId = filter.companyId;

    taxReport.urId = await generateUrId(taxReportMain);
    const newTaxReport = new taxReportMain(taxReport);


    const savedRes = await newTaxReport.save()
      .catch((err: Error) => err);

    if (savedRes instanceof Error) {
      const errResponse = handleMongooseErr(savedRes);

      return res.status(errResponse.status).send(errResponse);
    }

    addParentToLocals(res, savedRes._id, taxReportMain.collection.collectionName, 'makeTrackEdit');

    return res.status(200).send({ success: true });
  }
);

taxReportRoutes.get(
  '/one/:urIdOr_id',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('reports', 'read'),
  async(req: IcustomRequest<{ urIdOr_id: string }, null>, res) => {
    const { urIdOr_id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const filterwithId = verifyObjectId(urIdOr_id) ? { _id: urIdOr_id } : { urId: urIdOr_id };
    const taxReport = await taxReportLean
      .findOne({ ...filterwithId, ...filter })
      .lean()
      .populate({ path: 'estimates', model: estimateLean })
      .populate({ path: 'payments', model: paymentLean });

    if (!taxReport) {
      return res.status(404).send({ success: false, err: 'not found' });
    }

    addParentToLocals(res, taxReport._id, taxReportMain.collection.collectionName, 'trackDataView');

    return res.status(200).send(taxReport);
  }
);

taxReportRoutes.get(
  '/all/:offset/:limit',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('reports', 'read'),
  async(req: IcustomRequest<{ offset: string; limit: string }, null>, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { filter } = makeCompanyBasedQuery(req);
    const all = await Promise.all([
      taxReportLean
        .find({ ...filter })
        .skip(offset)
        .limit(limit)
        .lean()
        .populate({ path: 'estimates', model: estimateLean })
        .populate({ path: 'payments', model: paymentLean }),
      taxReportLean.countDocuments({ ...filter })
    ]);
    const response: IdataArrayResponse<TtaxReport> = {
      count: all[1],
      data: all[0]
    };

    for (const val of all[0]) {
      addParentToLocals(res, val._id, taxReportMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

taxReportRoutes.delete(
  '/delete/one/:_id',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('reports', 'delete'),
  async(req: IcustomRequest<never, unknown>, res) => {
    const { _id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);

    // const deleted = await taxReportMain.findOneAndDelete({ _id, ...filter });
    const updateRes = await taxReportMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } })
      .catch((err: Error) => err);

    if (updateRes instanceof Error) {
      const errResponse = handleMongooseErr(updateRes);

      return res.status(errResponse.status).send(errResponse);
    }

    addParentToLocals(res, _id, taxReportMain.collection.collectionName, 'trackDataDelete');

    return res.status(200).send({ success: true });
  }
);

taxReportRoutes.post(
  '/filter',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('reports', 'read'),
  async(req: IcustomRequest<never, IfilterProps>, res) => {
    const { filter } = makeCompanyBasedQuery(req);
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);

    /*
  const aggCursor = invoiceLean
  .aggregate<IfilterAggResponse<soth>>([
  ...lookupSubFieldInvoiceRelatedFilter(constructFiltersFromBody(req), propSort, offset, limit)
]);
  const dataArr: IfilterAggResponse<soth>[] = [];

  for await (const data of aggCursor) {
    dataArr.push(data);
  }

  const all = dataArr[0]?.data || [];
  const count = dataArr[0]?.total?.count || 0;
  */

    const all = await Promise.all([
      taxReportLean
        .find({ ...filter })
        .skip(offset)
        .limit(limit)
        .lean()
        .populate({ path: 'estimates', model: estimateLean })
        .populate({ path: 'payments', model: paymentLean }),
      taxReportLean.countDocuments({ ...filter })
    ]);
    const response: IdataArrayResponse<TtaxReport> = {
      count: all[1],
      data: all[0]
    };

    for (const val of all[0]) {
      addParentToLocals(res, val._id, taxReportMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

taxReportRoutes.put(
  '/delete/many',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('reports', 'delete'),
  async(req: IcustomRequest<never, IdeleteMany>, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    const updateRes = await taxReportMain
      .updateMany({ ...filter, _id: { $in: _ids } }, {
        $set: { isDeleted: true }
      }).catch((err: Error) => err);

    if (updateRes instanceof Error) {
      const errResponse = handleMongooseErr(updateRes);

      return res.status(errResponse.status).send(errResponse);
    }

    for (const val of _ids) {
      addParentToLocals(res, val, taxReportMain.collection.collectionName, 'trackDataDelete');
    }

    return res.status(200).send({ success: true });
  }
);
