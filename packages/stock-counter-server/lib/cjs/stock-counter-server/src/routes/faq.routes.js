"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.faqRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const faq_model_1 = require("../models/faq.model");
const faqanswer_model_1 = require("../models/faqanswer.model");
/** Logger for faqRoutes */
const faqRoutesLogger = tracer.colorConsole({
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
 * Router for FAQ routes.
 */
exports.faqRoutes = express_1.default.Router();
exports.faqRoutes.post('/add', async (req, res) => {
    const faq = req.body;
    faq.urId = await (0, stock_universal_server_1.generateUrId)(faq_model_1.faqMain);
    const newFaq = new faq_model_1.faqMain(faq);
    let errResponse;
    const saved = await newFaq.save()
        .catch(err => {
        faqRoutesLogger.error('create - err: ', err);
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
        (0, stock_universal_server_1.addParentToLocals)(res, saved._id, faq_model_1.faqMain.collection.collectionName, 'makeTrackEdit');
    }
    return res.status(200).send({ success: Boolean(saved) });
});
exports.faqRoutes.get('/one/:_id', async (req, res) => {
    const { _id } = req.params;
    // const { companyId } = req.user;
    const _ids = [_id];
    const filter = { _id };
    const isValid = (0, stock_universal_server_1.verifyObjectIds)(_ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const faq = await faq_model_1.faqLean
        .findOne({ ...filter, ...(0, stock_universal_server_1.makePredomFilter)(req) })
        .lean();
    if (!faq) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    (0, stock_universal_server_1.addParentToLocals)(res, faq._id, faq_model_1.faqMain.collection.collectionName, 'trackDataView');
    return res.status(200).send(faq);
});
exports.faqRoutes.get('/all/:offset/:limit', async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const all = await Promise.all([
        faq_model_1.faqLean
            .find({ ...(0, stock_universal_server_1.makePredomFilter)(req) })
            .skip(offset)
            .limit(limit)
            .lean(),
        faq_model_1.faqLean.countDocuments({ ...(0, stock_universal_server_1.makePredomFilter)(req) })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, faq_model_1.faqMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.faqRoutes.post('/filter', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('receipts', 'read'), async (req, res) => {
    const { propSort } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const aggCursor = faq_model_1.faqLean
        .aggregate([
        ...(0, stock_universal_server_1.lookupSubFieldInvoiceRelatedFilter)((0, stock_universal_server_1.constructFiltersFromBody)(req), propSort, offset, limit)
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
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, faq_model_1.faqMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.faqRoutes.delete('/delete/one/:_id', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, async (req, res) => {
    const { _id } = req.params;
    const { companyId } = req.user;
    // const { companyId } = req.user;
    const _ids = [_id];
    const filter = { _id, companyId };
    const isValid = (0, stock_universal_server_1.verifyObjectIds)(_ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await faq_model_1.faqMain.findOneAndDelete(filter);
    if (Boolean(deleted)) {
        (0, stock_universal_server_1.addParentToLocals)(res, _id, faq_model_1.faqMain.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.faqRoutes.post('/createans', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('faqs', 'create'), async (req, res) => {
    const faq = req.body.faq;
    const { companyId } = req.user;
    faq.companyId = companyId;
    faq.urId = await (0, stock_universal_server_1.generateUrId)(faqanswer_model_1.faqanswerMain);
    const newFaqAns = new faqanswer_model_1.faqanswerMain(faq);
    let errResponse;
    const saved = await newFaqAns.save()
        .catch(err => {
        faqRoutesLogger.error('createans - err: ', err);
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
    return res.status(200).send({ success: Boolean(saved) });
});
exports.faqRoutes.get('/getallans/:faqId', async (req, res) => {
    const faqsAns = await faqanswer_model_1.faqanswerLean
        .find({ faq: req.params.faqId, ...(0, stock_universal_server_1.makePredomFilter)(req) })
        .lean();
    return res.status(200).send(faqsAns);
});
exports.faqRoutes.delete('/deleteoneans/:_id', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('faqs', 'delete'), async (req, res) => {
    const { _id } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await faqanswer_model_1.faqanswerMain.findOneAndDelete({ _id })
        .catch(err => {
        faqRoutesLogger.error('deleteoneans - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
//# sourceMappingURL=faq.routes.js.map