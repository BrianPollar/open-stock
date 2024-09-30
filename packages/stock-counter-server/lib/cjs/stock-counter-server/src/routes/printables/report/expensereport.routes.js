"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseReportRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const expense_model_1 = require("../../../models/expense.model");
const expenesreport_model_1 = require("../../../models/printables/report/expenesreport.model");
/** Logger for expense report routes */
const expenseReportRoutesLogger = tracer.colorConsole({
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
 * Expense report routes.
 */
exports.expenseReportRoutes = express_1.default.Router();
exports.expenseReportRoutes.post('/add', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'create'), async (req, res) => {
    const expenseReport = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    expenseReport.companyId = filter.companyId;
    expenseReport.urId = await (0, stock_universal_server_1.generateUrId)(expenesreport_model_1.expenseReportMain);
    const newExpenseReport = new expenesreport_model_1.expenseReportMain(expenseReport);
    let errResponse;
    const saved = await newExpenseReport.save().catch(err => {
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
    if (saved && saved._id) {
        (0, stock_universal_server_1.addParentToLocals)(res, saved._id, expenesreport_model_1.expenseReportLean.collection.collectionName, 'makeTrackEdit');
    }
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    return res.status(200).send({ success: true });
});
exports.expenseReportRoutes.get('/one/:urId', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'read'), async (req, res) => {
    const { urId } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const expenseReport = await expenesreport_model_1.expenseReportLean
        .findOne({ urId, ...filter })
        .lean()
        .populate({ path: 'expenses', model: expense_model_1.expenseLean });
    if (!expenseReport) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    (0, stock_universal_server_1.addParentToLocals)(res, expenseReport._id, expenesreport_model_1.expenseReportLean.collection.collectionName, 'trackDataView');
    return res.status(200).send(expenseReport);
});
exports.expenseReportRoutes.get('/all/:offset/:limit', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const all = await Promise.all([
        expenesreport_model_1.expenseReportLean
            .find(filter)
            .skip(offset)
            .limit(limit)
            .lean()
            .populate({ path: 'expenses', model: expense_model_1.expenseLean })
            .catch(() => {
            return [];
        }),
        expenesreport_model_1.expenseReportLean.countDocuments(filter)
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, expenesreport_model_1.expenseReportLean.collection.collectionName, 'trackDataView');
    }
    res.status(200).send(response);
    return res.end();
});
exports.expenseReportRoutes.delete('/delete/one/:_id', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'delete'), async (req, res) => {
    const { _id } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    // const deleted = await expenseReportMain.findOneAndDelete({ _id, ...filter });
    const deleted = await expenesreport_model_1.expenseReportMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } });
    if (Boolean(deleted)) {
        (0, stock_universal_server_1.addParentToLocals)(res, _id, expenesreport_model_1.expenseReportLean.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.expenseReportRoutes.post('/filter', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    /* TODO const aggCursor = invoiceLean
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
        expenesreport_model_1.expenseReportLean
            .find({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
            .lean()
            .skip(offset)
            .limit(limit)
            .populate({ path: 'expenses', model: expense_model_1.expenseLean }),
        expenesreport_model_1.expenseReportLean.countDocuments({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, expenesreport_model_1.expenseReportLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.expenseReportRoutes.put('/delete/many', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    /* const deleted = await expenseReportMain
    .deleteMany({ ...filter, _id: { $in: _ids } })
    .catch(err => {
      expenseReportRoutesLogger.error('deletemany - err: ', err);

      return null;
    }); */
    const deleted = await expenesreport_model_1.expenseReportMain
        .updateMany({ ...filter, _id: { $in: _ids } }, {
        $set: { isDeleted: true }
    })
        .catch(err => {
        expenseReportRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        for (const val of _ids) {
            (0, stock_universal_server_1.addParentToLocals)(res, val, expenesreport_model_1.expenseReportLean.collection.collectionName, 'trackDataDelete');
        }
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({
            success: Boolean(deleted),
            err: 'could not delete selected items, try again in a while'
        });
    }
});
//# sourceMappingURL=expensereport.routes.js.map