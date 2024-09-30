"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewRoutes = void 0;
const tslib_1 = require("tslib");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_2 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const review_model_1 = require("../models/review.model");
const item_routes_1 = require("./item.routes");
/**
 * Logger for review routes
 */
const reviewRoutesLogger = tracer.colorConsole({
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
 * Express router for review routes
 */
exports.reviewRoutes = express_1.default.Router();
exports.reviewRoutes.post('/add', async (req, res, next) => {
    const review = req.body;
    review.companyId = 'superAdmin';
    review.urId = await (0, stock_universal_server_2.generateUrId)(review_model_1.reviewMain);
    const newReview = new review_model_1.reviewMain(review);
    let errResponse;
    const saved = await newReview.save()
        .catch(err => {
        reviewRoutesLogger.error('create - err: ', err);
        errResponse = {
            success: false,
            status: 403
        };
        if (err && err.errors) {
            errResponse.err = (0, stock_universal_server_2.stringifyMongooseErr)(err.errors);
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
        (0, stock_universal_server_2.addParentToLocals)(res, saved._id, review_model_1.reviewMain.collection.collectionName, 'makeTrackEdit');
    }
    return next();
}, item_routes_1.addReview);
exports.reviewRoutes.get('/one/:_id', async (req, res) => {
    const { _id } = req.params;
    const review = await review_model_1.reviewLean
        .findOne({ _id, ...(0, stock_universal_server_1.makePredomFilter)(req) })
        .lean();
    if (!review) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    (0, stock_universal_server_2.addParentToLocals)(res, review._id, review_model_1.reviewMain.collection.collectionName, 'trackDataView');
    return res.status(200).send(review);
});
exports.reviewRoutes.get('/all/:_id/:offset/:limit', async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_2.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const all = await Promise.all([
        review_model_1.reviewLean
            .find({ itemId: req.params._id, ...(0, stock_universal_server_1.makePredomFilter)(req) })
            .skip(offset)
            .limit(limit)
            .lean(),
        review_model_1.reviewLean.countDocuments({ itemId: req.params._id })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        (0, stock_universal_server_2.addParentToLocals)(res, val._id, review_model_1.reviewMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.reviewRoutes.post('/filter', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('items', 'read'), async (req, res) => {
    const { propSort } = req.body;
    const { offset, limit } = (0, stock_universal_server_2.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const filter = (0, stock_universal_server_1.constructFiltersFromBody)(req);
    const aggCursor = review_model_1.reviewLean.aggregate([
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
    const staffsToReturn = all.filter(val => val.userId);
    const response = {
        count,
        data: staffsToReturn
    };
    for (const val of all) {
        (0, stock_universal_server_2.addParentToLocals)(res, val._id, review_model_1.reviewMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.reviewRoutes.get('/getratingcount/:_id/:rating', async (req, res) => {
    const { id, rating } = req.params;
    const review = await review_model_1.reviewLean
        .find({ itemId: id, rating })
        .lean();
    return res.status(200).send({ count: review.length });
});
exports.reviewRoutes.delete('/delete/one/:_id/:itemId/:rating', async (req, res, next) => {
    const { _id } = req.params;
    // const deleted = await reviewMain.findOneAndDelete({ _id });
    const deleted = await review_model_1.reviewMain.updateOne({ _id }, { $set: { isDeleted: true } });
    if (Boolean(deleted)) {
        (0, stock_universal_server_2.addParentToLocals)(res, _id, review_model_1.reviewMain.collection.collectionName, 'trackDataDelete');
        return next();
    }
    else {
        return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
}, item_routes_1.removeReview);
//# sourceMappingURL=review.routes.js.map