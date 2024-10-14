import { requireActiveCompany } from '@open-stock/stock-auth-server';
import { addParentToLocals, constructFiltersFromBody, generateUrId, handleMongooseErr, lookupFacet, lookupTrackEdit, lookupTrackView, makePredomFilter, offsetLimitRelegator, requireAuth, roleAuthorisation, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import { Error } from 'mongoose';
import { faqLean, faqMain } from '../models/faq.model';
import { faqanswerLean, faqanswerMain } from '../models/faqanswer.model';
/**
 * Router for FAQ routes.
 */
export const faqRoutes = express.Router();
faqRoutes.post('/add', async (req, res) => {
    const faq = req.body;
    faq.urId = await generateUrId(faqMain);
    const newFaq = new faqMain(faq);
    const savedRes = await newFaq.save()
        .catch((err) => err);
    if (savedRes instanceof Error) {
        const errResponse = handleMongooseErr(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    addParentToLocals(res, savedRes._id, faqMain.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: true });
});
faqRoutes.get('/one/:urIdOr_id', async (req, res) => {
    const { urIdOr_id } = req.params;
    // const { companyId } = req.user;
    const filterwithId = verifyObjectId(urIdOr_id) ? { _id: urIdOr_id } : { urId: urIdOr_id };
    const faq = await faqLean
        .findOne({ ...filterwithId, ...makePredomFilter(req) })
        .lean();
    if (!faq) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    addParentToLocals(res, faq._id, faqMain.collection.collectionName, 'trackDataView');
    return res.status(200).send(faq);
});
faqRoutes.get('/all/:offset/:limit', async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const all = await Promise.all([
        faqLean
            .find({ ...makePredomFilter(req) })
            .skip(offset)
            .limit(limit)
            .lean(),
        faqLean.countDocuments({ ...makePredomFilter(req) })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        addParentToLocals(res, val._id, faqMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
faqRoutes.post('/filter', requireAuth, requireActiveCompany, roleAuthorisation('receipts', 'read'), async (req, res) => {
    const { propSort, returnEmptyArr } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);
    const filter = constructFiltersFromBody(req);
    const aggCursor = faqLean
        .aggregate([
        {
            $match: {
                $and: [
                    // { status: 'pending' },
                    ...filter
                ]
            }
        },
        ...lookupTrackEdit(),
        ...lookupTrackView(),
        ...lookupFacet(offset, limit, propSort, returnEmptyArr)
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
        addParentToLocals(res, val._id, faqMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
faqRoutes.delete('/delete/one/:_id', requireAuth, requireActiveCompany, async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { _id } = req.params;
    const { companyId } = req.user;
    // const { companyId } = req.user;
    const _ids = [_id];
    const filter = { _id, companyId };
    const isValid = verifyObjectIds(_ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleteRes = await faqMain
        .findOneAndDelete(filter).catch((err) => err);
    if (deleteRes instanceof Error) {
        const errResponse = handleMongooseErr(deleteRes);
        return res.status(errResponse.status).send(errResponse);
    }
    addParentToLocals(res, _id, faqMain.collection.collectionName, 'trackDataDelete');
    return res.status(200).send({ success: true });
});
faqRoutes.post('/createans', requireAuth, requireActiveCompany, roleAuthorisation('faqs', 'create'), async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const faq = req.body.faq;
    const { companyId } = req.user;
    faq.companyId = companyId;
    faq.urId = await generateUrId(faqanswerMain);
    const newFaqAns = new faqanswerMain(faq);
    const savedRes = await newFaqAns.save()
        .catch((err) => err);
    if (savedRes instanceof Error) {
        const errResponse = handleMongooseErr(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    return res.status(200).send({ success: true });
});
faqRoutes.get('/getallans/:faqId', async (req, res) => {
    const faqsAns = await faqanswerLean
        .find({ faq: req.params.faqId, ...makePredomFilter(req) })
        .lean();
    return res.status(200).send(faqsAns);
});
faqRoutes.delete('/deleteoneans/:_id', requireAuth, requireActiveCompany, roleAuthorisation('faqs', 'delete'), async (req, res) => {
    const { _id } = req.params;
    const isValid = verifyObjectIds([_id]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleteRes = await faqanswerMain.findOneAndDelete({ _id })
        .catch((err) => err);
    if (deleteRes instanceof Error) {
        const errResponse = handleMongooseErr(deleteRes);
        return res.status(errResponse.status).send(errResponse);
    }
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=faq.routes.js.map