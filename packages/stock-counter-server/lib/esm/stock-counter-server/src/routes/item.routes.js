import { populateCompany, populatePhotos, populateTrackEdit, populateTrackView, requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord } from '@open-stock/stock-auth-server';
import { addParentToLocals, appendBody, appendUserToReqIfTokenExist, constructFiltersFromBody, deleteAllFiles, deleteFiles, fileMetaLean, generateUrId, handleMongooseErr, lookupFacet, lookupPhotos, lookupTrackEdit, lookupTrackView, makeCompanyBasedQuery, makePredomFilter, offsetLimitRelegator, requireAuth, roleAuthorisation, saveMetaToDb, uploadFiles, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import { Error } from 'mongoose';
import { itemLean, itemMain } from '../models/item.model';
import { itemDecoyMain } from '../models/itemdecoy.model';
import { itemOfferMain } from '../models/itemoffer.model';
import { getDecoyFromBehaviour, registerSearchParams, todaysRecomendation } from '../utils/user-behavoiur';
/**
 * Express router for item routes.
 */
export const itemRoutes = express.Router();
export const addReview = async (req, res) => {
    const { itemId, userId } = req.body.review;
    const isValid = verifyObjectId(itemId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await itemMain
        .findById(itemId);
    if (!item) {
        return res.status(404).send({ success: false });
    }
    item.reviewedBy?.push(userId || 'tourer');
    let reviewCount = 0;
    if (item.reviewCount) {
        reviewCount = ++item.reviewCount;
    }
    const reviewRatingsTotal = item.reviewRatingsTotal + req.body.review.rating;
    let reviewWeight = 0;
    if (reviewRatingsTotal && item.reviewedBy?.length) {
        reviewWeight = reviewRatingsTotal / item.reviewedBy.length; // <= 10
    }
    const updateRes = await itemMain.updateOne({
        _id: itemId
    }, {
        $set: {
            reviewedBy: item.reviewedBy,
            reviewCount,
            reviewRatingsTotal,
            reviewWeight
        }
    }).catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    return res.status(200).send({ success: true });
};
export const removeReview = async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { userId } = req.user;
    const { filter } = makeCompanyBasedQuery(req);
    const { itemId, rating } = req.params;
    const isValid = verifyObjectIds([itemId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await itemMain
        .findOne({ _id: itemId, ...filter });
    if (!item) {
        return res.status(404).send({ success: false });
    }
    const found = item.reviewedBy?.find(val => val === userId || 'tourer');
    if (!found) {
        return res.status(404).send({ success: false });
    }
    const indexOf = (item.reviewedBy || []).indexOf(found);
    const reviewedBy = item.reviewedBy?.splice(indexOf);
    let reviewCount = 0;
    if (item.reviewCount) {
        reviewCount = --item.reviewCount;
    }
    let reviewRatingsTotal = 0;
    if (item.reviewRatingsTotal) {
        reviewRatingsTotal = item.reviewRatingsTotal - parseInt(rating, 10);
    }
    let reviewWeight = 0;
    if (reviewRatingsTotal && item.reviewedBy?.length) {
        reviewWeight = reviewRatingsTotal / item.reviewedBy.length;
    }
    const updateRes = await itemMain.updateOne({
        _id: itemId, ...filter
    }, {
        $set: {
            reviewedBy,
            reviewCount,
            reviewRatingsTotal,
            reviewWeight
        }
    }).catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    return res.status(200).send({ success: true });
};
itemRoutes.post('/add', requireAuth, requireActiveCompany, requireCanUseFeature('item'), roleAuthorisation('items', 'create'), async (req, res, next) => {
    const { item } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    item.companyId = filter.companyId;
    item.urId = await generateUrId(itemMain);
    const newProd = new itemMain(item);
    const savedRes = await newProd.save()
        .catch((err) => err);
    if (savedRes instanceof Error) {
        const errResponse = handleMongooseErr(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    addParentToLocals(res, savedRes._id, itemMain.collection.collectionName, 'makeTrackEdit');
    next();
}, requireUpdateSubscriptionRecord('item'));
itemRoutes.post('/add/img', requireAuth, requireActiveCompany, requireCanUseFeature('item'), roleAuthorisation('items', 'create'), uploadFiles, appendBody, saveMetaToDb, async (req, res, next) => {
    const item = req.body.item;
    const { filter } = makeCompanyBasedQuery(req);
    item.companyId = filter.companyId;
    item.ecomerceCompat = true;
    item.urId = await generateUrId(itemMain);
    const parsed = req.body;
    if (parsed && parsed.newPhotos) {
        item.photos = parsed.newPhotos;
    }
    if (parsed && parsed.newVideos) {
        item.video = parsed.newVideos[0];
    }
    const newProd = new itemMain(item);
    const savedRes = await newProd.save()
        .catch((err) => err);
    if (savedRes instanceof Error) {
        const errResponse = handleMongooseErr(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    addParentToLocals(res, savedRes._id, itemMain.collection.collectionName, 'makeTrackEdit');
    return next();
}, requireUpdateSubscriptionRecord('item'));
itemRoutes.put('/update', requireAuth, requireActiveCompany, roleAuthorisation('items', 'update'), async (req, res) => {
    const updatedProduct = req.body.item;
    const { filter } = makeCompanyBasedQuery(req);
    updatedProduct.companyId = filter.companyId;
    // const { _id } = updatedProduct;
    const isValid = verifyObjectIds([updatedProduct._id]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await itemMain
        .findOne({ _id: updatedProduct._id, ...filter });
    if (!item) {
        return res.status(404).send({ success: false });
    }
    if (!item.urId || item.urId === '0') {
        item.urId = await generateUrId(itemMain);
    }
    // delete updatedProduct._id;
    const keys = Object.keys(updatedProduct);
    keys.forEach(key => {
        if (item[key] && key !== '_id') {
            item[key] = updatedProduct[key] || item[key];
        }
    });
    const updateRes = await item.save()
        .catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    return res.status(200).send({ success: true });
});
itemRoutes.post('/update/img', requireAuth, requireActiveCompany, roleAuthorisation('items', 'update'), uploadFiles, appendBody, saveMetaToDb, async (req, res) => {
    const updatedProduct = req.body.item;
    const { filter } = makeCompanyBasedQuery(req);
    const { _id } = updatedProduct;
    const isValid = verifyObjectIds([_id]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await itemMain
        .findOne({ _id, ...filter });
    if (!item) {
        return res.status(404).send({ success: false });
    }
    if (!item.urId || item.urId === '0') {
        item.urId = await generateUrId(itemMain);
    }
    const parsed = req.body;
    if (parsed && parsed.newPhotos) {
        const oldPhotos = item.photos || [];
        item.photos = [...oldPhotos, ...parsed.newPhotos];
    }
    if (parsed && parsed.newVideos) {
        const meta = await fileMetaLean.findById(item.video);
        if (meta) {
            await deleteAllFiles([meta], true);
        }
        item.video = parsed.newVideos[0];
    }
    // delete updatedProduct._id;
    const keys = Object.keys(updatedProduct);
    keys.forEach(key => {
        if (item[key] && key !== '_id') {
            item[key] = updatedProduct[key] || item[key];
        }
    });
    const updateRes = await item.save()
        .catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    return res.status(200).send({ success: true });
});
itemRoutes.put('/like/:itemId', requireAuth, async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { filter } = makeCompanyBasedQuery(req);
    const { userId } = req.user;
    const { itemId } = req.params;
    const isValid = verifyObjectIds([itemId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await itemMain
        .findOne({ _id: itemId, ...filter });
    if (!item) {
        return res.status(404).send({ success: false });
    }
    const likes = item.likes || [];
    likes.push(userId);
    let likesCount = item.likesCount || 0;
    likesCount++;
    const updateRes = await itemMain.updateOne({
        _id: itemId, ...filter
    }, {
        $set: {
            likes,
            likesCount
        }
    }).catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    return res.status(200).send({ success: true });
});
itemRoutes.put('/unlike/:itemId', requireAuth, async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { companyId } = req.user;
    const { userId } = req.user;
    const { itemId } = req.params;
    const isValid = verifyObjectIds([itemId, companyId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await itemMain
        .findOne({ _id: itemId });
    if (!item) {
        return res.status(404).send({ success: false });
    }
    let likes = item.likes || [];
    likes = likes.filter(val => val !== userId);
    let likesCount = item.likesCount || 0;
    likesCount--;
    const updateRes = await itemMain.updateOne({
        _id: itemId
    }, {
        $set: {
            likes,
            likesCount
        }
    }).catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    return res.status(200).send({ success: true });
});
itemRoutes.get('/one/:urIdOr_id', appendUserToReqIfTokenExist, async (req, res) => {
    const { urIdOr_id } = req.params;
    const filterwithId = verifyObjectId(urIdOr_id) ? { _id: urIdOr_id } : { urId: urIdOr_id };
    const item = await itemLean
        .findOne({ ...filterwithId })
        .populate([populatePhotos(true), populateCompany()])
        .lean();
    if (!item || !item.companyId) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    addParentToLocals(res, item._id, itemMain.collection.collectionName, 'trackDataView');
    return res.status(200).send(item);
});
itemRoutes.get('/all/:offset/:limit/:ecomerceCompat', appendUserToReqIfTokenExist, async (req, res) => {
    const { ecomerceCompat } = req.params;
    let filter = {};
    if (ecomerceCompat === 'true') {
        filter = { ...filter, ecomerceCompat: true };
    }
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const all = await Promise.all([
        itemLean
            .find({ ...filter, ...makePredomFilter(req) })
            .skip(offset)
            .limit(limit)
            .populate([populatePhotos(true), populateCompany(), populateTrackEdit(), populateTrackView()])
            .lean(),
        itemLean.countDocuments({ ...filter, ...makePredomFilter(req) })
    ]);
    const newItems = all[0].filter(item => item.companyId);
    const response = {
        count: all[1],
        data: newItems
    };
    for (const val of all[0]) {
        addParentToLocals(res, val._id, itemMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
itemRoutes.get('/gettodaysuggestions/:offset/:limit/:ecomerceCompat', appendUserToReqIfTokenExist, async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ success: false, err: 'unauthourised' });
    }
    const { limit } = req.params;
    const { userId } = req.user;
    const stnCookie = req.signedCookies['settings'];
    const { _ids, newOffset, newLimit } = await todaysRecomendation(Number(limit), stnCookie?.userCookieId, userId);
    let filter = { ecomerceCompat: true };
    if (_ids && _ids.length > 0) {
        filter = { ...filter, _id: { $in: _ids } };
    }
    const all = await Promise.all([
        itemLean
            .find({ ...filter, ...makePredomFilter(req) })
            .sort({ timesViewed: 1 })
            .skip(newOffset)
            .limit(newLimit)
            .populate([populatePhotos(true), populateCompany()])
            .lean(),
        itemLean.countDocuments({ ...filter, ...makePredomFilter(req) })
    ]);
    const newItems = all[0].filter(item => item.companyId);
    const response = {
        count: all[1],
        data: newItems
    };
    for (const val of newItems) {
        addParentToLocals(res, val._id, itemMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
itemRoutes.get('/getbehaviourdecoy/offset/limit/:ecomerceCompat', appendUserToReqIfTokenExist, async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ success: false, err: 'unauthourised' });
    }
    const { userId } = req.user;
    const stnCookie = req.signedCookies['settings'];
    const { _ids } = await getDecoyFromBehaviour(stnCookie?.userCookieId, userId);
    const all = await Promise.all([
        itemLean
            .find({ _id: { $in: _ids }, ...makePredomFilter(req) })
            .sort({ timesViewed: 1 })
            .populate([populatePhotos(true), populateCompany()])
            .lean(),
        itemLean.countDocuments({ _id: { $in: _ids }, ...makePredomFilter(req) })
    ]);
    const newItems = all[0].filter(item => item.companyId);
    const response = {
        count: all[1],
        data: newItems
    };
    for (const val of newItems) {
        addParentToLocals(res, val._id, itemMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
itemRoutes.get('/getfeatured/:offset/:limit/:ecomerceCompat', appendUserToReqIfTokenExist, async (req, res) => {
    const { ecomerceCompat } = req.params;
    let filter = {};
    if (ecomerceCompat === 'true') {
        filter = { ...filter, ecomerceCompat: true };
    }
    const all = await Promise.all([
        itemLean
            .find({ ...filter, ...makePredomFilter(req) })
            .sort({ timesViewed: 1, likesCount: 1, reviewCount: 1 })
            .populate([populatePhotos(true), populateCompany()])
            .lean(),
        itemLean.countDocuments({ ...filter, ...makePredomFilter(req) })
    ]);
    const newItems = all[0].filter(item => item.companyId);
    const response = {
        count: all[1],
        data: newItems
    };
    for (const val of newItems) {
        addParentToLocals(res, val._id, itemMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
/*
itemRoutes.get(
  '/filterstars/:starVal/:offset/:limit/:ecomerceCompat',
  appendUserToReqIfTokenExist,
  async(req: IcustomRequest<{ starVal: string; ecomerceCompat: string}, null>, res) => {
    const { ecomerceCompat } = req.params;
    let filter = {} as object;

    if (ecomerceCompat === 'true') {
      filter = { ...filter, ecomerceCompat: true };
    }
    const starVal = Number(req.params.starVal);
    const all = await Promise.all([
      reviewLean
        .find({ ...filter, ...makePredomFilter(req) })
        .where('rating') // rating
        .lte(starVal + 2)
        .gte(starVal)
        .select({ itemId: 1 })
        .lean()
        .populate([populatePhotos(true), populateCompany()])
        .lean(),
      reviewLean.countDocuments({ ...filter, ...makePredomFilter(req) })
    ]);
    const newItems = all[0].filter(val => val.companyId);
    const response: IdataArrayResponse<Treview> = {
      count: all[1],
      data: newItems
    };

    for (const val of newItems) {
      addParentToLocals(res, val._id, itemMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);
*/
/*
itemRoutes.get(
  '/discount/:discountValue/:offset/:limit/:ecomerceCompat',
  appendUserToReqIfTokenExist,
  async(req: IcustomRequest<never, null>, res) => {
    const { ecomerceCompat } = req.params;
    let filter = {} as object;

    if (ecomerceCompat === 'true') {
      filter = { ...filter, ecomerceCompat: true };
    }
    const { discountValue } = req.params;
    const all = await Promise.all([
      itemLean
        .find({ ...filter, ...makePredomFilter(req) })
        .or([
          {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'costMeta.offer': 'true',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'costMeta.discount': Number(discountValue)
          },
          {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'costMeta.offer': true,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'costMeta.discount': Number(discountValue)
          }
        ])
        .sort({ createdAt: -1 })
        .populate([populatePhotos(true), populateCompany()])
        .lean(),
      itemLean.countDocuments({ ...filter, ...makePredomFilter(req) })
    ]);
    const newItems = all[0].filter(item => item.companyId);
    const response: IdataArrayResponse<Iitem> = {
      count: all[1],
      data: newItems
    };

    for (const val of newItems) {
      addParentToLocals(res, val._id, itemMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);
*/
itemRoutes.post('/sponsored/get', appendUserToReqIfTokenExist, async (req, res) => {
    const _ids = req.body._ids;
    const filter = { _id: { $in: _ids } };
    if (_ids && _ids.length > 0) {
        for (const id of _ids) {
            const isValid = verifyObjectId(id);
            if (!isValid) {
                return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
            }
        }
    }
    else {
        return res.status(403).send({ success: false, status: 403, err: 'no sponsored items provided' });
    }
    const items = await itemLean
        .find({ ...filter, ...makePredomFilter(req) })
        .lean()
        .sort({ timesViewed: 1 })
        .populate([populatePhotos(true), populateCompany()])
        .lean();
    const newItems = items.filter(item => item.companyId);
    for (const val of newItems) {
        addParentToLocals(res, val._id, itemMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(newItems);
});
itemRoutes.get('/getoffered', appendUserToReqIfTokenExist, async (req, res) => {
    const filter = {};
    const items = await itemLean
        .find({ ...filter, ...makePredomFilter(req) })
        .populate({ path: 'sponsored', model: itemLean,
        populate: [{
                path: 'photos', model: fileMetaLean
            }
        ]
    })
        .sort({ createdAt: -1 })
        .populate([populatePhotos(true), populateCompany()])
        .lean();
    const newItems = items.filter(item => item.companyId);
    const filtered = newItems.filter(p => p.sponsored?.length && p.sponsored?.length > 0);
    return res.status(200).send(filtered);
});
itemRoutes.put('/sponsored/add/:_id', requireAuth, requireActiveCompany, roleAuthorisation('items', 'update'), async (req, res) => {
    const { _id } = req.params;
    const { sponsored } = req.body;
    const item = await itemMain.findById(_id);
    if (!item) {
        return res.status(404).send({ success: false });
    }
    const itemsonsored = item.sponsored || [];
    itemsonsored.push(sponsored);
    const updateRes = await itemMain.updateOne({
        _id
    }, {
        $set: {
            sponsored: itemsonsored
        }
    }).catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    return res.status(200).send({ success: true });
});
itemRoutes.put('/sponsored/update/:_id', requireAuth, requireActiveCompany, roleAuthorisation('items', 'update'), async (req, res) => {
    const { _id } = req.params;
    const { sponsored } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const item = await itemMain.findOne({ _id, ...filter });
    if (!item) {
        return res.status(404).send({ success: false });
    }
    const itemSponsored = item.sponsored || [];
    const found = itemSponsored.find(val => val.item === sponsored.item);
    if (found) {
        const indexOf = itemSponsored.indexOf(found);
        if (indexOf !== -1) {
            itemSponsored[indexOf] = sponsored;
        }
        else {
            itemSponsored.push(sponsored);
        }
    }
    const updateRes = await itemMain.updateOne({
        _id, ...filter
    }, {
        $set: {
            sponsored: item.sponsored
        }
    }).catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    return res.status(200).send({ success: true });
});
itemRoutes.delete('/sponsored/delete/:_id/:spnsdId', requireAuth, requireActiveCompany, roleAuthorisation('items', 'update'), async (req, res) => {
    const { _id, spnsdId } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const item = await itemMain.findOne({ _id, ...filter });
    if (!item) {
        return res.status(404).send({ success: false });
    }
    const itemSponsored = item.sponsored || [];
    const found = itemSponsored.find(val => val.item === spnsdId);
    if (found) {
        const indexOf = itemSponsored.indexOf(found);
        if (indexOf !== -1) {
            itemSponsored.splice(indexOf, 1);
        }
    }
    const updateRes = await itemMain.updateOne({
        _id, ...filter
    }, {
        $set: {
            sponsored: item.sponsored
        }
    }).catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    return res.status(200).send({ success: true });
});
itemRoutes.put('/delete/one/:_id', requireAuth, requireActiveCompany, roleAuthorisation('items', 'delete'), async (req, res) => {
    const { _id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    // start by removing offers
    await itemOfferMain.deleteMany({ ...filter, items: { $elemMatch: { $in: [_id] } } });
    // also remove decoys
    await itemDecoyMain.deleteMany({ ...filter, items: { $elemMatch: { $in: [_id] } } });
    const found = await itemMain.findOne({ _id, ...filter })
        .populate([populatePhotos(true)])
        .populate({ path: 'video', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .lean();
    if (found) {
        let filesWithDir = found.photos.map(photo => ({
            _id: photo._id,
            url: photo.url
        }));
        if (found.video) {
            filesWithDir = [...filesWithDir, ...[found.video]];
        }
        await deleteAllFiles(filesWithDir);
    }
    // const deleted = await itemMain.findOneAndDelete({ _id, ...filter });
    const updateRes = await itemMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } })
        .catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    addParentToLocals(res, _id, itemMain.collection.collectionName, 'trackDataDelete');
    return res.status(200).send({ success: true });
});
itemRoutes.put('/deletefiles', requireAuth, requireActiveCompany, roleAuthorisation('items', 'delete'), deleteFiles(true), async (req, res) => {
    const filesWithDir = req.body.filesWithDir;
    const { filter } = makeCompanyBasedQuery(req);
    if (filesWithDir && !filesWithDir.length) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const updatedProduct = req.body.item;
    const { _id } = updatedProduct;
    const item = await itemMain
        .findOne({ _id, ...filter });
    if (!item) {
        return res.status(404).send({ success: false, err: 'item not found' });
    }
    const filesWithDirIds = filesWithDir.map(val => val._id);
    const photos = item.photos;
    if (item.video && filesWithDirIds.includes(item.video)) {
        // eslint-disable-next-line no-undefined
        item.video = undefined;
    }
    const updateRes = await itemMain.updateOne({
        _id, ...filter
    }, {
        $set: {
            photos: photos?.filter(p => {
                if (typeof p === 'string') {
                    return !filesWithDirIds.includes(p);
                }
                else {
                    return !filesWithDirIds.includes(p._id.toString());
                }
            }),
            video: item.video
        }
    }).catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    return res.status(200).send({ success: true });
});
itemRoutes.post('/filter', appendUserToReqIfTokenExist, async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { userId } = req.user;
    const { searchterm, propSort, returnEmptyArr } = req.body;
    let { propFilter } = req.body;
    if (!propFilter || !propFilter.ecomerceCompat) {
        if (!propFilter) {
            propFilter = {};
        }
        propFilter.ecomerceCompat = true;
    }
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);
    const stnCookie = req.signedCookies['settings'];
    const filter = constructFiltersFromBody(req);
    if (searchterm && userId) {
        registerSearchParams(searchterm, '', stnCookie?.userCookieId, userId);
    }
    const aggCursor = itemLean.aggregate([
        {
            $match: {
                $and: [
                    // { status: 'pending' },
                    ...filter
                ]
            }
        },
        ...lookupPhotos(),
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
    const newItems = all.filter(item => item.companyId);
    const response = {
        count,
        data: newItems
    };
    return res.status(200).send(response);
});
itemRoutes.put('/delete/many', requireAuth, requireActiveCompany, roleAuthorisation('items', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    // start by removing offers
    /* await itemOfferMain.deleteMany({  items: { $elemMatch: { $in: _ids } } }); */
    // TODO tarack ehe
    await itemOfferMain.updateOne({ ...filter, items: { $elemMatch: { $in: _ids } } }, {
        $set: { isDeleted: true }
    }).catch((err) => err);
    // also remove decoys
    /* await itemDecoyMain.deleteMany({  items: { $elemMatch: { $in: _ids } } }); */
    // TODO TARC
    await itemDecoyMain.updateOne({ ...filter, items: { $elemMatch: { $in: _ids } } }, {
        $set: { isDeleted: true }
    }).catch((err) => err);
    let filesWithDir = [];
    const alltoDelete = await itemLean.find({ _id: { $in: _ids } })
        .populate([populatePhotos(true)])
        .populate({ path: 'video', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .lean();
    for (const user of alltoDelete) {
        if (user.photos && user.photos?.length > 0) {
            filesWithDir = [...filesWithDir, ...user.photos];
        }
        if (user.video) {
            filesWithDir = [...filesWithDir, ...[user.video]];
        }
    }
    await deleteAllFiles(filesWithDir);
    const updateRes = await itemMain
        .updateMany({ _id: { $in: _ids } }, {
        $set: { isDeleted: true }
    })
        .catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    for (const val of _ids) {
        addParentToLocals(res, val, itemMain.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=item.routes.js.map