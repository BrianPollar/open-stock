"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceRoutes = exports.saveInvoice = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const invoice_model_1 = require("../../models/printables/invoice.model");
const invoicerelated_model_1 = require("../../models/printables/related/invoicerelated.model");
const invoicerelated_1 = require("./related/invoicerelated");
const log4js_1 = require("log4js");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const receipt_model_1 = require("../../models/printables/receipt.model");
/** Logger for invoice routes */
const invoiceRoutesLogger = (0, log4js_1.getLogger)('routes/invoiceRoutes');
/**
 * Generates a new invoice ID by incrementing the highest existing invoice ID.
 * @returns A promise that resolves to the new invoice ID.
 */
const makeinvoiceId = async () => {
    const count = await invoicerelated_model_1.invoiceRelatedMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({ invoiceId: { $exists: true, $ne: null } }).sort({ _id: -1 }).limit(1).lean().select({ invoiceId: 1 });
    let incCount = count[0]?.invoiceId || 0;
    return ++incCount;
};
/**
 * Saves an invoice and its related information to the database.
 * @param invoice - The invoice to be saved.
 * @param invoiceRelated - The related information of the invoice.
 * @param notifRedirectUrl - The URL to redirect to after sending a notification.
 * @param localMailHandler - The email handler to use for sending notifications.
 * @returns A promise that resolves to an object containing the success status and the IDs of the saved invoice and related information.
 */
/**
 * Saves an invoice and its related information to the database.
 * @param invoice - The invoice object to be saved.
 * @param invoiceRelated - The related information of the invoice.
 * @param notifRedirectUrl - The URL to redirect to after notification.
 * @param localMailHandler - The email handler to use for local emails.
 * @returns A promise that resolves to an object containing the success status, the ID of the saved invoice, and the ID of the related information.
 */
const saveInvoice = async (invoice, invoiceRelated, notifRedirectUrl, localMailHandler) => {
    invoiceRelated.invoiceId = await makeinvoiceId();
    console.log('1111111 inv');
    const extraNotifDesc = 'Newly created invoice';
    const relatedId = await (0, invoicerelated_1.relegateInvRelatedCreation)(invoiceRelated, extraNotifDesc, notifRedirectUrl, localMailHandler);
    if (!relatedId.success) {
        return relatedId;
    }
    console.log('2222222 inv', relatedId);
    invoice.invoiceRelated = relatedId.id;
    const newInvoice = new invoice_model_1.invoiceMain(invoice);
    let errResponse;
    const saved = await newInvoice.save()
        .catch(err => {
        console.log('333333333 inv err', err);
        invoiceRoutesLogger.error('create - err: ', err);
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
        return {
            ...errResponse
        };
    }
    // await updateInvoiceRelated(invoiceRelated); // !! WHY CALL THIS
    return { success: true, status: 200, id: saved._id, invoiceRelatedId: relatedId.id };
};
exports.saveInvoice = saveInvoice;
/** Router for invoice routes */
exports.invoiceRoutes = express_1.default.Router();
/**
 * Endpoint for creating a new invoice.
 * @param req - The request object.
 * @param res - The response object.
 * @returns A response indicating the success status of the operation.
 */
exports.invoiceRoutes.post('/create', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { invoice, invoiceRelated } = req.body;
    const response = await (0, exports.saveInvoice)(invoice, invoiceRelated, req.app.locals.stockCounterServer.notifRedirectUrl, req.app.locals.stockCounterServer.locaLMailHandler);
    return res.status(response.status).send({ success: response.success });
});
/**
 * Endpoint for updating an existing invoice.
 * @param req - The request object.
 * @param res - The response object.
 * @returns A response indicating the success status of the operation.
 */
