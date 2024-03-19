"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeReview = exports.addReview = exports.itemRoutes = void 0;
const tslib_1 = require("tslib");
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
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_1 = require("@open-stock/stock-universal");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const log4js_1 = require("log4js");
const item_model_1 = require("../models/item.model");
const itemdecoy_model_1 = require("../models/itemdecoy.model");
const itemoffer_model_1 = require("../models/itemoffer.model");
const review_model_1 = require("../models/review.model");
/** The logger for the item routes */
const itemRoutesLogger = (0, log4js_1.getLogger)('routes/itemRoutes');
/**
 * Express router for item routes.
 */
exports.itemRoutes = express_1.default.Router();
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
const addReview = async (req, res) => {
    const { userId } = req.user;
    const itemId = req.body.review.itemId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(itemId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await item_model_1.itemMain
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
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
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
exports.addReview = addReview;
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
const removeReview = async (req, res) => {
    const { userId } = req.user;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const { itemId, rating } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([itemId, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await item_model_1.itemMain
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
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
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
exports.removeReview = removeReview;
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
exports.itemRoutes.post('/create/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items', 'create'), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, async (req, res) => {
    const item = req.body.item;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    item.companyId = queryId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const count = await item_model_1.itemMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    item.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    const parsed = req.body.parsed;
    if (parsed && parsed.newFiles) {
        const oldPhotos = item.photos || [];
        item.photos = oldPhotos.concat(parsed.newFiles);
    }
    const newProd = new item_model_1.itemMain(item);
    let errResponse;
    const saved = await newProd.save()
        .catch(err => {
        itemRoutesLogger.error('create - err: ', err);
        errResponse = {
            success: false,
            status: 403
        };
        if (err && err.errors) {
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
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
exports.itemRoutes.put('/update/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items', 'update'), async (req, res) => {
    const updatedProduct = req.body.item;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    updatedProduct.companyId = queryId;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedProduct;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await item_model_1.itemMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndUpdate({ _id, companyId: queryId });
    if (!item) {
        return res.status(404).send({ success: false });
    }
    if (!item.urId || item.urId === '0') {
        const count = (0, stock_universal_1.makeRandomString)(3, 'numbers');
        item.urId = (0, stock_universal_server_1.makeUrId)(Number(count));
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
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
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
exports.itemRoutes.post('/updateimg/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items', 'update'), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, async (req, res) => {
    const updatedProduct = req.body.item;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedProduct;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await item_model_1.itemMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndUpdate({ _id, companyId: queryId });
    if (!item) {
        return res.status(404).send({ success: false });
    }
    if (!item.urId || item.urId === '0') {
        const count = (0, stock_universal_1.makeRandomString)(3, 'numbers');
        item.urId = (0, stock_universal_server_1.makeUrId)(Number(count));
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
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
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
exports.itemRoutes.put('/like/:itemId/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const { userId } = req.user;
    const { itemId } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([itemId, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await item_model_1.itemMain
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
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
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
exports.itemRoutes.put('/unlike/:itemId/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const { userId } = req.user;
    const { itemId } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([itemId, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await item_model_1.itemMain
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
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
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
exports.itemRoutes.get('/getone/:urId/:companyIdParam', async (req, res) => {
    const { companyIdParam, urId } = req.params;
    let filter = { urId };
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (isValid) {
        filter = { urId, companyId: companyIdParam };
    }
    const item = await item_model_1.itemLean
        .findOne(filter)
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .populate({ path: 'companyId', model: stock_auth_server_1.companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .lean();
    if (item && !item.companyId) {
        return res.status(200).send({});
    }
    return res.status(200).send(item);
});
exports.itemRoutes.get('/filtergeneral/:prop/:val/:offset/:limit/:companyIdParam', async (req, res) => {
    const { companyIdParam, prop, val } = req.params;
    let filter = { [prop]: { $regex: val, $options: 'i' } };
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam, [prop]: { $regex: val, $options: 'i' } };
    }
    const items = await item_model_1.itemLean
        .find(filter)
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .populate({ path: 'companyId', model: stock_auth_server_1.companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .lean();
    const newItems = items.filter(item => item.companyId);
    return res.status(200).send(newItems);
});
exports.itemRoutes.get('/filterrandom/:prop/:val/:offset/:limit/:companyIdParam', async (req, res) => {
    const { companyIdParam, prop, val } = req.params;
    let filter = { [prop]: { $regex: val, $options: 'i' } };
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam, [prop]: { $regex: val, $options: 'i' } };
    }
    const items = await item_model_1.itemLean
        .find(filter)
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .populate({ path: 'companyId', model: stock_auth_server_1.companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .sort({ timesViewed: 1, likesCount: 1, reviewCount: 1 })
        .lean();
    const newItems = items.filter(item => item.companyId);
    return res.status(200).send(newItems);
});
exports.itemRoutes.get('/getall/:offset/:limit/:companyIdParam', async (req, res) => {
    const { companyIdParam } = req.params;
    let filter = {};
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam };
    }
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const items = await item_model_1.itemLean
        .find(filter)
        .skip(offset)
        .limit(limit)
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .populate({ path: 'companyId', model: stock_auth_server_1.companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .lean();
    const newItems = items.filter(item => item.companyId);
    return res.status(200).send(newItems);
});
exports.itemRoutes.get('/gettrending/:offset/:limit/:companyIdParam', async (req, res) => {
    const { companyIdParam } = req.params;
    let filter = {};
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam };
    }
    const items = await item_model_1.itemLean
        .find(filter)
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .sort({ timesViewed: 1 })
        .populate({ path: 'companyId', model: stock_auth_server_1.companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .lean();
    const newItems = items.filter(item => item.companyId);
    return res.status(200).send(newItems);
});
exports.itemRoutes.get('/getfeatured/:offset/:limit/:companyIdParam', async (req, res) => {
    const { companyIdParam } = req.params;
    let filter = {};
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam };
    }
    const items = await item_model_1.itemLean
        .find(filter)
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .sort({ timesViewed: 1, likesCount: 1, reviewCount: 1 })
        .populate({ path: 'companyId', model: stock_auth_server_1.companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .lean();
    const newItems = items.filter(item => item.companyId);
    return res.status(200).send(newItems);
});
// newly posted
exports.itemRoutes.get('/getnew/:offset/:limit/:companyIdParam', async (req, res) => {
    const { companyIdParam } = req.params;
    let filter = {};
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam };
    }
    const items = await item_model_1.itemLean
        .find(filter)
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .sort({ createdAt: -1 })
        .populate({ path: 'companyId', model: stock_auth_server_1.companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .lean();
    const newItems = items.filter(item => item.companyId);
    return res.status(200).send(newItems);
});
// new not used
exports.itemRoutes.get('/getbrandnew/:offset/:limit/:companyIdParam', async (req, res) => {
    const { companyIdParam } = req.params;
    let filter = { state: 'new' };
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam, state: 'new' };
    }
    const items = await item_model_1.itemLean
        .find(filter)
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .sort({ createdAt: -1 })
        .populate({ path: 'companyId', model: stock_auth_server_1.companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .lean();
    const newItems = items.filter(item => item.companyId);
    return res.status(200).send(newItems);
});
// new not used
exports.itemRoutes.get('/getused/:offset/:limit/:companyIdParam', async (req, res) => {
    const { companyIdParam } = req.params;
    let filter = { state: 'refurbished' };
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam, state: 'refurbished' };
    }
    const items = await item_model_1.itemLean
        .find(filter)
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .sort({ createdAt: -1 })
        .populate({ path: 'companyId', model: stock_auth_server_1.companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .lean();
    const newItems = items.filter(item => item.companyId);
    return res.status(200).send(newItems);
});
// filterprice
exports.itemRoutes.get('/filterprice/max/:priceFilterValue/:offset/:limit/:companyIdParam', async (req, res) => {
    const { companyIdParam } = req.params;
    let filter = {};
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam };
    }
    const { priceFilterValue } = req.params;
    const items = await item_model_1.itemLean
        .find(filter)
        .gte('costMeta.sellingPrice', Number(priceFilterValue))
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .sort({ createdAt: -1 })
        .populate({ path: 'companyId', model: stock_auth_server_1.companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .lean();
    const newItems = items.filter(item => item.companyId);
    return res.status(200).send(newItems);
});
exports.itemRoutes.get('/filterprice/min/:priceFilterValue/:offset/:limit/:companyIdParam', async (req, res) => {
    const { companyIdParam } = req.params;
    let filter = {};
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam };
    }
    const { priceFilterValue } = req.params;
    const items = await item_model_1.itemLean
        .find(filter)
        .lte('costMeta.sellingPrice', Number(priceFilterValue))
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .sort({ createdAt: -1 })
        .populate({ path: 'companyId', model: stock_auth_server_1.companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .lean();
    const newItems = items.filter(item => item.companyId);
    return res.status(200).send(newItems);
});
exports.itemRoutes.get('/filterprice/eq/:priceFilterMinValue/:priceFilterMaxValue/:offset/:limit/:companyIdParam', async (req, res) => {
    const { companyIdParam } = req.params;
    let filter = {};
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam };
    }
    const { priceFilterMinValue, priceFilterMaxValue } = req.params;
    const items = await item_model_1.itemLean
        .find(filter)
        .gte('costMeta.sellingPrice', Number(priceFilterMaxValue))
        .lte('costMeta.sellingPrice', Number(priceFilterMinValue))
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .sort({ createdAt: -1 })
        .populate({ path: 'companyId', model: stock_auth_server_1.companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .lean();
    const newItems = items.filter(item => item.companyId);
    return res.status(200).send(newItems);
});
exports.itemRoutes.get('/filterstars/:starVal/:offset/:limit/:companyIdParam', async (req, res) => {
    const { companyIdParam } = req.params;
    let filter = {};
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam };
    }
    const starVal = Number(req.params.starVal);
    const reviews = await review_model_1.reviewLean
        .find(filter)
        .where('rating') // rating
        .lte(starVal + 2)
        .gte(starVal)
        .select({ itemId: 1 })
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .lean()
        .populate({ path: 'companyId', model: stock_auth_server_1.companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .lean();
    const newItems = reviews.filter(val => val.companyId);
    const items = newItems
        .map(val => val.itemId);
    return res.status(200).send(items);
});
exports.itemRoutes.get('/discount/:discountValue/:offset/:limit/:companyIdParam', async (req, res) => {
    const { companyIdParam } = req.params;
    let filter = {};
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam };
    }
    const { discountValue } = req.params;
    const items = await item_model_1.itemLean
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
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .sort({ createdAt: -1 })
        .populate({ path: 'companyId', model: stock_auth_server_1.companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .lean();
    const newItems = items.filter(item => item.companyId);
    return res.status(200).send(newItems);
});
exports.itemRoutes.post('/getsponsored/:companyIdParam', async (req, res) => {
    const { companyIdParam } = req.params;
    const ids = req.body.sponsored;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    let filter = { _id: { $in: ids } };
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (isValid) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        filter = { companyId: companyIdParam, _id: { $in: ids } };
    }
    if (ids && ids.length > 0) {
        for (const id of ids) {
            const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
            if (!isValid) {
                return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
            }
        }
    }
    else {
        return res.status(403).send({ success: false, status: 403, err: 'no sponsored items provided' });
    }
    const items = await item_model_1.itemLean
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find(filter)
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .lean()
        .sort({ timesViewed: 1 })
        .populate({ path: 'companyId', model: stock_auth_server_1.companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .lean();
    const newItems = items.filter(item => item.companyId);
    return res.status(200).send(newItems);
});
exports.itemRoutes.get('/getoffered/:companyIdParam', async (req, res) => {
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    let filter = {};
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (isValid) {
        filter = { companyId: queryId };
    }
    const items = await item_model_1.itemLean
        .find(filter)
        .populate({ path: 'sponsored', model: item_model_1.itemLean,
        populate: [{
                path: 'photos', model: stock_universal_server_1.fileMetaLean
            }
        ]
    })
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .sort({ createdAt: -1 })
        .populate({ path: 'companyId', model: stock_auth_server_1.companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .lean();
    const newItems = items.filter(item => item.companyId);
    const filtered = newItems.filter(p => p.sponsored?.length && p.sponsored?.length > 0);
    return res.status(200).send(filtered);
});
exports.itemRoutes.put('/addsponsored/:id/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items', 'update'), stock_universal_server_1.deleteFiles, async (req, res) => {
    const { id } = req.params;
    const { sponsored } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await item_model_1.itemMain.findByIdAndUpdate(id);
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
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
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
exports.itemRoutes.put('/updatesponsored/:id/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items', 'update'), stock_universal_server_1.deleteFiles, async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const { sponsored } = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const item = await item_model_1.itemMain.findOneAndUpdate({ _id: id, companyId: queryId });
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
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
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
exports.itemRoutes.delete('/deletesponsored/:id/:spnsdId/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items', 'delete'), stock_universal_server_1.deleteFiles, async (req, res) => {
    const { id, spnsdId } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const item = await item_model_1.itemMain.findOneAndUpdate({ _id: id, companyId: queryId });
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
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
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
exports.itemRoutes.put('/deleteone/:id/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items', 'delete'), stock_universal_server_1.deleteFiles, async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const deleted = await item_model_1.itemMain.findOneAndDelete({ _id: id, companyId: queryId });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.itemRoutes.put('/deleteimages/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items', 'delete'), stock_universal_server_1.deleteFiles, async (req, res) => {
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
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await item_model_1.itemMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndUpdate({ _id, companyId: queryId });
    if (!item) {
        return res.status(404).send({ success: false, err: 'item not found' });
    }
    const filesWithDirIds = filesWithDir.map(val => val._id);
    const photos = item.photos;
    item.photos = photos
        .filter((p) => !filesWithDirIds.includes(p));
    let errResponse;
    await item.save().catch(err => {
        errResponse = {
            success: false,
            status: 403
        };
        if (err && err.errors) {
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
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
exports.itemRoutes.post('/search/:limit/:offset/:companyIdParam', async (req, res) => {
    const { searchterm, searchKey, category, extraFilers, subCategory } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    let filter;
    if (!category || category === 'all') {
        if (subCategory) {
            filter = { subCategory };
        }
        else {
            filter = {};
        }
    }
    else if (subCategory) {
        filter = { category, subCategory };
    }
    else {
        filter = { category };
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
                    ...{ category: extraFilers.val.val }
                };
                break;
            case 'subCategory':
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
    const items = await item_model_1.itemLean
        .find({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' }, ...filter })
        .skip(offset)
        .limit(limit)
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .populate({ path: 'companyId', model: stock_auth_server_1.companyLean, transform: (doc) => (doc.blocked ? null : doc._id) })
        .lean();
    const newItems = items.filter(item => item.companyId);
    return res.status(200).send(newItems);
});
exports.itemRoutes.put('/deletemany/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items', 'delete'), stock_universal_server_1.deleteFiles, async (req, res) => {
    const { ids } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([...ids, ...[queryId]]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // start by removing offers
    await itemoffer_model_1.itemOfferMain.deleteMany({ companyId: queryId, items: { $elemMatch: { $in: ids } } });
    // also remove decoys
    await itemdecoy_model_1.itemDecoyMain.deleteMany({ companyId: queryId, items: { $elemMatch: { $in: ids } } });
    const deleted = await item_model_1.itemMain
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