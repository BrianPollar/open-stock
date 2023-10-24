"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoicesReportRoutes = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const payment_model_1 = require("../../../models/payment.model");
const estimate_model_1 = require("../../../models/printables/estimate.model");
const invoicereport_model_1 = require("../../../models/printables/report/invoicereport.model");
const log4js_1 = require("log4js");
/** Logger for invoicesReportRoutes */
const invoicesReportRoutesLogger = (0, log4js_1.getLogger)('routes/invoicesReportRoutes');
/** Express router for invoices report routes */
exports.invoicesReportRoutes = express_1.default.Router();
/**
 * Route to create a new invoices report
 *
 * @name POST /create
 * @function
 * @memberof module:routes/invoicesReportRoutes~invoicesReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
exports.invoicesReportRoutes.post('/create', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const invoicesReport = req.body.invoicesReport;
    const count = await invoicereport_model_1.invoicesReportMain
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    invoicesReport.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    const newInvoiceReport = new invoicereport_model_1.invoicesReportMain(invoicesReport);
    let errResponse;
    await newInvoiceReport.save().catch(err => {
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
 * Route to get a single invoices report by urId
 *
 * @name GET /getone/:urId
 * @function
 * @memberof module:routes/invoicesReportRoutes~invoicesReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
exports.invoicesReportRoutes.get('/getone/:urId', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { urId } = req.params;
    const invoicesReport = await invoicereport_model_1.invoicesReportLean
        .findOne({ urId })
        .lean()
        .populate({ path: 'estimates', model: estimate_model_1.estimateLean })
        .populate({ path: 'payments', model: payment_model_1.paymentLean });
    return res.status(200).send(invoicesReport);
});
/**
 * Route to get all invoices reports with pagination
 *
 * @name GET /getall/:offset/:limit
 * @function
 * @memberof module:routes/invoicesReportRoutes~invoicesReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
exports.invoicesReportRoutes.get('/getall/:offset/:limit', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const invoicesReports = await invoicereport_model_1.invoicesReportLean
        .find({})
        .skip(offset)
        .limit(limit)
        .lean()
        .populate({ path: 'estimates', model: estimate_model_1.estimateLean })
        .populate({ path: 'payments', model: payment_model_1.paymentLean });
    return res.status(200).send(invoicesReports);
});
/**
 * Route to delete a single invoices report by id
 *
 * @name DELETE /deleteone/:id
 * @function
 * @memberof module:routes/invoicesReportRoutes~invoicesReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
exports.invoicesReportRoutes.delete('/deleteone/:id', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { id } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await invoicereport_model_1.invoicesReportMain.findByIdAndDelete(id);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
/**
 * Route to search invoices reports by a search term and key with pagination
 *
 * @name POST /search/:offset/:limit
 * @function
 * @memberof module:routes/invoicesReportRoutes~invoicesReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
exports.invoicesReportRoutes.post('/search/:offset/:limit', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const invoicesReports = await invoicereport_model_1.invoicesReportLean
        .find({ [searchKey]: { $regex: searchterm, $options: 'i' } })
        .lean()
        .skip(offset)
        .limit(limit)
        .populate({ path: 'estimates', model: estimate_model_1.estimateLean })
        .populate({ path: 'payments', model: payment_model_1.paymentLean });
    return res.status(200).send(invoicesReports);
});
/**
 * Route to delete multiple invoices reports by ids
 *
 * @name PUT /deletemany
 * @function
 * @memberof module:routes/invoicesReportRoutes~invoicesReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
exports.invoicesReportRoutes.put('/deletemany', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { ids } = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)(ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await invoicereport_model_1.invoicesReportMain
        .deleteMany({ _id: { $in: ids } })
        .catch(err => {
        invoicesReportRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
//# sourceMappingURL=invoicereport.routes.js.map