exports.invoiceRoutes.put('/update', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { updatedInvoice, invoiceRelated } = req.body.invoice;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedInvoice;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(_id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const invoice = await invoice_model_1.invoiceMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findByIdAndUpdate(_id);
    if (!invoice) {
        return res.status(404).send({ success: false });
    }
    invoice.dueDate = updatedInvoice.dueDate || invoice.dueDate;
    await (0, invoicerelated_1.updateInvoiceRelated)(invoiceRelated);
    let errResponse;
    const updated = await invoice.save()
        .catch(err => {
        invoiceRoutesLogger.error('update - err: ', err);
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
    return res.status(200).send({ success: Boolean(updated) });
});
/**
 * Endpoint for retrieving a single invoice by ID.
 * @param req - The request object.
 * @param res - The response object.
 * @returns A response containing the requested invoice and its related information.
 */
exports.invoiceRoutes.get('/getone/:invoiceId', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { invoiceId } = req.params;
    const invoiceRelated = await invoicerelated_model_1.invoiceRelatedLean
        .findOne({ invoiceId })
        .lean()
        .populate({ path: 'billingUserId', model: stock_auth_server_1.userLean })
        .populate({ path: 'payments', model: invoicerelated_model_1.invoiceRelatedLean });
    let returned;
    if (invoiceRelated) {
        returned = (0, invoicerelated_1.makeInvoiceRelatedPdct)(invoiceRelated, invoiceRelated
            .billingUserId);
    }
    return res.status(200).send(returned);
});
exports.invoiceRoutes.get('/getall/:offset/:limit', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const invoices = await invoice_model_1.invoiceLean
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
    const returned = invoices
        .map(val => (0, invoicerelated_1.makeInvoiceRelatedPdct)(val.invoiceRelated, val.invoiceRelated
        .billingUserId));
    return res.status(200).send(returned);
});
exports.invoiceRoutes.put('/deleteone', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { id, invoiceRelated, creationType, stage } = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await (0, invoicerelated_1.deleteAllLinked)(invoiceRelated, creationType, stage, 'invoice');
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.invoiceRoutes.post('/search/:limit/:offset', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const invoices = await invoice_model_1.invoiceLean
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
    const returned = invoices
        .map(val => (0, invoicerelated_1.makeInvoiceRelatedPdct)(val.invoiceRelated, val.invoiceRelated
        .billingUserId));
    return res.status(200).send(returned);
});
exports.invoiceRoutes.put('/deletemany', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { credentials } = req.body;
    console.log('INCOOOOOOMING ', req.body);
    if (!credentials || credentials?.length < 1) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    /** await invoiceMain
      // eslint-disable-next-line @typescript-eslint/naming-convention
      .deleteMany({ _id: { $in: ids } });**/
    const promises = credentials
        .map(async (val) => {
        await (0, invoicerelated_1.deleteAllLinked)(val.invoiceRelated, val.creationType, val.stage, 'invoice');
        return new Promise(resolve => resolve(true));
    });
    await Promise.all(promises);
    return res.status(200).send({ success: true });
});
// payments
exports.invoiceRoutes.post('/createpayment', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const pay = req.body;
    const count = await receipt_model_1.receiptLean
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    pay.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    const newInvoicePaym = new receipt_model_1.receiptMain(pay);
    let errResponse;
    const saved = await newInvoicePaym.save().catch(err => {
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
    console.log('adding install 111111111', saved);
    await (0, invoicerelated_1.updateInvoiceRelatedPayments)(saved);
    return res.status(200).send({ success: true });
});
exports.invoiceRoutes.put('/updatepayment', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const pay = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(pay._id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const foundPay = await receipt_model_1.receiptMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findByIdAndUpdate(pay._id);
    if (!foundPay) {
        return res.status(404).send({ success: false });
    }
    foundPay.amount = pay.amount || foundPay.amount;
    let errResponse;
    await foundPay.save().catch(err => {
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
    return res.status(200).send({ success: true });
});
exports.invoiceRoutes.get('/getonepayment/:urId', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { urId } = req.params;
    const invoicePay = await receipt_model_1.receiptLean
        .findOne({ urId })
        .lean();
    return res.status(200).send(invoicePay);
});
exports.invoiceRoutes.get('/getallpayments', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const invoicePays = await receipt_model_1.receiptLean
        .find({})
        .lean();
    return res.status(200).send(invoicePays);
});
exports.invoiceRoutes.put('/deleteonepayment', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { id, invoiceRelated, creationType, stage } = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await (0, invoicerelated_1.deleteAllLinked)(invoiceRelated, creationType, stage, 'invoice');
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.invoiceRoutes.put('/deletemanypayments', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { ids } = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)(ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await receipt_model_1.receiptMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ _id: { $in: ids } })
        .catch(err => {
        invoiceRoutesLogger.error('deletemanypayments - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
//# sourceMappingURL=invoice.routes.js.map