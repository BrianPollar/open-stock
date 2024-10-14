"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseReportRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const mongoose_1 = require("mongoose");
const expense_model_1 = require("../../../models/expense.model");
const expenesreport_model_1 = require("../../../models/printables/report/expenesreport.model");
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
    const savedRes = await newExpenseReport.save().catch((err) => err);
    if (savedRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    if (savedRes && savedRes._id) {
        (0, stock_universal_server_1.addParentToLocals)(res, savedRes._id, expenesreport_model_1.expenseReportLean.collection.collectionName, 'makeTrackEdit');
    }
    return res.status(200).send({ success: true });
});
exports.expenseReportRoutes.get('/one/:urIdOr_id', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'read'), async (req, res) => {
    const { urIdOr_id } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const filterwithId = (0, stock_universal_server_1.verifyObjectId)(urIdOr_id) ? { _id: urIdOr_id } : { urId: urIdOr_id };
    const expenseReport = await expenesreport_model_1.expenseReportLean
        .findOne({ ...filterwithId, ...filter })
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
    const updateRes = await expenesreport_model_1.expenseReportMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } })
        .catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, _id, expenesreport_model_1.expenseReportLean.collection.collectionName, 'trackDataDelete');
    return res.status(200).send({ success: true });
});
exports.expenseReportRoutes.post('/filter', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'read'), async (req, res) => {
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
            .find({ ...filter })
            .lean()
            .skip(offset)
            .limit(limit)
            .populate({ path: 'expenses', model: expense_model_1.expenseLean }),
        expenesreport_model_1.expenseReportLean.countDocuments({ ...filter })
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
    const updateRes = await expenesreport_model_1.expenseReportMain
        .updateMany({ ...filter, _id: { $in: _ids } }, {
        $set: { isDeleted: true }
    })
        .catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    for (const val of _ids) {
        (0, stock_universal_server_1.addParentToLocals)(res, val, expenesreport_model_1.expenseReportLean.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=expensereport.routes.js.map