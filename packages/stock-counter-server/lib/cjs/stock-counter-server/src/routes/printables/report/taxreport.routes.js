"use strict";
/* eslint-disable @typescript-eslint/no-misused-promises */
Object.defineProperty(exports, "__esModule", { value: true });
exports.taxReportRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const payment_model_1 = require("../../../models/payment.model");
const estimate_model_1 = require("../../../models/printables/estimate.model");
const taxreport_model_1 = require("../../../models/printables/report/taxreport.model");
/** Logger for tax report routes */
const taxReportRoutesLogger = tracer.colorConsole({
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
 * Router for tax report routes.
 */
exports.taxReportRoutes = express_1.default.Router();
/**
 * Create a new tax report
 * @name POST /create
 * @function
 * @memberof module:taxReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} - Promise object representing the response
 */
exports.taxReportRoutes.post('/create/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'create'), async (req, res) => {
    const taxReport = req.body.taxReport;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    taxReport.companyId = filter.companyId;
    const count = await taxreport_model_1.taxReportMain
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    taxReport.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    const newTaxReport = new taxreport_model_1.taxReportMain(taxReport);
    let errResponse;
    const saved = await newTaxReport.save()
        .catch(err => {
        taxReportRoutesLogger.error('create - err: ', err);
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
        (0, stock_universal_server_1.addParentToLocals)(res, saved._id, taxreport_model_1.taxReportMain.collection.collectionName, 'makeTrackEdit');
    }
    return res.status(200).send({ success: true });
});
/**
 * Get a single tax report by UR ID
 * @name GET /getone/:urId
 * @function
 * @memberof module:taxReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} - Promise object representing the response
 */
exports.taxReportRoutes.get('/getone/:urId/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'read'), async (req, res) => {
    const { urId } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const taxReport = await taxreport_model_1.taxReportLean
        .findOne({ urId, ...filter })
        .lean()
        .populate({ path: 'estimates', model: estimate_model_1.estimateLean })
        .populate({ path: 'payments', model: payment_model_1.paymentLean });
    if (taxReport) {
        (0, stock_universal_server_1.addParentToLocals)(res, taxReport._id, taxreport_model_1.taxReportMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(taxReport);
});
/**
 * Get all tax reports with pagination
 * @name GET /getall/:offset/:limit
 * @function
 * @memberof module:taxReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} - Promise object representing the response
 */
exports.taxReportRoutes.get('/getall/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const all = await Promise.all([
        taxreport_model_1.taxReportLean
            .find({ ...filter })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate({ path: 'estimates', model: estimate_model_1.estimateLean })
            .populate({ path: 'payments', model: payment_model_1.paymentLean }),
        taxreport_model_1.taxReportLean.countDocuments({ ...filter })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, taxreport_model_1.taxReportMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
/**
 * Delete a single tax report by ID
 * @name DELETE /deleteone/:id
 * @function
 * @memberof module:taxReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} - Promise object representing the response
 */
exports.taxReportRoutes.delete('/deleteone/:id/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'delete'), async (req, res) => {
    const { id } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    // const deleted = await taxReportMain.findOneAndDelete({ _id: id, ...filter });
    const deleted = await taxreport_model_1.taxReportMain.updateOne({ _id: id, ...filter }, { $set: { isDeleted: true } });
    if (Boolean(deleted)) {
        (0, stock_universal_server_1.addParentToLocals)(res, id, taxreport_model_1.taxReportMain.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
/**
 * Search for tax reports with pagination
 * @name POST /search/:offset/:limit
 * @function
 * @memberof module:taxReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} - Promise object representing the response
 */
exports.taxReportRoutes.post('/search/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const all = await Promise.all([
        taxreport_model_1.taxReportLean
            .find({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate({ path: 'estimates', model: estimate_model_1.estimateLean })
            .populate({ path: 'payments', model: payment_model_1.paymentLean }),
        taxreport_model_1.taxReportLean.countDocuments({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, taxreport_model_1.taxReportMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
/**
 * Delete multiple tax reports by ID
 * @name PUT /deletemany
 * @function
 * @memberof module:taxReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} - Promise object representing the response
 */
exports.taxReportRoutes.put('/deletemany/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'delete'), async (req, res) => {
    const { ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    /* const deleted = await taxReportMain
      .deleteMany({ ...filter, _id: { $in: ids } })
      .catch(err => {
        taxReportRoutesLogger.error('deletemany - err: ', err);
  
        return null;
      }); */
    const deleted = await taxreport_model_1.taxReportMain
        .updateMany({ ...filter, _id: { $in: ids } }, {
        $set: { isDeleted: true }
    })
        .catch(err => {
        taxReportRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        for (const val of ids) {
            (0, stock_universal_server_1.addParentToLocals)(res, val, taxreport_model_1.taxReportMain.collection.collectionName, 'trackDataDelete');
        }
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
//# sourceMappingURL=taxreport.routes.js.map