import { requireActiveCompany } from '@open-stock/stock-auth-server';
import { addParentToLocals, constructFiltersFromBody, generateUrId, lookupSubFieldInvoiceRelatedFilter, makePredomFilter, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { faqLean, faqMain } from '../models/faq.model';
import { faqanswerLean, faqanswerMain } from '../models/faqanswer.model';
/** Logger for faqRoutes */
const faqRoutesLogger = tracer.colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
        // eslint-disable-next-line no-console
        console.log(data.output);
        const logDir = path.join(process.cwd() + '/openstockLog/');
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
export const faqRoutes = express.Router();
faqRoutes.post('/add', async (req, res) => {
    const faq = req.body;
    faq.urId = await generateUrId(faqMain);
    const newFaq = new faqMain(faq);
    let errResponse;
    const saved = await newFaq.save()
        .catch(err => {
        faqRoutesLogger.error('create - err: ', err);
        errResponse = {
            success: false,
            status: 403
        };
        if (err && err.errors) {
            errResponse.err = stringifyMongooseErr(err.errors);
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
        addParentToLocals(res, saved._id, faqMain.collection.collectionName, 'makeTrackEdit');
    }
    return res.status(200).send({ success: Boolean(saved) });
});
faqRoutes.get('/one/:_id', async (req, res) => {
    const { _id } = req.params;
    // const { companyId } = req.user;
    const _ids = [_id];
    const filter = { _id };
    const isValid = verifyObjectIds(_ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const faq = await faqLean
        .findOne({ ...filter, ...makePredomFilter(req) })
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
    const { propSort } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);
    const aggCursor = faqLean
        .aggregate([
        ...lookupSubFieldInvoiceRelatedFilter(constructFiltersFromBody(req), propSort, offset, limit)
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
    const { _id } = req.params;
    const { companyId } = req.user;
    // const { companyId } = req.user;
    const _ids = [_id];
    const filter = { _id, companyId };
    const isValid = verifyObjectIds(_ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await faqMain.findOneAndDelete(filter);
    if (Boolean(deleted)) {
        addParentToLocals(res, _id, faqMain.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
faqRoutes.post('/createans', requireAuth, requireActiveCompany, roleAuthorisation('faqs', 'create'), async (req, res) => {
    const faq = req.body.faq;
    const { companyId } = req.user;
    faq.companyId = companyId;
    faq.urId = await generateUrId(faqanswerMain);
    const newFaqAns = new faqanswerMain(faq);
    let errResponse;
    const saved = await newFaqAns.save()
        .catch(err => {
        faqRoutesLogger.error('createans - err: ', err);
        errResponse = {
            success: false,
            status: 403
        };
        if (err && err.errors) {
            errResponse.err = stringifyMongooseErr(err.errors);
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
    const deleted = await faqanswerMain.findOneAndDelete({ _id })
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