"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateRoutes = exports.updateEstimateUniv = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const estimate_model_1 = require("../../models/printables/estimate.model");
const invoicerelated_model_1 = require("../../models/printables/related/invoicerelated.model");
const query_1 = require("../../utils/query");
const invoicerelated_1 = require("./related/invoicerelated");
/** Logger for estimate routes */
const estimateRoutesogger = tracer.colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
        // eslint-disable-next-line no-console
        console.log(data.output);
        const logDir = path_1.default.join(process.cwd() + '/openstockLog/');
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
    const count = await invoicerelated_model_1.invoiceRelatedMain
        .find({ companyId, estimateId: { $exists: true, $ne: null } })
        .sort({ _id: -1 }).limit(1).lean().select({ estimateId: 1 });
    let incCount = count[0]?.estimateId || 0;
    return ++incCount;
};
const updateEstimateUniv = async (res, estimateId, stage, companyId) => {
    const estimate = await estimate_model_1.estimateMain
        .findOne({ estimateId, companyId })
        .lean();
    if (!estimate) {
        return false;
    }
    let savedErr;
    await estimate_model_1.estimateMain.updateOne({
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
    (0, stock_universal_server_1.addParentToLocals)(res, estimate._id, estimate_model_1.estimateLean.collection.collectionName, 'makeTrackEdit');
    return true;
};
exports.updateEstimateUniv = updateEstimateUniv;
/** Router for estimate routes */
exports.estimateRoutes = express_1.default.Router();
exports.estimateRoutes.post('/add', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_auth_server_1.requireCanUseFeature)('quotation'), (0, stock_universal_server_1.roleAuthorisation)('estimates', 'create'), async (req, res, next) => {
    const { estimate, invoiceRelated } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    estimate.companyId = filter.companyId;
    estimate.urId = await (0, stock_universal_server_1.generateUrId)(estimate_model_1.estimateMain);
    invoiceRelated.companyId = filter.companyId;
    invoiceRelated.estimateId = await makeEstimateId(filter.companyId);
    const extraNotifDesc = 'Newly created estimate';
    const invoiceRelatedRes = await (0, invoicerelated_1.relegateInvRelatedCreation)(res, invoiceRelated, filter.companyId, extraNotifDesc);
    if (!invoiceRelatedRes.success) {
        return res.status(invoiceRelatedRes.status).send(invoiceRelatedRes);
    }
    estimate.invoiceRelated = invoiceRelatedRes._id;
    const newEstimate = new estimate_model_1.estimateMain(estimate);
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
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
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
        (0, stock_universal_server_1.addParentToLocals)(res, saved._id, estimate_model_1.estimateLean.collection.collectionName, 'makeTrackEdit');
    }
    return next();
}, (0, stock_auth_server_1.requireUpdateSubscriptionRecord)('quotation'));
exports.estimateRoutes.get('/one/:urId', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('estimates', 'read'), async (req, res) => {
    const { urId } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const estimate = await estimate_model_1.estimateLean
        .findOne({ urId, ...filter })
        .lean()
        .populate([(0, query_1.populateInvoiceRelated)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()]);
    if (!estimate || !estimate.invoiceRelated) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const returned = (0, invoicerelated_1.makeInvoiceRelatedPdct)(estimate.invoiceRelated, estimate.invoiceRelated
        .billingUserId, estimate.createdAt, { _id: estimate._id,
        urId: estimate.urId
    });
    // addParentToLocals(res, invoiceRelated._id, estimateLean.collection.collectionName, 'trackDataView'); // TODO
    return res.status(200).send(returned);
});
exports.estimateRoutes.get('/all/:offset/:limit', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('estimates', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const all = await Promise.all([
        estimate_model_1.estimateLean
            .find(filter)
            .skip(offset)
            .limit(limit)
            .lean()
            .populate([(0, query_1.populateInvoiceRelated)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()]),
        estimate_model_1.estimateLean.countDocuments(filter)
    ]);
    const returned = all[0]
        .filter(val => val && val.invoiceRelated)
        .map(val => (0, invoicerelated_1.makeInvoiceRelatedPdct)(val.invoiceRelated, val.invoiceRelated?.billingUserId, null, {
        _id: val._id
    }));
    const response = {
        count: all[1],
        data: returned
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, estimate_model_1.estimateLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.estimateRoutes.put('/delete/one', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('estimates', 'delete'), async (req, res) => {
    const { _id } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const found = await estimate_model_1.estimateLean.findOne({ _id }).lean();
    if (!found) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const deleted = await (0, invoicerelated_1.deleteAllLinked)(found.invoiceRelated, 'estimate', filter.companyId);
    if (Boolean(deleted)) {
        (0, stock_universal_server_1.addParentToLocals)(res, _id, estimate_model_1.estimateLean.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.estimateRoutes.post('/filter', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('estimates', 'read'), async (req, res) => {
    const { propSort } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const aggCursor = estimate_model_1.estimateLean
        .aggregate([
        ...(0, stock_universal_server_1.lookupSubFieldInvoiceRelatedFilter)((0, stock_universal_server_1.constructFiltersFromBody)(req), propSort, offset, limit)
    ]);
    const dataArr = [];
    for await (const data of aggCursor) {
        dataArr.push(data);
    }
    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;
    const returned = all
        .filter(val => val && val.invoiceRelated)
        .map(val => (0, invoicerelated_1.makeInvoiceRelatedPdct)(val.invoiceRelated, val.invoiceRelated?.billingUserId));
    const response = {
        count,
        data: returned
    };
    for (const val of all) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, estimate_model_1.estimateLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.estimateRoutes.put('/delete/many', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('estimates', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const promises = _ids
        .map(async (val) => {
        const found = await estimate_model_1.estimateLean.findOne({ _id: val }).lean();
        if (found) {
            await (0, invoicerelated_1.deleteAllLinked)(found.invoiceRelated, 'estimate', filter.companyId);
        }
        return new Promise(resolve => resolve(found._id));
    });
    const filterdExist = await Promise.all(promises);
    for (const val of filterdExist) {
        (0, stock_universal_server_1.addParentToLocals)(res, val, estimate_model_1.estimateLean.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=estimate.routes.js.map