"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.salesReportRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const estimate_model_1 = require("../../../models/printables/estimate.model");
const invoicerelated_model_1 = require("../../../models/printables/related/invoicerelated.model");
const salesreport_model_1 = require("../../../models/printables/report/salesreport.model");
/** Logger for sales report routes */
const salesReportRoutesLogger = tracer.colorConsole({
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
 * Express router for sales report routes.
 */
exports.salesReportRoutes = express_1.default.Router();
exports.salesReportRoutes.post('/add', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'create'), async (req, res) => {
    const salesReport = req.body.salesReport;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    salesReport.companyId = filter.companyId;
    salesReport.urId = await (0, stock_universal_server_1.generateUrId)(salesreport_model_1.salesReportMain);
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
        return err;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    if (saved && saved._id) {
        (0, stock_universal_server_1.addParentToLocals)(res, saved._id, salesreport_model_1.salesReportLean.collection.collectionName, 'makeTrackEdit');
    }
    return res.status(200).send({ success: true });
});
exports.salesReportRoutes.get('/one/:urId', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'read'), async (req, res) => {
    const { urId } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const salesReport = await salesreport_model_1.salesReportLean
        .findOne({ urId, ...filter })
        .lean()
        .populate({ path: 'estimates', model: estimate_model_1.estimateLean })
        .populate({ path: 'invoiceRelateds', model: invoicerelated_model_1.invoiceRelatedLean });
    if (!salesReport) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    (0, stock_universal_server_1.addParentToLocals)(res, salesReport._id, salesreport_model_1.salesReportLean.collection.collectionName, 'trackDataView');
    return res.status(200).send(salesReport);
});
exports.salesReportRoutes.get('/all/:offset/:limit', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const all = await Promise.all([
        salesreport_model_1.salesReportLean
            .find({ ...filter })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate({ path: 'estimates', model: estimate_model_1.estimateLean })
            .populate({ path: 'invoiceRelateds', model: invoicerelated_model_1.invoiceRelatedLean }),
        salesreport_model_1.salesReportLean.countDocuments({ ...filter })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, salesreport_model_1.salesReportLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.salesReportRoutes.delete('/delete/one/:_id', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'delete'), async (req, res) => {
    const { _id } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    // const deleted = await salesReportMain.findOneAndDelete({ _id, ...filter });
    const deleted = await salesreport_model_1.salesReportMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } });
    if (Boolean(deleted)) {
        (0, stock_universal_server_1.addParentToLocals)(res, _id, salesreport_model_1.salesReportLean.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.salesReportRoutes.post('/filter', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    /*
  const aggCursor = invoiceLean
 .aggregate<IfilterAggResponse<soth>>([
  ...lookupSubFieldInvoiceRelatedFilter(constructFiltersFromBody(req), propSort, offset, limit)
]);
  const dataArr: IfilterAggResponse<soth>[] = [];

  for await (const data of aggCursor) {
    dataArr.push(data);
  }

  const all = dataArr[0]?.data || [];
  const count = dataArr[0]?.total?.count || 0;
  */
    const all = await Promise.all([
        salesreport_model_1.salesReportLean
            .find({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate({ path: 'estimates', model: estimate_model_1.estimateLean })
            .populate({ path: 'invoiceRelateds', model: invoicerelated_model_1.invoiceRelatedLean }),
        salesreport_model_1.salesReportLean.countDocuments({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, salesreport_model_1.salesReportLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.salesReportRoutes.put('/delete/many', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    /* const deleted = await salesReportMain
    .deleteMany({ ...filter, _id: { $in: _ids } })
    .catch(err => {
      salesReportRoutesLogger.error('deletemany - err: ', err);

      return null;
    }); */
    const deleted = await salesreport_model_1.salesReportMain
        .updateMany({ ...filter, _id: { $in: _ids } }, {
        $set: { isDeleted: true }
    })
        .catch(err => {
        salesReportRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        for (const val of _ids) {
            (0, stock_universal_server_1.addParentToLocals)(res, val, salesreport_model_1.salesReportLean.collection.collectionName, 'trackDataDelete');
        }
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({
            success: Boolean(deleted), err: 'could not delete selected items, try again in a while'
        });
    }
});
//# sourceMappingURL=salesreport.routes.js.map