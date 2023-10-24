"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiptRoutes = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-misused-promises */
const express_1 = tslib_1.__importDefault(require("express"));
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
// import { paymentInstallsLean } from '../../models/printables/paymentrelated/paymentsinstalls.model';
const receipt_model_1 = require("../../models/printables/receipt.model");
const invoicerelated_model_1 = require("../../models/printables/related/invoicerelated.model");
const invoicerelated_1 = require("./related/invoicerelated");
const log4js_1 = require("log4js");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const paymentrelated_1 = require("../paymentrelated/paymentrelated");
/** */
const receiptRoutesLogger = (0, log4js_1.getLogger)('routes/receiptRoutes');
/** */
exports.receiptRoutes = express_1.default.Router();
exports.receiptRoutes.post('/create', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { receipt, invoiceRelated } = req.body;
    const count = await receipt_model_1.receiptMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    receipt.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    const extraNotifDesc = 'Newly created receipt';
    const invoiceRelatedRes = await (0, invoicerelated_1.relegateInvRelatedCreation)(invoiceRelated, extraNotifDesc, req.app.locals.stockCounterServer.notifRedirectUrl, req.app.locals.stockCounterServer.locaLMailHandler);
    if (!invoiceRelatedRes.success) {
        return res.status(invoiceRelatedRes.status).send(invoiceRelatedRes);
    }
    receipt.invoiceRelated = invoiceRelatedRes.id;
    console.log('going to make install now ', receipt.invoiceRelated);
    const added = await (0, paymentrelated_1.makePaymentInstall)(receipt, invoiceRelatedRes.id);
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
    return res.status(200).send({ success: added });
});
exports.receiptRoutes.get('/getone/:urId', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { urId } = req.params;
    const receipt = await receipt_model_1.receiptLean
        .findOne({ urId })
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
    console.log('one to return ', receipt);
    return res.status(200).send(returned);
});
exports.receiptRoutes.get('/getall/:offset/:limit', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const receipts = await receipt_model_1.receiptLean
        .find({})
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
    });
    const returned = receipts
        .map(val => {
        const related = (0, invoicerelated_1.makeInvoiceRelatedPdct)(val.invoiceRelated, val.invoiceRelated
            .billingUserId);
        return { ...val, ...related };
    });
    return res.status(200).send(returned);
});
exports.receiptRoutes.put('/deleteone', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { id, invoiceRelated, creationType, stage } = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await (0, invoicerelated_1.deleteAllLinked)(invoiceRelated, creationType, stage, 'receipt');
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.receiptRoutes.post('/search/:limit/:offset', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const receipts = await receipt_model_1.receiptLean
        .find({ [searchKey]: { $regex: searchterm, $options: 'i' } })
        .lean()
        .skip(offset)
        .limit(limit)
        .populate({
        path: 'invoiceRelated', model: invoicerelated_model_1.invoiceRelatedLean,
        populate: [{
                path: 'billingUserId', model: stock_auth_server_1.userLean
            },
            {
                path: 'payments', model: receipt_model_1.receiptLean
            }]
    });
    const returned = receipts
        .map(val => (0, invoicerelated_1.makeInvoiceRelatedPdct)(val.invoiceRelated, val.invoiceRelated
        .billingUserId));
    return res.status(200).send(returned);
});
exports.receiptRoutes.put('/update', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { updatedReceipt, invoiceRelated } = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(updatedReceipt._id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const found = await receipt_model_1.receiptMain.findByIdAndUpdate(updatedReceipt._id);
    if (!found) {
        return res.status(404).send({ success: false, status: 404, err: 'not found' });
    }
    found.paymentMode = updatedReceipt.paymentMode || found.paymentMode;
    await found.save();
    await (0, invoicerelated_1.updateInvoiceRelated)(invoiceRelated);
    return res.status(200).send({ success: true });
});
exports.receiptRoutes.put('/deletemany', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { credentials } = req.body;
    console.log('incooomin receipt', credentials);
    if (!credentials || credentials?.length < 1) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    /** await receiptMain
      // eslint-disable-next-line @typescript-eslint/naming-convention
      .deleteMany({ _id: { $in: ids } });**/
    const promises = credentials
        .map(async (val) => {
        await (0, invoicerelated_1.deleteAllLinked)(val.invoiceRelated, val.creationType, val.stage, 'receipt');
        return new Promise(resolve => resolve(true));
    });
    await Promise.all(promises);
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=receipt.routes.js.map