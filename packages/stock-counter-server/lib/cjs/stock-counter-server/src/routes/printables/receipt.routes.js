"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiptRoutes = void 0;
const tslib_1 = require("tslib");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
// import { paymentInstallsLean } from '../../models/printables/paymentrelated/paymentsinstalls.model';
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const receipt_model_1 = require("../../models/printables/receipt.model");
const query_1 = require("../../utils/query");
const paymentrelated_1 = require("../paymentrelated/paymentrelated");
const invoicerelated_1 = require("./related/invoicerelated");
/**
 * Router for handling receipt routes.
 */
exports.receiptRoutes = express_1.default.Router();
exports.receiptRoutes.post('/create/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_auth_server_1.requireCanUseFeature)('receipt'), (0, stock_universal_server_1.roleAuthorisation)('receipts', 'create'), async (req, res, next) => {
    const { receipt, invoiceRelated } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    receipt.companyId = filter.companyId;
    invoiceRelated.companyId = filter.companyId;
    const count = await receipt_model_1.receiptMain
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    receipt.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    const extraNotifDesc = 'Newly created receipt';
    const invoiceRelatedRes = await (0, invoicerelated_1.relegateInvRelatedCreation)(res, invoiceRelated, filter.companyId, extraNotifDesc);
    if (!invoiceRelatedRes.success) {
        return res.status(invoiceRelatedRes.status).send(invoiceRelatedRes);
    }
    receipt.invoiceRelated = invoiceRelatedRes.id;
    await (0, paymentrelated_1.makePaymentInstall)(res, receipt, invoiceRelatedRes.id, filter.companyId, invoiceRelated.creationType);
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
    await updateInvoiceRelated(invoiceRelated); */
    return next();
}, (0, stock_auth_server_1.requireUpdateSubscriptionRecord)('receipt'));
exports.receiptRoutes.get('/getone/:urId/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('receipts', 'read'), async (req, res) => {
    const { urId } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const receipt = await receipt_model_1.receiptLean
        .findOne({ urId, ...filter })
        .lean()
        .populate([(0, query_1.populateInvoiceRelated)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()]);
    let returned;
    if (receipt) {
        const relateds = (0, invoicerelated_1.makeInvoiceRelatedPdct)(receipt.invoiceRelated, receipt.invoiceRelated
            .billingUserId);
        // ensure reciepts are properly being populated
        returned = { ...receipt, ...relateds, ...{
                _id: receipt._id,
                urId: receipt.urId
            } };
        (0, stock_universal_server_1.addParentToLocals)(res, receipt._id, receipt_model_1.receiptLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(returned);
});
exports.receiptRoutes.get('/getall/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('receipts', 'read'), async (req, res) => {
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
        .map(val => {
        const related = (0, invoicerelated_1.makeInvoiceRelatedPdct)(val.invoiceRelated, val.invoiceRelated
            .billingUserId);
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
exports.receiptRoutes.put('/deleteone/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('receipts', 'delete'), async (req, res) => {
    const { id, invoiceRelated, creationType, stage } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const deleted = await (0, invoicerelated_1.deleteAllLinked)(invoiceRelated, creationType, stage, 'receipt', filter.companyId);
    if (Boolean(deleted)) {
        (0, stock_universal_server_1.addParentToLocals)(res, id, receipt_model_1.receiptLean.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.receiptRoutes.post('/search/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('receipts', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const all = await Promise.all([
        receipt_model_1.receiptLean
            .find({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate([(0, query_1.populateInvoiceRelated)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()]),
        receipt_model_1.receiptLean.countDocuments({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
    ]);
    const returned = all[0]
        .map(val => (0, invoicerelated_1.makeInvoiceRelatedPdct)(val.invoiceRelated, val.invoiceRelated
        .billingUserId));
    const response = {
        count: all[1],
        data: returned
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, receipt_model_1.receiptLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.receiptRoutes.put('/update/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('receipts', 'update'), async (req, res) => {
    const { updatedReceipt, invoiceRelated } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const found = await receipt_model_1.receiptMain
        .findOne({ _id: updatedReceipt._id, ...filter })
        .lean();
    if (!found) {
        return res.status(404).send({ success: false, status: 404, err: 'not found' });
    }
    let savedErr;
    await receipt_model_1.receiptMain.updateOne({
        _id: updatedReceipt._id, ...filter
    }, {
        $set: {
            paymentMode: updatedReceipt.paymentMode || found.paymentMode,
            isDeleted: updatedReceipt.isDeleted || found.isDeleted
        }
    }).catch(err => {
        exports.receiptRoutes.error('save error', err);
        savedErr = err;
        return null;
    });
    if (savedErr) {
        return res.status(500).send({ success: false });
    }
    (0, stock_universal_server_1.addParentToLocals)(res, found._id, receipt_model_1.receiptLean.collection.collectionName, 'makeTrackEdit');
    await (0, invoicerelated_1.updateInvoiceRelated)(res, invoiceRelated, filter.companyId);
    return res.status(200).send({ success: true });
});
exports.receiptRoutes.put('/deletemany/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('receipts', 'delete'), async (req, res) => {
    const { credentials } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    if (!credentials || credentials?.length < 1) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    /** await receiptMain
      .deleteMany({ _id: { $in: ids } });**/
    const promises = credentials
        .map(async (val) => {
        await (0, invoicerelated_1.deleteAllLinked)(val.invoiceRelated, val.creationType, val.stage, 'receipt', filter.companyId);
        return new Promise(resolve => resolve(true));
    });
    await Promise.all(promises);
    for (const val of credentials) {
        (0, stock_universal_server_1.addParentToLocals)(res, val.id, receipt_model_1.receiptLean.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=receipt.routes.js.map