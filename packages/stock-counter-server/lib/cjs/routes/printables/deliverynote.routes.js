"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deliveryNoteRoutes = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-misused-promises */
const express_1 = tslib_1.__importDefault(require("express"));
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const deliverynote_model_1 = require("../../models/printables/deliverynote.model");
// import { paymentInstallsLean } from '../../models/printables/paymentrelated/paymentsinstalls.model';
const invoicerelated_model_1 = require("../../models/printables/related/invoicerelated.model");
const invoicerelated_1 = require("./related/invoicerelated");
const log4js_1 = require("log4js");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const receipt_model_1 = require("../../models/printables/receipt.model");
/** */
const deliveryNoteRoutesLogger = (0, log4js_1.getLogger)('routes/deliveryNoteRoutes');
/** */
exports.deliveryNoteRoutes = express_1.default.Router();
exports.deliveryNoteRoutes.post('/create', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { deliveryNote, invoiceRelated } = req.body;
    const count = await deliverynote_model_1.deliveryNoteMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    deliveryNote.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    const extraNotifDesc = 'Newly generated delivery note';
    const invoiceRelatedRes = await (0, invoicerelated_1.relegateInvRelatedCreation)(invoiceRelated, extraNotifDesc, req.app.locals.stockCounterServernotifRedirectUrl, req.app.locals.stockCounterServer.locaLMailHandler);
    console.log('About result', invoiceRelatedRes);
    if (!invoiceRelatedRes.success) {
        return res.status(invoiceRelatedRes.status).send(invoiceRelatedRes);
    }
    deliveryNote.invoiceRelated = invoiceRelatedRes.id;
    const newDeliveryNote = new deliverynote_model_1.deliveryNoteMain(deliveryNote);
    let errResponse;
    const saved = await newDeliveryNote.save()
        .catch(err => {
        console.log('that error is', err);
        deliveryNoteRoutesLogger.error('create - err: ', err);
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
        return errResponse;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    await (0, invoicerelated_1.updateInvoiceRelated)(invoiceRelated);
    return res.status(200).send({ success: Boolean(saved) });
});
exports.deliveryNoteRoutes.get('/getone/:urId', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { urId } = req.params;
    const deliveryNote = await deliverynote_model_1.deliveryNoteLean
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
    if (deliveryNote) {
        returned = (0, invoicerelated_1.makeInvoiceRelatedPdct)(deliveryNote.invoiceRelated, deliveryNote.invoiceRelated
            .billingUserId, deliveryNote.createdAt, {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            _id: deliveryNote._id,
            urId: deliveryNote.urId
        });
    }
    return res.status(200).send(returned);
});
exports.deliveryNoteRoutes.get('/getall/:offset/:limit', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const deliveryNotes = await deliverynote_model_1.deliveryNoteLean
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
    const returned = deliveryNotes
        .map(val => (0, invoicerelated_1.makeInvoiceRelatedPdct)(val.invoiceRelated, val.invoiceRelated
        .billingUserId, (val).createdAt, {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _id: val._id,
        urId: val.urId
    }));
    return res.status(200).send(returned);
});
exports.deliveryNoteRoutes.put('/deleteone', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { id, invoiceRelated, creationType, stage } = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await (0, invoicerelated_1.deleteAllLinked)(invoiceRelated, creationType, stage, 'deliverynote');
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.deliveryNoteRoutes.post('/search/:limit/:offset', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const deliveryNotes = await deliverynote_model_1.deliveryNoteLean
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
    const returned = deliveryNotes
        .map(val => (0, invoicerelated_1.makeInvoiceRelatedPdct)(val.invoiceRelated, val.invoiceRelated
        .billingUserId));
    return res.status(200).send(returned);
});
exports.deliveryNoteRoutes.put('/deletemany', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { credentials } = req.body;
    /** const ids = credentials
      .map(val => val.id);
    await deliveryNoteMain
      // eslint-disable-next-line @typescript-eslint/naming-convention
      .deleteMany({ _id: { $in: ids } });**/
    const promises = credentials
        .map(async (val) => {
        await (0, invoicerelated_1.deleteAllLinked)(val.invoiceRelated, val.creationType, val.stage, 'deliverynote');
        return new Promise(resolve => resolve(true));
    });
    await Promise.all(promises);
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=deliverynote.routes.js.map