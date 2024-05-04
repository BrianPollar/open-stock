import { requireActiveCompany } from '@open-stock/stock-auth-server';
import { makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import * as tracer from 'tracer';
import { paymentLean } from '../../../models/payment.model';
import { estimateLean } from '../../../models/printables/estimate.model';
import { invoicesReportLean, invoicesReportMain } from '../../../models/printables/report/invoicereport.model';
import * as fs from 'fs';
/** Logger for invoicesReportRoutes */
const invoicesReportRoutesLogger = tracer.colorConsole({
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
 * Express router for invoices report routes.
 */
export const invoicesReportRoutes = express.Router();
/**
 * Route to create a new invoices report
 * @name POST /create
 * @function
 * @memberof module:routes/invoicesReportRoutes~invoicesReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
invoicesReportRoutes.post('/create/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'create'), async (req, res, next) => {
    const invoicesReport = req.body.invoicesReport;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectId(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    invoicesReport.companyId = queryId;
    const count = await invoicesReportMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
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
/**
 * Route to get a single invoices report by urId
 * @name GET /getone/:urId
 * @function
 * @memberof module:routes/invoicesReportRoutes~invoicesReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
invoicesReportRoutes.get('/getone/:urId/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'read'), async (req, res) => {
    const { urId } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectId(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const invoicesReport = await invoicesReportLean
        .findOne({ urId, queryId })
        .lean()
        .populate({ path: 'estimates', model: estimateLean })
        .populate({ path: 'payments', model: paymentLean });
    return res.status(200).send(invoicesReport);
});
/**
 * Route to get all invoices reports with pagination
 * @name GET /getall/:offset/:limit
 * @function
 * @memberof module:routes/invoicesReportRoutes~invoicesReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
invoicesReportRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'read'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectId(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const all = await Promise.all([
        invoicesReportLean
            .find({ companyId: queryId })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate({ path: 'estimates', model: estimateLean })
            .populate({ path: 'payments', model: paymentLean }),
        invoicesReportLean.countDocuments({ companyId: queryId })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
});
/**
 * Route to delete a single invoices report by id
 * @name DELETE /deleteone/:id
 * @function
 * @memberof module:routes/invoicesReportRoutes~invoicesReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
invoicesReportRoutes.delete('/deleteone/:id/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'delete'), async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const deleted = await invoicesReportMain.findOneAndDelete({ _id: id, companyId: queryId });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
/**
 * Route to search invoices reports by a search term and key with pagination
 * @name POST /search/:offset/:limit
 * @function
 * @memberof module:routes/invoicesReportRoutes~invoicesReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
invoicesReportRoutes.post('/search/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'read'), async (req, res) => {
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
        invoicesReportLean
            .find({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate({ path: 'estimates', model: estimateLean })
            .populate({ path: 'payments', model: paymentLean }),
        invoicesReportLean.countDocuments({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
});
/**
 * Route to delete multiple invoices reports by ids
 * @name PUT /deletemany
 * @function
 * @memberof module:routes/invoicesReportRoutes~invoicesReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
invoicesReportRoutes.put('/deletemany/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'delete'), async (req, res) => {
    const { ids } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([...ids, ...[queryId]]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await invoicesReportMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ companyId: queryId, _id: { $in: ids } })
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