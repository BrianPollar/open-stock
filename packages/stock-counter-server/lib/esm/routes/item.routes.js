/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { itemLean, itemMain } from '../models/item.model';
import { reviewLean } from '../models/review.model';
import { getLogger } from 'log4js';
import { makeRandomString } from '@open-stock/stock-universal';
import { appendBody, deleteFiles, makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, uploadFiles, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import { itemOfferMain } from '../models/itemoffer.model';
import { itemDecoyMain } from '../models/itemdecoy.model';
/** */
const itemRoutesLogger = getLogger('routes/itemRoutes');
/** */
export const itemRoutes = express.Router();
/** */
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
/** */
export const removeReview = async (req, res) => {
    const { userId } = req.user;
    const { itemId, rating } = req.params;
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
itemRoutes.post('/create', requireAuth, roleAuthorisation('items'), uploadFiles, appendBody, async (req, res) => {
    const item = req.body.item;
    const count = await itemMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    item.urId = makeUrId(Number(count[0]?.urId || '0'));
    item.photos = req.body.newFiles || [];
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
itemRoutes.put('/update', requireAuth, roleAuthorisation('items'), async (req, res) => {
    const updatedProduct = req.body.item;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedProduct;
    const isValid = verifyObjectId(_id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await itemMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findByIdAndUpdate(_id);
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
itemRoutes.post('/updateimg', requireAuth, roleAuthorisation('items'), uploadFiles, appendBody, async (req, res) => {
    const updatedProduct = req.body.item;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedProduct;
    const isValid = verifyObjectId(_id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await itemMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findByIdAndUpdate(_id);
    if (!item) {
        return res.status(404).send({ success: false });
    }
    if (!item.urId || item.urId === '0') {
        const count = makeRandomString(3, 'numbers');
        item.urId = makeUrId(Number(count));
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
itemRoutes.put('/like/:itemId', requireAuth, async (req, res) => {
    const { userId } = req.user;
    const { itemId } = req.params;
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
itemRoutes.put('/unlike/:itemId', requireAuth, async (req, res) => {
    const { userId } = req.user;
    const { itemId } = req.params;
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
itemRoutes.get('/getone/:urId', async (req, res) => {
    const { urId } = req.params;
    const item = await itemLean
        .findOne({ urId })
        .lean();
    return res.status(200).send(item);
});
itemRoutes.get('/filtergeneral/:prop/:val/:offset/:limit', async (req, res) => {
    const { prop, val } = req.params;
    const items = await itemLean
        .find({ [prop]: { $regex: val, $options: 'i' } })
        .lean();
    return res.status(200).send(items);
});
itemRoutes.get('/getall/:offset/:limit', async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const items = await itemLean
        .find({})
        .skip(offset)
        .limit(limit)
        .lean();
    return res.status(200).send(items);
});
itemRoutes.get('/gettrending/:offset/:limit', async (req, res) => {
    const items = await itemLean
        .find({})
        .lean()
        .sort({ timesViewed: 1 });
    return res.status(200).send(items);
});
// newly posted
itemRoutes.get('/getnew/:offset/:limit', async (req, res) => {
    const items = await itemLean
        .find({})
        .lean()
        .sort({ createdAt: -1 });
    return res.status(200).send(items);
});
// new not used
itemRoutes.get('/getbrandnew/:offset/:limit', async (req, res) => {
    const items = await itemLean
        .find({ state: 'new' })
        .lean()
        .sort({ createdAt: -1 });
    return res.status(200).send(items);
});
// new not used
itemRoutes.get('/getused/:offset/:limit', async (req, res) => {
    const items = await itemLean
        .find({ state: 'refurbished' })
        .lean()
        .sort({ createdAt: -1 });
    return res.status(200).send(items);
});
// filterprice
itemRoutes.get('/filterprice/max/:priceFilterValue/:offset/:limit', async (req, res) => {
    const { priceFilterValue } = req.params;
    const items = await itemLean
        .find({})
        .gte('costMeta.sellingPrice', Number(priceFilterValue))
        .lean()
        .sort({ createdAt: -1 });
    return res.status(200).send(items);
});
itemRoutes.get('/filterprice/min/:priceFilterValue/:offset/:limit', async (req, res) => {
    const { priceFilterValue } = req.params;
    const items = await itemLean
        .find({})
        .lte('costMeta.sellingPrice', Number(priceFilterValue))
        .lean()
        .sort({ createdAt: -1 });
    return res.status(200).send(items);
});
itemRoutes.get('/filterprice/eq/:priceFilterMinValue/:priceFilterMaxValue/:offset/:limit', async (req, res) => {
    const { priceFilterMinValue, priceFilterMaxValue } = req.params;
    const items = await itemLean
        .find({})
        .gte('costMeta.sellingPrice', Number(priceFilterMaxValue))
        .lte('costMeta.sellingPrice', Number(priceFilterMinValue))
        .lean()
        .sort({ createdAt: -1 });
    return res.status(200).send(items);
});
itemRoutes.get('/filterstars/:starVal/:offset/:limit', async (req, res) => {
    const starVal = Number(req.params.starVal);
    const reviews = await reviewLean
        .find({})
        .where('rating') // rating
        .lte(starVal + 2)
        .gte(starVal)
        .select({ itemId: 1 })
        .lean()
        .populate({ path: 'itemId', model: itemLean });
    const items = reviews
        .map(val => val.itemId);
    return res.status(200).send(items);
});
itemRoutes.get('/discount/:discountValue/:offset/:limit', async (req, res) => {
    const { discountValue } = req.params;
    const items = await itemLean
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
itemRoutes.post('/getsponsored', async (req, res) => {
    const ids = req.body.sponsored;
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
        .find({ _id: { $in: ids } })
        .lean()
        .sort({ timesViewed: 1 });
    return res.status(200).send(items);
});
itemRoutes.get('/getoffered', async (req, res) => {
    const items = await itemLean
        .find({})
        .lean()
        .populate({ path: 'sponsored', model: itemLean })
        .sort({ createdAt: -1 });
    const filtered = items.filter(p => p.sponsored?.length && p.sponsored?.length > 0);
    return res.status(200).send(filtered);
});
itemRoutes.put('/addsponsored/:id', requireAuth, roleAuthorisation('items'), deleteFiles, async (req, res) => {
    const { id } = req.params;
    const { sponsored } = req.body;
    const isValid = verifyObjectId(id);
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
itemRoutes.put('/updatesponsored/:id', requireAuth, roleAuthorisation('items'), deleteFiles, async (req, res) => {
    const { id } = req.params;
    const { sponsored } = req.body;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await itemMain.findByIdAndUpdate(id);
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
itemRoutes.delete('/deletesponsored/:id/:spnsdId', requireAuth, roleAuthorisation('items'), deleteFiles, async (req, res) => {
    const { id, spnsdId } = req.params;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await itemMain.findByIdAndUpdate(id);
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
itemRoutes.put('/deleteone/:id', requireAuth, roleAuthorisation('items'), deleteFiles, async (req, res) => {
    const { id } = req.params;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await itemMain.findByIdAndDelete(id);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
itemRoutes.put('/deleteimages', requireAuth, roleAuthorisation('items'), deleteFiles, async (req, res) => {
    const filesWithDir = req.body.filesWithDir;
    if (filesWithDir && !filesWithDir.length) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const updatedProduct = req.body.item;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedProduct;
    const isValid = verifyObjectId(_id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await itemMain
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
itemRoutes.post('/search/:limit/:offset', async (req, res) => {
    const { searchterm, searchKey, category, extraFilers } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
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
        .find({ [searchKey]: { $regex: searchterm, $options: 'i' }, ...filter })
        .skip(offset)
        .limit(limit)
        .lean();
    return res.status(200).send(items);
});
itemRoutes.put('/deletemany', requireAuth, roleAuthorisation('items'), deleteFiles, async (req, res) => {
    const { ids } = req.body;
    const isValid = verifyObjectIds(ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // start by removing offers
    await itemOfferMain.deleteMany({ items: { $elemMatch: { $in: ids } } });
    // also remove decoys
    await itemDecoyMain.deleteMany({ items: { $elemMatch: { $in: ids } } });
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