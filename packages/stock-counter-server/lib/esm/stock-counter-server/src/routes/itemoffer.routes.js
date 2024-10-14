import { populateTrackEdit, populateTrackView, requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord } from '@open-stock/stock-auth-server';
import { addParentToLocals, appendUserToReqIfTokenExist, constructFiltersFromBody, generateUrId, handleMongooseErr, lookupSubFieldItemsRelatedFilter, makeCompanyBasedQuery, makePredomFilter, offsetLimitRelegator, requireAuth, roleAuthorisation, verifyObjectId } from '@open-stock/stock-universal-server';
import express from 'express';
import { Error } from 'mongoose';
import { itemOfferLean, itemOfferMain } from '../models/itemoffer.model';
import { populateItems } from '../utils/query';
/**
 * Router for item offers.
 */
export const itemOfferRoutes = express.Router();
itemOfferRoutes.post('/add', requireAuth, requireActiveCompany, requireCanUseFeature('offer'), roleAuthorisation('offers', 'create'), async (req, res, next) => {
    const { itemoffer } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    itemoffer.companyId = filter.companyId;
    itemoffer.urId = await generateUrId(itemOfferMain);
    const newDecoy = new itemOfferMain(itemoffer);
    const savedRes = await newDecoy.save()
        .catch((err) => err);
    if (savedRes instanceof Error) {
        const errResponse = handleMongooseErr(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    addParentToLocals(res, savedRes._id, itemOfferMain.collection.collectionName, 'makeTrackEdit');
    return next();
}, requireUpdateSubscriptionRecord('offer'));
itemOfferRoutes.get('/all/:type/:offset/:limit', appendUserToReqIfTokenExist, async (req, res) => {
    const { type } = req.params;
    const query = {};
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    let filter = {};
    if (type !== 'all') {
        filter = { type, ...query };
    }
    const all = await Promise.all([
        itemOfferLean
            .find({ ...filter, ...makePredomFilter(req) })
            .skip(offset)
            .limit(limit)
            .populate([populateItems(), populateTrackEdit(), populateTrackView()])
            .lean(),
        itemOfferLean.countDocuments({ ...filter, ...makePredomFilter(req) })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        addParentToLocals(res, val._id, itemOfferMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
itemOfferRoutes.post('/filter', requireAuth, requireActiveCompany, roleAuthorisation('offers', 'read'), async (req, res) => {
    const { propSort, returnEmptyArr } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);
    const aggCursor = itemOfferLean
        .aggregate([
        ...lookupSubFieldItemsRelatedFilter(constructFiltersFromBody(req), offset, limit, propSort, returnEmptyArr)
    ]);
    const dataArr = [];
    for await (const data of aggCursor) {
        dataArr.push(data);
    }
    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;
    const response = {
        count,
        data: all
    };
    for (const val of all) {
        addParentToLocals(res, val._id, itemOfferMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
itemOfferRoutes.get('/one/:urIdOr_id', appendUserToReqIfTokenExist, async (req, res) => {
    const { urIdOr_id } = req.params;
    const filterwithId = verifyObjectId(urIdOr_id) ? { _id: urIdOr_id } : { urId: urIdOr_id };
    const offer = await itemOfferLean
        .findOne({ ...filterwithId, ...makePredomFilter(req) })
        .populate([populateItems(), populateTrackEdit(), populateTrackView()])
        .lean();
    if (!offer) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    addParentToLocals(res, offer._id, itemOfferMain.collection.collectionName, 'trackDataView');
    return res.status(200).send(offer);
});
itemOfferRoutes.delete('/delete/one/:_id', requireAuth, requireActiveCompany, roleAuthorisation('offers', 'delete'), async (req, res) => {
    const { _id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    // const deleted = await itemOfferMain.findOneAndDelete({ _id, });
    const updateRes = await itemOfferMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } })
        .catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    addParentToLocals(res, _id, itemOfferMain.collection.collectionName, 'trackDataDelete');
    return res.status(200).send({ success: true });
});
itemOfferRoutes.put('/delete/many', requireAuth, requireActiveCompany, roleAuthorisation('offers', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const updateRes = await itemOfferMain
        .updateMany({ _id: { $in: _ids }, ...filter }, {
        $set: { isDeleted: true }
    })
        .catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    for (const val of _ids) {
        addParentToLocals(res, val, itemOfferMain.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=itemoffer.routes.js.map