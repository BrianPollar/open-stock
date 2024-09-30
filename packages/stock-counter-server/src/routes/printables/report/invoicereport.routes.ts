import { requireActiveCompany } from '@open-stock/stock-auth-server';
import { IcustomRequest, IdataArrayResponse, IdeleteMany, IfilterProps, Isuccess } from '@open-stock/stock-universal';
import {
  addParentToLocals,
  generateUrId, makeCompanyBasedQuery,
  offsetLimitRelegator, requireAuth, roleAuthorisation,
  stringifyMongooseErr
} from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { paymentLean } from '../../../models/payment.model';
import { estimateLean } from '../../../models/printables/estimate.model';
import {
  TinvoicesReport, invoicesReportLean, invoicesReportMain
} from '../../../models/printables/report/invoicereport.model';

/** Logger for invoicesReportRoutes */
const invoicesReportRoutesLogger = tracer.colorConsole({
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
    let errResponse: Isuccess;

    const saved = await newInvoiceReport.save().catch(err => {
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
      addParentToLocals(res, saved._id, invoicesReportLean.collection.collectionName, 'makeTrackEdit');
    }

    return res.status(200).send({ success: true });
  }
);

invoicesReportRoutes.get(
  '/one/:urId',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('reports', 'read'),
  async(req: IcustomRequest<{ urId: string }, null>, res) => {
    const { urId } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const invoicesReport = await invoicesReportLean
      .findOne({ urId, ...filter })
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
    const deleted = await invoicesReportMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } });

    if (Boolean(deleted)) {
      addParentToLocals(res, _id, invoicesReportLean.collection.collectionName, 'trackDataDelete');

      return res.status(200).send({ success: Boolean(deleted) });
    } else {
      return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
  }
);

invoicesReportRoutes.post(
  '/filter',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('reports', 'read'),
  async(req: IcustomRequest<never, IfilterProps>, res) => {
    const { searchterm, searchKey } = req.body;
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
        .find({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
        .skip(offset)
        .limit(limit)
        .lean()
        .populate({ path: 'estimates', model: estimateLean })
        .populate({ path: 'payments', model: paymentLean }),
      invoicesReportLean.countDocuments({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
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

    /* const deleted = await invoicesReportMain
    .deleteMany({ ...filter, _id: { $in: _ids } })
    .catch(err => {
      invoicesReportRoutesLogger.error('deletemany - err: ', err);

      return null;
    }); */

    const deleted = await invoicesReportMain
      .updateMany({ ...filter, _id: { $in: _ids } }, {
        $set: { isDeleted: true }
      })
      .catch(err => {
        invoicesReportRoutesLogger.error('deletemany - err: ', err);

        return null;
      });

    if (Boolean(deleted)) {
      for (const val of _ids) {
        addParentToLocals(res, val, invoicesReportLean.collection.collectionName, 'trackDataDelete');
      }

      return res.status(200).send({ success: Boolean(deleted) });
    } else {
      return res.status(404).send({
        success: Boolean(deleted),
        err: 'could not delete selected items, try again in a while'
      });
    }
  }
);
