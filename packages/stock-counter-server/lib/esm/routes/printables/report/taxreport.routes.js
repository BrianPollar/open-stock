/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import { paymentLean } from '../../../models/payment.model';
import { estimateLean } from '../../../models/printables/estimate.model';
import { taxReportLean, taxReportMain } from '../../../models/printables/report/taxreport.model';
import { getLogger } from 'log4js';
/** Logger for tax report routes */
const taxReportRoutesLogger = getLogger('routes/taxReportRoutes');
/** Express router for tax report routes */
export const taxReportRoutes = express.Router();
/**
 * Create a new tax report
 * @name POST /create
 * @function
 * @memberof module:taxReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} - Promise object representing the response
 */
taxReportRoutes.post('/create', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const taxReport = req.body.taxReport;
    const count = await taxReportMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    taxReport.urId = makeUrId(Number(count[0]?.urId || '0'));
    const newTaxReport = new taxReportMain(taxReport);
    let errResponse;
    const saved = await newTaxReport.save()
        .catch(err => {
        taxReportRoutesLogger.error('create - err: ', err);
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
/**
 * Get a single tax report by UR ID
 * @name GET /getone/:urId
 * @function
 * @memberof module:taxReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} - Promise object representing the response
 */
taxReportRoutes.get('/getone/:urId', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { urId } = req.params;
    const taxReport = await taxReportLean
        .findOne({ urId })
        .lean()
        .populate({ path: 'estimates', model: estimateLean })
        .populate({ path: 'payments', model: paymentLean });
    return res.status(200).send(taxReport);
});
/**
 * Get all tax reports with pagination
 * @name GET /getall/:offset/:limit
 * @function
 * @memberof module:taxReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} - Promise object representing the response
 */
taxReportRoutes.get('/getall/:offset/:limit', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const taxReports = await taxReportLean
        .find({})
        .skip(offset)
        .limit(limit)
        .lean()
        .populate({ path: 'estimates', model: estimateLean })
        .populate({ path: 'payments', model: paymentLean });
    return res.status(200).send(taxReports);
});
/**
 * Delete a single tax report by ID
 * @name DELETE /deleteone/:id
 * @function
 * @memberof module:taxReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} - Promise object representing the response
 */
taxReportRoutes.delete('/deleteone/:id', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { id } = req.params;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await taxReportMain.findByIdAndDelete(id);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
/**
 * Search for tax reports with pagination
 * @name POST /search/:limit/:offset
 * @function
 * @memberof module:taxReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} - Promise object representing the response
 */
taxReportRoutes.post('/search/:limit/:offset', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const taxReports = await taxReportLean
        .find({ [searchKey]: { $regex: searchterm, $options: 'i' } })
        .lean()
        .skip(offset)
        .limit(limit)
        .populate({ path: 'estimates', model: estimateLean })
        .populate({ path: 'payments', model: paymentLean });
    return res.status(200).send(taxReports);
});
/**
 * Delete multiple tax reports by ID
 * @name PUT /deletemany
 * @function
 * @memberof module:taxReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} - Promise object representing the response
 */
taxReportRoutes.put('/deletemany', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { ids } = req.body;
    const isValid = verifyObjectIds(ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await taxReportMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ _id: { $in: ids } })
        .catch(err => {
        taxReportRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
//# sourceMappingURL=taxreport.routes.js.map