/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { expenseLean, expenseMain } from '../models/expense.model';
import { getLogger } from 'log4js';
import { makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
/** Logger for expense routes */
const expenseRoutesLogger = getLogger('routes/expenseRoutes');
/**
 * Router for handling expense routes.
 */
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
expenseRoutes.post('/create/:companyIdParam', requireAuth, roleAuthorisation('printables', 'create'), async (req, res) => {
    const expense = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    expense.companyId = queryId;
    const isValid = verifyObjectId(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const count = await expenseMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    expense.urId = makeUrId(Number(count[0]?.urId || '0'));
    const newExpense = new expenseMain(expense);
    let errResponse;
    const saved = await newExpense.save()
        .catch(err => {
        expenseRoutesLogger.error('create - err: ', err);
        errResponse = {
            success: false,
            status: 403
        };
        if (err && err.errors) {
            errResponse.err = stringifyMongooseErr(err.errors);
        }
        else {
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
expenseRoutes.put('/update/:companyIdParam', requireAuth, roleAuthorisation('printables', 'update'), async (req, res) => {
    const updatedExpense = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    updatedExpense.companyId = queryId;
    const isValid = verifyObjectIds([updatedExpense._id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const expense = await expenseMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndUpdate({ _id: updatedExpense._id, companyId: queryId });
    if (!expense) {
        return res.status(404).send({ success: false });
    }
    expense.name = updatedExpense.name || expense.name;
    expense.person = updatedExpense.person || expense.person;
    expense.cost = updatedExpense.cost || expense.cost;
    expense.category = updatedExpense.category || expense.category;
    expense.items = updatedExpense.items || expense.items;
    expense.note = updatedExpense.note || expense.note;
    let errResponse;
    const updated = await expense.save()
        .catch(err => {
        expenseRoutesLogger.error('update - err: ', err);
        errResponse = {
            success: false,
            status: 403
        };
        if (err && err.errors) {
            errResponse.err = stringifyMongooseErr(err.errors);
        }
        else {
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
expenseRoutes.get('/getone/:id/:companyIdParam', requireAuth, roleAuthorisation('printables', 'read'), async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const expense = await expenseLean
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOne({ _id: id, companyId: queryId })
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
expenseRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, roleAuthorisation('printables', 'read'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const expenses = await expenseLean
        .find({ companyId: queryId })
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
expenseRoutes.delete('/deleteone/:id/:companyIdParam', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const deleted = await expenseMain.findOneAndDelete({ _id: id, companyId: queryId });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
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
expenseRoutes.post('/search/:limit/:offset/:companyIdParam', requireAuth, roleAuthorisation('printables', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectId(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const expenses = await expenseLean
        .find({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
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
expenseRoutes.put('/deletemany/:companyIdParam', requireAuth, roleAuthorisation('printables', 'delete'), async (req, res) => {
    const { ids } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([...ids, ...[queryId]]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await expenseMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ _id: { $in: ids }, companyId: queryId })
        .catch(err => {
        expenseRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
//# sourceMappingURL=expense.routes.js.map