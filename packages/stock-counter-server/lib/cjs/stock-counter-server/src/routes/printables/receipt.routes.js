"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiptRoutes = void 0;
const tslib_1 = require("tslib");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
// import { paymentInstallsLean } from '../../models/printables/paymentrelated/paymentsinstalls.model';
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const mongoose_1 = require("mongoose");
const receipt_model_1 = require("../../models/printables/receipt.model");
const query_1 = require("../../utils/query");
const paymentrelated_1 = require("../paymentrelated/paymentrelated");
const invoicerelated_1 = require("./related/invoicerelated");
/**
 * Router for handling receipt routes.
 */
exports.receiptRoutes = express_1.default.Router();
exports.receiptRoutes.post('/add', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_auth_server_1.requireCanUseFeature)('receipt'), (0, stock_universal_server_1.roleAuthorisation)('receipts', 'create'), async (req, res, next) => {
    const { receipt, invoiceRelated } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    receipt.companyId = filter.companyId;
    invoiceRelated.companyId = filter.companyId;
    receipt.urId = await (0, stock_universal_server_1.generateUrId)(receipt_model_1.receiptMain);
    const extraNotifDesc = 'Newly created receipt';
    const invoiceRelatedRes = await (0, invoicerelated_1.relegateInvRelatedCreation)(res, invoiceRelated, filter.companyId, extraNotifDesc);
    if (!invoiceRelatedRes.success || !invoiceRelatedRes._id) {
        return res.status(invoiceRelatedRes.status || 403).send(invoiceRelatedRes);
    }
    receipt.invoiceRelated = invoiceRelatedRes._id;
    await (0, paymentrelated_1.makePaymentInstall)(res, receipt, invoiceRelatedRes._id, filter.companyId, invoiceRelated.creationType);
    // const newReceipt = new receiptMain(receipt);
    /*
  const savedRes = await newReceipt.save()
    .catch(err => {
      receiptRoutesLogger.error('create - err: ', err);
      errResponse = {
        success: false,
        status: 403
      };
      if (err && err.errors) {
        errResponse.err = stringifyMongooseErr(err.errors);
      } else {
        errResponse.err = `we are having problems connecting to our databases,
        try again in a while`;
      }
      return errResponse;
    });

  if (errResponse) {
    return res.status(403).send(errResponse);
  }
  await updateInvoiceRelated(invoiceRelated); */
    return next();
}, (0, stock_auth_server_1.requireUpdateSubscriptionRecord)('receipt'));
exports.receiptRoutes.get('/one/:urIdOr_id', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('receipts', 'read'), async (req, res) => {
    const { urIdOr_id } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const filterwithId = (0, stock_universal_server_1.verifyObjectId)(urIdOr_id) ? { _id: urIdOr_id } : { urId: urIdOr_id };
    const receipt = await receipt_model_1.receiptLean
        .findOne({ ...filterwithId, ...filter })
        .lean()
        .populate([(0, query_1.populateInvoiceRelated)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()]);
    if (!receipt || !receipt.invoiceRelated) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const relateds = (0, invoicerelated_1.makeInvoiceRelatedPdct)(receipt.invoiceRelated, receipt.invoiceRelated?.billingUserId);
    // ensure reciepts are properly being populated
    const returned = { ...receipt, ...relateds, ...{
            _id: receipt._id,
            urId: receipt.urId
        } };
    (0, stock_universal_server_1.addParentToLocals)(res, receipt._id, receipt_model_1.receiptLean.collection.collectionName, 'trackDataView');
    return res.status(200).send(returned);
});
exports.receiptRoutes.get('/all/:offset/:limit', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('receipts', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const all = await Promise.all([
        receipt_model_1.receiptLean
            .find(filter)
            .skip(offset)
            .limit(limit)
            .lean()
            .populate([(0, query_1.populateInvoiceRelated)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()]),
        receipt_model_1.receiptLean.countDocuments(filter)
    ]);
    const returned = all[0]
        .filter(val => val && val.invoiceRelated)
        .map(val => {
        const related = (0, invoicerelated_1.makeInvoiceRelatedPdct)(val.invoiceRelated, val.invoiceRelated?.billingUserId);
        return { ...val, ...related, ...{
                _id: val._id,
                urId: val.urId
            } };
    });
    const response = {
        count: all[1],
        data: returned
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, receipt_model_1.receiptLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.receiptRoutes.put('/delete/one', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('receipts', 'delete'), async (req, res) => {
    const { _id } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const found = await receipt_model_1.receiptLean.findOne({ _id }).lean();
    if (!found) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const updateRes = await (0, invoicerelated_1.deleteAllLinked)(found.invoiceRelated, 'receipt', filter.companyId);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, _id, receipt_model_1.receiptLean.collection.collectionName, 'trackDataDelete');
    return res.status(200).send({ success: true });
});
exports.receiptRoutes.post('/filter', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('receipts', 'read'), async (req, res) => {
    const { propSort, returnEmptyArr } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const aggCursor = receipt_model_1.receiptLean
        .aggregate([
        ...(0, stock_universal_server_1.lookupSubFieldInvoiceRelatedFilter)((0, stock_universal_server_1.constructFiltersFromBody)(req), offset, limit, propSort, returnEmptyArr)
    ]);
    const dataArr = [];
    for await (const data of aggCursor) {
        dataArr.push(data);
    }
    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;
    const returned = all
        .filter(val => val && val.invoiceRelated)
        .map(val => (0, invoicerelated_1.makeInvoiceRelatedPdct)(val.invoiceRelated, val.invoiceRelated?.billingUserId));
    const response = {
        count,
        data: returned
    };
    for (const val of all) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, receipt_model_1.receiptLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.receiptRoutes.put('/update', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('receipts', 'update'), async (req, res) => {
    const { updatedReceipt, invoiceRelated } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const found = await receipt_model_1.receiptMain
        .findOne({ _id: updatedReceipt._id, ...filter })
        .lean();
    if (!found) {
        return res.status(404).send({ success: false, status: 404, err: 'not found' });
    }
    const updateRes = await receipt_model_1.receiptMain.updateOne({
        _id: updatedReceipt._id, ...filter
    }, {
        $set: {
            paymentMode: updatedReceipt.paymentMode || found.paymentMode,
            isDeleted: updatedReceipt.isDeleted || found.isDeleted
        }
    }).catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, found._id, receipt_model_1.receiptLean.collection.collectionName, 'makeTrackEdit');
    await (0, invoicerelated_1.updateInvoiceRelated)(res, invoiceRelated);
    return res.status(200).send({ success: true });
});
exports.receiptRoutes.put('/delete/many', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('receipts', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const promises = _ids
        .map(async (val) => {
        const found = await receipt_model_1.receiptLean.findOne({ _id: val }).lean();
        if (found) {
            await (0, invoicerelated_1.deleteAllLinked)(found.invoiceRelated, 'receipt', filter.companyId);
        }
        return new Promise(resolve => resolve(found?._id));
    });
    const filterdExist = await Promise.all(promises);
    for (const val of filterdExist.filter(value => value)) {
        (0, stock_universal_server_1.addParentToLocals)(res, val, receipt_model_1.receiptLean.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=receipt.routes.js.map