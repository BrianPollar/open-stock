/* eslint-disable @typescript-eslint/no-misused-promises */
import { requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord, userLean } from '@open-stock/stock-auth-server';
import { makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import { getLogger } from 'log4js';
import { deliveryNoteLean, deliveryNoteMain } from '../../models/printables/deliverynote.model';
import { receiptLean } from '../../models/printables/receipt.model';
import { invoiceRelatedLean } from '../../models/printables/related/invoicerelated.model';
import { deleteAllLinked, makeInvoiceRelatedPdct, relegateInvRelatedCreation, updateInvoiceRelated } from './related/invoicerelated';
/** Logger for delivery note routes */
const deliveryNoteRoutesLogger = getLogger('routes/deliveryNoteRoutes');
/**
 * Express router for delivery note routes.
 */
export const deliveryNoteRoutes = express.Router();
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
deliveryNoteRoutes.post('/create/:companyIdParam', requireAuth, requireActiveCompany, requireCanUseFeature('delivery-note'), roleAuthorisation('deliveryNotes', 'create'), async (req, res, next) => {
    const { deliveryNote, invoiceRelated } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    deliveryNote.companyId = queryId;
    invoiceRelated.companyId = queryId;
    const count = await deliveryNoteMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    deliveryNote.urId = makeUrId(Number(count[0]?.urId || '0'));
    const extraNotifDesc = 'Newly generated delivery note';
    const invoiceRelatedRes = await relegateInvRelatedCreation(invoiceRelated, extraNotifDesc, companyId);
    if (!invoiceRelatedRes.success) {
        return res.status(invoiceRelatedRes.status).send(invoiceRelatedRes);
    }
    deliveryNote.invoiceRelated = invoiceRelatedRes.id;
    const newDeliveryNote = new deliveryNoteMain(deliveryNote);
    let errResponse;
    const saved = await newDeliveryNote.save()
        .catch(err => {
        deliveryNoteRoutesLogger.error('create - err: ', err);
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
    await updateInvoiceRelated(invoiceRelated, companyId);
    return next();
}, requireUpdateSubscriptionRecord);
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
deliveryNoteRoutes.get('/getone/:urId/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('deliveryNotes', 'read'), async (req, res) => {
    const { urId } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const deliveryNote = await deliveryNoteLean
        .findOne({ urId, queryId })
        .lean()
        .populate({
        path: 'invoiceRelated', model: invoiceRelatedLean,
        populate: [{
                path: 'billingUserId', model: userLean
            },
            {
                path: 'payments', model: receiptLean
            }]
    });
    let returned;
    if (deliveryNote) {
        returned = makeInvoiceRelatedPdct(deliveryNote.invoiceRelated, deliveryNote.invoiceRelated
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
deliveryNoteRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('deliveryNotes', 'read'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const all = await Promise.all([
        deliveryNoteLean
            .find({ companyId: queryId })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate({
            path: 'invoiceRelated', model: invoiceRelatedLean,
            populate: [{
                    path: 'billingUserId', model: userLean
                },
                {
                    path: 'payments', model: receiptLean
                }]
        }),
        deliveryNoteLean.countDocuments({ companyId: queryId })
    ]);
    const returned = all[0]
        .map(val => makeInvoiceRelatedPdct(val.invoiceRelated, val.invoiceRelated
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
deliveryNoteRoutes.put('/deleteone/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('deliveryNotes', 'delete'), async (req, res) => {
    const { id, invoiceRelated, creationType, stage } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await deleteAllLinked(invoiceRelated, creationType, stage, 'deliverynote', companyId);
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
deliveryNoteRoutes.post('/search/:limit/:offset/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('deliveryNotes', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const all = await Promise.all([
        deliveryNoteLean
            .find({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate({
            path: 'invoiceRelated', model: invoiceRelatedLean,
            populate: [{
                    path: 'billingUserId', model: userLean
                },
                {
                    path: 'payments', model: receiptLean
                }]
        }),
        deliveryNoteLean.countDocuments({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
    ]);
    const returned = all[0]
        .map(val => makeInvoiceRelatedPdct(val.invoiceRelated, val.invoiceRelated
        .billingUserId));
    const response = {
        count: all[1],
        data: returned
    };
    return res.status(200).send(response);
});
deliveryNoteRoutes.put('/deletemany/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('deliveryNotes', 'delete'), async (req, res) => {
    const { credentials } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    /** const ids = credentials
      .map(val => val.id);
    await deliveryNoteMain
      // eslint-disable-next-line @typescript-eslint/naming-convention
      .deleteMany({ _id: { $in: ids } });**/
    const promises = credentials
        .map(async (val) => {
        await deleteAllLinked(val.invoiceRelated, val.creationType, val.stage, 'deliverynote', queryId);
        return new Promise(resolve => resolve(true));
    });
    await Promise.all(promises);
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=deliverynote.routes.js.map