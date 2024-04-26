"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiptRoutes = void 0;
const tslib_1 = require("tslib");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
// import { paymentInstallsLean } from '../../models/printables/paymentrelated/paymentsinstalls.model';
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const receipt_model_1 = require("../../models/printables/receipt.model");
const invoicerelated_model_1 = require("../../models/printables/related/invoicerelated.model");
const paymentrelated_1 = require("../paymentrelated/paymentrelated");
const invoicerelated_1 = require("./related/invoicerelated");
/**
 * Router for handling receipt routes.
 */
exports.receiptRoutes = express_1.default.Router();
exports.receiptRoutes.post('/create/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_auth_server_1.requireCanUseFeature)('receipt'), (0, stock_universal_server_1.roleAuthorisation)('receipts', 'create'), async (req, res, next) => {
    const { receipt, invoiceRelated } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    receipt.companyId = queryId;
    invoiceRelated.companyId = queryId;
    const count = await receipt_model_1.receiptMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    receipt.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    const extraNotifDesc = 'Newly created receipt';
    const invoiceRelatedRes = await (0, invoicerelated_1.relegateInvRelatedCreation)(invoiceRelated, queryId, extraNotifDesc);
    if (!invoiceRelatedRes.success) {
        return res.status(invoiceRelatedRes.status).send(invoiceRelatedRes);
    }
    receipt.invoiceRelated = invoiceRelatedRes.id;
    await (0, paymentrelated_1.makePaymentInstall)(receipt, invoiceRelatedRes.id, queryId);
    // const newReceipt = new receiptMain(receipt);
    /* let errResponse: Isuccess;
    const saved = await newReceipt.save()
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
    await updateInvoiceRelated(invoiceRelated);*/
    return next();
}, (0, stock_auth_server_1.requireUpdateSubscriptionRecord)('receipt'));
exports.receiptRoutes.get('/getone/:urId/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('receipts', 'read'), async (req, res) => {
    const { urId } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const receipt = await receipt_model_1.receiptLean
        .findOne({ urId, queryId })
        .lean()
        .populate({
        path: 'invoiceRelated', model: invoicerelated_model_1.invoiceRelatedLean,
        populate: [{
                path: 'billingUserId', model: stock_auth_server_1.userLean
            },
            {
                path: 'payments', model: receipt_model_1.receiptLean
            }]
    });
    let returned;
    if (receipt) {
        const relateds = (0, invoicerelated_1.makeInvoiceRelatedPdct)(receipt.invoiceRelated, receipt.invoiceRelated
            .billingUserId);
        // ensure reciepts are properly being populated
        returned = { ...receipt, ...relateds };
    }
    return res.status(200).send(returned);
});
exports.receiptRoutes.get('/getall/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('receipts', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const all = await Promise.all([
        receipt_model_1.receiptLean
            .find({ companyId: queryId })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate({
            path: 'invoiceRelated', model: invoicerelated_model_1.invoiceRelatedLean,
            populate: [{
                    path: 'billingUserId', model: stock_auth_server_1.userLean
                },
                {
                    path: 'payments', model: receipt_model_1.receiptLean
                }]
        }),
        receipt_model_1.receiptLean.countDocuments({ companyId: queryId })
    ]);
    const returned = all[0]
        .map(val => {
        const related = (0, invoicerelated_1.makeInvoiceRelatedPdct)(val.invoiceRelated, val.invoiceRelated
            .billingUserId);
        return { ...val, ...related };
    });
    const response = {
        count: all[1],
        data: returned
    };
    return res.status(200).send(response);
});
exports.receiptRoutes.put('/deleteone/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('receipts', 'delete'), async (req, res) => {
    const { id, invoiceRelated, creationType, stage } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await (0, invoicerelated_1.deleteAllLinked)(invoiceRelated, creationType, stage, 'receipt', queryId);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.receiptRoutes.post('/search/:limit/:offset/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('receipts', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const all = await Promise.all([
        receipt_model_1.receiptLean
            .find({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate({
            path: 'invoiceRelated', model: invoicerelated_model_1.invoiceRelatedLean,
            populate: [{
                    path: 'billingUserId', model: stock_auth_server_1.userLean
                },
                {
                    path: 'payments', model: receipt_model_1.receiptLean
                }]
        }),
        receipt_model_1.receiptLean.countDocuments({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
    ]);
    const returned = all[0]
        .map(val => (0, invoicerelated_1.makeInvoiceRelatedPdct)(val.invoiceRelated, val.invoiceRelated
        .billingUserId));
    const response = {
        count: all[1],
        data: returned
    };
    return res.status(200).send(response);
});
exports.receiptRoutes.put('/update/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('receipts', 'update'), async (req, res) => {
    const { updatedReceipt, invoiceRelated } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    updatedReceipt.companyId = queryId;
    invoiceRelated.companyId = queryId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([updatedReceipt._id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const found = await receipt_model_1.receiptMain.findOneAndUpdate({ _id: updatedReceipt._id, companyId: queryId });
    if (!found) {
        return res.status(404).send({ success: false, status: 404, err: 'not found' });
    }
    found.paymentMode = updatedReceipt.paymentMode || found.paymentMode;
    await found.save();
    await (0, invoicerelated_1.updateInvoiceRelated)(invoiceRelated, queryId);
    return res.status(200).send({ success: true });
});
exports.receiptRoutes.put('/deletemany/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('receipts', 'delete'), async (req, res) => {
    const { credentials } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    if (!credentials || credentials?.length < 1) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    /** await receiptMain
      // eslint-disable-next-line @typescript-eslint/naming-convention
      .deleteMany({ _id: { $in: ids } });**/
    const promises = credentials
        .map(async (val) => {
        await (0, invoicerelated_1.deleteAllLinked)(val.invoiceRelated, val.creationType, val.stage, 'receipt', queryId);
        return new Promise(resolve => resolve(true));
    });
    await Promise.all(promises);
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=receipt.routes.js.map