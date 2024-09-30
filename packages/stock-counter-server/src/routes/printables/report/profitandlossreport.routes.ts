import { requireActiveCompany } from '@open-stock/stock-auth-server';
import {
  IcustomRequest, IdataArrayResponse, IdeleteMany, IfilterProps, IprofitAndLossReport, Isuccess
} from '@open-stock/stock-universal';
import {
  addParentToLocals,
  generateUrId,
  makeCompanyBasedQuery, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr
} from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { expenseLean } from '../../../models/expense.model';
import { paymentLean } from '../../../models/payment.model';
import {
  TprofitandlossReport, profitandlossReportLean, profitandlossReportMain
} from '../../../models/printables/report/profitandlossreport.model';

/** Logger for the profit and loss report routes */
const profitAndLossReportRoutesLogger = tracer.colorConsole({
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
 * Router for profit and loss report.
 */
export const profitAndLossReportRoutes = express.Router();

/**
 * Create a new profit and loss report.
 * @param req - The request object.
 * @param res - The response object.
 */
profitAndLossReportRoutes.post(
  '/add',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('reports', 'create'),
  async(req: IcustomRequest<never, IprofitAndLossReport>, res) => {
    const profitAndLossReport = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    profitAndLossReport.companyId = filter.companyId;

    profitAndLossReport.urId = await generateUrId(profitandlossReportMain);
    const newProfitAndLossReport = new profitandlossReportMain(profitAndLossReport);

    let errResponse: Isuccess;

    const saved = await newProfitAndLossReport.save()
      .catch(err => {
        profitAndLossReportRoutesLogger.error('create - err: ', err);
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
      addParentToLocals(res, saved._id, profitandlossReportLean.collection.collectionName, 'makeTrackEdit');
    }

    return res.status(200).send({ success: true });
  }
);

profitAndLossReportRoutes.get(
  '/one/:urId',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('reports', 'read'),
  async(req: IcustomRequest<{ urId: string }, null>, res) => {
    const { urId } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const profitAndLossReport = await profitandlossReportLean
      .findOne({ urId, ...filter })
      .lean()
      .populate({ path: 'expenses', model: expenseLean })
      .populate({ path: 'payments', model: paymentLean });

    if (!profitAndLossReport) {
      return res.status(404).send({ success: false, err: 'not found' });
    }

    addParentToLocals(
      res,
      profitAndLossReport._id,
      profitandlossReportLean.collection.collectionName,
      'trackDataView'
    );

    return res.status(200).send(profitAndLossReport);
  }
);

profitAndLossReportRoutes.get(
  '/all/:offset/:limit',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('reports', 'read'),
  async(req: IcustomRequest<{ offset: string; limit: string }, null>, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { filter } = makeCompanyBasedQuery(req);
    const all = await Promise.all([
      profitandlossReportLean
        .find(filter)
        .skip(offset)
        .limit(limit)
        .lean()
        .populate({ path: 'expenses', model: expenseLean })
        .populate({ path: 'payments', model: paymentLean }),
      profitandlossReportLean.countDocuments(filter)
    ]);
    const response: IdataArrayResponse<TprofitandlossReport> = {
      count: all[1],
      data: all[0]
    };

    for (const val of all[0]) {
      addParentToLocals(res, val._id, profitandlossReportLean.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

profitAndLossReportRoutes.delete(
  '/delete/one/:_id',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('reports', 'delete'),
  async(req: IcustomRequest<never, unknown>, res) => {
    const { _id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);

    // const deleted = await profitandlossReportMain.findOneAndDelete({ _id, ...filter });
    const deleted = await profitandlossReportMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } });

    if (Boolean(deleted)) {
      addParentToLocals(res, _id, profitandlossReportLean.collection.collectionName, 'trackDataDelete');

      return res.status(200).send({ success: Boolean(deleted) });
    } else {
      return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
  }
);

profitAndLossReportRoutes.post(
  '/filter',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('reports', 'read'),
  async(req: IcustomRequest<never, IfilterProps>, res) => {
    const { searchterm, searchKey } = req.body;
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
      profitandlossReportLean
        .find({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
        .skip(offset)
        .limit(limit)
        .lean()
        .populate({ path: 'expenses', model: expenseLean })
        .populate({ path: 'payments', model: paymentLean }),
      profitandlossReportLean.countDocuments({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
    ]);
    const response: IdataArrayResponse<TprofitandlossReport> = {
      count: all[1],
      data: all[0]
    };

    for (const val of all[0]) {
      addParentToLocals(res, val._id, profitandlossReportLean.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

profitAndLossReportRoutes.put(
  '/delete/many',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('reports', 'delete'),
  async(req: IcustomRequest<never, IdeleteMany>, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    /* const deleted = await profitandlossReportMain
    .deleteMany({ ...filter, _id: { $in: _ids } })
    .catch(err => {
      profitAndLossReportRoutesLogger.debug('deletemany - err', err);

      return null;
    }); */


    const deleted = await profitandlossReportMain
      .updateMany({ ...filter, _id: { $in: _ids } }, {
        $set: { isDeleted: true }
      })
      .catch(err => {
        profitAndLossReportRoutesLogger.debug('deletemany - err', err);

        return null;
      });

    if (Boolean(deleted)) {
      for (const val of _ids) {
        addParentToLocals(res, val, profitandlossReportLean.collection.collectionName, 'trackDataDelete');
      }

      return res.status(200).send({ success: Boolean(deleted) });
    } else {
      return res.status(404).send({
        success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
  }
);
