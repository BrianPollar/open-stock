"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deliveryNoteRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const mongoose_1 = require("mongoose");
const deliverynote_model_1 = require("../../models/printables/deliverynote.model");
const query_1 = require("../../utils/query");
const invoicerelated_1 = require("./related/invoicerelated");
/**
 * Express router for delivery note routes.
 */
exports.deliveryNoteRoutes = express_1.default.Router();
exports.deliveryNoteRoutes.post('/add', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_auth_server_1.requireCanUseFeature)('quotation'), (0, stock_universal_server_1.roleAuthorisation)('deliveryNotes', 'create'), async (req, res, next) => {
    const { deliveryNote, invoiceRelated } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    deliveryNote.companyId = filter.companyId;
    invoiceRelated.companyId = filter.companyId;
    deliveryNote.urId = await (0, stock_universal_server_1.generateUrId)(deliverynote_model_1.deliveryNoteMain);
    const extraNotifDesc = 'Newly generated delivery note';
    const invoiceRelatedRes = await (0, invoicerelated_1.relegateInvRelatedCreation)(res, invoiceRelated, filter.companyId, extraNotifDesc);
    if (!invoiceRelatedRes.success && invoiceRelatedRes.status) {
        return res.status(invoiceRelatedRes.status).send(invoiceRelatedRes);
    }
    deliveryNote.invoiceRelated = invoiceRelatedRes._id;
    const newDeliveryNote = new deliverynote_model_1.deliveryNoteMain(deliveryNote);
    const savedRes = await newDeliveryNote.save()
        .catch((err) => err);
    if (savedRes instanceof Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, savedRes._id, deliverynote_model_1.deliveryNoteLean.collection.collectionName, 'makeTrackEdit');
    await (0, invoicerelated_1.updateInvoiceRelated)(res, invoiceRelated);
    return next();
}, (0, stock_auth_server_1.requireUpdateSubscriptionRecord)('quotation'));
exports.deliveryNoteRoutes.get('/one/:urIdOr_id', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryNotes', 'read'), async (req, res) => {
    const { urIdOr_id } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const filterwithId = (0, stock_universal_server_1.verifyObjectId)(urIdOr_id) ? { _id: urIdOr_id } : { urId: urIdOr_id };
    const deliveryNote = await deliverynote_model_1.deliveryNoteLean
        .findOne({ ...filterwithId, ...filter })
        .lean()
        .populate([(0, query_1.populateInvoiceRelated)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()]);
    if (!deliveryNote || !deliveryNote.invoiceRelated) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const returned = (0, invoicerelated_1.makeInvoiceRelatedPdct)(deliveryNote.invoiceRelated, deliveryNote.invoiceRelated
        .billingUserId, deliveryNote.createdAt, {
        _id: deliveryNote._id,
        urId: deliveryNote.urId
    });
    (0, stock_universal_server_1.addParentToLocals)(res, deliveryNote._id, deliverynote_model_1.deliveryNoteLean.collection.collectionName, 'trackDataView');
    return res.status(200).send(returned);
});
exports.deliveryNoteRoutes.get('/all/:offset/:limit', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryNotes', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const all = await mongoose_1.Promise.all([
        deliverynote_model_1.deliveryNoteLean
            .find(filter)
            .skip(offset)
            .limit(limit)
            .lean()
            .populate([(0, query_1.populateInvoiceRelated)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()]),
        deliverynote_model_1.deliveryNoteLean.countDocuments(filter)
    ]);
    const returned = all[0]
        .filter(val => val && val.invoiceRelated)
        .map(val => (0, invoicerelated_1.makeInvoiceRelatedPdct)(val.invoiceRelated, val.invoiceRelated
        .billingUserId, (val).createdAt, {
        _id: val._id,
        urId: val.urId
    }));
    const response = {
        count: all[1],
        data: returned
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, deliverynote_model_1.deliveryNoteLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.deliveryNoteRoutes.put('/delete/one', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryNotes', 'delete'), async (req, res) => {
    const { _id } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const found = await deliverynote_model_1.deliveryNoteLean.findOne({ _id }).lean();
    if (!found) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const updateRes = await (0, invoicerelated_1.deleteAllLinked)(found.invoiceRelated, 'deliverynote', filter.companyId);
    if (updateRes instanceof Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, _id, deliverynote_model_1.deliveryNoteLean.collection.collectionName, 'trackDataDelete');
    return res.status(200).send({ success: true });
});
exports.deliveryNoteRoutes.post('/filter', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryNotes', 'read'), async (req, res) => {
    const { propSort, returnEmptyArr } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const aggCursor = deliverynote_model_1.deliveryNoteLean
        .aggregate([
        ...(0, stock_universal_server_1.lookupSubFieldInvoiceRelatedFilter)((0, stock_universal_server_1.constructFiltersFromBody)(req), offset, limit, propSort, returnEmptyArr)
    ]);
    const dataArr = [];
    for await (const data of aggCursor) {
        dataArr.push(data);
    }
    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;
    const returned = all
        .filter(val => val && val.invoiceRelated)
        .map(val => (0, invoicerelated_1.makeInvoiceRelatedPdct)(val.invoiceRelated, val.invoiceRelated
        .billingUserId));
    const response = {
        count,
        data: returned
    };
    for (const val of all) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, deliverynote_model_1.deliveryNoteLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.deliveryNoteRoutes.put('/delete/many', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryNotes', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const promises = _ids
        .map(async (_id) => {
        const found = await deliverynote_model_1.deliveryNoteLean.findOne({ _id }).lean();
        if (found) {
            await (0, invoicerelated_1.deleteAllLinked)(found.invoiceRelated, 'deliverynote', filter.companyId);
        }
        return new mongoose_1.Promise(resolve => resolve(found?._id));
    });
    const filterdExist = await mongoose_1.Promise.all(promises);
    for (const val of filterdExist.filter(value => value)) {
        (0, stock_universal_server_1.addParentToLocals)(res, val, deliverynote_model_1.deliveryNoteLean.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=deliverynote.routes.js.map