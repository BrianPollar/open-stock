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
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const user_behavoiur_controller_1 = require("../controllers/user-behavoiur.controller");
const item_model_1 = require("../models/item.model");
const itemdecoy_model_1 = require("../models/itemdecoy.model");
const itemoffer_model_1 = require("../models/itemoffer.model");
const review_model_1 = require("../models/review.model");
/** The logger for the item routes */
const itemRoutesLogger = tracer.colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
        // eslint-disable-next-line no-console
        console.log(data.output);
        const logDir = path_1.default.join(process.cwd() + '/openstockLog/');
        fs.mkdir(logDir, { recursive: true }, (err) => {
            if (err) {
                if (err) {
                    // eslint-disable-next-line no-console
                    console.log('data.output err ', err);
                }
            }
        });
        fs.appendFile(logDir + '/counter-server.log', data.rawoutput + '\n', err => {
            if (err) {
                // eslint-disable-next-line no-console
                console.log('raw.output err ', err);
            }
        });
    }
});
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
    const { itemId, userId } = req.body.review;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(itemId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await item_model_1.itemMain
        .findByIdAndUpdate(itemId);
    if (!item) {
        return res.status(404).send({ success: false });
    }
    item.reviewedBy.push(userId || 'tourer');
    item.reviewCount++;
    item.reviewRatingsTotal += req.body.review.rating;
    item.reviewWeight = item.reviewRatingsTotal / item.reviewedBy.length; // <= 10
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
exports.itemRoutes.post('/create/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_auth_server_1.requireCanUseFeature)('item'), (0, stock_universal_server_1.roleAuthorisation)('items', 'create'), async (req, res, next) => {
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
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    item.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
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
    if (!Boolean(saved)) {
        return res.status(403).send('unknown error');
    }
    return next();
}, (0, stock_auth_server_1.requireUpdateSubscriptionRecord)('item'));
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
exports.itemRoutes.post('/createimg/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_auth_server_1.requireCanUseFeature)('item'), (0, stock_universal_server_1.roleAuthorisation)('items', 'create'), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, async (req, res, next) => {
    const item = req.body.item;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    item.companyId = queryId;
    item.ecomerceCompat = true;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const count = await item_model_1.itemMain
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    item.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    const parsed = req.body;
    if (parsed && parsed.newPhotos) {
        item.photos = parsed.newPhotos;
    }
    if (parsed && parsed.newVideos) {
        item.video = parsed.newVideos[0];
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
    if (!Boolean(saved)) {
        return res.status(403).send('unknown error');
    }
    return next();
}, (0, stock_auth_server_1.requireUpdateSubscriptionRecord)('item'));
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
exports.itemRoutes.put('/update/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('items', 'update'), async (req, res) => {
    const updatedProduct = req.body.item;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    updatedProduct.companyId = queryId;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    // const { _id } = updatedProduct;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([updatedProduct._id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await item_model_1.itemMain
        .findOne({ _id: updatedProduct._id, companyId: queryId });
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
        if (item[key] && key !== '_id') {
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
exports.itemRoutes.post('/updateimg/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('items', 'update'), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, async (req, res) => {
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
        .findOne({ _id, companyId: queryId });
    if (!item) {
        return res.status(404).send({ success: false });
    }
    if (!item.urId || item.urId === '0') {
        const count = (0, stock_universal_1.makeRandomString)(3, 'numbers');
        item.urId = (0, stock_universal_server_1.makeUrId)(Number(count));
    }
    const parsed = req.body;
    if (parsed && parsed.newPhotos) {
        const oldPhotos = item.photos || [];
        item.photos = [...oldPhotos, ...parsed.newPhotos];
    }
    if (parsed && parsed.newVideos) {
        const meta = await stock_universal_server_1.fileMetaLean.findById(item.video);
        if (meta) {
            await (0, stock_universal_server_1.deleteAllFiles)([meta]);
        }
        item.video = parsed.newVideos[0];
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
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .populate({ path: 'companyId', model: stock_auth_server_1.companyLean,
        populate: [{
                path: 'owner', model: stock_auth_server_1.userLean,
                populate: [{
                        path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                    }],
                transform: (doc) => ({ _id: doc._id, email: doc.email, phone: doc.phone, profilePic: doc.profilePic })
            }
        ],
        transform: (doc) => {
            if (doc.blocked) {
                return null;
            }
            else {
                return { _id: doc._id, displayName: doc.displayName, owner: doc.owner };
            }
        }
    })
        .lean();
    if (item && !item.companyId) {
        return res.status(200).send({});
    }
    return res.status(200).send(item);
});
exports.itemRoutes.get('/filtergeneral/:prop/:val/:offset/:limit/:companyIdParam/:ecomerceCompat', async (req, res) => {
    const { companyIdParam, prop, val, ecomerceCompat } = req.params;
    let filter = { [prop]: { $regex: val, $options: 'i' } };
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam, [prop]: { $regex: val, $options: 'i' } };
    }
    if (prop === 'time') {
        filter = { companyId: companyIdParam, createdAt: { $gte: new Date(val) } };
    }
    if (ecomerceCompat === 'true') {
        filter = { ...filter, ecomerceCompat: true };
    }
    const all = await Promise.all([
        item_model_1.itemLean
            .find(filter)
            .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
            .populate({ path: 'companyId', model: stock_auth_server_1.companyLean,
            populate: [{
                    path: 'owner', model: stock_auth_server_1.userLean,
                    populate: [{
                            path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                        }],
                    transform: (doc) => ({ _id: doc._id, email: doc.email, phone: doc.phone, profilePic: doc.profilePic })
                }
            ],
            transform: (doc) => {
                if (doc.blocked) {
                    return null;
                }
                else {
                    return { _id: doc._id, displayName: doc.displayName, owner: doc.owner };
                }
            }
        })
            .lean(),
        item_model_1.itemLean.countDocuments(filter)
    ]);
    const newItems = all[0].filter(item => item.companyId);
    const response = {
        count: all[1],
        data: newItems
    };
    return res.status(200).send(response);
});
exports.itemRoutes.get('/filterrandom/:prop/:val/:offset/:limit/:companyIdParam/:ecomerceCompat', async (req, res) => {
    const { companyIdParam, prop, val, ecomerceCompat } = req.params;
    let filter = { [prop]: { $regex: val, $options: 'i' } };
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam, [prop]: { $regex: val, $options: 'i' } };
    }
    if (ecomerceCompat === 'true') {
        filter = { ...filter, ecomerceCompat: true };
    }
    const all = await Promise.all([
        item_model_1.itemLean
            .find(filter)
            .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
            .populate({ path: 'companyId', model: stock_auth_server_1.companyLean,
            populate: [{
                    path: 'owner', model: stock_auth_server_1.userLean,
                    populate: [{
                            path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                        }],
                    transform: (doc) => ({ _id: doc._id, email: doc.email, phone: doc.phone, profilePic: doc.profilePic })
                }
            ],
            transform: (doc) => {
                if (doc.blocked) {
                    return null;
                }
                else {
                    return { _id: doc._id, displayName: doc.displayName, owner: doc.owner };
                }
            }
        })
            .sort({ timesViewed: 1, likesCount: 1, reviewCount: 1 })
            .lean(),
        item_model_1.itemLean.countDocuments(filter)
    ]);
    const newItems = all[0].filter(item => item.companyId);
    const response = {
        count: all[1],
        data: newItems
    };
    return res.status(200).send(response);
});
exports.itemRoutes.get('/getall/:offset/:limit/:companyIdParam/:ecomerceCompat', async (req, res) => {
    const { companyIdParam, ecomerceCompat } = req.params;
    let filter = {};
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam };
    }
    if (ecomerceCompat === 'true') {
        filter = { ...filter, ecomerceCompat: true };
    }
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const all = await Promise.all([
        item_model_1.itemLean
            .find(filter)
            .skip(offset)
            .limit(limit)
            .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
            .populate({ path: 'companyId', model: stock_auth_server_1.companyLean,
            populate: [{
                    path: 'owner', model: stock_auth_server_1.userLean,
                    populate: [{
                            path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                        }],
                    transform: (doc) => ({ _id: doc._id, email: doc.email, phone: doc.phone, profilePic: doc.profilePic })
                }
            ],
            transform: (doc) => {
                if (doc.blocked) {
                    return null;
                }
                else {
                    return { _id: doc._id, displayName: doc.displayName, owner: doc.owner };
                }
            }
        })
            .lean(),
        item_model_1.itemLean.countDocuments(filter)
    ]);
    const newItems = all[0].filter(item => item.companyId);
    const response = {
        count: all[1],
        data: newItems
    };
    return res.status(200).send(response);
});
exports.itemRoutes.get('/getbestsellers/:offset/:limit/:companyIdParam/:ecomerceCompat', async (req, res) => {
    const { companyIdParam, ecomerceCompat } = req.params;
    let filter = {};
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam };
    }
    if (ecomerceCompat === 'true') {
        filter = { ...filter, ecomerceCompat: true };
    }
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const all = await Promise.all([
        item_model_1.itemLean
            .find(filter)
            .skip(offset)
            .limit(limit)
            .sort({ soldCount: 1 })
            .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
            .populate({ path: 'companyId', model: stock_auth_server_1.companyLean,
            populate: [{
                    path: 'owner', model: stock_auth_server_1.userLean,
                    populate: [{
                            path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                        }],
                    transform: (doc) => ({ _id: doc._id, email: doc.email, phone: doc.phone, profilePic: doc.profilePic })
                }
            ],
            transform: (doc) => {
                if (doc.blocked) {
                    return null;
                }
                else {
                    return { _id: doc._id, displayName: doc.displayName, owner: doc.owner };
                }
            }
        })
            .lean(),
        item_model_1.itemLean.countDocuments(filter)
    ]);
    const newItems = all[0].filter(item => item.companyId);
    const response = {
        count: all[1],
        data: newItems
    };
    return res.status(200).send(response);
});
exports.itemRoutes.get('/gettodaysuggestions/:userId/:offset/:limit/:companyIdParam/:ecomerceCompat', async (req, res) => {
    const { userId, limit } = req.params;
    const stnCookie = req.signedCookies['settings'];
    const { ids, newOffset, newLimit } = await (0, user_behavoiur_controller_1.todaysRecomendation)(limit, stnCookie?.userCookieId, userId);
    let filter = { ecomerceCompat: true };
    if (ids && ids.length > 0) {
        filter = { ...filter, _id: { $in: ids } };
    }
    const all = await Promise.all([
        item_model_1.itemLean
            .find(filter)
            .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
            .sort({ timesViewed: 1 })
            .skip(newOffset)
            .limit(newLimit)
            .populate({ path: 'companyId', model: stock_auth_server_1.companyLean,
            populate: [{
                    path: 'owner', model: stock_auth_server_1.userLean,
                    populate: [{
                            path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                        }],
                    transform: (doc) => ({ _id: doc._id, email: doc.email, phone: doc.phone, profilePic: doc.profilePic })
                }
            ],
            transform: (doc) => {
                if (doc.blocked) {
                    return null;
                }
                else {
                    return { _id: doc._id, displayName: doc.displayName, owner: doc.owner };
                }
            }
        })
            .lean(),
        item_model_1.itemLean.countDocuments(filter)
    ]);
    const newItems = all[0].filter(item => item.companyId);
    const response = {
        count: all[1],
        data: newItems
    };
    return res.status(200).send(response);
});
exports.itemRoutes.get('/gettrending/:offset/:limit/:companyIdParam/:ecomerceCompat', async (req, res) => {
    const { companyIdParam, ecomerceCompat } = req.params;
    let filter = {};
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam };
    }
    if (ecomerceCompat === 'true') {
        filter = { ...filter, ecomerceCompat: true };
    }
    const all = await Promise.all([
        item_model_1.itemLean
            .find(filter)
            .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
            .sort({ timesViewed: 1 })
            .populate({ path: 'companyId', model: stock_auth_server_1.companyLean,
            populate: [{
                    path: 'owner', model: stock_auth_server_1.userLean,
                    populate: [{
                            path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                        }],
                    transform: (doc) => ({ _id: doc._id, email: doc.email, phone: doc.phone, profilePic: doc.profilePic })
                }
            ],
            transform: (doc) => {
                if (doc.blocked) {
                    return null;
                }
                else {
                    return { _id: doc._id, displayName: doc.displayName, owner: doc.owner };
                }
            }
        })
            .lean(),
        item_model_1.itemLean.countDocuments(filter)
    ]);
    const newItems = all[0].filter(item => item.companyId);
    const response = {
        count: all[1],
        data: newItems
    };
    return res.status(200).send(response);
});
exports.itemRoutes.get('/getbehaviourdecoy/:userId/offset/limit/:companyIdParam/:ecomerceCompat', async (req, res) => {
    const { userId } = req.params;
    const stnCookie = req.signedCookies['settings'];
    const { ids } = await (0, user_behavoiur_controller_1.getDecoyFromBehaviour)(stnCookie?.userCookieId, userId);
    const all = await Promise.all([
        item_model_1.itemLean
            .find({ _id: { $in: ids } })
            .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
            .sort({ timesViewed: 1 })
            .populate({ path: 'companyId', model: stock_auth_server_1.companyLean,
            populate: [{
                    path: 'owner', model: stock_auth_server_1.userLean,
                    populate: [{
                            path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                        }],
                    transform: (doc) => ({ _id: doc._id, email: doc.email, phone: doc.phone, profilePic: doc.profilePic })
                }
            ],
            transform: (doc) => {
                if (doc.blocked) {
                    return null;
                }
                else {
                    return { _id: doc._id, displayName: doc.displayName, owner: doc.owner };
                }
            }
        })
            .lean(),
        item_model_1.itemLean.countDocuments({ _id: { $in: ids } })
    ]);
    const newItems = all[0].filter(item => item.companyId);
    const response = {
        count: all[1],
        data: newItems
    };
    return res.status(200).send(response);
});
exports.itemRoutes.get('/getfeatured/:offset/:limit/:companyIdParam/:ecomerceCompat', async (req, res) => {
    const { companyIdParam, ecomerceCompat } = req.params;
    let filter = {};
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam };
    }
    if (ecomerceCompat === 'true') {
        filter = { ...filter, ecomerceCompat: true };
    }
    const all = await Promise.all([
        item_model_1.itemLean
            .find(filter)
            .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
            .sort({ timesViewed: 1, likesCount: 1, reviewCount: 1 })
            .populate({ path: 'companyId', model: stock_auth_server_1.companyLean,
            populate: [{
                    path: 'owner', model: stock_auth_server_1.userLean,
                    populate: [{
                            path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                        }],
                    transform: (doc) => ({ _id: doc._id, email: doc.email, phone: doc.phone, profilePic: doc.profilePic })
                }
            ],
            transform: (doc) => {
                if (doc.blocked) {
                    return null;
                }
                else {
                    return { _id: doc._id, displayName: doc.displayName, owner: doc.owner };
                }
            }
        })
            .lean(),
        item_model_1.itemLean.countDocuments(filter)
    ]);
    const newItems = all[0].filter(item => item.companyId);
    const response = {
        count: all[1],
        data: newItems
    };
    return res.status(200).send(response);
});
// newly posted
exports.itemRoutes.get('/getnew/:offset/:limit/:companyIdParam/:ecomerceCompat', async (req, res) => {
    const { companyIdParam, ecomerceCompat } = req.params;
    let filter = {};
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam };
    }
    if (ecomerceCompat === 'true') {
        filter = { ...filter, ecomerceCompat: true };
    }
    const all = await Promise.all([
        item_model_1.itemLean
            .find(filter)
            .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
            .sort({ createdAt: -1 })
            .populate({ path: 'companyId', model: stock_auth_server_1.companyLean,
            populate: [{
                    path: 'owner', model: stock_auth_server_1.userLean,
                    populate: [{
                            path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                        }],
                    transform: (doc) => ({ _id: doc._id, email: doc.email, phone: doc.phone, profilePic: doc.profilePic })
                }
            ],
            transform: (doc) => {
                if (doc.blocked) {
                    return null;
                }
                else {
                    return { _id: doc._id, displayName: doc.displayName, owner: doc.owner };
                }
            }
        })
            .lean(),
        item_model_1.itemLean.countDocuments(filter)
    ]);
    const newItems = all[0].filter(item => item.companyId);
    const response = {
        count: all[1],
        data: newItems
    };
    return res.status(200).send(response);
});
// new not used
exports.itemRoutes.get('/getbrandnew/:offset/:limit/:companyIdParam/:ecomerceCompat', async (req, res) => {
    const { companyIdParam, ecomerceCompat } = req.params;
    let filter = { state: 'new' };
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam, state: 'new' };
    }
    if (ecomerceCompat === 'true') {
        filter = { ...filter, ecomerceCompat: true };
    }
    const all = await Promise.all([
        item_model_1.itemLean
            .find(filter)
            .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
            .sort({ createdAt: -1 })
            .populate({ path: 'companyId', model: stock_auth_server_1.companyLean,
            populate: [{
                    path: 'owner', model: stock_auth_server_1.userLean,
                    populate: [{
                            path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                        }],
                    transform: (doc) => ({ _id: doc._id, email: doc.email, phone: doc.phone, profilePic: doc.profilePic })
                }
            ],
            transform: (doc) => {
                if (doc.blocked) {
                    return null;
                }
                else {
                    return { _id: doc._id, displayName: doc.displayName, owner: doc.owner };
                }
            }
        })
            .lean(),
        item_model_1.itemLean.countDocuments(filter)
    ]);
    const newItems = all[0].filter(item => item.companyId);
    const response = {
        count: all[1],
        data: newItems
    };
    return res.status(200).send(response);
});
// new not used
exports.itemRoutes.get('/getused/:offset/:limit/:companyIdParam/:ecomerceCompat', async (req, res) => {
    const { companyIdParam, ecomerceCompat } = req.params;
    let filter = { state: 'refurbished' };
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam, state: 'refurbished' };
    }
    if (ecomerceCompat === 'true') {
        filter = { ...filter, ecomerceCompat: true };
    }
    const all = await Promise.all([
        item_model_1.itemLean
            .find(filter)
            .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
            .sort({ createdAt: -1 })
            .populate({ path: 'companyId', model: stock_auth_server_1.companyLean,
            populate: [{
                    path: 'owner', model: stock_auth_server_1.userLean,
                    populate: [{
                            path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                        }],
                    transform: (doc) => ({ _id: doc._id, email: doc.email, phone: doc.phone, profilePic: doc.profilePic })
                }
            ],
            transform: (doc) => {
                if (doc.blocked) {
                    return null;
                }
                else {
                    return { _id: doc._id, displayName: doc.displayName, owner: doc.owner };
                }
            }
        })
            .lean(),
        item_model_1.itemLean.countDocuments(filter)
    ]);
    const newItems = all[0].filter(item => item.companyId);
    const response = {
        count: all[1],
        data: newItems
    };
    return res.status(200).send(response);
});
// filterprice
exports.itemRoutes.get('/filterprice/max/:priceFilterValue/:offset/:limit/:companyIdParam/:ecomerceCompat', async (req, res) => {
    const { companyIdParam, ecomerceCompat } = req.params;
    let filter = {};
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam };
    }
    if (ecomerceCompat === 'true') {
        filter = { ...filter, ecomerceCompat: true };
    }
    const { priceFilterValue } = req.params;
    const all = await Promise.all([
        item_model_1.itemLean
            .find(filter)
            .gte('costMeta.sellingPrice', Number(priceFilterValue))
            .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
            .sort({ createdAt: -1 })
            .populate({ path: 'companyId', model: stock_auth_server_1.companyLean,
            populate: [{
                    path: 'owner', model: stock_auth_server_1.userLean,
                    populate: [{
                            path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                        }],
                    transform: (doc) => ({ _id: doc._id, email: doc.email, phone: doc.phone, profilePic: doc.profilePic })
                }
            ],
            transform: (doc) => {
                if (doc.blocked) {
                    return null;
                }
                else {
                    return { _id: doc._id, displayName: doc.displayName, owner: doc.owner };
                }
            }
        })
            .lean(),
        item_model_1.itemLean.countDocuments(filter)
    ]);
    const newItems = all[0].filter(item => item.companyId);
    const response = {
        count: all[1],
        data: newItems
    };
    return res.status(200).send(response);
});
exports.itemRoutes.get('/filterprice/min/:priceFilterValue/:offset/:limit/:companyIdParam/:ecomerceCompat', async (req, res) => {
    const { companyIdParam, ecomerceCompat } = req.params;
    let filter = {};
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam };
    }
    if (ecomerceCompat === 'true') {
        filter = { ...filter, ecomerceCompat: true };
    }
    const { priceFilterValue } = req.params;
    const all = await Promise.all([
        item_model_1.itemLean
            .find(filter)
            .lte('costMeta.sellingPrice', Number(priceFilterValue))
            .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
            .sort({ createdAt: -1 })
            .populate({ path: 'companyId', model: stock_auth_server_1.companyLean,
            populate: [{
                    path: 'owner', model: stock_auth_server_1.userLean,
                    populate: [{
                            path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                        }],
                    transform: (doc) => ({ _id: doc._id, email: doc.email, phone: doc.phone, profilePic: doc.profilePic })
                }
            ],
            transform: (doc) => {
                if (doc.blocked) {
                    return null;
                }
                else {
                    return { _id: doc._id, displayName: doc.displayName, owner: doc.owner };
                }
            }
        })
            .lean(),
        item_model_1.itemLean.countDocuments(filter)
    ]);
    const newItems = all[0].filter(item => item.companyId);
    const response = {
        count: all[1],
        data: newItems
    };
    return res.status(200).send(response);
});
exports.itemRoutes.get('/filterprice/eq/:priceFilterMinValue/:priceFilterMaxValue/:offset/:limit/:companyIdParam/:ecomerceCompat', async (req, res) => {
    const { companyIdParam, ecomerceCompat } = req.params;
    let filter = {};
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam };
    }
    if (ecomerceCompat === 'true') {
        filter = { ...filter, ecomerceCompat: true };
    }
    const { priceFilterMinValue, priceFilterMaxValue } = req.params;
    const all = await Promise.all([
        item_model_1.itemLean
            .find(filter)
            .gte('costMeta.sellingPrice', Number(priceFilterMaxValue))
            .lte('costMeta.sellingPrice', Number(priceFilterMinValue))
            .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
            .sort({ createdAt: -1 })
            .populate({ path: 'companyId', model: stock_auth_server_1.companyLean,
            populate: [{
                    path: 'owner', model: stock_auth_server_1.userLean,
                    populate: [{
                            path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                        }],
                    transform: (doc) => ({ _id: doc._id, email: doc.email, phone: doc.phone, profilePic: doc.profilePic })
                }
            ],
            transform: (doc) => {
                if (doc.blocked) {
                    return null;
                }
                else {
                    return { _id: doc._id, displayName: doc.displayName, owner: doc.owner };
                }
            }
        })
            .lean(),
        item_model_1.itemLean.countDocuments(filter)
    ]);
    const newItems = all[0].filter(item => item.companyId);
    const response = {
        count: all[1],
        data: newItems
    };
    return res.status(200).send(response);
});
exports.itemRoutes.get('/filterstars/:starVal/:offset/:limit/:companyIdParam/:ecomerceCompat', async (req, res) => {
    const { companyIdParam, ecomerceCompat } = req.params;
    let filter = {};
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam };
    }
    if (ecomerceCompat === 'true') {
        filter = { ...filter, ecomerceCompat: true };
    }
    const starVal = Number(req.params.starVal);
    const all = await Promise.all([
        review_model_1.reviewLean
            .find(filter)
            .where('rating') // rating
            .lte(starVal + 2)
            .gte(starVal)
            .select({ itemId: 1 })
            .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
            .lean()
            .populate({ path: 'companyId', model: stock_auth_server_1.companyLean,
            populate: [{
                    path: 'owner', model: stock_auth_server_1.userLean,
                    populate: [{
                            path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                        }],
                    transform: (doc) => ({ _id: doc._id, email: doc.email, phone: doc.phone, profilePic: doc.profilePic })
                }
            ],
            transform: (doc) => {
                if (doc.blocked) {
                    return null;
                }
                else {
                    return { _id: doc._id, displayName: doc.displayName, owner: doc.owner };
                }
            }
        })
            .lean(),
        review_model_1.reviewLean.countDocuments(filter)
    ]);
    const newItems = all[0].filter(val => val.companyId);
    const response = {
        count: all[1],
        data: newItems
    };
    return res.status(200).send(response);
});
exports.itemRoutes.get('/discount/:discountValue/:offset/:limit/:companyIdParam/:ecomerceCompat', async (req, res) => {
    const { companyIdParam, ecomerceCompat } = req.params;
    let filter = {};
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (isValid) {
        filter = { companyId: companyIdParam };
    }
    if (ecomerceCompat === 'true') {
        filter = { ...filter, ecomerceCompat: true };
    }
    const { discountValue } = req.params;
    const all = await Promise.all([
        item_model_1.itemLean
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
            .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
            .sort({ createdAt: -1 })
            .populate({ path: 'companyId', model: stock_auth_server_1.companyLean,
            populate: [{
                    path: 'owner', model: stock_auth_server_1.userLean,
                    populate: [{
                            path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                        }],
                    transform: (doc) => ({ _id: doc._id, email: doc.email, phone: doc.phone, profilePic: doc.profilePic })
                }
            ],
            transform: (doc) => {
                if (doc.blocked) {
                    return null;
                }
                else {
                    return { _id: doc._id, displayName: doc.displayName, owner: doc.owner };
                }
            }
        })
            .lean(),
        item_model_1.itemLean.countDocuments(filter)
    ]);
    const newItems = all[0].filter(item => item.companyId);
    const response = {
        count: all[1],
        data: newItems
    };
    return res.status(200).send(response);
});
exports.itemRoutes.post('/getsponsored/:companyIdParam', async (req, res) => {
    const { companyIdParam } = req.params;
    const ids = req.body.sponsored;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    let filter = { _id: { $in: ids } };
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (isValid) {
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
        .find(filter)
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .lean()
        .sort({ timesViewed: 1 })
        .populate({ path: 'companyId', model: stock_auth_server_1.companyLean,
        populate: [{
                path: 'owner', model: stock_auth_server_1.userLean,
                populate: [{
                        path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                    }],
                transform: (doc) => ({ _id: doc._id, email: doc.email, phone: doc.phone, profilePic: doc.profilePic })
            }
        ],
        transform: (doc) => {
            if (doc.blocked) {
                return null;
            }
            else {
                return { _id: doc._id, displayName: doc.displayName, owner: doc.owner };
            }
        }
    })
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
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .sort({ createdAt: -1 })
        .populate({ path: 'companyId', model: stock_auth_server_1.companyLean,
        populate: [{
                path: 'owner', model: stock_auth_server_1.userLean,
                populate: [{
                        path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                    }],
                transform: (doc) => ({ _id: doc._id, email: doc.email, phone: doc.phone, profilePic: doc.profilePic })
            }
        ],
        transform: (doc) => {
            if (doc.blocked) {
                return null;
            }
            else {
                return { _id: doc._id, displayName: doc.displayName, owner: doc.owner };
            }
        }
    })
        .lean();
    const newItems = items.filter(item => item.companyId);
    const filtered = newItems.filter(p => p.sponsored?.length && p.sponsored?.length > 0);
    return res.status(200).send(filtered);
});
exports.itemRoutes.put('/addsponsored/:id/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('items', 'update'), async (req, res) => {
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
exports.itemRoutes.put('/updatesponsored/:id/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('items', 'update'), stock_universal_server_1.deleteFiles, async (req, res) => {
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
exports.itemRoutes.delete('/deletesponsored/:id/:spnsdId/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('items', 'update'), async (req, res) => {
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
exports.itemRoutes.put('/deleteone/:id/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('items', 'delete'), async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // start by removing offers
    await itemoffer_model_1.itemOfferMain.deleteMany({ companyId: queryId, items: { $elemMatch: { $in: [id] } } });
    // also remove decoys
    await itemdecoy_model_1.itemDecoyMain.deleteMany({ companyId: queryId, items: { $elemMatch: { $in: [id] } } });
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const found = await item_model_1.itemMain.findOne({ _id: id, companyId: queryId })
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .populate({ path: 'video', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .lean();
    if (found) {
        let filesWithDir = found.photos.map(photo => ({
            _id: photo._id,
            url: photo.url
        }));
        if (found.video) {
            filesWithDir = [...filesWithDir, ...[found.video]];
        }
        await (0, stock_universal_server_1.deleteAllFiles)(filesWithDir);
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
exports.itemRoutes.put('/deletefiles/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('items', 'delete'), stock_universal_server_1.deleteFiles, async (req, res) => {
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
        .findOneAndUpdate({ _id, companyId: queryId });
    if (!item) {
        return res.status(404).send({ success: false, err: 'item not found' });
    }
    const filesWithDirIds = filesWithDir.map(val => val._id);
    const photos = item.photos;
    item.photos = photos
        .filter((p) => !filesWithDirIds.includes(p));
    if (item.video && filesWithDirIds.includes(item.video)) {
        item.video = null;
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
exports.itemRoutes.post('/search/:offset/:limit/:companyIdParam;userId', async (req, res) => {
    const { searchterm, searchKey, category, extraFilers, subCategory, ecomerceCompat } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const stnCookie = req.signedCookies['settings'];
    (0, user_behavoiur_controller_1.registerSearchParams)(searchterm, '', stnCookie?.userCookieId, req.params.userId);
    const { companyIdParam } = req.params;
    if (companyIdParam !== 'undefined') {
        itemRoutesLogger.info('filter item with 999999 def');
        const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
    }
    itemRoutesLogger.info('filter item with 11111');
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
    if (ecomerceCompat === 'true') {
        filter = { ...filter, ecomerceCompat: true };
    }
    if (companyIdParam !== 'undefined') {
        filter = { ...filter, companyId: companyIdParam };
    }
    itemRoutesLogger.info('filter item with 22222');
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
            /* default:
              return res.status(401).send({ success: false, err: 'unauthorised' }); */
        }
    }
    /* TODO proper regex
    const searchFields = ['name', 'description', 'category', 'subCategory', 'brand'];
    const searchRegex = { $regex: searchterm, $options: 'i' };
    const searchQuery = searchFields.reduce((acc, field) => {
      acc[field] = searchRegex;
      return acc;
    }, {}); */
    const all = await Promise.all([
        item_model_1.itemLean
            .find({ [searchKey]: { $regex: searchterm, $options: 'i' }, ...filter })
            .skip(offset)
            .limit(limit)
            .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
            .populate({ path: 'companyId', model: stock_auth_server_1.companyLean,
            populate: [{
                    path: 'owner', model: stock_auth_server_1.userLean,
                    populate: [{
                            path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                        }],
                    transform: (doc) => ({ _id: doc._id, email: doc.email, phone: doc.phone, profilePic: doc.profilePic })
                }
            ],
            transform: (doc) => {
                if (doc.blocked) {
                    return null;
                }
                else {
                    return { _id: doc._id, displayName: doc.displayName, owner: doc.owner };
                }
            }
        })
            .lean(),
        item_model_1.itemLean.countDocuments({ [searchKey]: { $regex: searchterm, $options: 'i' }, ...filter })
    ]);
    const newItems = all[0].filter(item => item.companyId);
    const response = {
        count: all[1],
        data: newItems
    };
    return res.status(200).send(response);
});
exports.itemRoutes.put('/deletemany/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('items', 'delete'), async (req, res) => {
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
    let filesWithDir;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const alltoDelete = await item_model_1.itemLean.find({ _id: { $in: ids } })
        .populate({ path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .populate({ path: 'profileCoverPic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .populate({ path: 'video', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .lean();
    for (const user of alltoDelete) {
        if (user.photos?.length > 0) {
            filesWithDir = [...filesWithDir, ...user.photos];
        }
        if (user.video) {
            filesWithDir = [...filesWithDir, ...[user.video]];
        }
    }
    await (0, stock_universal_server_1.deleteAllFiles)(filesWithDir);
    const deleted = await item_model_1.itemMain
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