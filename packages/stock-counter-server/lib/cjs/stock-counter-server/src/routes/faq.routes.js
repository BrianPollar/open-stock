"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.faqRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const mongoose_1 = require("mongoose");
const faq_model_1 = require("../models/faq.model");
const faqanswer_model_1 = require("../models/faqanswer.model");
/**
 * Router for FAQ routes.
 */
exports.faqRoutes = express_1.default.Router();
exports.faqRoutes.post('/add', async (req, res) => {
    const faq = req.body;
    faq.urId = await (0, stock_universal_server_1.generateUrId)(faq_model_1.faqMain);
    const newFaq = new faq_model_1.faqMain(faq);
    const savedRes = await newFaq.save()
        .catch((err) => err);
    if (savedRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, savedRes._id, faq_model_1.faqMain.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: true });
});
exports.faqRoutes.get('/one/:urIdOr_id', async (req, res) => {
    const { urIdOr_id } = req.params;
    // const { companyId } = req.user;
    const filterwithId = (0, stock_universal_server_1.verifyObjectId)(urIdOr_id) ? { _id: urIdOr_id } : { urId: urIdOr_id };
    const faq = await faq_model_1.faqLean
        .findOne({ ...filterwithId, ...(0, stock_universal_server_1.makePredomFilter)(req) })
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
    const { propSort, returnEmptyArr } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const filter = (0, stock_universal_server_1.constructFiltersFromBody)(req);
    const aggCursor = faq_model_1.faqLean
        .aggregate([
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
        ...(0, stock_universal_server_1.lookupFacet)(offset, limit, propSort, returnEmptyArr)
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
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { _id } = req.params;
    const { companyId } = req.user;
    // const { companyId } = req.user;
    const _ids = [_id];
    const filter = { _id, companyId };
    const isValid = (0, stock_universal_server_1.verifyObjectIds)(_ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleteRes = await faq_model_1.faqMain
        .findOneAndDelete(filter).catch((err) => err);
    if (deleteRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(deleteRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, _id, faq_model_1.faqMain.collection.collectionName, 'trackDataDelete');
    return res.status(200).send({ success: true });
});
exports.faqRoutes.post('/createans', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('faqs', 'create'), async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const faq = req.body.faq;
    const { companyId } = req.user;
    faq.companyId = companyId;
    faq.urId = await (0, stock_universal_server_1.generateUrId)(faqanswer_model_1.faqanswerMain);
    const newFaqAns = new faqanswer_model_1.faqanswerMain(faq);
    const savedRes = await newFaqAns.save()
        .catch((err) => err);
    if (savedRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    return res.status(200).send({ success: true });
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
    const deleteRes = await faqanswer_model_1.faqanswerMain.findOneAndDelete({ _id })
        .catch((err) => err);
    if (deleteRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(deleteRes);
        return res.status(errResponse.status).send(errResponse);
    }
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=faq.routes.js.map