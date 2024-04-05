"use strict";
/* eslint-disable @typescript-eslint/no-misused-promises */
Object.defineProperty(exports, "__esModule", { value: true });
exports.faqRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const log4js_1 = require("log4js");
const faq_model_1 = require("../models/faq.model");
const faqanswer_model_1 = require("../models/faqanswer.model");
/** Logger for faqRoutes */
const faqRoutesLogger = (0, log4js_1.getLogger)('routes/faqRoutes');
/**
 * Router for FAQ routes.
 */
exports.faqRoutes = express_1.default.Router();
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
exports.faqRoutes.post('/create/:companyIdParam', async (req, res) => {
    const faq = req.body.faq;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    faq.companyId = queryId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const count = await faq_model_1.faqMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    faq.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
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
        return errResponse;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
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
exports.faqRoutes.get('/getone/:id/:companyIdParam', async (req, res) => {
    const { id } = req.params;
    // const { companyId } = (req as Icustomrequest).user;
    const { companyIdParam } = req.params;
    // const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const queryId = companyIdParam;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const faq = await faq_model_1.faqLean
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOne({ _id: id, companyId: queryId })
        .lean();
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
exports.faqRoutes.get('/getall/:offset/:limit/:companyIdParam', async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    // const { companyId } = (req as Icustomrequest).user;
    const { companyIdParam } = req.params;
    // const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const queryId = companyIdParam;
    const all = await Promise.all([
        faq_model_1.faqLean
            .find({ companyId: queryId })
            .skip(offset)
            .limit(limit)
            .lean(),
        faq_model_1.faqLean.countDocuments({ companyId: queryId })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
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
exports.faqRoutes.delete('/deleteone/:id/:companyIdParam', async (req, res) => {
    const { id } = req.params;
    // const { companyId } = (req as Icustomrequest).user;
    const { companyIdParam } = req.params;
    // const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const queryId = companyIdParam;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const deleted = await faq_model_1.faqMain.findOneAndDelete({ _id: id, companyId: queryId });
    if (Boolean(deleted)) {
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
exports.faqRoutes.post('/createans/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('faqs', 'create'), async (req, res) => {
    const faq = req.body.faq;
    // const { companyId } = (req as Icustomrequest).user;
    const { companyIdParam } = req.params;
    // const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const queryId = companyIdParam;
    faq.companyId = queryId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const count = await faqanswer_model_1.faqanswerMain.countDocuments();
    faq.urId = (0, stock_universal_server_1.makeUrId)(count);
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
        return errResponse;
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
exports.faqRoutes.get('/getallans/:faqId/:companyIdParam', async (req, res) => {
    // const { companyId } = (req as Icustomrequest).user;
    const { companyIdParam } = req.params;
    // const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const queryId = companyIdParam;
    const faqsAns = await faqanswer_model_1.faqanswerLean
        .find({ faq: req.params.faqId, companyId: queryId })
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
exports.faqRoutes.delete('/deleteoneans/:id/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('faqs', 'delete'), async (req, res) => {
    const { id } = req.params;
    // const { companyId } = (req as Icustomrequest).user;
    const { companyIdParam } = req.params;
    // const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const queryId = companyIdParam;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const deleted = await faqanswer_model_1.faqanswerMain.findOneAndDelete({ _id: id, companyId: queryId })
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