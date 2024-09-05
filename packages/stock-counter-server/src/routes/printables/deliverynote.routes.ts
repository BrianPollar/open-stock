

import { populateTrackEdit, populateTrackView, requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord } from '@open-stock/stock-auth-server';
import { IdataArrayResponse, IinvoiceRelated, Isuccess, Iuser } from '@open-stock/stock-universal';
import { addParentToLocals, makeCompanyBasedQuery, makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr } from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { deliveryNoteLean, deliveryNoteMain } from '../../models/printables/deliverynote.model';
import { populateInvoiceRelated } from '../../utils/query';
import {
  deleteAllLinked,
  makeInvoiceRelatedPdct,
  relegateInvRelatedCreation,
  updateInvoiceRelated
} from './related/invoicerelated';

/** Logger for delivery note routes */
const deliveryNoteRoutesLogger = tracer.colorConsole({
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
 * Express router for delivery note routes.
 */
export const deliveryNoteRoutes = express.Router();

/**
 * Route to create a delivery note
 * @name POST /create
 * @function
 * @memberof module:deliveryNoteRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing delivery note and invoice related data
 * @param {Object} req.body.deliveryNote - Delivery note data
 * @param {Object} req.body.invoiceRelated - Invoice related data
 * @param {Object} res - Express response object
 * @returns {Object} Success status and saved delivery note data
 */
deliveryNoteRoutes.post('/create/:companyIdParam', requireAuth, requireActiveCompany, requireCanUseFeature('quotation'), roleAuthorisation('deliveryNotes', 'create'), async(req, res, next) => {
  const { deliveryNote, invoiceRelated } = req.body;
  const { filter } = makeCompanyBasedQuery(req);

  deliveryNote.companyId = filter.companyId;
  invoiceRelated.companyId = filter.companyId;
  const count = await deliveryNoteMain
    .find({ }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });

  deliveryNote.urId = makeUrId(Number(count[0]?.urId || '0'));
  const extraNotifDesc = 'Newly generated delivery note';
  const invoiceRelatedRes = await relegateInvRelatedCreation(res, invoiceRelated, filter.companyId, extraNotifDesc);

  if (!invoiceRelatedRes.success) {
    return res.status(invoiceRelatedRes.status).send(invoiceRelatedRes);
  }
  deliveryNote.invoiceRelated = invoiceRelatedRes.id;
  const newDeliveryNote = new deliveryNoteMain(deliveryNote);
  let errResponse: Isuccess;

  const saved = await newDeliveryNote.save()
    .catch(err => {
      deliveryNoteRoutesLogger.error('create - err: ', err);
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

      return err;
    });

  if (errResponse) {
    return res.status(403).send(errResponse);
  }

  if (saved && saved._id) {
    addParentToLocals(res, saved._id, deliveryNoteLean.collection.collectionName, 'makeTrackEdit');
  }

  await updateInvoiceRelated(res, invoiceRelated, filter.companyId);

  return next();
}, requireUpdateSubscriptionRecord('quotation'));

/**
 * Route to get a delivery note by UR ID
 * @name GET /getone/:urId
 * @function
 * @memberof module:deliveryNoteRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {string} req.params.urId - UR ID of the delivery note to retrieve
 * @param {Object} res - Express response object
 * @returns {Object} Delivery note data with related invoice data
 */
deliveryNoteRoutes.get('/getone/:urId/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('deliveryNotes', 'read'), async(req, res) => {
  const { urId } = req.params;
  const { filter } = makeCompanyBasedQuery(req);
  const deliveryNote = await deliveryNoteLean
    .findOne({ urId, ...filter })
    .lean()
    .populate([populateInvoiceRelated(), populateTrackEdit(), populateTrackView()]);
  let returned;

  if (deliveryNote) {
    returned = makeInvoiceRelatedPdct(
      deliveryNote.invoiceRelated as Required<IinvoiceRelated>,
      (deliveryNote.invoiceRelated as IinvoiceRelated)
        .billingUserId as unknown as Iuser,
      deliveryNote.createdAt,
      {
        _id: deliveryNote._id,
        urId: deliveryNote.urId
      }
    );

    addParentToLocals(res, deliveryNote._id, deliveryNoteLean.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(returned);
});

/**
 * Route to get all delivery notes with related invoice data
 * @name GET /getall/:offset/:limit
 * @function
 * @memberof module:deliveryNoteRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {string} req.params.offset - Offset for pagination
 * @param {string} req.params.limit - Limit for pagination
 * @param {Object} res - Express response object
 * @returns {Array} Array of delivery note data with related invoice data
 */
deliveryNoteRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('deliveryNotes', 'read'), async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const { filter } = makeCompanyBasedQuery(req);
  const all = await Promise.all([
    deliveryNoteLean
      .find(filter)
      .skip(offset)
      .limit(limit)
      .lean()
      .populate([populateInvoiceRelated(), populateTrackEdit(), populateTrackView()]),
    deliveryNoteLean.countDocuments(filter)
  ]);
  const returned = all[0]
    .map(val => makeInvoiceRelatedPdct(
      val.invoiceRelated as Required<IinvoiceRelated>,
      (val.invoiceRelated as IinvoiceRelated)
        .billingUserId as unknown as Iuser,
      (val).createdAt,
      {
        _id: val._id,
        urId: val.urId
      }
    ));
  const response: IdataArrayResponse = {
    count: all[1],
    data: returned
  };

  for (const val of all[0]) {
    addParentToLocals(res, val._id, deliveryNoteLean.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(response);
});

/**
 * Route to delete a delivery note and its related invoice data
 * @name PUT /deleteone
 * @function
 * @memberof module:deliveryNoteRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {string} req.body.id - ID of the delivery note to delete
 * @param {string} req.body.invoiceRelated - ID of the related invoice data to delete
 * @param {string} req.body.creationType - Type of creation for the related invoice data
 * @param {string} req.body.stage - Stage of the related invoice data
 * @param {Object} res - Express response object
 * @returns {Object} Success status of the deletion operation
 */
deliveryNoteRoutes.put('/deleteone/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('deliveryNotes', 'delete'), async(req, res) => {
  const { id, invoiceRelated, creationType, stage } = req.body;
  const { filter } = makeCompanyBasedQuery(req);
  const deleted = await deleteAllLinked(invoiceRelated, creationType, stage, 'deliverynote', filter.companyId);

  if (Boolean(deleted)) {
    addParentToLocals(res, id, deliveryNoteLean.collection.collectionName, 'trackDataDelete');

    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
});

/**
 * Route to search for delivery notes by search term and key
 * @name POST /search/:offset/:limit
 * @function
 * @memberof module:deliveryNoteRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {string} req.params.limit - Limit for pagination
 * @param {string} req.params.offset - Offset for pagination
 * @param {Object} req.body - Request body containing search term and key
 * @param {string} req.body.searchterm - Search term
 * @param {string} req.body.searchKey - Search key
 * @param {Object} res - Express response object
 * @returns {Array} Array of delivery note data with related invoice data
 */
deliveryNoteRoutes.post('/search/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('deliveryNotes', 'read'), async(req, res) => {
  const { searchterm, searchKey } = req.body;
  const { filter } = makeCompanyBasedQuery(req);
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const all = await Promise.all([
    deliveryNoteLean
      .find({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
      .skip(offset)
      .limit(limit)
      .lean()
      .populate([populateInvoiceRelated(), populateTrackEdit(), populateTrackView()]),
    deliveryNoteLean.countDocuments({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
  ]);
  const returned = all[0]
    .map(val => makeInvoiceRelatedPdct(
      val.invoiceRelated as Required<IinvoiceRelated>,
      (val.invoiceRelated as IinvoiceRelated)
        .billingUserId as unknown as Iuser
    ));
  const response: IdataArrayResponse = {
    count: all[1],
    data: returned
  };

  for (const val of all[0]) {
    addParentToLocals(res, val._id, deliveryNoteLean.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(response);
});

deliveryNoteRoutes.put('/deletemany/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('deliveryNotes', 'delete'), async(req, res) => {
  const { credentials } = req.body;
  const { filter } = makeCompanyBasedQuery(req);

  /** const ids = credentials
    .map(val => val.id);
  await deliveryNoteMain
    .deleteMany({ _id: { $in: ids } });**/
  const promises = credentials
    .map(async val => {
      await deleteAllLinked(val.invoiceRelated, val.creationType, val.stage, 'deliverynote', filter.companyId);

      return new Promise(resolve => resolve(true));
    });

  await Promise.all(promises);

  for (const val of credentials) {
    addParentToLocals(res, val.id, deliveryNoteLean.collection.collectionName, 'trackDataDelete');
  }

  return res.status(200).send({ success: true });
});

