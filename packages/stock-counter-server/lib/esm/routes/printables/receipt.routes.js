/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, verifyObjectId } from '@open-stock/stock-universal-server';
// import { paymentInstallsLean } from '../../models/printables/paymentrelated/paymentsinstalls.model';
import { receiptLean, receiptMain } from '../../models/printables/receipt.model';
import { invoiceRelatedLean } from '../../models/printables/related/invoicerelated.model';
import { deleteAllLinked, makeInvoiceRelatedPdct, relegateInvRelatedCreation, updateInvoiceRelated } from './related/invoicerelated';
import { getLogger } from 'log4js';
import { userLean } from '@open-stock/stock-auth-server';
import { makePaymentInstall } from '../paymentrelated/paymentrelated';
/** */
const receiptRoutesLogger = getLogger('routes/receiptRoutes');
/** */
export const receiptRoutes = express.Router();
receiptRoutes.post('/create', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { receipt, invoiceRelated } = req.body;
    const count = await receiptMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    receipt.urId = makeUrId(Number(count[0]?.urId || '0'));
    const extraNotifDesc = 'Newly created receipt';
    const invoiceRelatedRes = await relegateInvRelatedCreation(invoiceRelated, extraNotifDesc, req.app.locals.stockCounterServer.notifRedirectUrl, req.app.locals.stockCounterServer.locaLMailHandler);
    if (!invoiceRelatedRes.success) {
        return res.status(invoiceRelatedRes.status).send(invoiceRelatedRes);
    }
    receipt.invoiceRelated = invoiceRelatedRes.id;
    console.log('going to make install now ', receipt.invoiceRelated);
    const added = await makePaymentInstall(receipt, invoiceRelatedRes.id);
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
receiptRoutes.get('/getone/:urId', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { urId } = req.params;
    const receipt = await receiptLean
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
    if (receipt) {
        const relateds = makeInvoiceRelatedPdct(receipt.invoiceRelated, receipt.invoiceRelated
            .billingUserId);
        // ensure reciepts are properly being populated
        returned = { ...receipt, ...relateds };
    }
    console.log('one to return ', receipt);
    return res.status(200).send(returned);
});
receiptRoutes.get('/getall/:offset/:limit', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const receipts = await receiptLean
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
    const returned = receipts
        .map(val => {
        const related = makeInvoiceRelatedPdct(val.invoiceRelated, val.invoiceRelated
            .billingUserId);
        return { ...val, ...related };
    });
    return res.status(200).send(returned);
});
receiptRoutes.put('/deleteone', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { id, invoiceRelated, creationType, stage } = req.body;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await deleteAllLinked(invoiceRelated, creationType, stage, 'receipt');
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
receiptRoutes.post('/search/:limit/:offset', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const receipts = await receiptLean
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
    const returned = receipts
        .map(val => makeInvoiceRelatedPdct(val.invoiceRelated, val.invoiceRelated
        .billingUserId));
    return res.status(200).send(returned);
});
receiptRoutes.put('/update', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { updatedReceipt, invoiceRelated } = req.body;
    const isValid = verifyObjectId(updatedReceipt._id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const found = await receiptMain.findByIdAndUpdate(updatedReceipt._id);
    if (!found) {
        return res.status(404).send({ success: false, status: 404, err: 'not found' });
    }
    found.paymentMode = updatedReceipt.paymentMode || found.paymentMode;
    await found.save();
    await updateInvoiceRelated(invoiceRelated);
    return res.status(200).send({ success: true });
});
receiptRoutes.put('/deletemany', requireAuth, roleAuthorisation('printables'), async (req, res) => {
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
        await deleteAllLinked(val.invoiceRelated, val.creationType, val.stage, 'receipt');
        return new Promise(resolve => resolve(true));
    });
    await Promise.all(promises);
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=receipt.routes.js.map