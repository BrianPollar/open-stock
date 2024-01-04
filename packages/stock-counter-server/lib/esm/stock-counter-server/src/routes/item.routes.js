/**
 * @file item.routes.ts
 * @description This file contains the express routes for handling CRUD operations on item and review data.
 * @requires express
 * @requires Request
 * @requires Response
 * @requires itemLean
 * @requires itemMain
 * @requires reviewLean
 * @requires getLogger
 * @requires Icustomrequest
 * @requires Ifilewithdir
 * @requires Isuccess
 * @requires makeRandomString
 * @requires appendBody
 * @requires deleteFiles
 * @requires makeUrId
 * @requires offsetLimitRelegator
 * @requires requireAuth
 * @requires roleAuthorisation
 * @requires stringifyMongooseErr
 * @requires uploadFiles
 * @requires verifyObjectId
 * @requires verifyObjectIds
 * @requires itemOfferMain
 * @requires itemDecoyMain
 */
import express from 'express';
import { itemLean, itemMain } from '../models/item.model';
import { reviewLean } from '../models/review.model';
import { getLogger } from 'log4js';
import { makeRandomString } from '@open-stock/stock-universal';
import { appendBody, deleteFiles, fileMetaLean, makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, saveMetaToDb, stringifyMongooseErr, uploadFiles, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import { itemOfferMain } from '../models/itemoffer.model';
import { itemDecoyMain } from '../models/itemdecoy.model';
import { companyLean } from '@open-stock/stock-auth-server';
/** The logger for the item routes */
const itemRoutesLogger = getLogger('routes/itemRoutes');
/**
 * Express router for item routes.
 */
export const itemRoutes = express.Router();
/**
 * Adds a review for an item
 * @function
 * @async
 * @param {Request} req - The express request object
 * @param {Icustomrequest} req.user - The custom request object with user data
 * @param {string} req.body.review.itemId - The id of the item being reviewed
 * @param {number} req.body.review.rating - The rating given to the item in the review
 * @param {Response} res - The express response object
 * @returns {Promise<Response>} - The express response object with a success status and saved item data
 */
export const addReview = async (req, res) => {
    const { userId } = req.user;
    const itemId = req.body.review.itemId;
    const isValid = verifyObjectId(itemId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await itemMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findByIdAndUpdate(itemId);
    if (!item) {
        return res.status(404).send({ success: false });
    }
    item.reviewedBy.push(userId || 'tourer');
    item.reviewCount++;
    item.reviewRatingsTotal += req.body.review.rating;
    item.reviewWeight = item.reviewRatingsTotal / item.reviewedBy.length;
    let errResponse;
    const saved = await item.save()
        .catch(err => {
        itemRoutesLogger.error('addReview - err: ', err);
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
    return res.status(200).send({ success: Boolean(saved) });
};
/**
 * Removes a review for an item
 * @function
 * @async
 * @param {Request} req - The express request object
 * @param {Icustomrequest} req.user - The custom request object with user data
 * @param {string} req.params.itemId - The id of the item being reviewed
 * @param {string} req.params.rating - The rating given to the item in the review
 * @param {Response} res - The express response object
 * @returns {Promise<Response>} - The express response object with a success status
 */
export const removeReview = async (req, res) => {
    const { userId } = req.user;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const { itemId, rating } = req.params;
    const isValid = verifyObjectIds([itemId, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await itemMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndUpdate({ _id: itemId, companyId: queryId });
    if (!item) {
        return res.status(404).send({ success: false });
    }
    const found = item.reviewedBy
        .find(val => val === userId || 'tourer');
    if (!found) {
        return res.status(404).send({ success: false });
    }
    const indexOf = item.reviewedBy
        .indexOf(found);
    item.reviewedBy.splice(indexOf);
    item.reviewCount--;
    item.reviewRatingsTotal -= parseInt(rating, 10);
    item.reviewWeight = item.reviewRatingsTotal / item.reviewedBy.length;
    let errResponse;
    await item.save().catch(err => {
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
    return res.status(200).send({ success: true });
};
/**
 * Creates a new item
 * @function
 * @async
 * @param {Request} req - The express request object
 * @param {Icustomrequest} req.user - The custom request object with user data
 * @param {Object} req.body.item - The item data to create
 * @param {Response} res - The express response object
 * @returns {Promise<Response>} - The express response object with a success status and saved item data
 */
itemRoutes.post('/create/:companyIdParam', requireAuth, roleAuthorisation('items', 'create'), uploadFiles, appendBody, saveMetaToDb, async (req, res) => {
    const item = req.body.item;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    item.companyId = queryId;
    const isValid = verifyObjectId(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const count = await itemMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    item.urId = makeUrId(Number(count[0]?.urId || '0'));
    const parsed = req.body.parsed;
    if (parsed && parsed.newFiles) {
        const oldPhotos = item.photos;
        item.photos = oldPhotos.concat(parsed.newFiles);
    }
    const newProd = new itemMain(item);
    let errResponse;
    const saved = await newProd.save()
        .catch(err => {
        itemRoutesLogger.error('create - err: ', err);
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
    return res.status(200).send({ success: Boolean(saved) });
});
/**
 * Updates an existing item
 * @function
 * @async
 * @param {Request} req - The express request object
 * @param {Icustomrequest} req.user - The custom request object with user data
 * @param {Object} req.body.item - The item data to update
 * @param {Response} res - The express response object
 * @returns {Promise<Response>} - The express response object with a success status
 */
itemRoutes.put('/update/:companyIdParam', requireAuth, roleAuthorisation('items', 'update'), async (req, res) => {
    const updatedProduct = req.body.item;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    updatedProduct.companyId = queryId;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedProduct;
    const isValid = verifyObjectIds([_id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await itemMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndUpdate({ _id, companyId: queryId });
    if (!item) {
        return res.status(404).send({ success: false });
    }
    if (!item.urId || item.urId === '0') {
        const count = makeRandomString(3, 'numbers');
        item.urId = makeUrId(Number(count));
    }
    delete updatedProduct._id;
    const keys = Object.keys(updatedProduct);
    keys.forEach(key => {
        if (item[key]) {
            item[key] = updatedProduct[key] || item[key];
        }
    });
    let errResponse;
    const updated = await item.save()
        .catch(err => {
        itemRoutesLogger.error('update - err: ', err);
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
    return res.status(200).send({ success: Boolean(updated) });
});
itemRoutes.post('/updateimg/:companyIdParam', requireAuth, roleAuthorisation('items', 'update'), uploadFiles, appendBody, saveMetaToDb, async (req, res) => {
    const updatedProduct = req.body.item;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedProduct;
    const isValid = verifyObjectIds([_id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await itemMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndUpdate({ _id, companyId: queryId });
    if (!item) {
        return res.status(404).send({ success: false });
    }
    if (!item.urId || item.urId === '0') {
        const count = makeRandomString(3, 'numbers');
        item.urId = makeUrId(Number(count));
    }
    const parsed = req.body.parsed;
    if (parsed && parsed.newFiles) {
        const oldPhotos = item.photos;
        item.photos = oldPhotos.concat(parsed.newFiles);
    }
    delete updatedProduct._id;
    const keys = Object.keys(updatedProduct);
    keys.forEach(key => {
        if (item[key]) {
            item[key] = updatedProduct[key] || item[key];
        }
    });
    let errResponse;
    const updated = await item.save()
        .catch(err => {
        itemRoutesLogger.error('updateimg - err: ', err);
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
    return res.status(200).send({ success: Boolean(updated) });
});
itemRoutes.put('/like/:itemId/:companyIdParam', requireAuth, async (req, res) => {
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const { userId } = req.user;
    const { itemId } = req.params;
    const isValid = verifyObjectIds([itemId, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await itemMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndUpdate({ _id: itemId, companyId: queryId });
    if (!item) {
        return res.status(404).send({ success: false });
    }
    item.likes.push(userId);
    item.likesCount++;
    let errResponse;
    await item.save().catch(err => {
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
    return res.status(200).send({ success: true });
});
itemRoutes.put('/unlike/:itemId/:companyIdParam', requireAuth, async (req, res) => {
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const { userId } = req.user;
    const { itemId } = req.params;
    const isValid = verifyObjectIds([itemId, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await itemMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndUpdate({ _id: itemId, companyId: queryId });
    if (!item) {
        return res.status(404).send({ success: false });
    }
    item.likes = item.likes.filter(val => val !== userId);
    item.likesCount--;
    let errResponse;
    await item.save().catch(err => {
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
    return res.status(200).send({ success: true });
});
itemRoutes.get('/getone/:urId/:companyIdParam', async (req, res) => {
    const { companyIdParam, urId } = req.params;
    let filter = { urId };
    const isValid = verifyObjectId(companyIdParam);
    if (isValid) {
        filter = { urId, companyId: companyIdParam };
    }
    const item = await itemLean
        .findOne(filter)
        .populate({ path: 'photos', model: fileMetaLean })
        .populate({ path: 'companyId', model: companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .lean();
    if (item && !item.companyId) {
        return res.status(200).send({});
    }
    return res.status(200).send(item);
});
itemRoutes.get('/filtergeneral/:prop/:val/:offset/:limit/:companyIdParam', async (req, res) => {
    const { companyIdParam, prop, val } = req.params;
    let filter = { [prop]: { $regex: val, $options: 'i' } };
    const isValid = verifyObjectId(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam, [prop]: { $regex: val, $options: 'i' } };
    }
    const items = await itemLean
        .find(filter)
        .populate({ path: 'photos', model: fileMetaLean })
        .populate({ path: 'companyId', model: companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .lean();
    const newItems = items.filter(item => item.companyId);
    return res.status(200).send(newItems);
});
itemRoutes.get('/getall/:offset/:limit/:companyIdParam', async (req, res) => {
    const { companyIdParam } = req.params;
    let filter = {};
    const isValid = verifyObjectId(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam };
    }
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const items = await itemLean
        .find(filter)
        .skip(offset)
        .limit(limit)
        .populate({ path: 'photos', model: fileMetaLean })
        .populate({ path: 'companyId', model: companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .lean();
    const newItems = items.filter(item => item.companyId);
    return res.status(200).send(newItems);
});
itemRoutes.get('/gettrending/:offset/:limit/:companyIdParam', async (req, res) => {
    const { companyIdParam } = req.params;
    let filter = {};
    const isValid = verifyObjectId(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam };
    }
    const items = await itemLean
        .find(filter)
        .populate({ path: 'photos', model: fileMetaLean })
        .sort({ timesViewed: 1 })
        .populate({ path: 'companyId', model: companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .lean();
    const newItems = items.filter(item => item.companyId);
    return res.status(200).send(newItems);
});
// newly posted
itemRoutes.get('/getnew/:offset/:limit/:companyIdParam', async (req, res) => {
    const { companyIdParam } = req.params;
    let filter = {};
    const isValid = verifyObjectId(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam };
    }
    const items = await itemLean
        .find(filter)
        .populate({ path: 'photos', model: fileMetaLean })
        .sort({ createdAt: -1 })
        .populate({ path: 'companyId', model: companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .lean();
    const newItems = items.filter(item => item.companyId);
    return res.status(200).send(newItems);
});
// new not used
itemRoutes.get('/getbrandnew/:offset/:limit/:companyIdParam', async (req, res) => {
    const { companyIdParam } = req.params;
    let filter = { state: 'new' };
    const isValid = verifyObjectId(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam, state: 'new' };
    }
    const items = await itemLean
        .find(filter)
        .populate({ path: 'photos', model: fileMetaLean })
        .sort({ createdAt: -1 })
        .populate({ path: 'companyId', model: companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .lean();
    const newItems = items.filter(item => item.companyId);
    return res.status(200).send(newItems);
});
// new not used
itemRoutes.get('/getused/:offset/:limit/:companyIdParam', async (req, res) => {
    const { companyIdParam } = req.params;
    let filter = { state: 'refurbished' };
    const isValid = verifyObjectId(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam, state: 'refurbished' };
    }
    const items = await itemLean
        .find(filter)
        .populate({ path: 'photos', model: fileMetaLean })
        .sort({ createdAt: -1 })
        .populate({ path: 'companyId', model: companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .lean();
    const newItems = items.filter(item => item.companyId);
    return res.status(200).send(newItems);
});
// filterprice
itemRoutes.get('/filterprice/max/:priceFilterValue/:offset/:limit/:companyIdParam', async (req, res) => {
    const { companyIdParam } = req.params;
    let filter = {};
    const isValid = verifyObjectId(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam };
    }
    const { priceFilterValue } = req.params;
    const items = await itemLean
        .find(filter)
        .gte('costMeta.sellingPrice', Number(priceFilterValue))
        .populate({ path: 'photos', model: fileMetaLean })
        .sort({ createdAt: -1 })
        .populate({ path: 'companyId', model: companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .lean();
    const newItems = items.filter(item => item.companyId);
    return res.status(200).send(newItems);
});
itemRoutes.get('/filterprice/min/:priceFilterValue/:offset/:limit/:companyIdParam', async (req, res) => {
    const { companyIdParam } = req.params;
    let filter = {};
    const isValid = verifyObjectId(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam };
    }
    const { priceFilterValue } = req.params;
    const items = await itemLean
        .find(filter)
        .lte('costMeta.sellingPrice', Number(priceFilterValue))
        .populate({ path: 'photos', model: fileMetaLean })
        .sort({ createdAt: -1 })
        .populate({ path: 'companyId', model: companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .lean();
    const newItems = items.filter(item => item.companyId);
    return res.status(200).send(newItems);
});
itemRoutes.get('/filterprice/eq/:priceFilterMinValue/:priceFilterMaxValue/:offset/:limit/:companyIdParam', async (req, res) => {
    const { companyIdParam } = req.params;
    let filter = {};
    const isValid = verifyObjectId(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam };
    }
    const { priceFilterMinValue, priceFilterMaxValue } = req.params;
    const items = await itemLean
        .find(filter)
        .gte('costMeta.sellingPrice', Number(priceFilterMaxValue))
        .lte('costMeta.sellingPrice', Number(priceFilterMinValue))
        .populate({ path: 'photos', model: fileMetaLean })
        .sort({ createdAt: -1 })
        .populate({ path: 'companyId', model: companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .lean();
    const newItems = items.filter(item => item.companyId);
    return res.status(200).send(newItems);
});
itemRoutes.get('/filterstars/:starVal/:offset/:limit/:companyIdParam', async (req, res) => {
    const { companyIdParam } = req.params;
    let filter = {};
    const isValid = verifyObjectId(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam };
    }
    const starVal = Number(req.params.starVal);
    const reviews = await reviewLean
        .find(filter)
        .where('rating') // rating
        .lte(starVal + 2)
        .gte(starVal)
        .select({ itemId: 1 })
        .populate({ path: 'photos', model: fileMetaLean })
        .lean()
        .populate({ path: 'itemId', model: itemLean,
        populate: [{
                path: 'photos', model: fileMetaLean, transform: (doc) => doc.url
            }]
    })
        .populate({ path: 'companyId', model: companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .lean();
    const newItems = reviews.filter(val => val.companyId);
    const items = newItems
        .map(val => val.itemId);
    return res.status(200).send(items);
});
itemRoutes.get('/discount/:discountValue/:offset/:limit/:companyIdParam', async (req, res) => {
    const { companyIdParam } = req.params;
    let filter = {};
    const isValid = verifyObjectId(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam };
    }
    const { discountValue } = req.params;
    const items = await itemLean
        .find(filter)
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
        .populate({ path: 'photos', model: fileMetaLean })
        .sort({ createdAt: -1 })
        .populate({ path: 'companyId', model: companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .lean();
    const newItems = items.filter(item => item.companyId);
    return res.status(200).send(newItems);
});
itemRoutes.post('/getsponsored/:companyIdParam', async (req, res) => {
    const { companyIdParam } = req.params;
    const ids = req.body.sponsored;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    let filter = { _id: { $in: ids } };
    const isValid = verifyObjectId(companyIdParam);
    if (isValid) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        filter = { companyId: companyIdParam, _id: { $in: ids } };
    }
    if (ids && ids.length > 0) {
        for (const id of ids) {
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
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find(filter)
        .populate({ path: 'photos', model: fileMetaLean })
        .lean()
        .sort({ timesViewed: 1 })
        .populate({ path: 'companyId', model: companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .lean();
    const newItems = items.filter(item => item.companyId);
    return res.status(200).send(newItems);
});
itemRoutes.get('/getoffered/:companyIdParam', async (req, res) => {
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    let filter = {};
    const isValid = verifyObjectId(queryId);
    if (isValid) {
        filter = { companyId: queryId };
    }
    const items = await itemLean
        .find(filter)
        .populate({ path: 'sponsored', model: itemLean,
        populate: [{
                path: 'photos', model: fileMetaLean
            }
        ]
    })
        .populate({ path: 'photos', model: fileMetaLean })
        .sort({ createdAt: -1 })
        .populate({ path: 'companyId', model: companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .lean();
    const newItems = items.filter(item => item.companyId);
    const filtered = newItems.filter(p => p.sponsored?.length && p.sponsored?.length > 0);
    return res.status(200).send(filtered);
});
itemRoutes.put('/addsponsored/:id/:companyIdParam', requireAuth, roleAuthorisation('items', 'update'), deleteFiles, async (req, res) => {
    const { id } = req.params;
    const { sponsored } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await itemMain.findByIdAndUpdate(id);
    if (!item) {
        return res.status(404).send({ success: false });
    }
    item.sponsored.push(sponsored);
    let errResponse;
    await item.save().catch(err => {
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
        return res.status(200).send({ success: true });
    }
    return res.status(200).send({ success: true });
});
itemRoutes.put('/updatesponsored/:id/:companyIdParam', requireAuth, roleAuthorisation('items', 'update'), deleteFiles, async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const { sponsored } = req.body;
    const isValid = verifyObjectIds([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const item = await itemMain.findOneAndUpdate({ _id: id, companyId: queryId });
    if (!item) {
        return res.status(404).send({ success: false });
    }
    const found = item.sponsored.find(val => val.item === sponsored.item);
    if (found) {
        const indexOf = item.sponsored.indexOf(found);
        item.sponsored[indexOf] = sponsored;
    }
    let errResponse;
    await item.save().catch(err => {
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
    return res.status(200).send({ success: true });
});
itemRoutes.delete('/deletesponsored/:id/:spnsdId/:companyIdParam', requireAuth, roleAuthorisation('items', 'delete'), deleteFiles, async (req, res) => {
    const { id, spnsdId } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const item = await itemMain.findOneAndUpdate({ _id: id, companyId: queryId });
    if (!item) {
        return res.status(404).send({ success: false });
    }
    const found = item.sponsored.find(val => val.item === spnsdId);
    if (found) {
        const indexOf = item.sponsored.indexOf(found);
        item.sponsored.splice(indexOf, 1);
    }
    let errResponse;
    await item.save().catch(err => {
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
    return res.status(200).send({ success: true });
});
itemRoutes.put('/deleteone/:id/:companyIdParam', requireAuth, roleAuthorisation('items', 'delete'), deleteFiles, async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const deleted = await itemMain.findOneAndDelete({ _id: id, companyId: queryId });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
itemRoutes.put('/deleteimages/:companyIdParam', requireAuth, roleAuthorisation('items', 'delete'), deleteFiles, async (req, res) => {
    const filesWithDir = req.body.filesWithDir;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    if (filesWithDir && !filesWithDir.length) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const updatedProduct = req.body.item;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedProduct;
    const isValid = verifyObjectIds([_id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await itemMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndUpdate({ _id, companyId: queryId });
    if (!item) {
        return res.status(404).send({ success: false, err: 'item not found' });
    }
    const photos = item.photos;
    const filesWithDirStr = filesWithDir
        .map(val => val.url);
    item.photos = photos
        .filter(p => !filesWithDirStr.includes(p))
        .map(p => p._id);
    let errResponse;
    await item.save().catch(err => {
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
    return res.status(200).send({ success: true });
});
itemRoutes.post('/search/:limit/:offset/:companyIdParam', async (req, res) => {
    const { searchterm, searchKey, category, extraFilers } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    let filter;
    if (!category || category === 'all') {
        filter = {};
    }
    else {
        filter = { type: category };
    }
    if (extraFilers) {
        switch (extraFilers.filter) {
            case 'price':
                if (extraFilers.val.min && extraFilers.val.max) {
                    filter = {
                        ...filter,
                        ...{
                            $gte: extraFilers.val.min,
                            $lte: extraFilers.val.max
                        }
                    };
                }
                else if (extraFilers.val.min) {
                    filter = {
                        ...filter,
                        ...{ $gte: extraFilers.val.min }
                    };
                }
                else if (extraFilers.val.max) {
                    filter = {
                        ...filter,
                        ...{ $lte: extraFilers.val.min }
                    };
                }
                break;
            case 'state':
                filter = {
                    ...filter,
                    ...{ state: extraFilers.val.val }
                };
                break;
            case 'category':
                filter = {
                    ...filter,
                    ...{ type: extraFilers.val.val }
                };
                break;
            case 'breand':
                filter = {
                    ...filter,
                    ...{ brand: extraFilers.val.val }
                };
                break;
            default:
                return res.status(401).send({ success: false, err: 'unauthorised' });
        }
    }
    const items = await itemLean
        .find({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' }, ...filter })
        .skip(offset)
        .limit(limit)
        .populate({ path: 'companyId', model: companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .lean();
    const newItems = items.filter(item => item.companyId);
    return res.status(200).send(newItems);
});
itemRoutes.put('/deletemany/:companyIdParam', requireAuth, roleAuthorisation('items', 'delete'), deleteFiles, async (req, res) => {
    const { ids } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([...ids, ...[queryId]]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // start by removing offers
    await itemOfferMain.deleteMany({ companyId: queryId, items: { $elemMatch: { $in: ids } } });
    // also remove decoys
    await itemDecoyMain.deleteMany({ companyId: queryId, items: { $elemMatch: { $in: ids } } });
    const deleted = await itemMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ _id: { $in: ids } })
        .catch(err => {
        itemRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
//# sourceMappingURL=item.routes.js.map