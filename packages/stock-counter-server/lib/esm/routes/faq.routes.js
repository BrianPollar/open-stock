/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { faqanswerLean, faqanswerMain } from '../models/faqanswer.model';
import { faqLean, faqMain } from '../models/faq.model';
import { getLogger } from 'log4js';
import { makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId } from '@open-stock/stock-universal-server';
/** */
const faqRoutesLogger = getLogger('routes/faqRoutes');
/** */
export const faqRoutes = express.Router();
faqRoutes.post('/create', async (req, res) => {
    const faq = req.body.faq;
    const count = await faqMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    faq.urId = makeUrId(Number(count[0]?.urId || '0'));
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
        return errResponse;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    return res.status(200).send({ success: Boolean(saved) });
});
faqRoutes.get('/getone/:id', async (req, res) => {
    const { id } = req.params;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const faq = await faqLean
        .findById(id)
        .lean();
    return res.status(200).send(faq);
});
faqRoutes.get('/getall/:offset/:limit', async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const faqs = await faqLean
        .find({})
        .skip(offset)
        .limit(limit)
        .lean();
    return res.status(200).send(faqs);
});
faqRoutes.delete('/deleteone/:id', async (req, res) => {
    const { id } = req.params;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await faqMain.findByIdAndDelete(id);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
faqRoutes.post('/createans', requireAuth, roleAuthorisation('faqs'), async (req, res) => {
    const faq = req.body.faq;
    const count = await faqanswerMain.countDocuments();
    faq.urId = makeUrId(count);
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
        return errResponse;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    return res.status(200).send({ success: Boolean(saved) });
});
faqRoutes.get('/getallans/:faqId', async (req, res) => {
    const faqsAns = await faqanswerLean
        .find({ faq: req.params.faqId })
        .lean();
    return res.status(200).send(faqsAns);
});
faqRoutes.delete('/deleteoneans/:id', requireAuth, roleAuthorisation('faqs'), async (req, res) => {
    const { id } = req.params;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await faqanswerMain.findByIdAndDelete(id)
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