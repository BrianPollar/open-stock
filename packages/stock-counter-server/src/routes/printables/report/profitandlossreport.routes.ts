import express from 'express';
import { makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectIds } from '@open-stock/stock-universal-server';
import { expenseLean } from '../../../models/expense.model';
import { paymentLean } from '../../../models/payment.model';
import { profitandlossReportLean, profitandlossReportMain } from '../../../models/printables/report/profitandlossreport.model';
import { getLogger } from 'log4js';
import { Icustomrequest, Isuccess } from '@open-stock/stock-universal';

/** Logger for the profit and loss report routes */
const profitAndLossReportRoutesLogger = getLogger('routes/profitAndLossReportRoutes');

/**
 * Router for profit and loss report.
 */
export const profitAndLossReportRoutes = express.Router();

/**
 * Create a new profit and loss report.
 * @param req - The request object.
 * @param res - The response object.
 */
profitAndLossReportRoutes.post('/create/:companyIdParam', requireAuth, roleAuthorisation('printables', 'create'), async(req, res) => {
  const profitAndLossReport = req.body.profitAndLossReport;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  profitAndLossReport.companyId = queryId;
  const count = await profitandlossReportMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
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
      return errResponse;
    });

  if (errResponse) {
    return res.status(403).send(errResponse);
  }
  return res.status(200).send({ success: Boolean(saved) });
});

/**
 * Get a single profit and loss report by URID.
 * @param req - The request object.
 * @param res - The response object.
 */
profitAndLossReportRoutes.get('/getone/:urId/:companyIdParam', requireAuth, roleAuthorisation('printables', 'read'), async(req, res) => {
  const { urId } = req.params;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const profitAndLossReport = await profitandlossReportLean
    .findOne({ urId, queryId })
    .lean()
    .populate({ path: 'expenses', model: expenseLean })
    .populate({ path: 'payments', model: paymentLean });
  return res.status(200).send(profitAndLossReport);
});

/**
 * Get all profit and loss reports with pagination.
 * @param req - The request object.
 * @param res - The response object.
 */
profitAndLossReportRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, roleAuthorisation('printables', 'read'), async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const profitAndLossReports = await profitandlossReportLean
    .find({ companyId: queryId })
    .skip(offset)
    .limit(limit)
    .lean()
    .populate({ path: 'expenses', model: expenseLean })
    .populate({ path: 'payments', model: paymentLean });
  return res.status(200).send(profitAndLossReports);
});

/**
 * Delete a single profit and loss report by ID.
 * @param req - The request object.
 * @param res - The response object.
 */
profitAndLossReportRoutes.delete('/deleteone/:id/:companyIdParam', requireAuth, roleAuthorisation('printables', 'delete'), async(req, res) => {
  const { id } = req.params;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectIds([id, queryId]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const deleted = await profitandlossReportMain.findOneAndDelete({ _id: id, companyId: queryId });
  if (Boolean(deleted)) {
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
profitAndLossReportRoutes.post('/search/:limit/:offset/:companyIdParam', requireAuth, roleAuthorisation('printables', 'read'), async(req, res) => {
  const { searchterm, searchKey } = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const profitAndLossReports = await profitandlossReportLean
    .find({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
    .lean()
    .skip(offset)
    .limit(limit)
    .populate({ path: 'expenses', model: expenseLean })
    .populate({ path: 'payments', model: paymentLean });
  return res.status(200).send(profitAndLossReports);
});

/**
 * Delete multiple profit and loss reports by ID.
 * @param req - The request object.
 * @param res - The response object.
 */
profitAndLossReportRoutes.put('/deletemany/:companyIdParam', requireAuth, roleAuthorisation('printables', 'delete'), async(req, res) => {
  const { ids } = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectIds([...ids, ...[queryId]]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const deleted = await profitandlossReportMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .deleteMany({ companyId: queryId, _id: { $in: ids } })
    .catch(err => {
      profitAndLossReportRoutesLogger.debug('deletemany - err', err);
      return null;
    });
  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
  }
});
