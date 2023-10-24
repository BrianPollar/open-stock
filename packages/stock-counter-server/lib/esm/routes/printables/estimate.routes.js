/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId } from '@open-stock/stock-universal-server';
import { estimateLean, estimateMain } from '../../models/printables/estimate.model';
// import { paymentInstallsLean } from '../../models/printables/paymentrelated/paymentsinstalls.model';
import { invoiceRelatedLean, invoiceRelatedMain } from '../../models/printables/related/invoicerelated.model';
import { deleteAllLinked, makeInvoiceRelatedPdct, relegateInvRelatedCreation } from './related/invoicerelated';
import { getLogger } from 'log4js';
import { userLean } from '@open-stock/stock-auth-server';
import { receiptLean } from '../../models/printables/receipt.model';
/** */
const estimateRoutesogger = getLogger('routes/estimateRoutes');
const makeEstimateId = async () => {
    const count = await invoiceRelatedMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ estimateId: 1 });
    let incCount = count[0]?.estimateId || 0;
    return ++incCount;
};
/** /** */
export const updateEstimateUniv = async (estimateId, stage, invoiceId) => {
    const estimate = await estimateMain
        .findOneAndUpdate({ estimateId });
    if (!estimate) {
        return false;
    }
    if (invoiceId) {
        estimate.invoiceId = invoiceId;
    }
    estimate.stage = stage;
    await estimate.save();
    return true;
};
/** */
export const estimateRoutes = express.Router();
estimateRoutes.post('/create', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { estimate, invoiceRelated } = req.body;
    invoiceRelated.estimateId = await makeEstimateId();
    const extraNotifDesc = 'Newly created estimate';
    const invoiceRelatedRes = await relegateInvRelatedCreation(invoiceRelated, extraNotifDesc, req.app.locals.stockCounterServer.notifRedirectUrl, req.app.locals.stockCounterServer.locaLMailHandler);
    if (!invoiceRelatedRes.success) {
        return res.status(invoiceRelatedRes.status).send(invoiceRelatedRes);
    }
    estimate.invoiceRelated = invoiceRelatedRes.id;
    const newEstimate = new estimateMain(estimate);
    let errResponse;
    const saved = await newEstimate.save()
        .catch(err => {
        estimateRoutesogger.error('create - err: ', err);
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
    return res.status(200).send({ success: Boolean(saved) });
});
estimateRoutes.get('/getone/:estimateId', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { estimateId } = req.params;
    const invoiceRelated = await invoiceRelatedLean
        .findOne({ estimateId })
        .lean()
        .populate({ path: 'billingUserId', model: userLean })
        .populate({ path: 'payments', model: receiptLean });
    let returned;
    if (invoiceRelated) {
        returned = makeInvoiceRelatedPdct(invoiceRelated, invoiceRelated
            .billingUserId);
    }
    return res.status(200).send(returned);
});
estimateRoutes.get('/getall/:offset/:limit', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const estimates = await estimateLean
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
    const returned = estimates
        .map(val => makeInvoiceRelatedPdct(val.invoiceRelated, val.invoiceRelated
        .billingUserId));
    return res.status(200).send(returned);
});
estimateRoutes.put('/deleteone', requireAuth, async (req, res) => {
    const { id, invoiceRelated, creationType, stage } = req.body;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await deleteAllLinked(invoiceRelated, creationType, stage, 'estimate');
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
estimateRoutes.post('/search/:limit/:offset', requireAuth, roleAuthorisation('estimates'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const estimates = await estimateLean
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
    const returned = estimates
        .map(val => makeInvoiceRelatedPdct(val.invoiceRelated, val.invoiceRelated
        .billingUserId));
    return res.status(200).send(returned);
});
estimateRoutes.put('/deletemany', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { credentials } = req.body;
    if (!credentials || credentials?.length < 1) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    /** await estimateMain
      // eslint-disable-next-line @typescript-eslint/naming-convention
      .deleteMany({ _id: { $in: ids } });**/
    const promises = credentials
        .map(async (val) => {
        await deleteAllLinked(val.invoiceRelated, val.creationType, val.stage, 'estimate');
        return new Promise(resolve => resolve(true));
    });
    await Promise.all(promises);
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=estimate.routes.js.map