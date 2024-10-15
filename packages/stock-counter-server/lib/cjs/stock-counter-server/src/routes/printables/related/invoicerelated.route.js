"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceRelateRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const invoicerelated_model_1 = require("../../../models/printables/related/invoicerelated.model");
const query_1 = require("../../../utils/query");
const invoicerelated_1 = require("./invoicerelated");
/**
 * Router for handling invoice related routes.
 */
exports.invoiceRelateRoutes = express_1.default.Router();
exports.invoiceRelateRoutes.get('/one/:_id', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'read'), async (req, res) => {
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const { _id } = req.params;
    const related = await invoicerelated_model_1.invoiceRelatedLean
        .findOne({ _id, ...filter })
        .lean()
        .populate([(0, query_1.populateBillingUser)(), (0, query_1.populatePayments)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()]);
    if (!related) {
        return res.status(404).send();
    }
    const returned = (0, invoicerelated_1.makeInvoiceRelatedPdct)(related, related
        .billingUserId);
    (0, stock_universal_server_1.addParentToLocals)(res, related._id, 'invoicerelateds', 'trackDataView');
    return res.status(200).send(returned);
});
exports.invoiceRelateRoutes.get('/all/:offset/:limit', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const all = await Promise.all([
        invoicerelated_model_1.invoiceRelatedLean
            .find({ ...filter })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate([(0, query_1.populateBillingUser)(), (0, query_1.populatePayments)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()]),
        invoicerelated_model_1.invoiceRelatedLean.countDocuments({ ...filter })
    ]);
    const response = {
        count: all[1],
        data: []
    };
    if (all[0]) {
        const returned = all[0]
            .filter(val => val)
            .map(val => (0, invoicerelated_1.makeInvoiceRelatedPdct)(val, val
            .billingUserId));
        response.data = returned;
        for (const val of all[0]) {
            (0, stock_universal_server_1.addParentToLocals)(res, val._id, invoicerelated_model_1.invoiceRelatedLean.collection.collectionName, 'trackDataView');
        }
        return res.status(200).send(response);
    }
    else {
        return res.status(200).send(response);
    }
});
exports.invoiceRelateRoutes.post('/filter', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'read'), async (req, res) => {
    const { propSort, returnEmptyArr } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const filter = (0, stock_universal_server_1.constructFiltersFromBody)(req);
    const aggCursor = invoicerelated_model_1.invoiceRelatedLean.aggregate([
        {
            $match: {
                $and: [
                    // { status: 'pending' },
                    ...filter
                ]
            }
        },
        ...(0, stock_universal_server_1.lookupBillingUser)(),
        ...(0, stock_universal_server_1.lookupTrackEdit)(),
        ...(0, stock_universal_server_1.lookupTrackView)(),
        ...(0, stock_universal_server_1.lookupFacet)(offset, limit, propSort, returnEmptyArr)
    ]);
    const dataArr = [];
    for await (const data of aggCursor) {
        dataArr.push(data);
    }
    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;
    const response = {
        count,
        data: []
    };
    if (all) {
        const returned = all
            .filter(val => val)
            .map(val => (0, invoicerelated_1.makeInvoiceRelatedPdct)(val, (val)
            .billingUserId));
        response.data = returned;
        for (const val of all) {
            (0, stock_universal_server_1.addParentToLocals)(res, val._id, invoicerelated_model_1.invoiceRelatedLean.collection.collectionName, 'trackDataView');
        }
        return res.status(200).send(response);
    }
    else {
        return res.status(200).send(response);
    }
});
exports.invoiceRelateRoutes.put('/update', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'update'), async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { invoiceRelated } = req.body;
    const { companyId } = req.user;
    invoiceRelated.companyId = companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([invoiceRelated.invoiceRelated, companyId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    await (0, invoicerelated_1.updateInvoiceRelated)(res, invoiceRelated);
    return res.status(200).send({ success: true });
});
/*
db.estimates.aggregate<IfilterAggResponse<soth>>([
  {
    $addFields: {
      invoiceRelated: { $toObjectId: '$invoiceRelated' }
    }
  },
  {
    $lookup: {
      from: 'invoicerelateds',
      as: 'FieldCollege',
      let: { invoiceRelated: '$invoiceRelated' },
      pipeline: [
        {
          $match: {
            $and: [
              { $expr: { $eq: ['$$invoiceRelated', '$_id'] } },
              { status: 'pending' }
            ]
          }
        },
        { $limit: 1 },
        {
          $addFields: {
            billingUserId: { $toObjectId: '$billingUserId' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'billingUserId',
            foreignField: '_id',
            as: 'billingUserId'
          }
        },
        { $unwind: '$billingUserId' }
      ]
    }
  },
  {
    $addFields: {
      trackEdit: { $toObjectId: '$trackEdit' }
    }
  },
  {
    $lookup: {
      from: 'trackedits',
      localField: 'trackEdit',
      foreignField: '_id',
      as: 'trackEdit'
    }
  },
  {
    $unwind: {
      path: '$trackEdit',
      preserveNullAndEmptyArrays: true
    }
  },
  { $match: { FieldCollege: { $ne: [] } } },
  {
    $addFields: {
      FieldCollege: { $arrayElemAt: ['$FieldCollege', 0] }
    }
  },
  { $facet: {
    data: [],
    total: [{ $count: 'count' }]
  } },
  { $unwind: '$total' }
]);
*/
/*
db.estimates.aggregate<IfilterAggResponse<soth>>([
  {
    $addFields: {
      invoiceRelated: { $toObjectId: '$invoiceRelated' }
    }
  },
  {
    $lookup: {
      from: 'invoicerelateds',
      as: 'FieldCollege',
      let: { invoiceRelated: '$invoiceRelated' },
      pipeline: [
        {
          $match: {
            $and: [
              { $expr: { $eq: ['$$invoiceRelated', '$_id'] } },
              { status: 'pending' }
            ]
          }
        },
        {
          $addFields: {
            billingUserId: { $toObjectId: '$billingUserId' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'billingUserId',
            foreignField: '_id',
            as: 'billingUserId'
          }
        },
        { $unwind: '$billingUserId' }
      ]
    }
  },
  {
    $addFields: {
      trackEdit: { $toObjectId: '$trackEdit' }
    }
  },
  {
    $lookup: {
      from: 'trackedits',
      localField: 'trackEdit',
      foreignField: '_id',
      as: 'trackEdit'
    }
  },
  {
    $unwind: {
      path: '$trackEdit',
      preserveNullAndEmptyArrays: true
    }
  },
  { $match: { FieldCollege: { $ne: [] } } },
  { $facet: {
    data: [],
    total: [{ $count: 'count' }]
  } },
  { $unwind: '$total' }
]);
*/
//# sourceMappingURL=invoicerelated.route.js.map