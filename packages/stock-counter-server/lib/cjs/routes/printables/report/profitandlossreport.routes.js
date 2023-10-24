"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profitAndLossReportRoutes = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const expense_model_1 = require("../../../models/expense.model");
const payment_model_1 = require("../../../models/payment.model");
const profitandlossreport_model_1 = require("../../../models/printables/report/profitandlossreport.model");
const log4js_1 = require("log4js");
/** Logger for the profit and loss report routes */
const profitAndLossReportRoutesLogger = (0, log4js_1.getLogger)('routes/profitAndLossReportRoutes');
/** Router for the profit and loss report routes */
exports.profitAndLossReportRoutes = express_1.default.Router();
/**
 * Create a new profit and loss report.
 * @param req - The request object.
 * @param res - The response object.
 */
exports.profitAndLossReportRoutes.post('/create', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const profitAndLossReport = req.body.profitAndLossReport;
    const count = await profitandlossreport_model_1.profitandlossReportMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    profitAndLossReport.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    const newProfitAndLossReport = new profitandlossreport_model_1.profitandlossReportMain(profitAndLossReport);
    let errResponse;
    const saved = await newProfitAndLossReport.save()
        .catch(err => {
        profitAndLossReportRoutesLogger.error('create - err: ', err);
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
 * Get a single profit and loss report by URID.
 * @param req - The request object.
 * @param res - The response object.
 */
exports.profitAndLossReportRoutes.get('/getone/:urId', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { urId } = req.params;
    const profitAndLossReport = await profitandlossreport_model_1.profitandlossReportLean
        .findOne({ urId })
        .lean()
        .populate({ path: 'expenses', model: expense_model_1.expenseLean })
        .populate({ path: 'payments', model: payment_model_1.paymentLean });
    return res.status(200).send(profitAndLossReport);
});
/**
 * Get all profit and loss reports with pagination.
 * @param req - The request object.
 * @param res - The response object.
 */
exports.profitAndLossReportRoutes.get('/getall/:offset/:limit', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const profitAndLossReports = await profitandlossreport_model_1.profitandlossReportLean
        .find({})
        .skip(offset)
        .limit(limit)
        .lean()
        .populate({ path: 'expenses', model: expense_model_1.expenseLean })
        .populate({ path: 'payments', model: payment_model_1.paymentLean });
    return res.status(200).send(profitAndLossReports);
});
/**
 * Delete a single profit and loss report by ID.
 * @param req - The request object.
 * @param res - The response object.
 */
exports.profitAndLossReportRoutes.delete('/deleteone/:id', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { id } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await profitandlossreport_model_1.profitandlossReportMain.findByIdAndDelete(id);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
/**
 * Search for profit and loss reports by a search term and key with pagination.
 * @param req - The request object.
 * @param res - The response object.
 */
exports.profitAndLossReportRoutes.post('/search/:limit/:offset', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const profitAndLossReports = await profitandlossreport_model_1.profitandlossReportLean
        .find({ [searchKey]: { $regex: searchterm, $options: 'i' } })
        .lean()
        .skip(offset)
        .limit(limit)
        .populate({ path: 'expenses', model: expense_model_1.expenseLean })
        .populate({ path: 'payments', model: payment_model_1.paymentLean });
    return res.status(200).send(profitAndLossReports);
});
/**
 * Delete multiple profit and loss reports by ID.
 * @param req - The request object.
 * @param res - The response object.
 */
exports.profitAndLossReportRoutes.put('/deletemany', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { ids } = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)(ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await profitandlossreport_model_1.profitandlossReportMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ _id: { $in: ids } })
        .catch(err => {
        profitAndLossReportRoutesLogger.debug('deletemany - err', err);
        return null;
    });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
//# sourceMappingURL=profitandlossreport.routes.js.map