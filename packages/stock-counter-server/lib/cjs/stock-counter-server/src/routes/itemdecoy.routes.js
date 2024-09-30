"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemDecoyRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const item_model_1 = require("../models/item.model");
const itemdecoy_model_1 = require("../models/itemdecoy.model");
const query_1 = require("../utils/query");
/** Logger for item decoy routes */
const itemDecoyRoutesLogger = tracer.colorConsole({
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
 * Router for item decoy routes.
 */
exports.itemDecoyRoutes = express_1.default.Router();
exports.itemDecoyRoutes.post('/add/:how', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_auth_server_1.requireCanUseFeature)('decoy'), (0, stock_universal_server_1.roleAuthorisation)('decoys', 'create'), async (req, res, next) => {
    const { how } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const { itemdecoy } = req.body;
    itemdecoy.companyId = filter.companyId;
    const urId = await (0, stock_universal_server_1.generateUrId)(itemdecoy_model_1.itemDecoyMain);
    let decoy;
    if (how === 'automatic') {
        // If creating an automatic decoy, verify the item ID and find the item
        const isValid = (0, stock_universal_server_1.verifyObjectId)(itemdecoy.items[0]); // TODO
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        const found = await item_model_1.itemLean.findById(itemdecoy.items[0])
            .lean();
        if (!found) {
            return res.status(404).send({ success: false });
        }
        // Find the items with the minimum and maximum selling prices
        const minItem = await item_model_1.itemLean.find({})
            .lte('costMeta.sellingPrice', Number(found.costMeta.sellingPrice))
            .sort({ createdAt: -1 })
            .limit(1);
        const maxItem = await item_model_1.itemLean.find({})
            .gte('costMeta.sellingPrice', Number(found.costMeta.sellingPrice))
            .sort({ createdAt: 1 })
            .limit(1);
        // Create the decoy object
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
        // If creating a manual decoy, simply use the provided item ID
        decoy = {
            urId,
            type: how,
            items: itemdecoy.items[0]
        };
    }
    // Save the new decoy to the database
    const newDecoy = new itemdecoy_model_1.itemDecoyMain(decoy);
    let errResponse;
    const saved = await newDecoy.save()
        .catch(err => {
        itemDecoyRoutesLogger.error('create - err: ', err);
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
        (0, stock_universal_server_1.addParentToLocals)(res, saved._id, itemdecoy_model_1.itemDecoyMain.collection.collectionName, 'makeTrackEdit');
    }
    if (!Boolean(saved)) {
        return res.status(403).send('unknown error');
    }
    return next();
}, (0, stock_auth_server_1.requireUpdateSubscriptionRecord)('decoy'));
exports.itemDecoyRoutes.get('/all/:offset/:limit', stock_universal_server_1.appendUserToReqIfTokenExist, async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const filter = {};
    const all = await Promise.all([
        itemdecoy_model_1.itemDecoyLean
            .find({ ...filter, ...(0, stock_universal_server_1.makePredomFilter)(req) })
            .skip(offset)
            .limit(limit)
            .populate([(0, query_1.populateItems)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()])
            .lean(),
        itemdecoy_model_1.itemDecoyLean.countDocuments({ ...filter, ...(0, stock_universal_server_1.makePredomFilter)(req) })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, itemdecoy_model_1.itemDecoyMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.itemDecoyRoutes.post('/filter', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('decoys', 'read'), async (req, res) => {
    const { propSort } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const aggCursor = itemdecoy_model_1.itemDecoyLean
        .aggregate([
        ...(0, stock_universal_server_1.lookupSubFieldItemsRelatedFilter)((0, stock_universal_server_1.constructFiltersFromBody)(req), propSort, offset, limit)
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
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, itemdecoy_model_1.itemDecoyMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.itemDecoyRoutes.get('/one/:_id', stock_universal_server_1.appendUserToReqIfTokenExist, async (req, res) => {
    const { _id } = req.params;
    const _ids = [_id];
    const isValid = (0, stock_universal_server_1.verifyObjectIds)(_ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const decoy = await itemdecoy_model_1.itemDecoyLean
        .findOne({ _id, ...(0, stock_universal_server_1.makePredomFilter)(req) })
        .populate([(0, query_1.populateItems)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()])
        .lean();
    if (!decoy) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    (0, stock_universal_server_1.addParentToLocals)(res, decoy._id, itemdecoy_model_1.itemDecoyMain.collection.collectionName, 'trackDataView');
    return res.status(200).send(decoy);
});
exports.itemDecoyRoutes.delete('/delete/one/:_id', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('decoys', 'delete'), async (req, res) => {
    const { _id } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    // const deleted = await itemDecoyMain.findOneAndDelete({ _id, });
    const deleted = await itemdecoy_model_1.itemDecoyMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } });
    if (Boolean(deleted)) {
        (0, stock_universal_server_1.addParentToLocals)(res, _id, itemdecoy_model_1.itemDecoyMain.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.itemDecoyRoutes.put('/delete/many', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('decoys', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    /* const deleted = await itemDecoyMain
    .deleteMany({ _id: { $in: _ids }, })
    .catch(err => {
      itemDecoyRoutesLogger.error('deletemany - err: ', err);

      return null;
    }); */
    const deleted = await itemdecoy_model_1.itemDecoyMain
        .updateMany({ _id: { $in: _ids }, ...filter }, {
        $set: { isDeleted: true }
    })
        .catch(err => {
        itemDecoyRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        for (const val of _ids) {
            (0, stock_universal_server_1.addParentToLocals)(res, val, itemdecoy_model_1.itemDecoyMain.collection.collectionName, 'trackDataDelete');
        }
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({
            success: Boolean(deleted), err: 'could not delete selected items, try again in a while'
        });
    }
});
//# sourceMappingURL=itemdecoy.routes.js.map