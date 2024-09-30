"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeReview = exports.addReview = exports.itemRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const item_model_1 = require("../models/item.model");
const itemdecoy_model_1 = require("../models/itemdecoy.model");
const itemoffer_model_1 = require("../models/itemoffer.model");
const user_behavoiur_1 = require("../utils/user-behavoiur");
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
const removeReview = async (req, res) => {
    const { userId } = req.user;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const { itemId, rating } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([itemId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await item_model_1.itemMain
        .findOneAndUpdate({ _id: itemId, ...filter });
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
exports.itemRoutes.post('/add', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_auth_server_1.requireCanUseFeature)('item'), (0, stock_universal_server_1.roleAuthorisation)('items', 'create'), async (req, res, next) => {
    const { item } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    item.companyId = filter.companyId;
    item.urId = await (0, stock_universal_server_1.generateUrId)(item_model_1.itemMain);
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
        return err;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    if (saved && saved._id) {
        (0, stock_universal_server_1.addParentToLocals)(res, saved._id, item_model_1.itemMain.collection.collectionName, 'makeTrackEdit');
    }
    if (!Boolean(saved)) {
        return res.status(403).send('unknown error');
    }
    next();
}, (0, stock_auth_server_1.requireUpdateSubscriptionRecord)('item'));
exports.itemRoutes.post('/add/img', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_auth_server_1.requireCanUseFeature)('item'), (0, stock_universal_server_1.roleAuthorisation)('items', 'create'), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, async (req, res, next) => {
    const item = req.body.item;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    item.companyId = filter.companyId;
    item.ecomerceCompat = true;
    item.urId = await (0, stock_universal_server_1.generateUrId)(item_model_1.itemMain);
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
        return err;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    if (saved && saved._id) {
        (0, stock_universal_server_1.addParentToLocals)(res, saved._id, item_model_1.itemMain.collection.collectionName, 'makeTrackEdit');
    }
    if (!Boolean(saved)) {
        return res.status(403).send('unknown error');
    }
    next();
}, (0, stock_auth_server_1.requireUpdateSubscriptionRecord)('item'));
exports.itemRoutes.put('/update', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('items', 'update'), async (req, res) => {
    const updatedProduct = req.body.item;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    updatedProduct.companyId = filter.companyId;
    // const { _id } = updatedProduct;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([updatedProduct._id]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await item_model_1.itemMain
        .findOne({ _id: updatedProduct._id, ...filter });
    if (!item) {
        return res.status(404).send({ success: false });
    }
    if (!item.urId || item.urId === '0') {
        item.urId = await (0, stock_universal_server_1.generateUrId)(item_model_1.itemMain);
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
exports.itemRoutes.post('/update/img', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('items', 'update'), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, async (req, res) => {
    const updatedProduct = req.body.item;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const { _id } = updatedProduct;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await item_model_1.itemMain
        .findOne({ _id, ...filter });
    if (!item) {
        return res.status(404).send({ success: false });
    }
    if (!item.urId || item.urId === '0') {
        item.urId = await (0, stock_universal_server_1.generateUrId)(item_model_1.itemMain);
    }
    const parsed = req.body;
    if (parsed && parsed.newPhotos) {
        const oldPhotos = item.photos || [];
        item.photos = [...oldPhotos, ...parsed.newPhotos];
    }
    if (parsed && parsed.newVideos) {
        const meta = await stock_universal_server_1.fileMetaLean.findById(item.video);
        if (meta) {
            await (0, stock_universal_server_1.deleteAllFiles)([meta], true);
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
exports.itemRoutes.put('/like/:itemId', stock_universal_server_1.requireAuth, async (req, res) => {
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const { userId } = req.user;
    const { itemId } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([itemId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await item_model_1.itemMain
        .findOneAndUpdate({ _id: itemId, ...filter });
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
    const { companyId } = req.user;
    const { userId } = req.user;
    const { itemId } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([itemId, companyId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await item_model_1.itemMain
        .findOneAndUpdate({ _id: itemId });
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
exports.itemRoutes.get('/one/:urId', stock_universal_server_1.appendUserToReqIfTokenExist, async (req, res) => {
    const { urId } = req.params;
    const filter = { urId };
    const item = await item_model_1.itemLean
        .findOne({ ...filter })
        .populate([(0, stock_auth_server_1.populatePhotos)(true), (0, stock_auth_server_1.populateCompany)()])
        .lean();
    if (!item || !item.companyId) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    (0, stock_universal_server_1.addParentToLocals)(res, item._id, item_model_1.itemMain.collection.collectionName, 'trackDataView');
    return res.status(200).send(item);
});
exports.itemRoutes.get('/all/:offset/:limit/:ecomerceCompat', stock_universal_server_1.appendUserToReqIfTokenExist, async (req, res) => {
    const { ecomerceCompat } = req.params;
    let filter = {};
    if (ecomerceCompat === 'true') {
        filter = { ...filter, ecomerceCompat: true };
    }
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const all = await Promise.all([
        item_model_1.itemLean
            .find({ ...filter, ...(0, stock_universal_server_1.makePredomFilter)(req) })
            .skip(offset)
            .limit(limit)
            .populate([(0, stock_auth_server_1.populatePhotos)(true), (0, stock_auth_server_1.populateCompany)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()])
            .lean(),
        item_model_1.itemLean.countDocuments({ ...filter, ...(0, stock_universal_server_1.makePredomFilter)(req) })
    ]);
    const newItems = all[0].filter(item => item.companyId);
    const response = {
        count: all[1],
        data: newItems
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, item_model_1.itemMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.itemRoutes.get('/gettodaysuggestions/:offset/:limit/:ecomerceCompat', stock_universal_server_1.appendUserToReqIfTokenExist, async (req, res) => {
    const { limit } = req.params;
    const { userId } = req.user;
    const stnCookie = req.signedCookies['settings'];
    const { _ids, newOffset, newLimit } = await (0, user_behavoiur_1.todaysRecomendation)(Number(limit), stnCookie?.userCookieId, userId);
    let filter = { ecomerceCompat: true };
    if (_ids && _ids.length > 0) {
        filter = { ...filter, _id: { $in: _ids } };
    }
    const all = await Promise.all([
        item_model_1.itemLean
            .find({ ...filter, ...(0, stock_universal_server_1.makePredomFilter)(req) })
            .sort({ timesViewed: 1 })
            .skip(newOffset)
            .limit(newLimit)
            .populate([(0, stock_auth_server_1.populatePhotos)(true), (0, stock_auth_server_1.populateCompany)()])
            .lean(),
        item_model_1.itemLean.countDocuments({ ...filter, ...(0, stock_universal_server_1.makePredomFilter)(req) })
    ]);
    const newItems = all[0].filter(item => item.companyId);
    const response = {
        count: all[1],
        data: newItems
    };
    for (const val of newItems) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, item_model_1.itemMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.itemRoutes.get('/getbehaviourdecoy/offset/limit/:ecomerceCompat', stock_universal_server_1.appendUserToReqIfTokenExist, async (req, res) => {
    const { userId } = req.user;
    const stnCookie = req.signedCookies['settings'];
    const { _ids } = await (0, user_behavoiur_1.getDecoyFromBehaviour)(stnCookie?.userCookieId, userId);
    const all = await Promise.all([
        item_model_1.itemLean
            .find({ _id: { $in: _ids }, ...(0, stock_universal_server_1.makePredomFilter)(req) })
            .sort({ timesViewed: 1 })
            .populate([(0, stock_auth_server_1.populatePhotos)(true), (0, stock_auth_server_1.populateCompany)()])
            .lean(),
        item_model_1.itemLean.countDocuments({ _id: { $in: _ids }, ...(0, stock_universal_server_1.makePredomFilter)(req) })
    ]);
    const newItems = all[0].filter(item => item.companyId);
    const response = {
        count: all[1],
        data: newItems
    };
    for (const val of newItems) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, item_model_1.itemMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.itemRoutes.get('/getfeatured/:offset/:limit/:ecomerceCompat', stock_universal_server_1.appendUserToReqIfTokenExist, async (req, res) => {
    const { ecomerceCompat } = req.params;
    let filter = {};
    if (ecomerceCompat === 'true') {
        filter = { ...filter, ecomerceCompat: true };
    }
    const all = await Promise.all([
        item_model_1.itemLean
            .find({ ...filter, ...(0, stock_universal_server_1.makePredomFilter)(req) })
            .sort({ timesViewed: 1, likesCount: 1, reviewCount: 1 })
            .populate([(0, stock_auth_server_1.populatePhotos)(true), (0, stock_auth_server_1.populateCompany)()])
            .lean(),
        item_model_1.itemLean.countDocuments({ ...filter, ...(0, stock_universal_server_1.makePredomFilter)(req) })
    ]);
    const newItems = all[0].filter(item => item.companyId);
    const response = {
        count: all[1],
        data: newItems
    };
    for (const val of newItems) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, item_model_1.itemMain.collection.collectionName, 'trackDataView');
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
exports.itemRoutes.post('/sponsored/get', stock_universal_server_1.appendUserToReqIfTokenExist, async (req, res) => {
    const _ids = req.body._ids;
    const filter = { _id: { $in: _ids } };
    if (_ids && _ids.length > 0) {
        for (const id of _ids) {
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
        .find({ ...filter, ...(0, stock_universal_server_1.makePredomFilter)(req) })
        .lean()
        .sort({ timesViewed: 1 })
        .populate([(0, stock_auth_server_1.populatePhotos)(true), (0, stock_auth_server_1.populateCompany)()])
        .lean();
    const newItems = items.filter(item => item.companyId);
    for (const val of newItems) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, item_model_1.itemMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(newItems);
});
exports.itemRoutes.get('/getoffered', stock_universal_server_1.appendUserToReqIfTokenExist, async (req, res) => {
    const filter = {};
    const items = await item_model_1.itemLean
        .find({ ...filter, ...(0, stock_universal_server_1.makePredomFilter)(req) })
        .populate({ path: 'sponsored', model: item_model_1.itemLean,
        populate: [{
                path: 'photos', model: stock_universal_server_1.fileMetaLean
            }
        ]
    })
        .sort({ createdAt: -1 })
        .populate([(0, stock_auth_server_1.populatePhotos)(true), (0, stock_auth_server_1.populateCompany)()])
        .lean();
    const newItems = items.filter(item => item.companyId);
    const filtered = newItems.filter(p => p.sponsored?.length && p.sponsored?.length > 0);
    return res.status(200).send(filtered);
});
exports.itemRoutes.put('/sponsored/add/:_id', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('items', 'update'), async (req, res) => {
    const { _id } = req.params;
    const { sponsored } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const item = await item_model_1.itemMain.findByIdAndUpdate(_id);
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
exports.itemRoutes.put('/sponsored/update/:_id', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('items', 'update'), async (req, res) => {
    const { _id } = req.params;
    const { sponsored } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const item = await item_model_1.itemMain.findOneAndUpdate({ _id, ...filter });
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
exports.itemRoutes.delete('/sponsored/delete/:_id/:spnsdId', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('items', 'update'), async (req, res) => {
    const { _id, spnsdId } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const item = await item_model_1.itemMain.findOneAndUpdate({ _id, ...filter });
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
exports.itemRoutes.put('/delete/one/:_id', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('items', 'delete'), async (req, res) => {
    const { _id } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    // start by removing offers
    await itemoffer_model_1.itemOfferMain.deleteMany({ ...filter, items: { $elemMatch: { $in: [_id] } } });
    // also remove decoys
    await itemdecoy_model_1.itemDecoyMain.deleteMany({ ...filter, items: { $elemMatch: { $in: [_id] } } });
    const found = await item_model_1.itemMain.findOne({ _id, ...filter })
        .populate([(0, stock_auth_server_1.populatePhotos)(true)])
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
    // const deleted = await itemMain.findOneAndDelete({ _id, ...filter });
    const deleted = await item_model_1.itemMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } });
    if (Boolean(deleted)) {
        (0, stock_universal_server_1.addParentToLocals)(res, _id, item_model_1.itemMain.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.itemRoutes.put('/deletefiles', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('items', 'delete'), (0, stock_universal_server_1.deleteFiles)(true), async (req, res) => {
    const filesWithDir = req.body.filesWithDir;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    if (filesWithDir && !filesWithDir.length) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const updatedProduct = req.body.item;
    const { _id } = updatedProduct;
    const item = await item_model_1.itemMain
        .findOneAndUpdate({ _id, ...filter });
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
exports.itemRoutes.post('/filter', stock_universal_server_1.appendUserToReqIfTokenExist, async (req, res) => {
    const { userId } = req.user;
    const { searchterm, propSort } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const stnCookie = req.signedCookies['settings'];
    const filter = (0, stock_universal_server_1.constructFiltersFromBody)(req);
    if (searchterm && userId) {
        (0, user_behavoiur_1.registerSearchParams)(searchterm, '', stnCookie?.userCookieId, userId);
    }
    const aggCursor = item_model_1.itemLean.aggregate([
        {
            $match: {
                $and: [
                    // { status: 'pending' },
                    ...filter
                ]
            }
        },
        ...(0, stock_universal_server_1.lookupTrackEdit)(),
        ...(0, stock_universal_server_1.lookupTrackView)(),
        {
            $facet: {
                data: [...(0, stock_universal_server_1.lookupSort)(propSort), ...(0, stock_universal_server_1.lookupOffset)(offset), ...(0, stock_universal_server_1.lookupLimit)(limit)],
                total: [{ $count: 'count' }]
            }
        },
        {
            $unwind: {
                path: '$total',
                preserveNullAndEmptyArrays: true
            }
        }
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
exports.itemRoutes.put('/delete/many', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('items', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    // start by removing offers
    /* await itemOfferMain.deleteMany({  items: { $elemMatch: { $in: _ids } } }); */
    // TODO tarack ehe
    await itemoffer_model_1.itemOfferMain.updateOne({ ...filter, items: { $elemMatch: { $in: _ids } } }, {
        $set: { isDeleted: true }
    });
    // also remove decoys
    /* await itemDecoyMain.deleteMany({  items: { $elemMatch: { $in: _ids } } }); */
    // TODO TARC
    await itemdecoy_model_1.itemDecoyMain.updateOne({ ...filter, items: { $elemMatch: { $in: _ids } } }, {
        $set: { isDeleted: true }
    });
    let filesWithDir;
    const alltoDelete = await item_model_1.itemLean.find({ _id: { $in: _ids } })
        .populate([(0, stock_auth_server_1.populatePhotos)(true)])
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
    /* const deleted = await itemMain
    .deleteMany({ _id: { $in: _ids } })
    .catch(err => {
      itemRoutesLogger.error('deletemany - err: ', err);

      return null;
    }); */
    const deleted = await item_model_1.itemMain
        .updateMany({ _id: { $in: _ids } }, {
        $set: { isDeleted: true }
    })
        .catch(err => {
        itemRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        for (const val of _ids) {
            (0, stock_universal_server_1.addParentToLocals)(res, val, item_model_1.itemMain.collection.collectionName, 'trackDataDelete');
        }
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({
            success: Boolean(deleted), err: 'could not delete selected items, try again in a while'
        });
    }
});
//# sourceMappingURL=item.routes.js.map