"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoicesReportRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const payment_model_1 = require("../../../models/payment.model");
const estimate_model_1 = require("../../../models/printables/estimate.model");
const invoicereport_model_1 = require("../../../models/printables/report/invoicereport.model");
/** Logger for invoicesReportRoutes */
const invoicesReportRoutesLogger = tracer.colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
        // eslint-disable-next-line no-console
        console.log(data.output);
        const logDir = path_1.default.join(process.cwd() + '/openstockLog/');
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
 * Express router for invoices report routes.
 */
exports.invoicesReportRoutes = express_1.default.Router();
/**
 * Route to create a new invoices report
 * @name POST /create
 * @function
 * @memberof module:routes/invoicesReportRoutes~invoicesReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
exports.invoicesReportRoutes.post('/create/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'create'), async (req, res) => {
    const invoicesReport = req.body.invoicesReport;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    invoicesReport.companyId = filter.companyId;
    const count = await invoicereport_model_1.invoicesReportMain
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    invoicesReport.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    const newInvoiceReport = new invoicereport_model_1.invoicesReportMain(invoicesReport);
    let errResponse;
    const saved = await newInvoiceReport.save().catch(err => {
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
        return err;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    if (saved && saved._id) {
        (0, stock_universal_server_1.addParentToLocals)(res, saved._id, invoicereport_model_1.invoicesReportLean.collection.collectionName, 'makeTrackEdit');
    }
    return res.status(200).send({ success: true });
});
/**
 * Route to get a single invoices report by urId
 * @name GET /getone/:urId
 * @function
 * @memberof module:routes/invoicesReportRoutes~invoicesReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
exports.invoicesReportRoutes.get('/getone/:urId/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'read'), async (req, res) => {
    const { urId } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const invoicesReport = await invoicereport_model_1.invoicesReportLean
        .findOne({ urId, ...filter })
        .lean()
        .populate({ path: 'estimates', model: estimate_model_1.estimateLean })
        .populate({ path: 'payments', model: payment_model_1.paymentLean });
    if (invoicesReport) {
        (0, stock_universal_server_1.addParentToLocals)(res, invoicesReport._id, invoicereport_model_1.invoicesReportLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(invoicesReport);
});
/**
 * Route to get all invoices reports with pagination
 * @name GET /getall/:offset/:limit
 * @function
 * @memberof module:routes/invoicesReportRoutes~invoicesReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
exports.invoicesReportRoutes.get('/getall/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const all = await Promise.all([
        invoicereport_model_1.invoicesReportLean
            .find(filter)
            .skip(offset)
            .limit(limit)
            .lean()
            .populate({ path: 'estimates', model: estimate_model_1.estimateLean })
            .populate({ path: 'payments', model: payment_model_1.paymentLean }),
        invoicereport_model_1.invoicesReportLean.countDocuments(filter)
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, invoicereport_model_1.invoicesReportLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
/**
 * Route to delete a single invoices report by id
 * @name DELETE /deleteone/:id
 * @function
 * @memberof module:routes/invoicesReportRoutes~invoicesReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
exports.invoicesReportRoutes.delete('/deleteone/:id/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'delete'), async (req, res) => {
    const { id } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    // const deleted = await invoicesReportMain.findOneAndDelete({ _id: id, ...filter });
    const deleted = await invoicereport_model_1.invoicesReportMain.updateOne({ _id: id, ...filter }, { $set: { isDeleted: true } });
    if (Boolean(deleted)) {
        (0, stock_universal_server_1.addParentToLocals)(res, id, invoicereport_model_1.invoicesReportLean.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
/**
 * Route to search invoices reports by a search term and key with pagination
 * @name POST /search/:offset/:limit
 * @function
 * @memberof module:routes/invoicesReportRoutes~invoicesReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
exports.invoicesReportRoutes.post('/search/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const all = await Promise.all([
        invoicereport_model_1.invoicesReportLean
            .find({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate({ path: 'estimates', model: estimate_model_1.estimateLean })
            .populate({ path: 'payments', model: payment_model_1.paymentLean }),
        invoicereport_model_1.invoicesReportLean.countDocuments({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, invoicereport_model_1.invoicesReportLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
/**
 * Route to delete multiple invoices reports by ids
 * @name PUT /deletemany
 * @function
 * @memberof module:routes/invoicesReportRoutes~invoicesReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
exports.invoicesReportRoutes.put('/deletemany/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'delete'), async (req, res) => {
    const { ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    /* const deleted = await invoicesReportMain
      .deleteMany({ ...filter, _id: { $in: ids } })
      .catch(err => {
        invoicesReportRoutesLogger.error('deletemany - err: ', err);
  
        return null;
      }); */
    const deleted = await invoicereport_model_1.invoicesReportMain
        .updateMany({ ...filter, _id: { $in: ids } }, {
        $set: { isDeleted: true }
    })
        .catch(err => {
        invoicesReportRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        for (const val of ids) {
            (0, stock_universal_server_1.addParentToLocals)(res, val, invoicereport_model_1.invoicesReportLean.collection.collectionName, 'trackDataDelete');
        }
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
//# sourceMappingURL=invoicereport.routes.js.map