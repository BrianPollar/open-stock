import { populateTrackEdit, populateTrackView, requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord } from '@open-stock/stock-auth-server';
import { addParentToLocals, constructFiltersFromBody, generateUrId, handleMongooseErr, lookupSubFieldInvoiceRelatedFilter, makeCompanyBasedQuery, offsetLimitRelegator, requireAuth, roleAuthorisation, verifyObjectId } from '@open-stock/stock-universal-server';
import express from 'express';
import { Promise } from 'mongoose';
import { deliveryNoteLean, deliveryNoteMain } from '../../models/printables/deliverynote.model';
import { populateInvoiceRelated } from '../../utils/query';
import { deleteAllLinked, makeInvoiceRelatedPdct, relegateInvRelatedCreation, updateInvoiceRelated } from './related/invoicerelated';
/**
 * Express router for delivery note routes.
 */
export const deliveryNoteRoutes = express.Router();
deliveryNoteRoutes.post('/add', requireAuth, requireActiveCompany, requireCanUseFeature('quotation'), roleAuthorisation('deliveryNotes', 'create'), async (req, res, next) => {
    const { deliveryNote, invoiceRelated } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    deliveryNote.companyId = filter.companyId;
    invoiceRelated.companyId = filter.companyId;
    deliveryNote.urId = await generateUrId(deliveryNoteMain);
    const extraNotifDesc = 'Newly generated delivery note';
    const invoiceRelatedRes = await relegateInvRelatedCreation(res, invoiceRelated, filter.companyId, extraNotifDesc);
    if (!invoiceRelatedRes.success && invoiceRelatedRes.status) {
        return res.status(invoiceRelatedRes.status).send(invoiceRelatedRes);
    }
    deliveryNote.invoiceRelated = invoiceRelatedRes._id;
    const newDeliveryNote = new deliveryNoteMain(deliveryNote);
    const savedRes = await newDeliveryNote.save()
        .catch((err) => err);
    if (savedRes instanceof Error) {
        const errResponse = handleMongooseErr(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    addParentToLocals(res, savedRes._id, deliveryNoteLean.collection.collectionName, 'makeTrackEdit');
    await updateInvoiceRelated(res, invoiceRelated);
    return next();
}, requireUpdateSubscriptionRecord('quotation'));
deliveryNoteRoutes.get('/one/:urIdOr_id', requireAuth, requireActiveCompany, roleAuthorisation('deliveryNotes', 'read'), async (req, res) => {
    const { urIdOr_id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const filterwithId = verifyObjectId(urIdOr_id) ? { _id: urIdOr_id } : { urId: urIdOr_id };
    const deliveryNote = await deliveryNoteLean
        .findOne({ ...filterwithId, ...filter })
        .lean()
        .populate([populateInvoiceRelated(), populateTrackEdit(), populateTrackView()]);
    if (!deliveryNote || !deliveryNote.invoiceRelated) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const returned = makeInvoiceRelatedPdct(deliveryNote.invoiceRelated, deliveryNote.invoiceRelated
        .billingUserId, deliveryNote.createdAt, {
        _id: deliveryNote._id,
        urId: deliveryNote.urId
    });
    addParentToLocals(res, deliveryNote._id, deliveryNoteLean.collection.collectionName, 'trackDataView');
    return res.status(200).send(returned);
});
deliveryNoteRoutes.get('/all/:offset/:limit', requireAuth, requireActiveCompany, roleAuthorisation('deliveryNotes', 'read'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { filter } = makeCompanyBasedQuery(req);
    const all = await Promise.all([
        deliveryNoteLean
            .find(filter)
            .skip(offset)
            .limit(limit)
            .lean()
            .populate([populateInvoiceRelated(), populateTrackEdit(), populateTrackView()]),
        deliveryNoteLean.countDocuments(filter)
    ]);
    const returned = all[0]
        .filter(val => val && val.invoiceRelated)
        .map(val => makeInvoiceRelatedPdct(val.invoiceRelated, val.invoiceRelated
        .billingUserId, (val).createdAt, {
        _id: val._id,
        urId: val.urId
    }));
    const response = {
        count: all[1],
        data: returned
    };
    for (const val of all[0]) {
        addParentToLocals(res, val._id, deliveryNoteLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
deliveryNoteRoutes.put('/delete/one', requireAuth, requireActiveCompany, roleAuthorisation('deliveryNotes', 'delete'), async (req, res) => {
    const { _id } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const found = await deliveryNoteLean.findOne({ _id }).lean();
    if (!found) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const updateRes = await deleteAllLinked(found.invoiceRelated, 'deliverynote', filter.companyId);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    addParentToLocals(res, _id, deliveryNoteLean.collection.collectionName, 'trackDataDelete');
    return res.status(200).send({ success: true });
});
deliveryNoteRoutes.post('/filter', requireAuth, requireActiveCompany, roleAuthorisation('deliveryNotes', 'read'), async (req, res) => {
    const { propSort, returnEmptyArr } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);
    const aggCursor = deliveryNoteLean
        .aggregate([
        ...lookupSubFieldInvoiceRelatedFilter(constructFiltersFromBody(req), offset, limit, propSort, returnEmptyArr)
    ]);
    const dataArr = [];
    for await (const data of aggCursor) {
        dataArr.push(data);
    }
    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;
    const returned = all
        .filter(val => val && val.invoiceRelated)
        .map(val => makeInvoiceRelatedPdct(val.invoiceRelated, val.invoiceRelated
        .billingUserId));
    const response = {
        count,
        data: returned
    };
    for (const val of all) {
        addParentToLocals(res, val._id, deliveryNoteLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
deliveryNoteRoutes.put('/delete/many', requireAuth, requireActiveCompany, roleAuthorisation('deliveryNotes', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const promises = _ids
        .map(async (_id) => {
        const found = await deliveryNoteLean.findOne({ _id }).lean();
        if (found) {
            await deleteAllLinked(found.invoiceRelated, 'deliverynote', filter.companyId);
        }
        return new Promise(resolve => resolve(found?._id));
    });
    const filterdExist = await Promise.all(promises);
    for (const val of filterdExist.filter(value => value)) {
        addParentToLocals(res, val, deliveryNoteLean.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=deliverynote.routes.js.map