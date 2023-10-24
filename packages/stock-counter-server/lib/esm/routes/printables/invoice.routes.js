/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import { invoiceLean, invoiceMain } from '../../models/printables/invoice.model';
// import { paymentInstallsLean, paymentInstallsMain } from '../../models/printables/paymentrelated/paymentsinstalls.model';
import { invoiceRelatedLean, invoiceRelatedMain } from '../../models/printables/related/invoicerelated.model';
import { deleteAllLinked, makeInvoiceRelatedPdct, relegateInvRelatedCreation, updateInvoiceRelated, updateInvoiceRelatedPayments } from './related/invoicerelated';
import { getLogger } from 'log4js';
import { userLean } from '@open-stock/stock-auth-server';
import { receiptLean, receiptMain } from '../../models/printables/receipt.model';
/** */
const invoiceRoutesLogger = getLogger('routes/invoiceRoutes');
const makeinvoiceId = async () => {
    const count = await invoiceRelatedMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ invoiceId: 1 });
    let incCount = count[0]?.invoiceId || 0;
    return ++incCount;
};
/** */
export const saveInvoice = async (invoice, invoiceRelated, notifRedirectUrl, localMailHandler) => {
    invoiceRelated.invoiceId = await makeinvoiceId();
    console.log('1111111 inv');
    const extraNotifDesc = 'Newly created invoice';
    const relatedId = await relegateInvRelatedCreation(invoiceRelated, extraNotifDesc, notifRedirectUrl, localMailHandler);
    if (!relatedId.success) {
        return relatedId;
    }
    console.log('2222222 inv', relatedId);
    invoice.invoiceRelated = relatedId.id;
    const newInvoice = new invoiceMain(invoice);
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
            errResponse.err = stringifyMongooseErr(err.errors);
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
/** */
export const invoiceRoutes = express.Router();
invoiceRoutes.post('/create', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { invoice, invoiceRelated } = req.body;
    const response = await saveInvoice(invoice, invoiceRelated, req.app.locals.stockCounterServer.notifRedirectUrl, req.app.locals.stockCounterServer.locaLMailHandler);
    return res.status(response.status).send({ success: response.success });
});
invoiceRoutes.put('/update', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { updatedInvoice, invoiceRelated } = req.body.invoice;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedInvoice;
    const isValid = verifyObjectId(_id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const invoice = await invoiceMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findByIdAndUpdate(_id);
    if (!invoice) {
        return res.status(404).send({ success: false });
    }
    invoice.dueDate = updatedInvoice.dueDate || invoice.dueDate;
    await updateInvoiceRelated(invoiceRelated);
    let errResponse;
    const updated = await invoice.save()
        .catch(err => {
        invoiceRoutesLogger.error('update - err: ', err);
        errResponse = {
            success: false,
            status: 403
        };
        if (err && err.errors) {
            errResponse.err = stringifyMongooseErr(err.errors);
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
invoiceRoutes.get('/getone/:invoiceId', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { invoiceId } = req.params;
    const invoiceRelated = await invoiceRelatedLean
        .findOne({ invoiceId })
        .lean()
        .populate({ path: 'billingUserId', model: userLean })
        .populate({ path: 'payments', model: invoiceRelatedLean });
    let returned;
    if (invoiceRelated) {
        returned = makeInvoiceRelatedPdct(invoiceRelated, invoiceRelated
            .billingUserId);
    }
    return res.status(200).send(returned);
});
invoiceRoutes.get('/getall/:offset/:limit', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const invoices = await invoiceLean
        .find({})
        .skip(offset)
        .limit(limit)
        .lean()
        .populate({
        path: 'invoiceRelated', model: invoiceRelatedLean,
        populate: [{
                path: 'billingUserId', model: userLean
            },
            {
                path: 'payments', model: receiptLean
            }]
    });
    const returned = invoices
        .map(val => makeInvoiceRelatedPdct(val.invoiceRelated, val.invoiceRelated
        .billingUserId));
    return res.status(200).send(returned);
});
invoiceRoutes.put('/deleteone', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { id, invoiceRelated, creationType, stage } = req.body;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await deleteAllLinked(invoiceRelated, creationType, stage, 'invoice');
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
invoiceRoutes.post('/search/:limit/:offset', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const invoices = await invoiceLean
        .find({ [searchKey]: { $regex: searchterm, $options: 'i' } })
        .lean()
        .skip(offset)
        .limit(limit)
        .populate({
        path: 'invoiceRelated', model: invoiceRelatedLean,
        populate: [{
                path: 'billingUserId', model: userLean
            },
            {
                path: 'payments', model: receiptLean
            }]
    });
    const returned = invoices
        .map(val => makeInvoiceRelatedPdct(val.invoiceRelated, val.invoiceRelated
        .billingUserId));
    return res.status(200).send(returned);
});
invoiceRoutes.put('/deletemany', requireAuth, roleAuthorisation('printables'), async (req, res) => {
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
        await deleteAllLinked(val.invoiceRelated, val.creationType, val.stage, 'invoice');
        return new Promise(resolve => resolve(true));
    });
    await Promise.all(promises);
    return res.status(200).send({ success: true });
});
// payments
invoiceRoutes.post('/createpayment', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const pay = req.body;
    const count = await receiptLean
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    pay.urId = makeUrId(Number(count[0]?.urId || '0'));
    const newInvoicePaym = new receiptMain(pay);
    let errResponse;
    const saved = await newInvoicePaym.save().catch(err => {
        errResponse = {
            success: false,
            status: 403
        };
        if (err && err.errors) {
            errResponse.err = stringifyMongooseErr(err.errors);
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
    await updateInvoiceRelatedPayments(saved);
    return res.status(200).send({ success: true });
});
invoiceRoutes.put('/updatepayment', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const pay = req.body;
    const isValid = verifyObjectId(pay._id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const foundPay = await receiptMain
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
            errResponse.err = stringifyMongooseErr(err.errors);
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
invoiceRoutes.get('/getonepayment/:urId', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { urId } = req.params;
    const invoicePay = await receiptLean
        .findOne({ urId })
        .lean();
    return res.status(200).send(invoicePay);
});
invoiceRoutes.get('/getallpayments', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const invoicePays = await receiptLean
        .find({})
        .lean();
    return res.status(200).send(invoicePays);
});
invoiceRoutes.put('/deleteonepayment', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { id, invoiceRelated, creationType, stage } = req.body;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await deleteAllLinked(invoiceRelated, creationType, stage, 'invoice');
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
invoiceRoutes.put('/deletemanypayments', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { ids } = req.body;
    const isValid = verifyObjectIds(ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await receiptMain
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