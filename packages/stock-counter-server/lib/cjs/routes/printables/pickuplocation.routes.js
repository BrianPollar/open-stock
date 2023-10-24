"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickupLocationRoutes = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-misused-promises */
const express_1 = tslib_1.__importDefault(require("express"));
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const pickuplocation_model_1 = require("../../models/printables/pickuplocation.model");
const log4js_1 = require("log4js");
/** */
const pickupLocationRoutesLogger = (0, log4js_1.getLogger)('routes/pickupLocationRoutes');
/** */
exports.pickupLocationRoutes = express_1.default.Router();
exports.pickupLocationRoutes.post('/create', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const pickupLocation = req.body;
    const newPickupLocation = new pickuplocation_model_1.pickupLocationMain(pickupLocation);
    let errResponse;
    const saved = await newPickupLocation.save()
        .catch(err => {
        pickupLocationRoutesLogger.error('create - err: ', err);
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
exports.pickupLocationRoutes.put('/update', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const updatedPickupLocation = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(updatedPickupLocation._id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const pickupLocation = await pickuplocation_model_1.pickupLocationMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findByIdAndUpdate(updatedPickupLocation._id);
    if (!pickupLocation) {
        return res.status(404).send({ success: false });
    }
    pickupLocation.name = updatedPickupLocation.name || pickupLocation.name;
    pickupLocation.contact = updatedPickupLocation.contact || pickupLocation.contact;
    let errResponse;
    const updated = await pickupLocation.save()
        .catch(err => {
        pickupLocationRoutesLogger.error('update - err: ', err);
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
exports.pickupLocationRoutes.get('/getone/:id', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { id } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const pickupLocation = await pickuplocation_model_1.pickupLocationLean
        .findById(id)
        .lean();
    return res.status(200).send(pickupLocation);
});
exports.pickupLocationRoutes.get('/getall/:offset/:limit', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const pickupLocations = await pickuplocation_model_1.pickupLocationLean
        .find({})
        .skip(offset)
        .limit(limit)
        .lean();
    return res.status(200).send(pickupLocations);
});
exports.pickupLocationRoutes.delete('/deleteone/:id', stock_universal_server_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await pickuplocation_model_1.pickupLocationMain.findByIdAndDelete(id);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.pickupLocationRoutes.post('/search/:limit/:offset', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const pickupLocations = await pickuplocation_model_1.pickupLocationLean
        .find({ [searchKey]: { $regex: searchterm, $options: 'i' } })
        .skip(offset)
        .limit(limit)
        .lean();
    return res.status(200).send(pickupLocations);
});
exports.pickupLocationRoutes.put('/deletemany', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { ids } = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)(ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await pickuplocation_model_1.pickupLocationMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ _id: { $in: ids } })
        .catch(err => {
        pickupLocationRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
//# sourceMappingURL=pickuplocation.routes.js.map