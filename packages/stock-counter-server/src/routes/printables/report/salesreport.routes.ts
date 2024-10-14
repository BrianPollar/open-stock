import { requireActiveCompany } from '@open-stock/stock-auth-server';
import {
  IcustomRequest,
  IdataArrayResponse, IdeleteMany,
  IfilterProps, IsalesReport
} from '@open-stock/stock-universal';
import {
  addParentToLocals, generateUrId,
  handleMongooseErr, makeCompanyBasedQuery, offsetLimitRelegator, requireAuth, roleAuthorisation, verifyObjectId
} from '@open-stock/stock-universal-server';
import express from 'express';
import { estimateLean } from '../../../models/printables/estimate.model';
import { invoiceRelatedLean } from '../../../models/printables/related/invoicerelated.model';
import { TsalesReport, salesReportLean, salesReportMain } from '../../../models/printables/report/salesreport.model';

/**
 * Express router for sales report routes.
 */
export const salesReportRoutes = express.Router();

salesReportRoutes.post(
  '/add',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('reports', 'create'),
  async(req: IcustomRequest<never, { salesReport: IsalesReport}>, res) => {
    const salesReport = req.body.salesReport;
    const { filter } = makeCompanyBasedQuery(req);

    salesReport.companyId = filter.companyId;

    salesReport.urId = await generateUrId(salesReportMain);
    const newSalesReport = new salesReportMain(salesReport);


    const savedRes = await newSalesReport.save()
      .catch((err: Error) => err);

    if (savedRes instanceof Error) {
      const errResponse = handleMongooseErr(savedRes);

      return res.status(errResponse.status).send(errResponse);
    }

    addParentToLocals(res, savedRes._id, salesReportLean.collection.collectionName, 'makeTrackEdit');

    return res.status(200).send({ success: true });
  }
);

salesReportRoutes.get(
  '/one/:urIdOr_id',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('reports', 'read'),
  async(req: IcustomRequest<{ urIdOr_id: string }, null>, res) => {
    const { urIdOr_id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const filterwithId = verifyObjectId(urIdOr_id) ? { _id: urIdOr_id } : { urId: urIdOr_id };
    const salesReport = await salesReportLean
      .findOne({ ...filterwithId, ...filter })
      .lean()
      .populate({ path: 'estimates', model: estimateLean })
      .populate({ path: 'invoiceRelateds', model: invoiceRelatedLean });

    if (!salesReport) {
      return res.status(404).send({ success: false, err: 'not found' });
    }

    addParentToLocals(res, salesReport._id, salesReportLean.collection.collectionName, 'trackDataView');

    return res.status(200).send(salesReport);
  }
);

salesReportRoutes.get(
  '/all/:offset/:limit',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('reports', 'read'),
  async(req: IcustomRequest<{ offset: string; limit: string }, null>, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { filter } = makeCompanyBasedQuery(req);
    const all = await Promise.all([
      salesReportLean
        .find({ ...filter })
        .skip(offset)
        .limit(limit)
        .lean()
        .populate({ path: 'estimates', model: estimateLean })
        .populate({ path: 'invoiceRelateds', model: invoiceRelatedLean }),
      salesReportLean.countDocuments({ ...filter })
    ]);
    const response: IdataArrayResponse<TsalesReport> = {
      count: all[1],
      data: all[0]
    };

    for (const val of all[0]) {
      addParentToLocals(res, val._id, salesReportLean.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

salesReportRoutes.delete(
  '/delete/one/:_id',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('reports', 'delete'),
  async(req: IcustomRequest<never, unknown>, res) => {
    const { _id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);

    // const deleted = await salesReportMain.findOneAndDelete({ _id, ...filter });
    const updateRes = await salesReportMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } })
      .catch((err: Error) => err);

    if (updateRes instanceof Error) {
      const errResponse = handleMongooseErr(updateRes);

      return res.status(errResponse.status).send(errResponse);
    }

    addParentToLocals(res, _id, salesReportLean.collection.collectionName, 'trackDataDelete');

    return res.status(200).send({ success: true });
  }
);

salesReportRoutes.post(
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
      salesReportLean
        .find({ ...filter })
        .skip(offset)
        .limit(limit)
        .lean()
        .populate({ path: 'estimates', model: estimateLean })
        .populate({ path: 'invoiceRelateds', model: invoiceRelatedLean }),
      salesReportLean.countDocuments({ ...filter })
    ]);
    const response: IdataArrayResponse<TsalesReport> = {
      count: all[1],
      data: all[0]
    };

    for (const val of all[0]) {
      addParentToLocals(res, val._id, salesReportLean.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

salesReportRoutes.put(
  '/delete/many',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('reports', 'delete'),
  async(req: IcustomRequest<never, IdeleteMany>, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    const updateRes = await salesReportMain
      .updateMany({ ...filter, _id: { $in: _ids } }, {
        $set: { isDeleted: true }
      })
      .catch((err: Error) => err);

    if (updateRes instanceof Error) {
      const errResponse = handleMongooseErr(updateRes);

      return res.status(errResponse.status).send(errResponse);
    }

    for (const val of _ids) {
      addParentToLocals(res, val, salesReportLean.collection.collectionName, 'trackDataDelete');
    }

    return res.status(200).send({ success: true });
  }
);
