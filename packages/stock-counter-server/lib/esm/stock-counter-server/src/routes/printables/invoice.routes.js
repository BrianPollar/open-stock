import { requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord, userLean } from '@open-stock/stock-auth-server';
import { makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import * as tracer from 'tracer';
import { invoiceLean, invoiceMain } from '../../models/printables/invoice.model';
import { receiptLean, receiptMain } from '../../models/printables/receipt.model';
import { invoiceRelatedLean, invoiceRelatedMain } from '../../models/printables/related/invoicerelated.model';
import { deleteAllLinked, makeInvoiceRelatedPdct, relegateInvRelatedCreation, updateInvoiceRelated, updateInvoiceRelatedPayments } from './related/invoicerelated';
/** Logger for invoice routes */
const invoiceRoutesLogger = tracer.colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
        // eslint-disable-next-line no-console
        console.log(data.output);
        const logDir = './openstockLog/';
        fs.mkdir(logDir, { recursive: true }, (err) => {
            if (err) {
                if (err) {
                    throw err;
                }
            }
        });
        fs.appendFile('./openStockLog/counter-server.log', data.rawoutput + '\n', err => {
            if (err) {
                throw err;
            }
        });
    }
});
/**
 * Generates a new invoice ID based on the given query ID.
 * @param queryId The query ID used to generate the invoice ID.
 * @returns A Promise that resolves to the generated invoice ID.
 */
const makeinvoiceId = async (queryId) => {
    const count = await invoiceRelatedMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({ companyId: queryId, invoiceId: { $exists: true, $ne: null } }).sort({ _id: -1 }).limit(1).lean().select({ invoiceId: 1 });
    let incCount = count[0]?.invoiceId || 0;
    return ++incCount;
};
/**
 * Saves an invoice along with its related information.
 * @param invoice - The invoice to be saved.
 * @param invoiceRelated - The related information of the invoice.
 * @param queryId - The ID of the company associated with the invoice.
 * @returns A promise that resolves to an object containing the success status,
 *          the ID of the saved invoice, and the ID of the related information.
 */
