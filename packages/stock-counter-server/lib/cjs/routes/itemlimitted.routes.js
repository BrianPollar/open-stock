"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemLimittedRoutes = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-misused-promises */
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const log4js_1 = require("log4js");
const itemlimitted_model_1 = require("../models/itemlimitted.model");
/** */
const itemLimittedRoutesLogger = (0, log4js_1.getLogger)('routes/itemLimittedRoutes');
/** */
exports.itemLimittedRoutes = express_1.default.Router();
exports.itemLimittedRoutes.post('/create', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items'), async (req, res) => {
    const { itemlimitted } = req.body;
    const count = await itemlimitted_model_1.itemLimittedMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    const urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    itemlimitted.urId = urId;
    const newItemlimitted = new itemlimitted_model_1.itemLimittedMain(itemlimitted);
    let errResponse;
    const saved = await newItemlimitted.save()
        .catch(err => {
        itemLimittedRoutesLogger.error('create - err: ', err);
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
exports.itemLimittedRoutes.get('/getall/:offset/:limit', async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const items = await itemlimitted_model_1.itemLimittedLean
        .find({})
        .skip(offset)
        .limit(limit)
        .lean();
    return res.status(200).send(items);
});
exports.itemLimittedRoutes.get('/getone/:id', async (req, res) => {
    const { id } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const items = await itemlimitted_model_1.itemLimittedLean
        .findById(id)
        .lean();
    return res.status(200).send(items);
});
exports.itemLimittedRoutes.delete('/deleteone/:id', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items'), async (req, res) => {
    const { id } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await itemlimitted_model_1.itemLimittedMain.findByIdAndDelete(id);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.itemLimittedRoutes.put('/updateone', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items'), async (req, res) => {
    const isValid = (0, stock_universal_server_1.verifyObjectId)(req.body._id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await itemlimitted_model_1.itemLimittedMain.findByIdAndUpdate(req.body._id);
    item.name = req.body.name;
    await item.save();
    return res.status(200).send({ success: true });
});
exports.itemLimittedRoutes.put('/deletemany', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items'), async (req, res) => {
    const { ids } = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)(ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await itemlimitted_model_1.itemLimittedMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ _id: { $in: ids } })
        .catch(err => {
        itemLimittedRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
//# sourceMappingURL=itemlimitted.routes.js.map