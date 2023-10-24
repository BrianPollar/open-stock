"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.salesReportRoutes = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-misused-promises */
const express_1 = tslib_1.__importDefault(require("express"));
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const estimate_model_1 = require("../../../models/printables/estimate.model");
const salesreport_model_1 = require("../../../models/printables/report/salesreport.model");
const log4js_1 = require("log4js");
const invoicerelated_model_1 = require("../../../models/printables/related/invoicerelated.model");
/** */
const salesReportRoutesLogger = (0, log4js_1.getLogger)('routes/salesReportRoutes');
/** */
exports.salesReportRoutes = express_1.default.Router();
exports.salesReportRoutes.post('/create', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const salesReport = req.body.salesReport;
    const count = await salesreport_model_1.salesReportMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    salesReport.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    const newSalesReport = new salesreport_model_1.salesReportMain(salesReport);
    let errResponse;
    const saved = await newSalesReport.save()
        .catch(err => {
        salesReportRoutesLogger.error('create - err: ', err);
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
exports.salesReportRoutes.get('/getone/:urId', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { urId } = req.params;
    const salesReport = await salesreport_model_1.salesReportLean
        .findOne({ urId })
        .lean()
        .populate({ path: 'estimates', model: estimate_model_1.estimateLean })
        .populate({ path: 'invoiceRelateds', model: invoicerelated_model_1.invoiceRelatedLean });
    return res.status(200).send(salesReport);
});
exports.salesReportRoutes.get('/getall/:offset/:limit', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const salesReports = await salesreport_model_1.salesReportLean
        .find({})
        .skip(offset)
        .limit(limit)
        .lean()
        .populate({ path: 'estimates', model: estimate_model_1.estimateLean })
        .populate({ path: 'invoiceRelateds', model: invoicerelated_model_1.invoiceRelatedLean });
    return res.status(200).send(salesReports);
});
exports.salesReportRoutes.delete('/deleteone/:id', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { id } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await salesreport_model_1.salesReportMain.findByIdAndDelete(id);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.salesReportRoutes.post('/search/:limit/:offset', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const salesReports = await salesreport_model_1.salesReportLean
        .find({ [searchKey]: { $regex: searchterm, $options: 'i' } })
        .lean()
        .skip(offset)
        .limit(limit)
        .populate({ path: 'estimates', model: estimate_model_1.estimateLean })
        .populate({ path: 'invoiceRelateds', model: invoicerelated_model_1.invoiceRelatedLean });
    return res.status(200).send(salesReports);
});
exports.salesReportRoutes.put('/deletemany', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { ids } = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)(ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await salesreport_model_1.salesReportMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ _id: { $in: ids } })
        .catch(err => {
        salesReportRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
//# sourceMappingURL=salesreport.routes.js.map