import { requireActiveCompany } from '@open-stock/stock-auth-server';
import { IdataArrayResponse, Isuccess } from '@open-stock/stock-universal';
import { addParentToLocals, makeCompanyBasedQuery, makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr } from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { expenseLean } from '../../../models/expense.model';
import { paymentLean } from '../../../models/payment.model';
import { profitandlossReportLean, profitandlossReportMain } from '../../../models/printables/report/profitandlossreport.model';

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
profitAndLossReportRoutes.post('/create/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'create'), async(req, res) => {
  const profitAndLossReport = req.body.profitAndLossReport;
  const { filter } = makeCompanyBasedQuery(req);

  profitAndLossReport.companyId = filter.companyId;
  const count = await profitandlossReportMain
    .find({ }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });

  profitAndLossReport.urId = makeUrId(Number(count[0]?.urId || '0'));
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
});

/**
 * Get a single profit and loss report by URID.
 * @param req - The request object.
 * @param res - The response object.
 */
profitAndLossReportRoutes.get('/getone/:urId/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'read'), async(req, res) => {
  const { urId } = req.params;
  const { filter } = makeCompanyBasedQuery(req);
  const profitAndLossReport = await profitandlossReportLean
    .findOne({ urId, ...filter })
    .lean()
    .populate({ path: 'expenses', model: expenseLean })
    .populate({ path: 'payments', model: paymentLean });

  if (profitAndLossReport) {
    addParentToLocals(res, profitAndLossReport._id, profitandlossReportLean.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(profitAndLossReport);
});

/**
 * Get all profit and loss reports with pagination.
 * @param req - The request object.
 * @param res - The response object.
 */
profitAndLossReportRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'read'), async(req, res) => {
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
  const response: IdataArrayResponse = {
    count: all[1],
    data: all[0]
  };

  for (const val of all[0]) {
    addParentToLocals(res, val._id, profitandlossReportLean.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(response);
});

/**
 * Delete a single profit and loss report by ID.
 * @param req - The request object.
 * @param res - The response object.
 */
profitAndLossReportRoutes.delete('/deleteone/:id/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'delete'), async(req, res) => {
  const { id } = req.params;
  const { filter } = makeCompanyBasedQuery(req);
  // eslint-disable-next-line @typescript-eslint/naming-convention
  // const deleted = await profitandlossReportMain.findOneAndDelete({ _id: id, ...filter });
  const deleted = await profitandlossReportMain.updateOne({ _id: id, ...filter }, { $set: { isDeleted: true } });

  if (Boolean(deleted)) {
    addParentToLocals(res, id, profitandlossReportLean.collection.collectionName, 'trackDataDelete');

    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
});

/**
 * Search for profit and loss reports by a search term and key with pagination.
 * @param req - The request object.
 * @param res - The response object.
 */
profitAndLossReportRoutes.post('/search/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'read'), async(req, res) => {
  const { searchterm, searchKey } = req.body;
  const { filter } = makeCompanyBasedQuery(req);
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
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
  const response: IdataArrayResponse = {
    count: all[1],
    data: all[0]
  };

  for (const val of all[0]) {
    addParentToLocals(res, val._id, profitandlossReportLean.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(response);
});

/**
 * Delete multiple profit and loss reports by ID.
 * @param req - The request object.
 * @param res - The response object.
 */
profitAndLossReportRoutes.put('/deletemany/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'delete'), async(req, res) => {
  const { ids } = req.body;
  const { filter } = makeCompanyBasedQuery(req);

  /* const deleted = await profitandlossReportMain
    .deleteMany({ ...filter, _id: { $in: ids } })
    .catch(err => {
      profitAndLossReportRoutesLogger.debug('deletemany - err', err);

      return null;
    }); */


  const deleted = await profitandlossReportMain
    .updateMany({ ...filter, _id: { $in: ids } }, {
      $set: { isDeleted: true }
    })
    .catch(err => {
      profitAndLossReportRoutesLogger.debug('deletemany - err', err);

      return null;
    });

  if (Boolean(deleted)) {
    for (const val of ids) {
      addParentToLocals(res, val, profitandlossReportLean.collection.collectionName, 'trackDataDelete');
    }

    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
  }
});
