/* eslint-disable @typescript-eslint/no-misused-promises */
import { requireActiveCompany } from '@open-stock/stock-auth-server';
import { addParentToLocals, makePredomFilter, makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
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
/**
 * Create a new FAQ
 * @name POST /create
 * @function
 * @memberof module:routes/faqRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {Object} req.body.faq - FAQ object to create
 * @param {Object} res - Express response object
 * @returns {Object} Success status and saved FAQ object
 */
faqRoutes.post('/create/:companyIdParam', async (req, res) => {
    const faq = req.body.faq;
    const count = await faqMain
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
/**
 * Get a single FAQ by ID
 * @name GET /getone/:id
 * @function
 * @memberof module:routes/faqRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {string} req.params.id - ID of the FAQ to retrieve
 * @param {Object} res - Express response object
 * @returns {Object} The requested FAQ object
 */
faqRoutes.get('/getone/:id/:companyIdParam', async (req, res) => {
    const { id, companyIdParam } = req.params;
    // const { companyId } = (req as Icustomrequest).user;
    let ids;
    let filter;
    if (companyIdParam !== 'undefined') {
        ids = [id, companyIdParam];
        filter = { _id: id, companyId: companyIdParam };
    }
    else {
        ids = [id];
        filter = { _id: id };
    }
    const isValid = verifyObjectIds(ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const faq = await faqLean
        .findOne({ ...filter, ...makePredomFilter(req) })
        .lean();
    if (faq) {
        addParentToLocals(res, faq._id, faqMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(faq);
});
/**
 * Get all FAQs with pagination
 * @name GET /getall/:offset/:limit
 * @function
 * @memberof module:routes/faqRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {string} req.params.offset - Offset for pagination
 * @param {string} req.params.limit - Limit for pagination
 * @param {Object} res - Express response object
 * @returns {Object[]} Array of FAQ objects
 */
faqRoutes.get('/getall/:offset/:limit/:companyIdParam', async (req, res) => {
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
/**
 * Delete a single FAQ by ID
 * @name DELETE /deleteone/:id
 * @function
 * @memberof module:routes/faqRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {string} req.params.id - ID of the FAQ to delete
 * @param {Object} res - Express response object
 * @returns {Object} Success status and deleted FAQ object
 */
faqRoutes.delete('/deleteone/:id/:companyIdParam', requireAuth, requireActiveCompany, async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    // const { companyId } = (req as Icustomrequest).user;
    const { companyIdParam } = req.params;
    let filter;
    let ids;
    if (companyIdParam !== 'undefined') {
        ids = [id, companyIdParam];
        filter = { _id: id, companyId: companyIdParam };
    }
    else {
        ids = [id];
        filter = { _id: id, companyId };
    }
    const isValid = verifyObjectIds(ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const deleted = await faqMain.findOneAndDelete(filter);
    if (Boolean(deleted)) {
        addParentToLocals(res, id, faqMain.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
/**
 * Create a new FAQ answer
 * @name POST /createans
 * @function
 * @memberof module:routes/faqRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {Object} req.body.faq - FAQ answer object to create
 * @param {Object} res - Express response object
 * @returns {Object} Success status and saved FAQ answer object
 */
faqRoutes.post('/createans/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('faqs', 'create'), async (req, res) => {
    const faq = req.body.faq;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    if (companyIdParam !== 'undefined') {
        const isValid = verifyObjectId(companyIdParam);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
    }
    faq.companyId = companyId;
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
        return err;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    return res.status(200).send({ success: Boolean(saved) });
});
/**
 * Get all FAQ answers for a given FAQ ID
 * @name GET /getallans/:faqId
 * @function
 * @memberof module:routes/faqRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {string} req.params.faqId - ID of the FAQ to retrieve answers for
 * @param {Object} res - Express response object
 * @returns {Object[]} Array of FAQ answer objects
 */
faqRoutes.get('/getallans/:faqId/:companyIdParam', async (req, res) => {
    const faqsAns = await faqanswerLean
        .find({ faq: req.params.faqId, ...makePredomFilter(req) })
        .lean();
    return res.status(200).send(faqsAns);
});
/**
 * Delete a single FAQ answer by ID
 * @name DELETE /deleteoneans/:id
 * @function
 * @memberof module:routes/faqRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {string} req.params.id - ID of the FAQ answer to delete
 * @param {Object} res - Express response object
 * @returns {Object} Success status and deleted FAQ answer object
 */
faqRoutes.delete('/deleteoneans/:id/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('faqs', 'delete'), async (req, res) => {
    const { id } = req.params;
    const { companyIdParam } = req.params;
    const isValid = verifyObjectIds([id, companyIdParam]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const deleted = await faqanswerMain.findOneAndDelete({ _id: id, companyId: companyIdParam })
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