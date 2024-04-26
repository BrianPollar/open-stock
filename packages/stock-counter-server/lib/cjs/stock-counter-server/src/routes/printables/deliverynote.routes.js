"use strict";
/* eslint-disable @typescript-eslint/no-misused-promises */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deliveryNoteRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const log4js_1 = require("log4js");
const deliverynote_model_1 = require("../../models/printables/deliverynote.model");
const receipt_model_1 = require("../../models/printables/receipt.model");
const invoicerelated_model_1 = require("../../models/printables/related/invoicerelated.model");
const invoicerelated_1 = require("./related/invoicerelated");
/** Logger for delivery note routes */
const deliveryNoteRoutesLogger = (0, log4js_1.getLogger)('routes/deliveryNoteRoutes');
/**
 * Express router for delivery note routes.
 */
exports.deliveryNoteRoutes = express_1.default.Router();
/**
 * Route to create a delivery note
 * @name POST /create
 * @function
 * @memberof module:deliveryNoteRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing delivery note and invoice related data
 * @param {Object} req.body.deliveryNote - Delivery note data
 * @param {Object} req.body.invoiceRelated - Invoice related data
 * @param {Object} res - Express response object
 * @returns {Object} Success status and saved delivery note data
 */
exports.deliveryNoteRoutes.post('/create/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_auth_server_1.requireCanUseFeature)('delivery-note'), (0, stock_universal_server_1.roleAuthorisation)('deliveryNotes', 'create'), async (req, res, next) => {
    const { deliveryNote, invoiceRelated } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    deliveryNote.companyId = queryId;
    invoiceRelated.companyId = queryId;
    const count = await deliverynote_model_1.deliveryNoteMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    deliveryNote.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    const extraNotifDesc = 'Newly generated delivery note';
    const invoiceRelatedRes = await (0, invoicerelated_1.relegateInvRelatedCreation)(invoiceRelated, queryId, extraNotifDesc);
    if (!invoiceRelatedRes.success) {
        return res.status(invoiceRelatedRes.status).send(invoiceRelatedRes);
    }
    deliveryNote.invoiceRelated = invoiceRelatedRes.id;
    const newDeliveryNote = new deliverynote_model_1.deliveryNoteMain(deliveryNote);
    let errResponse;
    await newDeliveryNote.save()
        .catch(err => {
        deliveryNoteRoutesLogger.error('create - err: ', err);
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
    await (0, invoicerelated_1.updateInvoiceRelated)(invoiceRelated, companyId);
    return next();
}, (0, stock_auth_server_1.requireUpdateSubscriptionRecord)('delivery-note'));
/**
 * Route to get a delivery note by UR ID
 * @name GET /getone/:urId
 * @function
 * @memberof module:deliveryNoteRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {string} req.params.urId - UR ID of the delivery note to retrieve
 * @param {Object} res - Express response object
 * @returns {Object} Delivery note data with related invoice data
 */
exports.deliveryNoteRoutes.get('/getone/:urId/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryNotes', 'read'), async (req, res) => {
    const { urId } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deliveryNote = await deliverynote_model_1.deliveryNoteLean
        .findOne({ urId, queryId })
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
    let returned;
    if (deliveryNote) {
        returned = (0, invoicerelated_1.makeInvoiceRelatedPdct)(deliveryNote.invoiceRelated, deliveryNote.invoiceRelated
            .billingUserId, deliveryNote.createdAt, {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            _id: deliveryNote._id,
            urId: deliveryNote.urId
        });
    }
    return res.status(200).send(returned);
});
/**
 * Route to get all delivery notes with related invoice data
 * @name GET /getall/:offset/:limit
 * @function
 * @memberof module:deliveryNoteRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {string} req.params.offset - Offset for pagination
 * @param {string} req.params.limit - Limit for pagination
 * @param {Object} res - Express response object
 * @returns {Array} Array of delivery note data with related invoice data
 */
exports.deliveryNoteRoutes.get('/getall/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryNotes', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const all = await Promise.all([
        deliverynote_model_1.deliveryNoteLean
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
        deliverynote_model_1.deliveryNoteLean.countDocuments({ companyId: queryId })
    ]);
    const returned = all[0]
        .map(val => (0, invoicerelated_1.makeInvoiceRelatedPdct)(val.invoiceRelated, val.invoiceRelated
        .billingUserId, (val).createdAt, {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _id: val._id,
        urId: val.urId
    }));
    const response = {
        count: all[1],
        data: returned
    };
    return res.status(200).send(response);
});
/**
 * Route to delete a delivery note and its related invoice data
 * @name PUT /deleteone
 * @function
 * @memberof module:deliveryNoteRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {string} req.body.id - ID of the delivery note to delete
 * @param {string} req.body.invoiceRelated - ID of the related invoice data to delete
 * @param {string} req.body.creationType - Type of creation for the related invoice data
 * @param {string} req.body.stage - Stage of the related invoice data
 * @param {Object} res - Express response object
 * @returns {Object} Success status of the deletion operation
 */
exports.deliveryNoteRoutes.put('/deleteone/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryNotes', 'delete'), async (req, res) => {
    const { id, invoiceRelated, creationType, stage } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await (0, invoicerelated_1.deleteAllLinked)(invoiceRelated, creationType, stage, 'deliverynote', companyId);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
/**
 * Route to search for delivery notes by search term and key
 * @name POST /search/:limit/:offset
 * @function
 * @memberof module:deliveryNoteRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {string} req.params.limit - Limit for pagination
 * @param {string} req.params.offset - Offset for pagination
 * @param {Object} req.body - Request body containing search term and key
 * @param {string} req.body.searchterm - Search term
 * @param {string} req.body.searchKey - Search key
 * @param {Object} res - Express response object
 * @returns {Array} Array of delivery note data with related invoice data
 */
exports.deliveryNoteRoutes.post('/search/:limit/:offset/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryNotes', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const all = await Promise.all([
        deliverynote_model_1.deliveryNoteLean
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
        deliverynote_model_1.deliveryNoteLean.countDocuments({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
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
exports.deliveryNoteRoutes.put('/deletemany/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryNotes', 'delete'), async (req, res) => {
    const { credentials } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    /** const ids = credentials
      .map(val => val.id);
    await deliveryNoteMain
      // eslint-disable-next-line @typescript-eslint/naming-convention
      .deleteMany({ _id: { $in: ids } });**/
    const promises = credentials
        .map(async (val) => {
        await (0, invoicerelated_1.deleteAllLinked)(val.invoiceRelated, val.creationType, val.stage, 'deliverynote', queryId);
        return new Promise(resolve => resolve(true));
    });
    await Promise.all(promises);
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=deliverynote.routes.js.map