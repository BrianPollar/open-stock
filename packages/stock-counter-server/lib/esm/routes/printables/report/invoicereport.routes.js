/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import { paymentLean } from '../../../models/payment.model';
import { estimateLean } from '../../../models/printables/estimate.model';
import { invoicesReportLean, invoicesReportMain } from '../../../models/printables/report/invoicereport.model';
import { getLogger } from 'log4js';
/** */
const invoicesReportRoutesLogger = getLogger('routes/invoicesReportRoutes');
/** */
export const invoicesReportRoutes = express.Router();
invoicesReportRoutes.post('/create', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const invoicesReport = req.body.invoicesReport;
    const count = await invoicesReportMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    invoicesReport.urId = makeUrId(Number(count[0]?.urId || '0'));
    const newInvoiceReport = new invoicesReportMain(invoicesReport);
    let errResponse;
    await newInvoiceReport.save().catch(err => {
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
invoicesReportRoutes.get('/getone/:urId', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { urId } = req.params;
    const invoicesReport = await invoicesReportLean
        .findOne({ urId })
        .lean()
        .populate({ path: 'estimates', model: estimateLean })
        .populate({ path: 'payments', model: paymentLean });
    return res.status(200).send(invoicesReport);
});
invoicesReportRoutes.get('/getall/:offset/:limit', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const invoicesReports = await invoicesReportLean
        .find({})
        .skip(offset)
        .limit(limit)
        .lean()
        .populate({ path: 'estimates', model: estimateLean })
        .populate({ path: 'payments', model: paymentLean });
    return res.status(200).send(invoicesReports);
});
invoicesReportRoutes.delete('/deleteone/:id', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { id } = req.params;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await invoicesReportMain.findByIdAndDelete(id);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
invoicesReportRoutes.post('/search/:offset/:limit', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const invoicesReports = await invoicesReportLean
        .find({ [searchKey]: { $regex: searchterm, $options: 'i' } })
        .lean()
        .skip(offset)
        .limit(limit)
        .populate({ path: 'estimates', model: estimateLean })
        .populate({ path: 'payments', model: paymentLean });
    return res.status(200).send(invoicesReports);
});
invoicesReportRoutes.put('/deletemany', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { ids } = req.body;
    const isValid = verifyObjectIds(ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await invoicesReportMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ _id: { $in: ids } })
        .catch(err => {
        invoicesReportRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
//# sourceMappingURL=invoicereport.routes.js.map