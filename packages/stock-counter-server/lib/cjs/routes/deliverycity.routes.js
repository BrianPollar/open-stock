"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deliverycityRoutes = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-misused-promises */
const express_1 = tslib_1.__importDefault(require("express"));
const deliverycity_model_1 = require("../models/deliverycity.model");
const log4js_1 = require("log4js");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
/** */
const deliverycityRoutesLogger = (0, log4js_1.getLogger)('routes/deliverycityRoutes');
/** */
exports.deliverycityRoutes = express_1.default.Router();
exports.deliverycityRoutes.post('/create', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items'), async (req, res) => {
    const deliverycity = req.body.deliverycity;
    const newDeliverycity = new deliverycity_model_1.deliverycityMain(deliverycity);
    let errResponse;
    const saved = await newDeliverycity.save()
        .catch(err => {
        deliverycityRoutesLogger.error('create - err: ', err);
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
exports.deliverycityRoutes.get('/getone/:id', async (req, res) => {
    const { id } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deliverycity = await deliverycity_model_1.deliverycityLean
        .findById(id)
        .lean();
    return res.status(200).send(deliverycity);
});
exports.deliverycityRoutes.get('/getall/:offset/:limit', async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const deliverycitys = await deliverycity_model_1.deliverycityLean
        .find({})
        .skip(offset)
        .limit(limit)
        .lean();
    return res.status(200).send(deliverycitys);
});
exports.deliverycityRoutes.put('/update', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items'), async (req, res) => {
    const updatedCity = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(updatedCity._id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deliverycity = await deliverycity_model_1.deliverycityMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findByIdAndUpdate(updatedCity._id);
    if (!deliverycity) {
        return res.status(404).send({ success: false });
    }
    deliverycity.name = updatedCity.name || deliverycity.name;
    deliverycity.shippingCost = updatedCity.shippingCost || deliverycity.shippingCost;
    deliverycity.currency = updatedCity.currency || deliverycity.currency;
    deliverycity.deliversInDays = updatedCity.deliversInDays || deliverycity.deliversInDays;
    let errResponse;
    const updated = await deliverycity.save()
        .catch(err => {
        deliverycityRoutesLogger.error('update - err: ', err);
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
exports.deliverycityRoutes.delete('/deleteone/:id', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items'), async (req, res) => {
    const { id } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await deliverycity_model_1.deliverycityMain.findByIdAndDelete(id);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.deliverycityRoutes.put('/deletemany', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items'), async (req, res) => {
    const { ids } = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)(ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await deliverycity_model_1.deliverycityMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ _id: { $in: ids } })
        .catch(err => {
        deliverycityRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
//# sourceMappingURL=deliverycity.routes.js.map