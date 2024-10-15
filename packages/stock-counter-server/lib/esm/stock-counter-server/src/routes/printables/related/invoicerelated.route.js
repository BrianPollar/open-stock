import { populateTrackEdit, populateTrackView, requireActiveCompany } from '@open-stock/stock-auth-server';
import { addParentToLocals, constructFiltersFromBody, lookupBillingUser, lookupFacet, lookupTrackEdit, lookupTrackView, makeCompanyBasedQuery, offsetLimitRelegator, requireAuth, roleAuthorisation, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import { invoiceRelatedLean } from '../../../models/printables/related/invoicerelated.model';
import { populateBillingUser, populatePayments } from '../../../utils/query';
import { makeInvoiceRelatedPdct, updateInvoiceRelated } from './invoicerelated';
/**
 * Router for handling invoice related routes.
 */
export const invoiceRelateRoutes = express.Router();
invoiceRelateRoutes.get('/one/:_id', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'read'), async (req, res) => {
    const { filter } = makeCompanyBasedQuery(req);
    const { _id } = req.params;
    const related = await invoiceRelatedLean
        .findOne({ _id, ...filter })
        .lean()
        .populate([populateBillingUser(), populatePayments(), populateTrackEdit(), populateTrackView()]);
    if (!related) {
        return res.status(404).send();
    }
    const returned = makeInvoiceRelatedPdct(related, related
        .billingUserId);
    addParentToLocals(res, related._id, 'invoicerelateds', 'trackDataView');
    return res.status(200).send(returned);
});
invoiceRelateRoutes.get('/all/:offset/:limit', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'read'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { filter } = makeCompanyBasedQuery(req);
    const all = await Promise.all([
        invoiceRelatedLean
            .find({ ...filter })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate([populateBillingUser(), populatePayments(), populateTrackEdit(), populateTrackView()]),
        invoiceRelatedLean.countDocuments({ ...filter })
    ]);
    const response = {
        count: all[1],
        data: []
    };
    if (all[0]) {
        const returned = all[0]
            .filter(val => val)
            .map(val => makeInvoiceRelatedPdct(val, val
            .billingUserId));
        response.data = returned;
        for (const val of all[0]) {
            addParentToLocals(res, val._id, invoiceRelatedLean.collection.collectionName, 'trackDataView');
        }
        return res.status(200).send(response);
    }
    else {
        return res.status(200).send(response);
    }
});
invoiceRelateRoutes.post('/filter', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'read'), async (req, res) => {
    const { propSort, returnEmptyArr } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);
    const filter = constructFiltersFromBody(req);
    const aggCursor = invoiceRelatedLean.aggregate([
        {
            $match: {
                $and: [
                    // { status: 'pending' },
                    ...filter
                ]
            }
        },
        ...lookupBillingUser(),
        ...lookupTrackEdit(),
        ...lookupTrackView(),
        ...lookupFacet(offset, limit, propSort, returnEmptyArr)
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
            .map(val => makeInvoiceRelatedPdct(val, (val)
            .billingUserId));
        response.data = returned;
        for (const val of all) {
            addParentToLocals(res, val._id, invoiceRelatedLean.collection.collectionName, 'trackDataView');
        }
        return res.status(200).send(response);
    }
    else {
        return res.status(200).send(response);
    }
});
invoiceRelateRoutes.put('/update', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'update'), async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { invoiceRelated } = req.body;
    const { companyId } = req.user;
    invoiceRelated.companyId = companyId;
    const isValid = verifyObjectIds([invoiceRelated.invoiceRelated, companyId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    await updateInvoiceRelated(res, invoiceRelated);
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