export const saveInvoice = async (invoice, invoiceRelated, queryId) => {
    invoice.companyId = queryId;
    invoiceRelated.companyId = queryId;
    invoiceRelated.invoiceId = await makeinvoiceId(queryId);
    const extraNotifDesc = 'Newly created invoice';
    const relatedId = await relegateInvRelatedCreation(invoiceRelated, queryId, extraNotifDesc);
    if (!relatedId.success) {
        return relatedId;
    }
    invoice.invoiceRelated = relatedId.id;
    invoice.companyId = queryId;
    const newInvoice = new invoiceMain(invoice);
    let errResponse;
    const saved = await newInvoice.save()
        .catch(err => {
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
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return { success: true, status: 200, id: saved._id, invoiceRelatedId: relatedId.id };
};
/**
 * Router for handling invoice routes.
 */
export const invoiceRoutes = express.Router();
/**
 * Endpoint for creating a new invoice.
 * @param req - The request object.
 * @param res - The response object.
 * @returns A response indicating the success status of the operation.
 */
invoiceRoutes.post('/create/:companyIdParam', requireAuth, requireActiveCompany, requireCanUseFeature('invoice'), roleAuthorisation('invoices', 'create'), async (req, res, next) => {
    const { invoice, invoiceRelated } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectId(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    invoice.companyId = queryId;
    invoiceRelated.companyId = queryId;
    const response = await saveInvoice(invoice, invoiceRelated, queryId);
    if (!response.success) {
        return res.status(response.status).send({ success: response.success });
    }
    return next();
}, requireUpdateSubscriptionRecord('invoice'));
/**
 * Endpoint for updating an existing invoice.
 * @param req - The request object.
 * @param res - The response object.
 * @returns A response indicating the success status of the operation.
 */
invoiceRoutes.put('/update/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'update'), async (req, res) => {
    const { updatedInvoice, invoiceRelated } = req.body.invoice;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    updatedInvoice.companyId = queryId;
    invoiceRelated.companyId = queryId;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedInvoice;
    const isValid = verifyObjectIds([_id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const invoice = await invoiceMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndUpdate({ _id, companyId: queryId });
    if (!invoice) {
        return res.status(404).send({ success: false });
    }
    invoice.dueDate = updatedInvoice.dueDate || invoice.dueDate;
    await updateInvoiceRelated(invoiceRelated, queryId);
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
/**
 * Endpoint for retrieving a single invoice by ID.
 * @param req - The request object.
 * @param res - The response object.
 * @returns A response containing the requested invoice and its related information.
 */
invoiceRoutes.get('/getone/:invoiceId/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'read'), async (req, res) => {
    const { invoiceId } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectId(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const invoiceRelated = await invoiceRelatedLean
        .findOne({ invoiceId, companyId: queryId })
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
invoiceRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'read'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectId(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const all = await Promise.all([
        invoiceLean
            .find({ companyId: queryId })
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
        }),
        invoiceLean.countDocuments({ companyId: queryId })
    ]);
    const returned = all[0]
        .map(val => makeInvoiceRelatedPdct(val.invoiceRelated, val.invoiceRelated
        .billingUserId));
    const response = {
        count: all[1],
        data: returned
    };
    return res.status(200).send(response);
});
invoiceRoutes.put('/deleteone/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'delete'), async (req, res) => {
    const { id, invoiceRelated, creationType, stage } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await deleteAllLinked(invoiceRelated, creationType, stage, 'invoice', queryId);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
invoiceRoutes.post('/search/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectId(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const all = await Promise.all([
        invoiceLean
            .find({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
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
        }),
        invoiceLean.countDocuments({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
    ]);
    const returned = all[0]
        .map(val => makeInvoiceRelatedPdct(val.invoiceRelated, val.invoiceRelated
        .billingUserId));
    const response = {
        count: all[1],
        data: returned
    };
    return res.status(200).send(response);
});
invoiceRoutes.put('/deletemany/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'delete'), async (req, res) => {
    const { credentials } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectId(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    if (!credentials || credentials?.length < 1) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    /** await invoiceMain
      // eslint-disable-next-line @typescript-eslint/naming-convention
      .deleteMany({ _id: { $in: ids } });**/
    const promises = credentials
        .map(async (val) => {
        await deleteAllLinked(val.invoiceRelated, val.creationType, val.stage, 'invoice', queryId);
        return new Promise(resolve => resolve(true));
    });
    await Promise.all(promises);
    return res.status(200).send({ success: true });
});
// payments
invoiceRoutes.post('/createpayment/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'create'), async (req, res) => {
    const pay = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectId(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    pay.companyId = queryId;
    const count = await receiptLean
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
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
    await updateInvoiceRelatedPayments(saved, queryId);
    return res.status(200).send({ success: true });
});
invoiceRoutes.put('/updatepayment/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'update'), async (req, res) => {
    const pay = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    pay.companyId = queryId;
    const isValid = verifyObjectIds([pay._id, queryId]);
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
invoiceRoutes.get('/getonepayment/:urId/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'read'), async (req, res) => {
    const { urId } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const invoicePay = await receiptLean
        .findOne({ urId, queryId })
        .lean();
    return res.status(200).send(invoicePay);
});
invoiceRoutes.get('/getallpayments/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'read'), async (req, res) => {
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectId(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const all = await Promise.all([
        receiptLean
            .find({ companyId: queryId })
            .lean(),
        receiptLean.countDocuments({ companyId: queryId })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
});
invoiceRoutes.put('/deleteonepayment/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'delete'), async (req, res) => {
    const { id, invoiceRelated, creationType, stage } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await deleteAllLinked(invoiceRelated, creationType, stage, 'invoice', queryId);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
invoiceRoutes.put('/deletemanypayments/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'delete'), async (req, res) => {
    const { ids } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([...ids, ...[queryId]]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await receiptMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ _id: { $in: ids }, companyId: queryId })
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