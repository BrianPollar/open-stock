/* eslint-disable @typescript-eslint/no-misused-promises */
import { makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import { getLogger } from 'log4js';
import { itemDecoyLean, itemDecoyMain } from '../models/itemdecoy.model';
import { itemLean } from '../models/item.model';
/** */
const itemDecoyRoutesLogger = getLogger('routes/itemDecoyRoutes');
/** */
export const itemDecoyRoutes = express.Router();
itemDecoyRoutes.post('/create/:how', requireAuth, roleAuthorisation('items'), async (req, res) => {
    const { how } = req.params;
    const { itemdecoy } = req.body;
    console.log('ok decoy is', itemdecoy);
    const count = await itemDecoyMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    const urId = makeUrId(Number(count[0]?.urId || '0'));
    let decoy;
    if (how === 'automatic') {
        const isValid = verifyObjectId(itemdecoy.items[0]);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        const found = await itemLean.findById(itemdecoy.items[0])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .lean();
        if (!found) {
            return res.status(404).send({ success: false });
        }
        const minItem = await itemLean.find({})
            .lte('costMeta.sellingPrice', Number(found.costMeta.sellingPrice))
            .sort({ createdAt: -1 })
            .limit(1);
        const maxItem = await itemLean.find({})
            .gte('costMeta.sellingPrice', Number(found.costMeta.sellingPrice))
            .sort({ createdAt: 1 })
            .limit(1);
        decoy = {
            type: how,
            urId,
            items: [
                minItem[0]._id,
                itemdecoy.items[0],
                maxItem[0]._id
            ]
        };
    }
    else {
        decoy = {
            urId,
            type: how,
            items: itemdecoy.items[0]
        };
    }
    const newDecoy = new itemDecoyMain(decoy);
    let errResponse;
    const saved = await newDecoy.save()
        .catch(err => {
        itemDecoyRoutesLogger.error('create - err: ', err);
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
itemDecoyRoutes.get('/getall/:offset/:limit', async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const items = await itemDecoyLean
        .find({})
        .skip(offset)
        .limit(limit)
        .populate({ path: 'items', model: itemLean })
        .lean();
    return res.status(200).send(items);
});
itemDecoyRoutes.get('/getone/:id', async (req, res) => {
    const { id } = req.params;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const items = await itemDecoyLean
        .findById(id)
        .populate({ path: 'items', model: itemLean })
        .lean();
    return res.status(200).send(items);
});
itemDecoyRoutes.delete('/deleteone/:id', requireAuth, roleAuthorisation('items'), async (req, res) => {
    const { id } = req.params;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await itemDecoyMain.findByIdAndDelete(id);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
itemDecoyRoutes.put('/deletemany', requireAuth, roleAuthorisation('items'), async (req, res) => {
    const { ids } = req.body;
    const isValid = verifyObjectIds(ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await itemDecoyMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ _id: { $in: ids } })
        .catch(err => {
        itemDecoyRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
//# sourceMappingURL=itemdecoy.routes.js.map