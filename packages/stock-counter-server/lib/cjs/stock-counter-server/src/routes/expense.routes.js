"use strict";
/* eslint-disable @typescript-eslint/no-misused-promises */
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseRoutes = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const expense_model_1 = require("../models/expense.model");
const log4js_1 = require("log4js");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
/** Logger for expense routes */
const expenseRoutesLogger = (0, log4js_1.getLogger)('routes/expenseRoutes');
/**
 * Router for handling expense routes.
 */
exports.expenseRoutes = express_1.default.Router();
/**
 * Create a new expense
 * @name POST /create
 * @function
 * @memberof module:expenseRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
exports.expenseRoutes.post('/create/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables', 'create'), async (req, res) => {
    const expense = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    expense.companyId = queryId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const count = await expense_model_1.expenseMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    expense.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    const newExpense = new expense_model_1.expenseMain(expense);
    let errResponse;
    const saved = await newExpense.save()
        .catch(err => {
        expenseRoutesLogger.error('create - err: ', err);
        errResponse = {
            success: false,
            status: 403
        };
        if (err && err.errors) {
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
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
exports.expenseRoutes.put('/update/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables', 'update'), async (req, res) => {
    const updatedExpense = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    updatedExpense.companyId = queryId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([updatedExpense._id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const expense = await expense_model_1.expenseMain
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
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
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
exports.expenseRoutes.get('/getone/:id/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables', 'read'), async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const expense = await expense_model_1.expenseLean
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
exports.expenseRoutes.get('/getall/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const expenses = await expense_model_1.expenseLean
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
exports.expenseRoutes.delete('/deleteone/:id/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const deleted = await expense_model_1.expenseMain.findOneAndDelete({ _id: id, companyId: queryId });
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
exports.expenseRoutes.post('/search/:limit/:offset/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const expenses = await expense_model_1.expenseLean
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
exports.expenseRoutes.put('/deletemany/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables', 'delete'), async (req, res) => {
    const { ids } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([...ids, ...[queryId]]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await expense_model_1.expenseMain
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