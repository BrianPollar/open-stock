import { requireActiveCompany } from '@open-stock/stock-auth-server';
import { IcustomRequest, IdataArrayResponse, IdeleteMany, IfilterProps } from '@open-stock/stock-universal';
import {
  addParentToLocals, generateUrId, handleMongooseErr, makeCompanyBasedQuery,
  offsetLimitRelegator, requireAuth, roleAuthorisation, verifyObjectId
} from '@open-stock/stock-universal-server';
import express from 'express';
import { Error } from 'mongoose';
import { paymentLean } from '../../../models/payment.model';
import { estimateLean } from '../../../models/printables/estimate.model';
import {
  TinvoicesReport, invoicesReportLean, invoicesReportMain
} from '../../../models/printables/report/invoicereport.model';

/**
 * Express router for invoices report routes.
 */
export const invoicesReportRoutes = express.Router();

invoicesReportRoutes.post(
  '/add',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('reports', 'create'),
  async(req: IcustomRequest<never, { invoicesReport }>, res) => {
    const invoicesReport = req.body.invoicesReport;
    const { filter } = makeCompanyBasedQuery(req);

    invoicesReport.companyId = filter.companyId;

    invoicesReport.urId = await generateUrId(invoicesReportMain);
    const newInvoiceReport = new invoicesReportMain(invoicesReport);

    const savedRes = await newInvoiceReport.save().catch((err: Error) => err);

    if (savedRes instanceof Error) {
      const errResponse = handleMongooseErr(savedRes);

      return res.status(errResponse.status).send(errResponse);
    }

    if (savedRes instanceof Error) {
      const errResponse = handleMongooseErr(savedRes);

      return res.status(errResponse.status).send(errResponse);
    }

    addParentToLocals(res, savedRes._id, invoicesReportLean.collection.collectionName, 'makeTrackEdit');


    return res.status(200).send({ success: true });
  }
);

invoicesReportRoutes.get(
  '/one/:urIdOr_id',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('reports', 'read'),
  async(req: IcustomRequest<{ urIdOr_id: string }, null>, res) => {
    const { urIdOr_id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const filterwithId = verifyObjectId(urIdOr_id) ? { _id: urIdOr_id } : { urId: urIdOr_id };
    const invoicesReport = await invoicesReportLean
      .findOne({ ...filterwithId, ...filter })
      .lean()
      .populate({ path: 'estimates', model: estimateLean })
      .populate({ path: 'payments', model: paymentLean });

    if (!invoicesReport) {
      return res.status(404).send({ success: false, err: 'not found' });
    }

    addParentToLocals(res, invoicesReport._id, invoicesReportLean.collection.collectionName, 'trackDataView');

    return res.status(200).send(invoicesReport);
  }
);

invoicesReportRoutes.get(
  '/all/:offset/:limit',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('reports', 'read'),
  async(req: IcustomRequest<{ offset: string; limit: string }, null>, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { filter } = makeCompanyBasedQuery(req);
    const all = await Promise.all([
      invoicesReportLean
        .find(filter)
        .skip(offset)
        .limit(limit)
        .lean()
        .populate({ path: 'estimates', model: estimateLean })
        .populate({ path: 'payments', model: paymentLean }),
      invoicesReportLean.countDocuments(filter)
    ]);
    const response: IdataArrayResponse<TinvoicesReport> = {
      count: all[1],
      data: all[0]
    };

    for (const val of all[0]) {
      addParentToLocals(res, val._id, invoicesReportLean.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

invoicesReportRoutes.delete(
  '/delete/one/:_id',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('reports', 'delete'),
  async(req: IcustomRequest<never, unknown>, res) => {
    const { _id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);

    // const deleted = await invoicesReportMain.findOneAndDelete({ _id, ...filter });
    const updateRes = await invoicesReportMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } })
      .catch((err: Error) => err);

    if (updateRes instanceof Error) {
      const errResponse = handleMongooseErr(updateRes);

      return res.status(errResponse.status).send(errResponse);
    }

    addParentToLocals(res, _id, invoicesReportLean.collection.collectionName, 'trackDataDelete');

    return res.status(200).send({ success: true });
  }
);

invoicesReportRoutes.post(
  '/filter',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('reports', 'read'),
  async(req: IcustomRequest<never, IfilterProps>, res) => {
    const { filter } = makeCompanyBasedQuery(req);
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);

    /* TODO
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
      invoicesReportLean
        .find({ ...filter })
        .skip(offset)
        .limit(limit)
        .lean()
        .populate({ path: 'estimates', model: estimateLean })
        .populate({ path: 'payments', model: paymentLean }),
      invoicesReportLean.countDocuments({ ...filter })
    ]);
    const response: IdataArrayResponse<TinvoicesReport> = {
      count: all[1],
      data: all[0]
    };

    for (const val of all[0]) {
      addParentToLocals(res, val._id, invoicesReportLean.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

invoicesReportRoutes.put(
  '/delete/many',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('reports', 'delete'),
  async(req: IcustomRequest<never, IdeleteMany>, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    const updateRes = await invoicesReportMain
      .updateMany({ ...filter, _id: { $in: _ids } }, {
        $set: { isDeleted: true }
      })
      .catch((err: Error) => err);

    if (updateRes instanceof Error) {
      const errResponse = handleMongooseErr(updateRes);

      return res.status(errResponse.status).send(errResponse);
    }

    for (const val of _ids) {
      addParentToLocals(res, val, invoicesReportLean.collection.collectionName, 'trackDataDelete');
    }

    return res.status(200).send({ success: true });
  }
);
