"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeReview = exports.addReview = exports.itemRoutes = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const item_model_1 = require("../models/item.model");
const review_model_1 = require("../models/review.model");
const log4js_1 = require("log4js");
const stock_universal_1 = require("@open-stock/stock-universal");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const itemoffer_model_1 = require("../models/itemoffer.model");
const itemdecoy_model_1 = require("../models/itemdecoy.model");
/** The logger for the item routes */
const itemRoutesLogger = (0, log4js_1.getLogger)('routes/itemRoutes');
/** The express router for handling item routes */
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
    const { itemId, rating } = req.params;
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
 * @param {Array<Ifilewithdir>} req.body.newFiles - The files to upload with the item
 * @param {Response} res - The express response object
 * @returns {Promise<Response>} - The express response object with a success status and saved item data
 */
exports.itemRoutes.post('/create', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items'), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, async (req, res) => {
    const item = req.body.item;
    const count = await item_model_1.itemMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    item.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    item.photos = req.body.newFiles || [];
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
exports.itemRoutes.put('/update', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items'), async (req, res) => {
    const updatedProduct = req.body.item;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedProduct;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(_id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await item_model_1.itemMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findByIdAndUpdate(_id);
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
exports.itemRoutes.post('/updateimg', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items'), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, async (req, res) => {
    const updatedProduct = req.body.item;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedProduct;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(_id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await item_model_1.itemMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findByIdAndUpdate(_id);
    if (!item) {
        return res.status(404).send({ success: false });
    }
    if (!item.urId || item.urId === '0') {
        const count = (0, stock_universal_1.makeRandomString)(3, 'numbers');
        item.urId = (0, stock_universal_server_1.makeUrId)(Number(count));
    }
    const photos = item.photos;
    item.photos = [...photos, ...req.body.newFiles];
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
exports.itemRoutes.put('/like/:itemId', stock_universal_server_1.requireAuth, async (req, res) => {
    const { userId } = req.user;
    const { itemId } = req.params;
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
exports.itemRoutes.put('/unlike/:itemId', stock_universal_server_1.requireAuth, async (req, res) => {
    const { userId } = req.user;
    const { itemId } = req.params;
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
exports.itemRoutes.get('/getone/:urId', async (req, res) => {
    const { urId } = req.params;
    const item = await item_model_1.itemLean
        .findOne({ urId })
        .lean();
    return res.status(200).send(item);
});
exports.itemRoutes.get('/filtergeneral/:prop/:val/:offset/:limit', async (req, res) => {
    const { prop, val } = req.params;
    const items = await item_model_1.itemLean
        .find({ [prop]: { $regex: val, $options: 'i' } })
        .lean();
    return res.status(200).send(items);
});
exports.itemRoutes.get('/getall/:offset/:limit', async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const items = await item_model_1.itemLean
        .find({})
        .skip(offset)
        .limit(limit)
        .lean();
    return res.status(200).send(items);
});
exports.itemRoutes.get('/gettrending/:offset/:limit', async (req, res) => {
    const items = await item_model_1.itemLean
        .find({})
        .lean()
        .sort({ timesViewed: 1 });
    return res.status(200).send(items);
});
// newly posted
exports.itemRoutes.get('/getnew/:offset/:limit', async (req, res) => {
    const items = await item_model_1.itemLean
        .find({})
        .lean()
        .sort({ createdAt: -1 });
    return res.status(200).send(items);
});
// new not used
exports.itemRoutes.get('/getbrandnew/:offset/:limit', async (req, res) => {
    const items = await item_model_1.itemLean
        .find({ state: 'new' })
        .lean()
        .sort({ createdAt: -1 });
    return res.status(200).send(items);
});
// new not used
exports.itemRoutes.get('/getused/:offset/:limit', async (req, res) => {
    const items = await item_model_1.itemLean
        .find({ state: 'refurbished' })
        .lean()
        .sort({ createdAt: -1 });
    return res.status(200).send(items);
});
// filterprice
exports.itemRoutes.get('/filterprice/max/:priceFilterValue/:offset/:limit', async (req, res) => {
    const { priceFilterValue } = req.params;
    const items = await item_model_1.itemLean
        .find({})
        .gte('costMeta.sellingPrice', Number(priceFilterValue))
        .lean()
        .sort({ createdAt: -1 });
    return res.status(200).send(items);
});
exports.itemRoutes.get('/filterprice/min/:priceFilterValue/:offset/:limit', async (req, res) => {
    const { priceFilterValue } = req.params;
    const items = await item_model_1.itemLean
        .find({})
        .lte('costMeta.sellingPrice', Number(priceFilterValue))
        .lean()
        .sort({ createdAt: -1 });
    return res.status(200).send(items);
});
exports.itemRoutes.get('/filterprice/eq/:priceFilterMinValue/:priceFilterMaxValue/:offset/:limit', async (req, res) => {
    const { priceFilterMinValue, priceFilterMaxValue } = req.params;
    const items = await item_model_1.itemLean
        .find({})
        .gte('costMeta.sellingPrice', Number(priceFilterMaxValue))
        .lte('costMeta.sellingPrice', Number(priceFilterMinValue))
        .lean()
        .sort({ createdAt: -1 });
    return res.status(200).send(items);
});
exports.itemRoutes.get('/filterstars/:starVal/:offset/:limit', async (req, res) => {
    const starVal = Number(req.params.starVal);
    const reviews = await review_model_1.reviewLean
        .find({})
        .where('rating') // rating
        .lte(starVal + 2)
        .gte(starVal)
        .select({ itemId: 1 })
        .lean()
        .populate({ path: 'itemId', model: item_model_1.itemLean });
    const items = reviews
        .map(val => val.itemId);
    return res.status(200).send(items);
});
exports.itemRoutes.get('/discount/:discountValue/:offset/:limit', async (req, res) => {
    const { discountValue } = req.params;
    const items = await item_model_1.itemLean
        .find({})
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
        .lean()
        .sort({ createdAt: -1 });
    return res.status(200).send(items);
});
exports.itemRoutes.post('/getsponsored', async (req, res) => {
    const ids = req.body.sponsored;
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
        .find({ _id: { $in: ids } })
        .lean()
        .sort({ timesViewed: 1 });
    return res.status(200).send(items);
});
exports.itemRoutes.get('/getoffered', async (req, res) => {
    const items = await item_model_1.itemLean
        .find({})
        .lean()
        .populate({ path: 'sponsored', model: item_model_1.itemLean })
        .sort({ createdAt: -1 });
    const filtered = items.filter(p => p.sponsored?.length && p.sponsored?.length > 0);
    return res.status(200).send(filtered);
});
exports.itemRoutes.put('/addsponsored/:id', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items'), stock_universal_server_1.deleteFiles, async (req, res) => {
    const { id } = req.params;
    const { sponsored } = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
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
exports.itemRoutes.put('/updatesponsored/:id', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items'), stock_universal_server_1.deleteFiles, async (req, res) => {
    const { id } = req.params;
    const { sponsored } = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await item_model_1.itemMain.findByIdAndUpdate(id);
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
exports.itemRoutes.delete('/deletesponsored/:id/:spnsdId', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items'), stock_universal_server_1.deleteFiles, async (req, res) => {
    const { id, spnsdId } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await item_model_1.itemMain.findByIdAndUpdate(id);
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
exports.itemRoutes.put('/deleteone/:id', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items'), stock_universal_server_1.deleteFiles, async (req, res) => {
    const { id } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await item_model_1.itemMain.findByIdAndDelete(id);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.itemRoutes.put('/deleteimages', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items'), stock_universal_server_1.deleteFiles, async (req, res) => {
    const filesWithDir = req.body.filesWithDir;
    if (filesWithDir && !filesWithDir.length) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const updatedProduct = req.body.item;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedProduct;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(_id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await item_model_1.itemMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findByIdAndUpdate(_id);
    if (!item) {
        return res.status(404).send({ success: false, err: 'item not found' });
    }
    const photos = item.photos;
    const filesWithDirStr = filesWithDir
        .map(val => val.filename);
    item.photos = photos
        .filter(p => !filesWithDirStr.includes(p));
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
exports.itemRoutes.post('/search/:limit/:offset', async (req, res) => {
    const { searchterm, searchKey, category, extraFilers } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
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
    const items = await item_model_1.itemLean
        .find({ [searchKey]: { $regex: searchterm, $options: 'i' }, ...filter })
        .skip(offset)
        .limit(limit)
        .lean();
    return res.status(200).send(items);
});
exports.itemRoutes.put('/deletemany', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items'), stock_universal_server_1.deleteFiles, async (req, res) => {
    const { ids } = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)(ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // start by removing offers
    await itemoffer_model_1.itemOfferMain.deleteMany({ items: { $elemMatch: { $in: ids } } });
    // also remove decoys
    await itemdecoy_model_1.itemDecoyMain.deleteMany({ items: { $elemMatch: { $in: ids } } });
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