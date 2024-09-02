"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profitAndLossReportRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const expense_model_1 = require("../../../models/expense.model");
const payment_model_1 = require("../../../models/payment.model");
const profitandlossreport_model_1 = require("../../../models/printables/report/profitandlossreport.model");
/** Logger for the profit and loss report routes */
const profitAndLossReportRoutesLogger = tracer.colorConsole({
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
 * Router for profit and loss report.
 */
exports.profitAndLossReportRoutes = express_1.default.Router();
/**
 * Create a new profit and loss report.
 * @param req - The request object.
 * @param res - The response object.
 */
exports.profitAndLossReportRoutes.post('/create/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'create'), async (req, res) => {
    const profitAndLossReport = req.body.profitAndLossReport;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    profitAndLossReport.companyId = filter.companyId;
    const count = await profitandlossreport_model_1.profitandlossReportMain
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
        return err;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    if (saved && saved._id) {
        (0, stock_universal_server_1.addParentToLocals)(res, saved._id, profitandlossreport_model_1.profitandlossReportLean.collection.collectionName, 'makeTrackEdit');
    }
    return res.status(200).send({ success: true });
});
/**
 * Get a single profit and loss report by URID.
 * @param req - The request object.
 * @param res - The response object.
 */
exports.profitAndLossReportRoutes.get('/getone/:urId/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'read'), async (req, res) => {
    const { urId } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const profitAndLossReport = await profitandlossreport_model_1.profitandlossReportLean
        .findOne({ urId, ...filter })
        .lean()
        .populate({ path: 'expenses', model: expense_model_1.expenseLean })
        .populate({ path: 'payments', model: payment_model_1.paymentLean });
    if (profitAndLossReport) {
        (0, stock_universal_server_1.addParentToLocals)(res, profitAndLossReport._id, profitandlossreport_model_1.profitandlossReportLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(profitAndLossReport);
});
/**
 * Get all profit and loss reports with pagination.
 * @param req - The request object.
 * @param res - The response object.
 */
exports.profitAndLossReportRoutes.get('/getall/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const all = await Promise.all([
        profitandlossreport_model_1.profitandlossReportLean
            .find(filter)
            .skip(offset)
            .limit(limit)
            .lean()
            .populate({ path: 'expenses', model: expense_model_1.expenseLean })
            .populate({ path: 'payments', model: payment_model_1.paymentLean }),
        profitandlossreport_model_1.profitandlossReportLean.countDocuments(filter)
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, profitandlossreport_model_1.profitandlossReportLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
/**
 * Delete a single profit and loss report by ID.
 * @param req - The request object.
 * @param res - The response object.
 */
exports.profitAndLossReportRoutes.delete('/deleteone/:id/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'delete'), async (req, res) => {
    const { id } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    // const deleted = await profitandlossReportMain.findOneAndDelete({ _id: id, ...filter });
    const deleted = await profitandlossreport_model_1.profitandlossReportMain.updateOne({ _id: id, ...filter }, { $set: { isDeleted: true } });
    if (Boolean(deleted)) {
        (0, stock_universal_server_1.addParentToLocals)(res, id, profitandlossreport_model_1.profitandlossReportLean.collection.collectionName, 'trackDataDelete');
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
exports.profitAndLossReportRoutes.post('/search/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const all = await Promise.all([
        profitandlossreport_model_1.profitandlossReportLean
            .find({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate({ path: 'expenses', model: expense_model_1.expenseLean })
            .populate({ path: 'payments', model: payment_model_1.paymentLean }),
        profitandlossreport_model_1.profitandlossReportLean.countDocuments({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, profitandlossreport_model_1.profitandlossReportLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
/**
 * Delete multiple profit and loss reports by ID.
 * @param req - The request object.
 * @param res - The response object.
 */
exports.profitAndLossReportRoutes.put('/deletemany/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'delete'), async (req, res) => {
    const { ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    /* const deleted = await profitandlossReportMain
      .deleteMany({ ...filter, _id: { $in: ids } })
      .catch(err => {
        profitAndLossReportRoutesLogger.debug('deletemany - err', err);
  
        return null;
      }); */
    const deleted = await profitandlossreport_model_1.profitandlossReportMain
        .updateMany({ ...filter, _id: { $in: ids } }, {
        $set: { isDeleted: true }
    })
        .catch(err => {
        profitAndLossReportRoutesLogger.debug('deletemany - err', err);
        return null;
    });
    if (Boolean(deleted)) {
        for (const val of ids) {
            (0, stock_universal_server_1.addParentToLocals)(res, val, profitandlossreport_model_1.profitandlossReportLean.collection.collectionName, 'trackDataDelete');
        }
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
//# sourceMappingURL=profitandlossreport.routes.js.map