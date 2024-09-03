"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateRoutes = exports.updateEstimateUniv = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const rxjs_1 = require("rxjs");
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
 * @param queryId The query ID used to filter the invoices.
 * @returns The new estimate ID.
 */
const makeEstimateId = async (queryId) => {
    const count = await invoicerelated_model_1.invoiceRelatedMain
        .find({ ...rxjs_1.filter, estimateId: { $exists: true, $ne: null } }).sort({ _id: -1 }).limit(1).lean().select({ estimateId: 1 });
    let incCount = count[0]?.estimateId || 0;
    return ++incCount;
};
/**
 * Updates the estimate with the specified ID and sets the stage and invoice ID.
 * @param estimateId - The ID of the estimate to update.
 * @param stage - The stage to set for the estimate.
 * @param queryId - The query ID associated with the estimate.
 * @param invoiceId - The invoice ID to set for the estimate (optional).
 * @returns A boolean indicating whether the estimate was successfully updated.
 */
const updateEstimateUniv = async (res, estimateId, stage, queryId, invoiceId) => {
    const estimate = await estimate_model_1.estimateMain
        .findOne({ estimateId, ...rxjs_1.filter })
        .lean();
    if (!estimate) {
        return false;
    }
    let savedErr;
    await estimate_model_1.estimateMain.updateOne({
        estimateId, ...rxjs_1.filter
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
/**
 * Creates a new estimate and invoice related object.
 * @param req The request object.
 * @param res The response object.
 * @returns A success object with a boolean indicating whether the operation was successful.
 */
exports.estimateRoutes.post('/create/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_auth_server_1.requireCanUseFeature)('quotation'), (0, stock_universal_server_1.roleAuthorisation)('estimates', 'create'), async (req, res, next) => {
    const { estimate, invoiceRelated } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    estimate.companyId = filter.companyId;
    invoiceRelated.companyId = filter.companyId;
    invoiceRelated.estimateId = await makeEstimateId(filter.companyId);
    const extraNotifDesc = 'Newly created estimate';
    const invoiceRelatedRes = await (0, invoicerelated_1.relegateInvRelatedCreation)(res, invoiceRelated, filter.companyId, extraNotifDesc);
    if (!invoiceRelatedRes.success) {
        return res.status(invoiceRelatedRes.status).send(invoiceRelatedRes);
    }
    estimate.invoiceRelated = invoiceRelatedRes.id;
    const newEstimate = new estimate_model_1.estimateMain(estimate);
    let errResponse;
    /**
     * Saves a new estimate and returns a response object.
     * @param {Estimate} newEstimate - The new estimate to be saved.
     * @returns {Promise<{success: boolean, status: number, err?: string}>} - A promise that resolves to an object with success, status, and err properties.
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
/**
 * Gets an estimate and its associated invoice related object by estimate ID.
 * @param req The request object.
 * @param res The response object.
 * @returns The invoice related object associated with the estimate.
 */
exports.estimateRoutes.get('/getone/:estimateId/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('estimates', 'read'), async (req, res) => {
    const { estimateId } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const invoiceRelated = await invoicerelated_model_1.invoiceRelatedLean
        .findOne({ estimateId, ...filter })
        .lean()
        .populate([(0, query_1.populatePayments)(), (0, query_1.populateBillingUser)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()]);
    let returned;
    if (invoiceRelated) {
        returned = (0, invoicerelated_1.makeInvoiceRelatedPdct)(invoiceRelated, invoiceRelated
            .billingUserId);
        // addParentToLocals(res, invoiceRelated._id, estimateLean.collection.collectionName, 'trackDataView'); // TODO
    }
    return res.status(200).send(returned);
});
/**
 * Gets all estimates and their associated invoice related objects.
 * @param req The request object.
 * @param res The response object.
 * @returns An array of invoice related objects associated with the estimates.
 */
exports.estimateRoutes.get('/getall/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('estimates', 'read'), async (req, res) => {
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
        .map(val => (0, invoicerelated_1.makeInvoiceRelatedPdct)(val.invoiceRelated, val.invoiceRelated
        .billingUserId, null, {
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
/**
 * Deletes an estimate and its associated invoice related object.
 * @param req The request object.
 * @param res The response object.
 * @returns A success object with a boolean indicating whether the operation was successful.
 */
exports.estimateRoutes.put('/deleteone/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('estimates', 'delete'), async (req, res) => {
    const { id, invoiceRelated, creationType, stage } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const deleted = await (0, invoicerelated_1.deleteAllLinked)(invoiceRelated, creationType, stage, 'estimate', filter.companyId);
    if (Boolean(deleted)) {
        (0, stock_universal_server_1.addParentToLocals)(res, id, estimate_model_1.estimateLean.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
/**
 * Searches for estimates by a given search term and search key.
 * @param req The request object.
 * @param res The response object.
 * @returns An array of invoice related objects associated with the matching estimates.
 */
exports.estimateRoutes.post('/search/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('estimates', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const all = await Promise.all([
        estimate_model_1.estimateLean
            .find({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate([(0, query_1.populateInvoiceRelated)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()]),
        estimate_model_1.estimateLean.countDocuments({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
    ]);
    const returned = all[0]
        .map(val => (0, invoicerelated_1.makeInvoiceRelatedPdct)(val.invoiceRelated, val.invoiceRelated
        .billingUserId));
    const response = {
        count: all[1],
        data: returned
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, estimate_model_1.estimateLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.estimateRoutes.put('/deletemany/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('estimates', 'delete'), async (req, res) => {
    const { credentials } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    if (!credentials || credentials?.length < 1) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    /** await estimateMain
      .deleteMany({ _id: { $in: ids } });**/
    const promises = credentials
        .map(async (val) => {
        await (0, invoicerelated_1.deleteAllLinked)(val.invoiceRelated, val.creationType, val.stage, 'estimate', filter.companyId);
        return new Promise(resolve => resolve(true));
    });
    await Promise.all(promises);
    for (const val of credentials) {
        (0, stock_universal_server_1.addParentToLocals)(res, val.id, estimate_model_1.estimateLean.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=estimate.routes.js.map