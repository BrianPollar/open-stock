"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateRoutes = exports.updateEstimateUniv = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const log4js_1 = require("log4js");
const estimate_model_1 = require("../../models/printables/estimate.model");
const receipt_model_1 = require("../../models/printables/receipt.model");
const invoicerelated_model_1 = require("../../models/printables/related/invoicerelated.model");
const invoicerelated_1 = require("./related/invoicerelated");
/** Logger for estimate routes */
const estimateRoutesogger = (0, log4js_1.getLogger)('routes/estimateRoutes');
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
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({ companyId: queryId, estimateId: { $exists: true, $ne: null } }).sort({ _id: -1 }).limit(1).lean().select({ estimateId: 1 });
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
const updateEstimateUniv = async (estimateId, stage, queryId, invoiceId) => {
    const estimate = await estimate_model_1.estimateMain
        .findOneAndUpdate({ estimateId, companyId: queryId });
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
exports.updateEstimateUniv = updateEstimateUniv;
/** Router for estimate routes */
exports.estimateRoutes = express_1.default.Router();
/**
 * Creates a new estimate and invoice related object.
 * @param req The request object.
 * @param res The response object.
 * @returns A success object with a boolean indicating whether the operation was successful.
 */
exports.estimateRoutes.post('/create/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables', 'create'), async (req, res) => {
    const { estimate, invoiceRelated } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    estimate.companyId = queryId;
    invoiceRelated.companyId = queryId;
    invoiceRelated.estimateId = await makeEstimateId(companyId);
    const extraNotifDesc = 'Newly created estimate';
    const invoiceRelatedRes = await (0, invoicerelated_1.relegateInvRelatedCreation)(invoiceRelated, extraNotifDesc, companyId);
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
        return errResponse;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    return res.status(200).send({ success: Boolean(saved) });
});
/**
 * Gets an estimate and its associated invoice related object by estimate ID.
 * @param req The request object.
 * @param res The response object.
 * @returns The invoice related object associated with the estimate.
 */
exports.estimateRoutes.get('/getone/:estimateId/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables', 'read'), async (req, res) => {
    const { estimateId } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    estimateId.companyId = queryId;
    const invoiceRelated = await invoicerelated_model_1.invoiceRelatedLean
        .findOne({ estimateId, companyId: queryId })
        .lean()
        .populate({ path: 'billingUserId', model: stock_auth_server_1.userLean })
        .populate({ path: 'payments', model: receipt_model_1.receiptLean });
    let returned;
    if (invoiceRelated) {
        returned = (0, invoicerelated_1.makeInvoiceRelatedPdct)(invoiceRelated, invoiceRelated
            .billingUserId);
    }
    return res.status(200).send(returned);
});
/**
 * Gets all estimates and their associated invoice related objects.
 * @param req The request object.
 * @param res The response object.
 * @returns An array of invoice related objects associated with the estimates.
 */
exports.estimateRoutes.get('/getall/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const all = await Promise.all([
        estimate_model_1.estimateLean
            .find({ companyId: queryId })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate({
            path: 'invoiceRelated', model: invoicerelated_model_1.invoiceRelatedLean,
            populate: [{
                    path: 'billingUserId', model: stock_auth_server_1.userLean
                },
                {
                    path: 'payments', model: receipt_model_1.receiptLean
                }]
        }),
        estimate_model_1.estimateLean.countDocuments({ companyId: queryId })
    ]);
    const returned = all[0]
        .map(val => (0, invoicerelated_1.makeInvoiceRelatedPdct)(val.invoiceRelated, val.invoiceRelated
        .billingUserId));
    const response = {
        count: all[1],
        data: returned
    };
    return res.status(200).send(response);
});
/**
 * Deletes an estimate and its associated invoice related object.
 * @param req The request object.
 * @param res The response object.
 * @returns A success object with a boolean indicating whether the operation was successful.
 */
exports.estimateRoutes.put('/deleteone/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { id, invoiceRelated, creationType, stage } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await (0, invoicerelated_1.deleteAllLinked)(invoiceRelated, creationType, stage, 'estimate', companyId);
    if (Boolean(deleted)) {
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
exports.estimateRoutes.post('/search/:limit/:offset/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const all = await Promise.all([
        estimate_model_1.estimateLean
            .find({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate({
            path: 'invoiceRelated', model: invoicerelated_model_1.invoiceRelatedLean,
            populate: [{
                    path: 'billingUserId', model: stock_auth_server_1.userLean
                },
                {
                    path: 'payments', model: receipt_model_1.receiptLean
                }]
        }),
        estimate_model_1.estimateLean.countDocuments({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
    ]);
    const returned = all[0]
        .map(val => (0, invoicerelated_1.makeInvoiceRelatedPdct)(val.invoiceRelated, val.invoiceRelated
        .billingUserId));
    const response = {
        count: all[1],
        data: returned
    };
    return res.status(200).send(response);
});
exports.estimateRoutes.put('/deletemany/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables', 'delete'), async (req, res) => {
    const { credentials } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    if (!credentials || credentials?.length < 1) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    /** await estimateMain
      // eslint-disable-next-line @typescript-eslint/naming-convention
      .deleteMany({ _id: { $in: ids } });**/
    const promises = credentials
        .map(async (val) => {
        await (0, invoicerelated_1.deleteAllLinked)(val.invoiceRelated, val.creationType, val.stage, 'estimate', queryId);
        return new Promise(resolve => resolve(true));
    });
    await Promise.all(promises);
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=estimate.routes.js.map