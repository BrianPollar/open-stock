import { makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import { getLogger } from 'log4js';
import { expenseLean } from '../../../models/expense.model';
import { expenseReportLean, expenseReportMain } from '../../../models/printables/report/expenesreport.model';
/** Logger for expense report routes */
const expenseReportRoutesLogger = getLogger('routes/expenseReportRoutes');
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
expenseReportRoutes.post('/create/:companyIdParam', requireAuth, roleAuthorisation('printables', 'create'), async (req, res) => {
    const expenseReport = req.body.expenseReport;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    expenseReport.companyId = queryId;
    const count = await expenseReportMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    expenseReport.urId = makeUrId(Number(count[0]?.urId || '0'));
    const newExpenseReport = new expenseReportMain(expenseReport);
    let errResponse;
    await newExpenseReport.save().catch(err => {
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
expenseReportRoutes.get('/getone/:urId/:companyIdParam', requireAuth, roleAuthorisation('printables', 'read'), async (req, res) => {
    const { urId } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const expenseReport = await expenseReportLean
        .findOne({ urId, queryId })
        .lean()
        .populate({ path: 'expenses', model: expenseLean });
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
expenseReportRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, roleAuthorisation('printables', 'read'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const expenseReports = await expenseReportLean
        .find({ companyId: queryId })
        .skip(offset)
        .limit(limit)
        .lean()
        .populate({ path: 'expenses', model: expenseLean, strictPopulate: false })
        .catch(() => {
        return [];
    });
    return res.status(200).send(expenseReports);
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
expenseReportRoutes.delete('/deleteone/:id/:companyIdParam', requireAuth, roleAuthorisation('printables', 'delete'), async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const deleted = await expenseReportMain.findOneAndDelete({ _id: id, companyId: queryId });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
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
expenseReportRoutes.post('/search/:offset/:limit/:companyIdParam', requireAuth, roleAuthorisation('printables', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const expenseReports = await expenseReportLean
        .find({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
        .lean()
        .skip(offset)
        .limit(limit)
        .populate({ path: 'expenses', model: expenseLean });
    return res.status(200).send(expenseReports);
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
expenseReportRoutes.put('/deletemany/:companyIdParam', requireAuth, roleAuthorisation('printables', 'delete'), async (req, res) => {
    const { ids } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([...ids, ...[queryId]]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await expenseReportMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ companyId: queryId, _id: { $in: ids } })
        .catch(err => {
        expenseReportRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
//# sourceMappingURL=expensereport.routes.js.map