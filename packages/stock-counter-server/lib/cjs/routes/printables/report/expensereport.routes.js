"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseReportRoutes = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-misused-promises */
const express_1 = tslib_1.__importDefault(require("express"));
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const expense_model_1 = require("../../../models/expense.model");
const expenesreport_model_1 = require("../../../models/printables/report/expenesreport.model");
const log4js_1 = require("log4js");
/** Logger for expense report routes */
const expenseReportRoutesLogger = (0, log4js_1.getLogger)('routes/expenseReportRoutes');
/** Router for expense report routes */
exports.expenseReportRoutes = express_1.default.Router();
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
exports.expenseReportRoutes.post('/create', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const expenseReport = req.body.expenseReport;
    const count = await expenesreport_model_1.expenseReportMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    expenseReport.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    const newExpenseReport = new expenesreport_model_1.expenseReportMain(expenseReport);
    let errResponse;
    await newExpenseReport.save().catch(err => {
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
exports.expenseReportRoutes.get('/getone/:urId', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { urId } = req.params;
    const expenseReport = await expenesreport_model_1.expenseReportLean
        .findOne({ urId })
        .lean()
        .populate({ path: 'expenses', model: expense_model_1.expenseLean });
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
exports.expenseReportRoutes.get('/getall/:offset/:limit', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const expenseReports = await expenesreport_model_1.expenseReportLean
        .find({})
        .skip(offset)
        .limit(limit)
        .lean()
        .populate({ path: 'expenses', model: expense_model_1.expenseLean, strictPopulate: false })
        .catch(err => {
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
exports.expenseReportRoutes.delete('/deleteone/:id', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { id } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await expenesreport_model_1.expenseReportMain.findByIdAndDelete(id);
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
exports.expenseReportRoutes.post('/search/:offset/:limit', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const expenseReports = await expenesreport_model_1.expenseReportLean
        .find({ [searchKey]: { $regex: searchterm, $options: 'i' } })
        .lean()
        .skip(offset)
        .limit(limit)
        .populate({ path: 'expenses', model: expense_model_1.expenseLean });
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
exports.expenseReportRoutes.put('/deletemany', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { ids } = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)(ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await expenesreport_model_1.expenseReportMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ _id: { $in: ids } })
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