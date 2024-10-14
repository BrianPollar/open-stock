"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemDecoyRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const mongoose_1 = require("mongoose");
const item_model_1 = require("../models/item.model");
const itemdecoy_model_1 = require("../models/itemdecoy.model");
const query_1 = require("../utils/query");
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
    const savedRes = await newDecoy.save()
        .catch((err) => err);
    if (savedRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, savedRes._id, itemdecoy_model_1.itemDecoyMain.collection.collectionName, 'makeTrackEdit');
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
    const { propSort, returnEmptyArr } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const aggCursor = itemdecoy_model_1.itemDecoyLean
        .aggregate([
        ...(0, stock_universal_server_1.lookupSubFieldItemsRelatedFilter)((0, stock_universal_server_1.constructFiltersFromBody)(req), offset, limit, propSort, returnEmptyArr)
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
exports.itemDecoyRoutes.get('/one/:urIdOr_id', stock_universal_server_1.appendUserToReqIfTokenExist, async (req, res) => {
    const { urIdOr_id } = req.params;
    const filterwithId = (0, stock_universal_server_1.verifyObjectId)(urIdOr_id) ? { _id: urIdOr_id } : { urId: urIdOr_id };
    const decoy = await itemdecoy_model_1.itemDecoyLean
        .findOne({ ...filterwithId, ...(0, stock_universal_server_1.makePredomFilter)(req) })
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
    const updateRes = await itemdecoy_model_1.itemDecoyMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } })
        .catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, _id, itemdecoy_model_1.itemDecoyMain.collection.collectionName, 'trackDataDelete');
    return res.status(200).send({ success: true });
});
exports.itemDecoyRoutes.put('/delete/many', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('decoys', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const updateRes = await itemdecoy_model_1.itemDecoyMain
        .updateMany({ _id: { $in: _ids }, ...filter }, {
        $set: { isDeleted: true }
    })
        .catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    for (const val of _ids) {
        (0, stock_universal_server_1.addParentToLocals)(res, val, itemdecoy_model_1.itemDecoyMain.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=itemdecoy.routes.js.map