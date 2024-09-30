"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickupLocationRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const pickuplocation_model_1 = require("../../models/printables/pickuplocation.model");
/**
 * Logger for pickup location routes
 */
const pickupLocationRoutesLogger = tracer.colorConsole({
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
 * Express router for pickup location routes
 */
exports.pickupLocationRoutes = express_1.default.Router();
exports.pickupLocationRoutes.post('/add', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryCitys', 'create'), async (req, res) => {
    const pickupLocation = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    pickupLocation.companyId = filter.companyId;
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
        return err;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    if (saved && saved._id) {
        (0, stock_universal_server_1.addParentToLocals)(res, saved._id, pickuplocation_model_1.pickupLocationMain.collection.collectionName, 'makeTrackEdit');
    }
    return res.status(200).send({ success: Boolean(saved) });
});
exports.pickupLocationRoutes.put('/update', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryCitys', 'update'), async (req, res) => {
    const updatedPickupLocation = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    updatedPickupLocation.companyId = filter.companyId;
    const pickupLocation = await pickuplocation_model_1.pickupLocationMain
        .findOne({ _id: updatedPickupLocation._id, ...filter })
        .lean();
    if (!pickupLocation) {
        return res.status(404).send({ success: false });
    }
    let errResponse;
    const updated = await pickuplocation_model_1.pickupLocationMain.updateOne({
        _id: updatedPickupLocation._id, ...filter
    }, {
        $set: {
            name: updatedPickupLocation.name || pickupLocation.name,
            contact: updatedPickupLocation.contact || pickupLocation.contact,
            isDeleted: updatedPickupLocation.isDeleted || pickupLocation.isDeleted
        }
    })
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
    (0, stock_universal_server_1.addParentToLocals)(res, pickupLocation._id, pickuplocation_model_1.pickupLocationMain.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: Boolean(updated) });
});
exports.pickupLocationRoutes.get('/one/:_id', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryCitys', 'read'), async (req, res) => {
    const { _id } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const pickupLocation = await pickuplocation_model_1.pickupLocationLean
        .findOne({ _id, ...filter })
        .lean();
    if (!pickupLocation) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    (0, stock_universal_server_1.addParentToLocals)(res, pickupLocation._id, pickuplocation_model_1.pickupLocationMain.collection.collectionName, 'trackDataView');
    return res.status(200).send(pickupLocation);
});
exports.pickupLocationRoutes.get('/all/:offset/:limit', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryCitys', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const all = await Promise.all([
        pickuplocation_model_1.pickupLocationLean
            .find({ ...filter })
            .skip(offset)
            .limit(limit)
            .lean(),
        pickuplocation_model_1.pickupLocationLean.countDocuments({ ...filter })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, pickuplocation_model_1.pickupLocationMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.pickupLocationRoutes.delete('/delete/one/:_id', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryCitys', 'delete'), async (req, res) => {
    const { _id } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    // const deleted = await pickupLocationMain.findOneAndDelete({ _id, ...filter });
    const deleted = await pickuplocation_model_1.pickupLocationMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } });
    if (Boolean(deleted)) {
        (0, stock_universal_server_1.addParentToLocals)(res, _id, pickuplocation_model_1.pickupLocationMain.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.pickupLocationRoutes.post('/filter', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryCitys', 'read'), async (req, res) => {
    const { propSort } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const aggCursor = pickuplocation_model_1.pickupLocationLean.aggregate([
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
    const response = {
        count,
        data: all
    };
    for (const val of all) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, pickuplocation_model_1.pickupLocationMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.pickupLocationRoutes.put('/delete/many', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryCitys', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    /* const deleted = await pickupLocationMain
    .deleteMany({ _id: { $in: _ids }, ...filter })
    .catch(err => {
      pickupLocationRoutesLogger.error('deletemany - err: ', err);

      return null;
    }); */
    const deleted = await pickuplocation_model_1.pickupLocationMain
        .updateMany({ _id: { $in: _ids }, ...filter }, {
        $set: { isDeleted: true }
    })
        .catch(err => {
        pickupLocationRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        for (const val of _ids) {
            (0, stock_universal_server_1.addParentToLocals)(res, val, pickuplocation_model_1.pickupLocationMain.collection.collectionName, 'trackDataDelete');
        }
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({
            success: Boolean(deleted), err: 'could not delete selected items, try again in a while'
        });
    }
});
//# sourceMappingURL=pickuplocation.routes.js.map