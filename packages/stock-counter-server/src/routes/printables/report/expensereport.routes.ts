
import { requireActiveCompany } from '@open-stock/stock-auth-server';
import { IdataArrayResponse, Isuccess } from '@open-stock/stock-universal';
import { addParentToLocals, makeCompanyBasedQuery, makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr } from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { expenseLean } from '../../../models/expense.model';
import { expenseReportLean, expenseReportMain } from '../../../models/printables/report/expenesreport.model';

/** Logger for expense report routes */
const expenseReportRoutesLogger = tracer.colorConsole({
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
 * Expense report routes.
 */
export const expenseReportRoutes = express.Router();

/**
 * Create a new expense report
 * @name POST /create
 * @function
 * @memberof module:routes/expenseReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} Promise representing the result of the operation
 */
expenseReportRoutes.post('/create/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'create'), async(req, res) => {
  const expenseReport = req.body.expenseReport;
  const { filter } = makeCompanyBasedQuery(req);

  expenseReport.companyId = filter.companyId;

  const count = await expenseReportMain
    .find({ }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });

  expenseReport.urId = makeUrId(Number(count[0]?.urId || '0'));
  const newExpenseReport = new expenseReportMain(expenseReport);
  let errResponse: Isuccess;

  const saved = await newExpenseReport.save().catch(err => {
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


  if (saved && saved._id) {
    addParentToLocals(res, saved._id, expenseReportLean.collection.collectionName, 'makeTrackEdit');
  }

  if (errResponse) {
    return res.status(403).send(errResponse);
  }

  return res.status(200).send({ success: true });
});

/**
 * Get a single expense report by UR ID
 * @name GET /getone/:urId
 * @function
 * @memberof module:routes/expenseReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} Promise representing the result of the operation
 */
expenseReportRoutes.get('/getone/:urId/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'read'), async(req, res) => {
  const { urId } = req.params;
  const { filter } = makeCompanyBasedQuery(req);
  const expenseReport = await expenseReportLean
    .findOne({ urId, ...filter })
    .lean()
    .populate({ path: 'expenses', model: expenseLean });

  if (expenseReport) {
    addParentToLocals(res, expenseReport._id, expenseReportLean.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(expenseReport);
});

/**
 * Get all expense reports with pagination
 * @name GET /getall/:offset/:limit
 * @function
 * @memberof module:routes/expenseReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} Promise representing the result of the operation
 */
expenseReportRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'read'), async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const { filter } = makeCompanyBasedQuery(req);
  const all = await Promise.all([
    expenseReportLean
      .find(filter)
      .skip(offset)
      .limit(limit)
      .lean()
      .populate({ path: 'expenses', model: expenseLean })
      .catch(() => {
        return [];
      }),
    expenseReportLean.countDocuments(filter)
  ]);


  const response: IdataArrayResponse = {
    count: all[1],
    data: all[0]
  };

  for (const val of all[0]) {
    addParentToLocals(res, val._id, expenseReportLean.collection.collectionName, 'trackDataView');
  }

  res.status(200).send(response);

  return res.end();
});

/**
 * Delete a single expense report by ID
 * @name DELETE /deleteone/:id
 * @function
 * @memberof module:routes/expenseReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} Promise representing the result of the operation
 */
expenseReportRoutes.delete('/deleteone/:id/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'delete'), async(req, res) => {
  const { id } = req.params;
  const { filter } = makeCompanyBasedQuery(req);
  // eslint-disable-next-line @typescript-eslint/naming-convention
  // const deleted = await expenseReportMain.findOneAndDelete({ _id: id, ...filter });
  const deleted = await expenseReportMain.updateOne({ _id: id, ...filter }, { $set: { isDeleted: true } });

  if (Boolean(deleted)) {
    addParentToLocals(res, id, expenseReportLean.collection.collectionName, 'trackDataDelete');

    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
});

/**
 * Search for expense reports by search term and search key with pagination
 * @name POST /search/:offset/:limit
 * @function
 * @memberof module:routes/expenseReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} Promise representing the result of the operation
 */
expenseReportRoutes.post('/search/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'read'), async(req, res) => {
  const { searchterm, searchKey } = req.body;
  const { filter } = makeCompanyBasedQuery(req);
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const all = await Promise.all([
    expenseReportLean
      .find({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
      .lean()
      .skip(offset)
      .limit(limit)
      .populate({ path: 'expenses', model: expenseLean }),
    expenseReportLean.countDocuments({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
  ]);
  const response: IdataArrayResponse = {
    count: all[1],
    data: all[0]
  };

  for (const val of all[0]) {
    addParentToLocals(res, val._id, expenseReportLean.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(response);
});

/**
 * Delete multiple expense reports by ID
 * @name PUT /deletemany
 * @function
 * @memberof module:routes/expenseReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} Promise representing the result of the operation
 */
expenseReportRoutes.put('/deletemany/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'delete'), async(req, res) => {
  const { ids } = req.body;
  const { filter } = makeCompanyBasedQuery(req);

  /* const deleted = await expenseReportMain
    .deleteMany({ ...filter, _id: { $in: ids } })
    .catch(err => {
      expenseReportRoutesLogger.error('deletemany - err: ', err);

      return null;
    }); */

  const deleted = await expenseReportMain
    .updateMany({ ...filter, _id: { $in: ids } }, {
      $set: { isDeleted: true }
    })
    .catch(err => {
      expenseReportRoutesLogger.error('deletemany - err: ', err);

      return null;
    });

  if (Boolean(deleted)) {
    for (const val of ids) {
      addParentToLocals(res, val, expenseReportLean.collection.collectionName, 'trackDataDelete');
    }

    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
  }
});
