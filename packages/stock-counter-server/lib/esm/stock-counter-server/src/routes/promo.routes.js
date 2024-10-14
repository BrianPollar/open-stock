import { requireActiveCompany } from '@open-stock/stock-auth-server';
import { makeRandomString } from '@open-stock/stock-universal';
import { addParentToLocals, constructFiltersFromBody, generateUrId, handleMongooseErr, lookupFacet, lookupTrackEdit, lookupTrackView, makeCompanyBasedQuery, offsetLimitRelegator, requireAuth, roleAuthorisation, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import { Error } from 'mongoose';
import { promocodeLean, promocodeMain } from '../models/promocode.model';
/**
 * Router for handling promo code routes.
 */
export const promocodeRoutes = express.Router();
promocodeRoutes.post('/create', requireAuth, requireActiveCompany, roleAuthorisation('items', 'create'), async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { items, amount, roomId } = req.body;
    const { companyId } = req.user;
    const isValid = verifyObjectId(companyId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const code = makeRandomString(8, 'combined');
    const urId = await generateUrId(promocodeMain);
    const promocode = {
        urId,
        companyId,
        code,
        amount,
        items,
        roomId,
        expireAt: new Date().toString()
    };
    const newpromocode = new promocodeMain(promocode);
    const savedRes = await newpromocode.save()
        .catch((err) => err);
    if (savedRes instanceof Error) {
        const errResponse = handleMongooseErr(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    addParentToLocals(res, savedRes._id, promocodeMain.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: true, code });
});
promocodeRoutes.get('/one/:urIdOr_id', requireAuth, requireActiveCompany, roleAuthorisation('items', 'read'), async (req, res) => {
    const { urIdOr_id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const filterwithId = verifyObjectId(urIdOr_id) ? { _id: urIdOr_id } : { urId: urIdOr_id };
    const promocode = await promocodeLean
        .findOne({ ...filterwithId, ...filter })
        .lean();
    if (!promocode) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    addParentToLocals(res, promocode._id, promocodeMain.collection.collectionName, 'trackDataView');
    return res.status(200).send(promocode);
});
promocodeRoutes.get('/getonebycode/:code', async (req, res) => {
    const { code } = req.params;
    const promocode = await promocodeLean
        .findOne({ code })
        .lean();
    if (promocode) {
        addParentToLocals(res, promocode._id, promocodeMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(promocode);
});
promocodeRoutes.get('/all/:offset/:limit', requireAuth, requireActiveCompany, roleAuthorisation('items', 'read'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { filter } = makeCompanyBasedQuery(req);
    const all = await Promise.all([
        promocodeLean
            .find(filter)
            .skip(offset)
            .limit(limit)
            .lean(),
        promocodeLean.countDocuments(filter)
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        addParentToLocals(res, val._id, promocodeMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
promocodeRoutes.post('/filter', requireAuth, requireActiveCompany, roleAuthorisation('items', 'read'), async (req, res) => {
    const { propSort, returnEmptyArr } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);
    const filter = constructFiltersFromBody(req);
    const aggCursor = promocodeLean.aggregate([
        {
            $match: {
                $and: [
                    // { status: 'pending' },
                    ...filter
                ]
            }
        },
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
        data: all
    };
    for (const val of all) {
        addParentToLocals(res, val._id, promocodeMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
promocodeRoutes.delete('/delete/one/:_id', requireAuth, requireActiveCompany, roleAuthorisation('items', 'delete'), async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { _id } = req.params;
    const { companyId } = req.user;
    const isValid = verifyObjectIds([_id, companyId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // const deleted = await promocodeMain.findOneAndDelete({ _id, });
    const updateRes = await promocodeMain.updateOne({ _id }, { $set: { isDeleted: true } })
        .catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    addParentToLocals(res, _id, promocodeMain.collection.collectionName, 'trackDataDelete');
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=promo.routes.js.map