"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoicesReportRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const mongoose_1 = require("mongoose");
const payment_model_1 = require("../../../models/payment.model");
const estimate_model_1 = require("../../../models/printables/estimate.model");
const invoicereport_model_1 = require("../../../models/printables/report/invoicereport.model");
/**
 * Express router for invoices report routes.
 */
exports.invoicesReportRoutes = express_1.default.Router();
exports.invoicesReportRoutes.post('/add', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'create'), async (req, res) => {
    const invoicesReport = req.body.invoicesReport;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    invoicesReport.companyId = filter.companyId;
    invoicesReport.urId = await (0, stock_universal_server_1.generateUrId)(invoicereport_model_1.invoicesReportMain);
    const newInvoiceReport = new invoicereport_model_1.invoicesReportMain(invoicesReport);
    const savedRes = await newInvoiceReport.save().catch((err) => err);
    if (savedRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    if (savedRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, savedRes._id, invoicereport_model_1.invoicesReportLean.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: true });
});
exports.invoicesReportRoutes.get('/one/:urIdOr_id', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'read'), async (req, res) => {
    const { urIdOr_id } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const filterwithId = (0, stock_universal_server_1.verifyObjectId)(urIdOr_id) ? { _id: urIdOr_id } : { urId: urIdOr_id };
    const invoicesReport = await invoicereport_model_1.invoicesReportLean
        .findOne({ ...filterwithId, ...filter })
        .lean()
        .populate({ path: 'estimates', model: estimate_model_1.estimateLean })
        .populate({ path: 'payments', model: payment_model_1.paymentLean });
    if (!invoicesReport) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    (0, stock_universal_server_1.addParentToLocals)(res, invoicesReport._id, invoicereport_model_1.invoicesReportLean.collection.collectionName, 'trackDataView');
    return res.status(200).send(invoicesReport);
});
exports.invoicesReportRoutes.get('/all/:offset/:limit', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'read'), async (req, res) => {
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
exports.invoicesReportRoutes.delete('/delete/one/:_id', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'delete'), async (req, res) => {
    const { _id } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    // const deleted = await invoicesReportMain.findOneAndDelete({ _id, ...filter });
    const updateRes = await invoicereport_model_1.invoicesReportMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } })
        .catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, _id, invoicereport_model_1.invoicesReportLean.collection.collectionName, 'trackDataDelete');
    return res.status(200).send({ success: true });
});
exports.invoicesReportRoutes.post('/filter', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'read'), async (req, res) => {
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    /* TODO
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
        invoicereport_model_1.invoicesReportLean
            .find({ ...filter })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate({ path: 'estimates', model: estimate_model_1.estimateLean })
            .populate({ path: 'payments', model: payment_model_1.paymentLean }),
        invoicereport_model_1.invoicesReportLean.countDocuments({ ...filter })
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
exports.invoicesReportRoutes.put('/delete/many', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('reports', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const updateRes = await invoicereport_model_1.invoicesReportMain
        .updateMany({ ...filter, _id: { $in: _ids } }, {
        $set: { isDeleted: true }
    })
        .catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    for (const val of _ids) {
        (0, stock_universal_server_1.addParentToLocals)(res, val, invoicereport_model_1.invoicesReportLean.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=invoicereport.routes.js.map