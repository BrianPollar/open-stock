import { populateTrackEdit, populateTrackView, requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord } from '@open-stock/stock-auth-server';
import { addParentToLocals, constructFiltersFromBody, generateUrId, lookupSubFieldInvoiceRelatedFilter, makeCompanyBasedQuery, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr } from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { estimateLean, estimateMain } from '../../models/printables/estimate.model';
import { invoiceRelatedMain } from '../../models/printables/related/invoicerelated.model';
import { populateInvoiceRelated } from '../../utils/query';
import { deleteAllLinked, makeInvoiceRelatedPdct, relegateInvRelatedCreation } from './related/invoicerelated';
/** Logger for estimate routes */
const estimateRoutesogger = tracer.colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
        // eslint-disable-next-line no-console
        console.log(data.output);
        const logDir = path.join(process.cwd() + '/openstockLog/');
        fs.mkdir(logDir, { recursive: true }, (err) => {
            if (err) {
                if (err) {
                    // eslint-disable-next-line no-console
                    console.log('data.output err ', err);
                }
            }
        });
        fs.appendFile(logDir + '/counter-server.log', data.rawoutput + '\n', err => {
            if (err) {
                // eslint-disable-next-line no-console
                console.log('raw.output err ', err);
            }
        });
    }
});
/**
 * Generates a new estimate ID by finding the highest existing estimate ID and incrementing it by 1.
 * @returns The new estimate ID.
 */
/**
 * Generates a new estimate ID based on the given query ID.
 * @param companyId The query ID used to filter the invoices.
 * @returns The new estimate ID.
 */
const makeEstimateId = async (companyId) => {
    const count = await invoiceRelatedMain
        .find({ companyId, estimateId: { $exists: true, $ne: null } })
        .sort({ _id: -1 }).limit(1).lean().select({ estimateId: 1 });
    let incCount = count[0]?.estimateId || 0;
    return ++incCount;
};
export const updateEstimateUniv = async (res, estimateId, stage, companyId) => {
    const estimate = await estimateMain
        .findOne({ estimateId, companyId })
        .lean();
    if (!estimate) {
        return false;
    }
    let savedErr;
    await estimateMain.updateOne({
        estimateId, companyId
    }, {
        $set: {
            stage
            // invoiceId: invoiceId || (estimate as IinvoiceRelated).invoiceId // TODO
        }
    }).catch(err => {
        estimateRoutesogger.error('save error', err);
        savedErr = err;
        return null;
    });
    if (savedErr) {
        return false;
    }
    addParentToLocals(res, estimate._id, estimateLean.collection.collectionName, 'makeTrackEdit');
    return true;
};
/** Router for estimate routes */
export const estimateRoutes = express.Router();
estimateRoutes.post('/add', requireAuth, requireActiveCompany, requireCanUseFeature('quotation'), roleAuthorisation('estimates', 'create'), async (req, res, next) => {
    const { estimate, invoiceRelated } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    estimate.companyId = filter.companyId;
    estimate.urId = await generateUrId(estimateMain);
    invoiceRelated.companyId = filter.companyId;
    invoiceRelated.estimateId = await makeEstimateId(filter.companyId);
    const extraNotifDesc = 'Newly created estimate';
    const invoiceRelatedRes = await relegateInvRelatedCreation(res, invoiceRelated, filter.companyId, extraNotifDesc);
    if (!invoiceRelatedRes.success) {
        return res.status(invoiceRelatedRes.status).send(invoiceRelatedRes);
    }
    estimate.invoiceRelated = invoiceRelatedRes._id;
    const newEstimate = new estimateMain(estimate);
    let errResponse;
    /**
   * Saves a new estimate and returns a response object.
   * @param {Estimate} newEstimate - The new estimate to be saved.
   * @returns {Promise<{success: boolean, status: number, err?: string}>} - A promise that
   * resolves to an object with success, status, and err properties.
   */
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
        return err;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    if (saved && saved._id) {
        addParentToLocals(res, saved._id, estimateLean.collection.collectionName, 'makeTrackEdit');
    }
    return next();
}, requireUpdateSubscriptionRecord('quotation'));
estimateRoutes.get('/one/:urId', requireAuth, requireActiveCompany, roleAuthorisation('estimates', 'read'), async (req, res) => {
    const { urId } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const estimate = await estimateLean
        .findOne({ urId, ...filter })
        .lean()
        .populate([populateInvoiceRelated(), populateTrackEdit(), populateTrackView()]);
    if (!estimate || !estimate.invoiceRelated) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const returned = makeInvoiceRelatedPdct(estimate.invoiceRelated, estimate.invoiceRelated
        .billingUserId, estimate.createdAt, { _id: estimate._id,
        urId: estimate.urId
    });
    // addParentToLocals(res, invoiceRelated._id, estimateLean.collection.collectionName, 'trackDataView'); // TODO
    return res.status(200).send(returned);
});
estimateRoutes.get('/all/:offset/:limit', requireAuth, requireActiveCompany, roleAuthorisation('estimates', 'read'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { filter } = makeCompanyBasedQuery(req);
    const all = await Promise.all([
        estimateLean
            .find(filter)
            .skip(offset)
            .limit(limit)
            .lean()
            .populate([populateInvoiceRelated(), populateTrackEdit(), populateTrackView()]),
        estimateLean.countDocuments(filter)
    ]);
    const returned = all[0]
        .filter(val => val && val.invoiceRelated)
        .map(val => makeInvoiceRelatedPdct(val.invoiceRelated, val.invoiceRelated?.billingUserId, null, {
        _id: val._id
    }));
    const response = {
        count: all[1],
        data: returned
    };
    for (const val of all[0]) {
        addParentToLocals(res, val._id, estimateLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
estimateRoutes.put('/delete/one', requireAuth, requireActiveCompany, roleAuthorisation('estimates', 'delete'), async (req, res) => {
    const { _id } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const found = await estimateLean.findOne({ _id }).lean();
    if (!found) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const deleted = await deleteAllLinked(found.invoiceRelated, 'estimate', filter.companyId);
    if (Boolean(deleted)) {
        addParentToLocals(res, _id, estimateLean.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
estimateRoutes.post('/filter', requireAuth, requireActiveCompany, roleAuthorisation('estimates', 'read'), async (req, res) => {
    const { propSort } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);
    const aggCursor = estimateLean
        .aggregate([
        ...lookupSubFieldInvoiceRelatedFilter(constructFiltersFromBody(req), propSort, offset, limit)
    ]);
    const dataArr = [];
    for await (const data of aggCursor) {
        dataArr.push(data);
    }
    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;
    const returned = all
        .filter(val => val && val.invoiceRelated)
        .map(val => makeInvoiceRelatedPdct(val.invoiceRelated, val.invoiceRelated?.billingUserId));
    const response = {
        count,
        data: returned
    };
    for (const val of all) {
        addParentToLocals(res, val._id, estimateLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
estimateRoutes.put('/delete/many', requireAuth, requireActiveCompany, roleAuthorisation('estimates', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const promises = _ids
        .map(async (val) => {
        const found = await estimateLean.findOne({ _id: val }).lean();
        if (found) {
            await deleteAllLinked(found.invoiceRelated, 'estimate', filter.companyId);
        }
        return new Promise(resolve => resolve(found._id));
    });
    const filterdExist = await Promise.all(promises);
    for (const val of filterdExist) {
        addParentToLocals(res, val, estimateLean.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=estimate.routes.js.map