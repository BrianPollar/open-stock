/* eslint-disable @typescript-eslint/no-misused-promises */

import { requireActiveCompany } from '@open-stock/stock-auth-server';
import { Icustomrequest, IdataArrayResponse, Isuccess } from '@open-stock/stock-universal';
import { makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import { getLogger } from 'log4js';
import { faqLean, faqMain } from '../models/faq.model';
import { faqanswerLean, faqanswerMain } from '../models/faqanswer.model';

/** Logger for faqRoutes */
const faqRoutesLogger = getLogger('routes/faqRoutes');

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
faqRoutes.post('/create/:companyIdParam', async(req, res) => {
  const faq = req.body.faq;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  faq.companyId = queryId;
  const isValid = verifyObjectId(queryId);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const count = await faqMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
  faq.urId = makeUrId(Number(count[0]?.urId || '0'));
  const newFaq = new faqMain(faq);
  let errResponse: Isuccess;
  const saved = await newFaq.save()
    .catch(err => {
      faqRoutesLogger.error('create - err: ', err);
      errResponse = {
        success: false,
        status: 403
      };
      if (err && err.errors) {
        errResponse.err = stringifyMongooseErr(err.errors);
      } else {
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
faqRoutes.get('/getone/:id/:companyIdParam', async(req, res) => {
  const { id } = req.params;
  // const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  // const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const queryId = companyIdParam;
  const isValid = verifyObjectIds([id, queryId]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const faq = await faqLean
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
faqRoutes.get('/getall/:offset/:limit/:companyIdParam', async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  // const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  // const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const queryId = companyIdParam;
  const all = await Promise.all([
    faqLean
      .find({ companyId: queryId })
      .skip(offset)
      .limit(limit)
      .lean(),
    faqLean.countDocuments({ companyId: queryId })
  ]);
  const response: IdataArrayResponse = {
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
faqRoutes.delete('/deleteone/:id/:companyIdParam', async(req, res) => {
  const { id } = req.params;
  // const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  // const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const queryId = companyIdParam;
  const isValid = verifyObjectIds([id, queryId]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const deleted = await faqMain.findOneAndDelete({ _id: id, companyId: queryId });
  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
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
faqRoutes.post('/createans/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('faqs', 'create'), async(req, res) => {
  const faq = req.body.faq;
  // const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  // const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const queryId = companyIdParam;
  faq.companyId = queryId;
  const isValid = verifyObjectId(queryId);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const count = await faqanswerMain.countDocuments();
  faq.urId = makeUrId(count);
  const newFaqAns = new faqanswerMain(faq);
  let errResponse: Isuccess;
  const saved = await newFaqAns.save()
    .catch(err => {
      faqRoutesLogger.error('createans - err: ', err);
      errResponse = {
        success: false,
        status: 403
      };
      if (err && err.errors) {
        errResponse.err = stringifyMongooseErr(err.errors);
      } else {
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
faqRoutes.get('/getallans/:faqId/:companyIdParam', async(req, res) => {
  // const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  // const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const queryId = companyIdParam;
  const faqsAns = await faqanswerLean
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
faqRoutes.delete('/deleteoneans/:id/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('faqs', 'delete'), async(req, res) => {
  const { id } = req.params;
  // const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  // const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const queryId = companyIdParam;
  const isValid = verifyObjectIds([id, queryId]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const deleted = await faqanswerMain.findOneAndDelete({ _id: id, companyId: queryId })
    .catch(err => {
      faqRoutesLogger.error('deleteoneans - err: ', err);
      return null;
    });
  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
});
