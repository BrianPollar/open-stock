"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateRoutes = exports.updateEstimateUniv = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const mongoose_1 = require("mongoose");
const estimate_model_1 = require("../../models/printables/estimate.model");
const invoicerelated_model_1 = require("../../models/printables/related/invoicerelated.model");
const query_1 = require("../../utils/query");
const invoicerelated_1 = require("./related/invoicerelated");
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
    const updateRes = await estimate_model_1.estimateMain.updateOne({
        estimateId, companyId
    }, {
        $set: {
            stage
            // invoiceId: invoiceId || (estimate as IinvoiceRelated).invoiceId // TODO
        }
    }).catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        (0, stock_universal_server_1.handleMongooseErr)(updateRes);
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
        return res.status(invoiceRelatedRes.status || 403).send(invoiceRelatedRes);
    }
    estimate.invoiceRelated = invoiceRelatedRes._id;
    const newEstimate = new estimate_model_1.estimateMain(estimate);
    /**
   * Saves a new estimate and returns a response object.
   * @param {Estimate} newEstimate - The new estimate to be saved.
   * @returns {Promise<{success: boolean, status: number, err?: string}>} - A promise that
   * resolves to an object with success, status, and err properties.
   */
    const savedRes = await newEstimate.save()
        .catch((err) => err);
    if (savedRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, savedRes._id, estimate_model_1.estimateLean.collection.collectionName, 'makeTrackEdit');
    return next();
}, (0, stock_auth_server_1.requireUpdateSubscriptionRecord)('quotation'));
exports.estimateRoutes.get('/one/:urIdOr_id', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('estimates', 'read'), async (req, res) => {
    const { urIdOr_id } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const filterwithId = (0, stock_universal_server_1.verifyObjectId)(urIdOr_id) ? { _id: urIdOr_id } : { urId: urIdOr_id };
    const estimate = await estimate_model_1.estimateLean
        .findOne({ ...filterwithId, ...filter })
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
        .map(val => (0, invoicerelated_1.makeInvoiceRelatedPdct)(val.invoiceRelated, val.invoiceRelated?.billingUserId, 
    // eslint-disable-next-line no-undefined
    undefined, {
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
    const updateRes = await (0, invoicerelated_1.deleteAllLinked)(found.invoiceRelated, 'estimate', filter.companyId);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, _id, estimate_model_1.estimateLean.collection.collectionName, 'trackDataDelete');
    return res.status(200).send({ success: true });
});
exports.estimateRoutes.post('/filter', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('estimates', 'read'), async (req, res) => {
    const { propSort, returnEmptyArr } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const aggCursor = estimate_model_1.estimateLean
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
        return new Promise(resolve => resolve(found?._id));
    });
    const filterdExist = await Promise.all(promises);
    for (const val of filterdExist.filter(value => value)) {
        (0, stock_universal_server_1.addParentToLocals)(res, val, estimate_model_1.estimateLean.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=estimate.routes.js.map