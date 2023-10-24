/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import { estimateLean } from '../../../models/printables/estimate.model';
import { salesReportLean, salesReportMain } from '../../../models/printables/report/salesreport.model';
import { getLogger } from 'log4js';
import { invoiceRelatedLean } from '../../../models/printables/related/invoicerelated.model';
/** */
const salesReportRoutesLogger = getLogger('routes/salesReportRoutes');
/** */
export const salesReportRoutes = express.Router();
salesReportRoutes.post('/create', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const salesReport = req.body.salesReport;
    const count = await salesReportMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    salesReport.urId = makeUrId(Number(count[0]?.urId || '0'));
    const newSalesReport = new salesReportMain(salesReport);
    let errResponse;
    const saved = await newSalesReport.save()
        .catch(err => {
        salesReportRoutesLogger.error('create - err: ', err);
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
salesReportRoutes.get('/getone/:urId', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { urId } = req.params;
    const salesReport = await salesReportLean
        .findOne({ urId })
        .lean()
        .populate({ path: 'estimates', model: estimateLean })
        .populate({ path: 'invoiceRelateds', model: invoiceRelatedLean });
    return res.status(200).send(salesReport);
});
salesReportRoutes.get('/getall/:offset/:limit', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const salesReports = await salesReportLean
        .find({})
        .skip(offset)
        .limit(limit)
        .lean()
        .populate({ path: 'estimates', model: estimateLean })
        .populate({ path: 'invoiceRelateds', model: invoiceRelatedLean });
    return res.status(200).send(salesReports);
});
salesReportRoutes.delete('/deleteone/:id', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { id } = req.params;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await salesReportMain.findByIdAndDelete(id);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
salesReportRoutes.post('/search/:limit/:offset', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const salesReports = await salesReportLean
        .find({ [searchKey]: { $regex: searchterm, $options: 'i' } })
        .lean()
        .skip(offset)
        .limit(limit)
        .populate({ path: 'estimates', model: estimateLean })
        .populate({ path: 'invoiceRelateds', model: invoiceRelatedLean });
    return res.status(200).send(salesReports);
});
salesReportRoutes.put('/deletemany', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { ids } = req.body;
    const isValid = verifyObjectIds(ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await salesReportMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ _id: { $in: ids } })
        .catch(err => {
        salesReportRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
//# sourceMappingURL=salesreport.routes.js.map