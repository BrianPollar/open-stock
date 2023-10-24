"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateRoutes = exports.updateEstimateUniv = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const estimate_model_1 = require("../../models/printables/estimate.model");
const invoicerelated_model_1 = require("../../models/printables/related/invoicerelated.model");
const invoicerelated_1 = require("./related/invoicerelated");
const log4js_1 = require("log4js");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const receipt_model_1 = require("../../models/printables/receipt.model");
/** Logger for estimate routes */
const estimateRoutesogger = (0, log4js_1.getLogger)('routes/estimateRoutes');
/**
 * Generates a new estimate ID by finding the highest existing estimate ID and incrementing it by 1.
 * @returns The new estimate ID.
 */
const makeEstimateId = async () => {
    const count = await invoicerelated_model_1.invoiceRelatedMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({ estimateId: { $exists: true, $ne: null } }).sort({ _id: -1 }).limit(1).lean().select({ estimateId: 1 });
    let incCount = count[0]?.estimateId || 0;
    return ++incCount;
};
/**
 * Updates an estimate's stage and/or invoice ID.
 * @param estimateId The ID of the estimate to update.
 * @param stage The new stage for the estimate.
 * @param invoiceId (Optional) The new invoice ID for the estimate.
 * @returns True if the update was successful, false otherwise.
 */
const updateEstimateUniv = async (estimateId, stage, invoiceId) => {
    const estimate = await estimate_model_1.estimateMain
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
exports.updateEstimateUniv = updateEstimateUniv;
/** Router for estimate routes */
exports.estimateRoutes = express_1.default.Router();
/**
 * Creates a new estimate and invoice related object.
 * @param req The request object.
 * @param res The response object.
 * @returns A success object with a boolean indicating whether the operation was successful.
 */
exports.estimateRoutes.post('/create', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { estimate, invoiceRelated } = req.body;
    invoiceRelated.estimateId = await makeEstimateId();
    const extraNotifDesc = 'Newly created estimate';
    const invoiceRelatedRes = await (0, invoicerelated_1.relegateInvRelatedCreation)(invoiceRelated, extraNotifDesc, req.app.locals.stockCounterServer.notifRedirectUrl, req.app.locals.stockCounterServer.locaLMailHandler);
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
exports.estimateRoutes.get('/getone/:estimateId', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { estimateId } = req.params;
    const invoiceRelated = await invoicerelated_model_1.invoiceRelatedLean
        .findOne({ estimateId })
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
exports.estimateRoutes.get('/getall/:offset/:limit', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const estimates = await estimate_model_1.estimateLean
        .find({})
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
    });
    const returned = estimates
        .map(val => (0, invoicerelated_1.makeInvoiceRelatedPdct)(val.invoiceRelated, val.invoiceRelated
        .billingUserId));
    return res.status(200).send(returned);
});
/**
 * Deletes an estimate and its associated invoice related object.
 * @param req The request object.
 * @param res The response object.
 * @returns A success object with a boolean indicating whether the operation was successful.
 */
exports.estimateRoutes.put('/deleteone', stock_universal_server_1.requireAuth, async (req, res) => {
    const { id, invoiceRelated, creationType, stage } = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await (0, invoicerelated_1.deleteAllLinked)(invoiceRelated, creationType, stage, 'estimate');
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
exports.estimateRoutes.post('/search/:limit/:offset', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('estimates'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const estimates = await estimate_model_1.estimateLean
        .find({ [searchKey]: { $regex: searchterm, $options: 'i' } })
        .lean()
        .skip(offset)
        .limit(limit)
        .populate({
        path: 'invoiceRelated', model: invoicerelated_model_1.invoiceRelatedLean,
        populate: [{
                path: 'billingUserId', model: stock_auth_server_1.userLean
            },
            {
                path: 'payments', model: receipt_model_1.receiptLean
            }]
    });
    const returned = estimates
        .map(val => (0, invoicerelated_1.makeInvoiceRelatedPdct)(val.invoiceRelated, val.invoiceRelated
        .billingUserId));
    return res.status(200).send(returned);
});
exports.estimateRoutes.put('/deletemany', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { credentials } = req.body;
    if (!credentials || credentials?.length < 1) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    /** await estimateMain
      // eslint-disable-next-line @typescript-eslint/naming-convention
      .deleteMany({ _id: { $in: ids } });**/
    const promises = credentials
        .map(async (val) => {
        await (0, invoicerelated_1.deleteAllLinked)(val.invoiceRelated, val.creationType, val.stage, 'estimate');
        return new Promise(resolve => resolve(true));
    });
    await Promise.all(promises);
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=estimate.routes.js.map