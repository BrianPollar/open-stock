import { requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord } from '@open-stock/stock-auth-server';
import { makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import { getLogger } from 'log4js';
import { estimateLean } from '../../../models/printables/estimate.model';
import { invoiceRelatedLean } from '../../../models/printables/related/invoicerelated.model';
import { salesReportLean, salesReportMain } from '../../../models/printables/report/salesreport.model';
/** Logger for sales report routes */
const salesReportRoutesLogger = getLogger('routes/salesReportRoutes');
/**
 * Express router for sales report routes.
 */
export const salesReportRoutes = express.Router();
/**
 * Create a new sales report
 * @name POST /create
 * @function
 * @memberof module:routers/salesReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} - Promise object represents the response
 */
salesReportRoutes.post('/create/:companyIdParam', requireAuth, requireActiveCompany, requireCanUseFeature('report'), roleAuthorisation('reports', 'create'), async (req, res, next) => {
    const salesReport = req.body.salesReport;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    salesReport.companyId = queryId;
    const count = await salesReportMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
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
    return next();
}, requireUpdateSubscriptionRecord);
/**
 * Get a sales report by UR ID
 * @name GET /getone/:urId
 * @function
 * @memberof module:routers/salesReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} - Promise object represents the response
 */
salesReportRoutes.get('/getone/:urId/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'read'), async (req, res) => {
    const { urId } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const salesReport = await salesReportLean
        .findOne({ urId, queryId })
        .lean()
        .populate({ path: 'estimates', model: estimateLean })
        .populate({ path: 'invoiceRelateds', model: invoiceRelatedLean });
    return res.status(200).send(salesReport);
});
/**
 * Get all sales reports with pagination
 * @name GET /getall/:offset/:limit
 * @function
 * @memberof module:routers/salesReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} - Promise object represents the response
 */
salesReportRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'read'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const all = await Promise.all([
        salesReportLean
            .find({ companyId: queryId })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate({ path: 'estimates', model: estimateLean })
            .populate({ path: 'invoiceRelateds', model: invoiceRelatedLean }),
        salesReportLean.countDocuments({ companyId: queryId })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
});
/**
 * Delete a sales report by ID
 * @name DELETE /deleteone/:id
 * @function
 * @memberof module:routers/salesReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} - Promise object represents the response
 */
salesReportRoutes.delete('/deleteone/:id/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'delete'), async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const deleted = await salesReportMain.findOneAndDelete({ _id: id, companyId: queryId });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
/**
 * Search for sales reports by search term and search key with pagination
 * @name POST /search/:limit/:offset
 * @function
 * @memberof module:routers/salesReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} - Promise object represents the response
 */
salesReportRoutes.post('/search/:limit/:offset/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const all = await Promise.all([
        salesReportLean
            .find({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate({ path: 'estimates', model: estimateLean })
            .populate({ path: 'invoiceRelateds', model: invoiceRelatedLean }),
        salesReportLean.countDocuments({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
});
/**
 * Delete multiple sales reports by IDs
 * @name PUT /deletemany
 * @function
 * @memberof module:routers/salesReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} - Promise object represents the response
 */
salesReportRoutes.put('/deletemany/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'delete'), async (req, res) => {
    const { ids } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([...ids, ...[queryId]]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await salesReportMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ companyId: queryId, _id: { $in: ids } })
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