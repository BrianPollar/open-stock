"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deliverycityRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const deliverycity_model_1 = require("../models/deliverycity.model");
/**
 * Logger for deliverycity routes
 */
const deliverycityRoutesLogger = tracer.colorConsole({
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
 * Express router for deliverycity routes
 */
exports.deliverycityRoutes = express_1.default.Router();
exports.deliverycityRoutes.post('/add', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryCitys', 'create'), async (req, res) => {
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
        return err;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    if (saved && saved._id) {
        (0, stock_universal_server_1.addParentToLocals)(res, saved._id, deliverycity_model_1.deliverycityMain.collection.collectionName, 'makeTrackEdit');
    }
    return res.status(200).send({ success: Boolean(saved) });
});
exports.deliverycityRoutes.get('/one/:_id', stock_universal_server_1.appendUserToReqIfTokenExist, async (req, res) => {
    const { _id } = req.params;
    const deliverycity = await deliverycity_model_1.deliverycityLean
        .findOne({ _id })
        .lean();
    if (!deliverycity) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    (0, stock_universal_server_1.addParentToLocals)(res, deliverycity._id, deliverycity_model_1.deliverycityMain.collection.collectionName, 'trackDataView');
    return res.status(200).send(deliverycity);
});
exports.deliverycityRoutes.get('/all/:offset/:limit', stock_universal_server_1.appendUserToReqIfTokenExist, async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const all = await Promise.all([
        deliverycity_model_1.deliverycityLean
            .find({ isDeleted: false })
            .skip(offset)
            .limit(limit)
            .lean(),
        deliverycity_model_1.deliverycityLean.countDocuments({})
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, deliverycity_model_1.deliverycityMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.deliverycityRoutes.put('/update', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryCitys', 'update'), async (req, res) => {
    const updatedCity = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([updatedCity._id]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deliverycity = await deliverycity_model_1.deliverycityMain
        .findOne({ _id: updatedCity._id, ...(0, stock_universal_server_1.makePredomFilter)(req) })
        .lean();
    if (!deliverycity) {
        return res.status(404).send({ success: false });
    }
    let errResponse;
    const updated = await deliverycity_model_1.deliverycityMain.updateOne({
        _id: updatedCity._id
    }, {
        $set: {
            name: updatedCity.name || deliverycity.name,
            shippingCost: updatedCity.shippingCost || deliverycity.shippingCost,
            currency: updatedCity.currency || deliverycity.currency,
            deliversInDays: updatedCity.deliversInDays || deliverycity.deliversInDays,
            isDeleted: updatedCity.isDeleted || deliverycity.isDeleted
        }
    })
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
    (0, stock_universal_server_1.addParentToLocals)(res, updatedCity._id, deliverycity_model_1.deliverycityMain.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: Boolean(updated) });
});
exports.deliverycityRoutes.delete('/delete/one/:_id', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryCitys', 'delete'), async (req, res) => {
    const { _id } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // const deleted = await deliverycityMain.findOneAndDelete({ _id });
    const deleted = await deliverycity_model_1.deliverycityMain
        .updateOne({ _id, ...(0, stock_universal_server_1.makePredomFilter)(req) }, { $set: { isDeleted: true } });
    if (Boolean(deleted)) {
        (0, stock_universal_server_1.addParentToLocals)(res, _id, deliverycity_model_1.deliverycityMain.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.deliverycityRoutes.put('/delete/many', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryCitys', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([..._ids]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    /* const deleted = await deliverycityMain
    .deleteMany({ _id: { $in: _ids } })
    .catch(err => {
      deliverycityRoutesLogger.error('deletemany - err: ', err);

      return null;
    }); */
    const deleted = await deliverycity_model_1.deliverycityMain
        .updateMany({ _id: { $in: _ids } }, {
        $set: { isDeleted: true }
    })
        .catch(err => {
        deliverycityRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        for (const val of _ids) {
            (0, stock_universal_server_1.addParentToLocals)(res, val, deliverycity_model_1.deliverycityMain.collection.collectionName, 'trackDataDelete');
        }
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({
            success: Boolean(deleted), err: 'could not delete selected items, try again in a while'
        });
    }
});
//# sourceMappingURL=deliverycity.routes.js.map