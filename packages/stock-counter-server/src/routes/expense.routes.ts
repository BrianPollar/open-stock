/* eslint-disable @typescript-eslint/no-misused-promises */

import express from 'express';
import { expenseLean, expenseMain } from '../models/expense.model';
import { getLogger } from 'log4js';
import { makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import { Isuccess } from '@open-stock/stock-universal';

/** Logger for expense routes */
const expenseRoutesLogger = getLogger('routes/expenseRoutes');

/** Router for expense routes */
export const expenseRoutes = express.Router();

/**
 * Create a new expense
 * @name POST /create
 * @function
 * @memberof module:expenseRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
expenseRoutes.post('/create', requireAuth, roleAuthorisation('printables'), async(req, res) => {
  const expense = req.body;
  const count = await expenseMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
  expense.urId = makeUrId(Number(count[0]?.urId || '0'));
  const newExpense = new expenseMain(expense);
  let errResponse: Isuccess;
  const saved = await newExpense.save()
    .catch(err => {
      expenseRoutesLogger.error('create - err: ', err);
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
 * Update an existing expense
 * @name PUT /update
 * @function
 * @memberof module:expenseRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
expenseRoutes.put('/update', requireAuth, roleAuthorisation('printables'), async(req, res) => {
  const updatedExpense = req.body;
  const isValid = verifyObjectId(updatedExpense._id);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const expense = await expenseMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .findByIdAndUpdate(updatedExpense._id);
  if (!expense) {
    return res.status(404).send({ success: false });
  }
  expense.name = updatedExpense.name || expense.name;
  expense.person = updatedExpense.person || expense.person;
  expense.cost = updatedExpense.cost || expense.cost;
  expense.category = updatedExpense.category || expense.category;
  expense.items = updatedExpense.items || expense.items;
  expense.note = updatedExpense.note || expense.note;
  let errResponse: Isuccess;
  const updated = await expense.save()
    .catch(err => {
      expenseRoutesLogger.error('update - err: ', err);
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
  return res.status(200).send({ success: Boolean(updated) });
});

/**
 * Get a single expense by ID
 * @name GET /getone/:id
 * @function
 * @memberof module:expenseRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
expenseRoutes.get('/getone/:id', requireAuth, roleAuthorisation('printables'), async(req, res) => {
  const { id } = req.params;
  const isValid = verifyObjectId(id);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const expense = await expenseLean
    .findById(id)
    .lean();
  return res.status(200).send(expense);
});

/**
 * Get all expenses with pagination
 * @name GET /getall/:offset/:limit
 * @function
 * @memberof module:expenseRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
expenseRoutes.get('/getall/:offset/:limit', requireAuth, roleAuthorisation('printables'), async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const expenses = await expenseLean
    .find({})
    .skip(offset)
    .limit(limit)
    .lean();
  return res.status(200).send(expenses);
});

/**
 * Delete a single expense by ID
 * @name DELETE /deleteone/:id
 * @function
 * @memberof module:expenseRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
expenseRoutes.delete('/deleteone/:id', requireAuth, async(req, res) => {
  const { id } = req.params;
  const isValid = verifyObjectId(id);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const deleted = await expenseMain.findByIdAndDelete(id);
  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
});

/**
 * Search expenses by a search term and key
 * @name POST /search/:limit/:offset
 * @function
 * @memberof module:expenseRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
expenseRoutes.post('/search/:limit/:offset', requireAuth, roleAuthorisation('printables'), async(req, res) => {
  const { searchterm, searchKey } = req.body;
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const expenses = await expenseLean
    .find({ [searchKey]: { $regex: searchterm, $options: 'i' } })
    .skip(offset)
    .limit(limit)
    .lean();
  return res.status(200).send(expenses);
});

/**
 * Delete multiple expenses by ID
 * @name PUT /deletemany
 * @function
 * @memberof module:expenseRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
expenseRoutes.put('/deletemany', requireAuth, roleAuthorisation('printables'), async(req, res) => {
  const { ids } = req.body;
  const isValid = verifyObjectIds(ids);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const deleted = await expenseMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .deleteMany({ _id: { $in: ids } })
    .catch(err => {
      expenseRoutesLogger.error('deletemany - err: ', err);
      return null;
    });
  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
  }
});
