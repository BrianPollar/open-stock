/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId } from '@open-stock/stock-universal-server';
import { deliveryNoteLean, deliveryNoteMain } from '../../models/printables/deliverynote.model';
// import { paymentInstallsLean } from '../../models/printables/paymentrelated/paymentsinstalls.model';
import { invoiceRelatedLean } from '../../models/printables/related/invoicerelated.model';
import { deleteAllLinked, makeInvoiceRelatedPdct, relegateInvRelatedCreation, updateInvoiceRelated } from './related/invoicerelated';
import { getLogger } from 'log4js';
import { userLean } from '@open-stock/stock-auth-server';
import { receiptLean } from '../../models/printables/receipt.model';
/** */
const deliveryNoteRoutesLogger = getLogger('routes/deliveryNoteRoutes');
/** */
export const deliveryNoteRoutes = express.Router();
deliveryNoteRoutes.post('/create', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { deliveryNote, invoiceRelated } = req.body;
    const count = await deliveryNoteMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    deliveryNote.urId = makeUrId(Number(count[0]?.urId || '0'));
    const extraNotifDesc = 'Newly generated delivery note';
    const invoiceRelatedRes = await relegateInvRelatedCreation(invoiceRelated, extraNotifDesc, req.app.locals.stockCounterServernotifRedirectUrl, req.app.locals.stockCounterServer.locaLMailHandler);
    console.log('About result', invoiceRelatedRes);
    if (!invoiceRelatedRes.success) {
        return res.status(invoiceRelatedRes.status).send(invoiceRelatedRes);
    }
    deliveryNote.invoiceRelated = invoiceRelatedRes.id;
    const newDeliveryNote = new deliveryNoteMain(deliveryNote);
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
    await updateInvoiceRelated(invoiceRelated);
    return res.status(200).send({ success: Boolean(saved) });
});
deliveryNoteRoutes.get('/getone/:urId', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { urId } = req.params;
    const deliveryNote = await deliveryNoteLean
        .findOne({ urId })
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
    let returned;
    if (deliveryNote) {
        returned = makeInvoiceRelatedPdct(deliveryNote.invoiceRelated, deliveryNote.invoiceRelated
            .billingUserId, deliveryNote.createdAt, {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            _id: deliveryNote._id,
            urId: deliveryNote.urId
        });
    }
    return res.status(200).send(returned);
});
deliveryNoteRoutes.get('/getall/:offset/:limit', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const deliveryNotes = await deliveryNoteLean
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
    const returned = deliveryNotes
        .map(val => makeInvoiceRelatedPdct(val.invoiceRelated, val.invoiceRelated
        .billingUserId, (val).createdAt, {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _id: val._id,
        urId: val.urId
    }));
    return res.status(200).send(returned);
});
deliveryNoteRoutes.put('/deleteone', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { id, invoiceRelated, creationType, stage } = req.body;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await deleteAllLinked(invoiceRelated, creationType, stage, 'deliverynote');
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
deliveryNoteRoutes.post('/search/:limit/:offset', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const deliveryNotes = await deliveryNoteLean
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
    const returned = deliveryNotes
        .map(val => makeInvoiceRelatedPdct(val.invoiceRelated, val.invoiceRelated
        .billingUserId));
    return res.status(200).send(returned);
});
deliveryNoteRoutes.put('/deletemany', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { credentials } = req.body;
    /** const ids = credentials
      .map(val => val.id);
    await deliveryNoteMain
      // eslint-disable-next-line @typescript-eslint/naming-convention
      .deleteMany({ _id: { $in: ids } });**/
    const promises = credentials
        .map(async (val) => {
        await deleteAllLinked(val.invoiceRelated, val.creationType, val.stage, 'deliverynote');
        return new Promise(resolve => resolve(true));
    });
    await Promise.all(promises);
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=deliverynote.routes.js.map