"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemOfferRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const itemoffer_model_1 = require("../models/itemoffer.model");
const query_1 = require("../utils/query");
/** Logger for item offer routes */
const itemOfferRoutesLogger = tracer.colorConsole({
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
 * Router for item offers.
 */
exports.itemOfferRoutes = express_1.default.Router();
exports.itemOfferRoutes.post('/add', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_auth_server_1.requireCanUseFeature)('offer'), (0, stock_universal_server_1.roleAuthorisation)('offers', 'create'), async (req, res, next) => {
    const { itemoffer } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    itemoffer.companyId = filter.companyId;
    itemoffer.urId = await (0, stock_universal_server_1.generateUrId)(itemoffer_model_1.itemOfferMain);
    const newDecoy = new itemoffer_model_1.itemOfferMain(itemoffer);
    let errResponse;
    const saved = await newDecoy.save()
        .catch(err => {
        itemOfferRoutesLogger.error('create - err: ', err);
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
        (0, stock_universal_server_1.addParentToLocals)(res, saved._id, itemoffer_model_1.itemOfferMain.collection.collectionName, 'makeTrackEdit');
    }
    if (Boolean(saved)) {
        return res.status(403).send('unknown error');
    }
    return next();
}, (0, stock_auth_server_1.requireUpdateSubscriptionRecord)('offer'));
exports.itemOfferRoutes.get('/all/:type/:offset/:limit', stock_universal_server_1.appendUserToReqIfTokenExist, async (req, res) => {
    const { type } = req.params;
    const query = {};
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    let filter;
    if (type !== 'all') {
        filter = { type, ...query };
    }
    const all = await Promise.all([
        itemoffer_model_1.itemOfferLean
            .find({ ...filter, ...(0, stock_universal_server_1.makePredomFilter)(req) })
            .skip(offset)
            .limit(limit)
            .populate([(0, query_1.populateItems)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()])
            .lean(),
        itemoffer_model_1.itemOfferLean.countDocuments({ ...filter, ...(0, stock_universal_server_1.makePredomFilter)(req) })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, itemoffer_model_1.itemOfferMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.itemOfferRoutes.post('/filter', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('offers', 'read'), async (req, res) => {
    const { propSort } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const aggCursor = itemoffer_model_1.itemOfferLean
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
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, itemoffer_model_1.itemOfferMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.itemOfferRoutes.get('/one/:_id', stock_universal_server_1.appendUserToReqIfTokenExist, async (req, res) => {
    const { _id } = req.params;
    const _ids = [_id];
    const isValid = (0, stock_universal_server_1.verifyObjectIds)(_ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const offer = await itemoffer_model_1.itemOfferLean
        .findOne({ _id, ...(0, stock_universal_server_1.makePredomFilter)(req) })
        .populate([(0, query_1.populateItems)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()])
        .lean();
    if (!offer) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    (0, stock_universal_server_1.addParentToLocals)(res, offer._id, itemoffer_model_1.itemOfferMain.collection.collectionName, 'trackDataView');
    return res.status(200).send(offer);
});
exports.itemOfferRoutes.delete('/delete/one/:_id', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('offers', 'delete'), async (req, res) => {
    const { _id } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    // const deleted = await itemOfferMain.findOneAndDelete({ _id, });
    const deleted = await itemoffer_model_1.itemOfferMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } });
    if (Boolean(deleted)) {
        (0, stock_universal_server_1.addParentToLocals)(res, _id, itemoffer_model_1.itemOfferMain.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.itemOfferRoutes.put('/delete/many', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('offers', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    /* const deleted = await itemOfferMain
    .deleteMany({ _id: { $in: _ids }, })
    .catch(err => {
      itemOfferRoutesLogger.error('deletemany - err: ', err);

      return null;
    }); */
    const deleted = await itemoffer_model_1.itemOfferMain
        .updateMany({ _id: { $in: _ids }, ...filter }, {
        $set: { isDeleted: true }
    })
        .catch(err => {
        itemOfferRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        for (const val of _ids) {
            (0, stock_universal_server_1.addParentToLocals)(res, val, itemoffer_model_1.itemOfferMain.collection.collectionName, 'trackDataDelete');
        }
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({
            success: Boolean(deleted), err: 'could not delete selected items, try again in a while'
        });
    }
});
//# sourceMappingURL=itemoffer.routes.js.map