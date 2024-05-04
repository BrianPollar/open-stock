"use strict";
/* eslint-disable @typescript-eslint/no-misused-promises */
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const tracer = tslib_1.__importStar(require("tracer"));
const expense_model_1 = require("../models/expense.model");
/** Logger for expense routes */
const expenseRoutesLogger = tracer.colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
        // eslint-disable-next-line no-console
        console.log(data.output);
        const logDir = './openstockLog/';
        fs.mkdir(logDir, { recursive: true }, (err) => {
            if (err) {
                if (err) {
                    throw err;
                }
            }
        });
        fs.appendFile('./openStockLog/counter-server.log', data.rawoutput + '\n', err => {
            if (err) {
                throw err;
            }
        });
    }
});
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
exports.expenseRoutes.post('/create/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_auth_server_1.requireCanUseFeature)('expense'), (0, stock_universal_server_1.roleAuthorisation)('expenses', 'create'), async (req, res, next) => {
    const expense = req.body;
    const { companyId } = req.user;
    if (companyId !== 'superAdmin') {
        const isValid = (0, stock_universal_server_1.verifyObjectId)(companyId);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
    }
    expense.companyId = companyId;
    const count = await expense_model_1.expenseMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({ companyId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
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
    if (!Boolean(saved)) {
        return res.status(403).send('unknown error occered');
    }
    return next();
}, (0, stock_auth_server_1.requireUpdateSubscriptionRecord)('expense'));
/**
 * Update an existing expense
 * @name PUT /update
 * @function
 * @memberof module:expenseRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
exports.expenseRoutes.put('/update/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('expenses', 'update'), async (req, res) => {
    const updatedExpense = req.body;
    const { companyId } = req.user;
    let ids;
    if (companyId !== 'superAdmin') {
        ids = [updatedExpense._id, companyId];
    }
    else {
        ids = [updatedExpense._id];
    }
    const isValid = (0, stock_universal_server_1.verifyObjectIds)(ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    updatedExpense.companyId = companyId;
    const expense = await expense_model_1.expenseMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndUpdate({ _id: updatedExpense._id, companyId });
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
exports.expenseRoutes.get('/getone/:id/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('expenses', 'read'), async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const expense = await expense_model_1.expenseLean
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOne({ _id: id, companyId })
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
exports.expenseRoutes.get('/getall/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('expenses', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const all = await Promise.all([
        expense_model_1.expenseLean
            .find({ companyId })
            .skip(offset)
            .limit(limit)
            .lean(),
        expense_model_1.expenseLean.countDocuments({ companyId })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
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
exports.expenseRoutes.delete('/deleteone/:id/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('expenses', 'delete'), async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const deleted = await expense_model_1.expenseMain.findOneAndDelete({ _id: id, companyId });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
/**
 * Search expenses by a search term and key
 * @name POST /search/:offset/:limit
 * @function
 * @memberof module:expenseRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
exports.expenseRoutes.post('/search/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('expenses', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { companyId } = req.user;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const all = await Promise.all([
        expense_model_1.expenseLean
            .find({ companyId, [searchKey]: { $regex: searchterm, $options: 'i' } })
            .skip(offset)
            .limit(limit)
            .lean(),
        expense_model_1.expenseLean.countDocuments({ companyId, [searchKey]: { $regex: searchterm, $options: 'i' } })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
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
exports.expenseRoutes.put('/deletemany/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('expenses', 'delete'), async (req, res) => {
    const { ids } = req.body;
    const { companyId } = req.user;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([...ids]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await expense_model_1.expenseMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ _id: { $in: ids }, companyId })
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