

import { requireActiveCompany } from '@open-stock/stock-auth-server';
import { IdataArrayResponse, Isuccess } from '@open-stock/stock-universal';
import { addParentToLocals, makeCompanyBasedQuery, makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr } from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { paymentLean } from '../../../models/payment.model';
import { estimateLean } from '../../../models/printables/estimate.model';
import { taxReportLean, taxReportMain } from '../../../models/printables/report/taxreport.model';

/** Logger for tax report routes */
const taxReportRoutesLogger = tracer.colorConsole({
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
 * Router for tax report routes.
 */
export const taxReportRoutes = express.Router();

/**
 * Create a new tax report
 * @name POST /create
 * @function
 * @memberof module:taxReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} - Promise object representing the response
 */
taxReportRoutes.post('/create/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'create'), async(req, res) => {
  const taxReport = req.body.taxReport;
  const { filter } = makeCompanyBasedQuery(req);

  taxReport.companyId = filter.companyId;
  const count = await taxReportMain
    .find({ }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });

  taxReport.urId = makeUrId(Number(count[0]?.urId || '0'));
  const newTaxReport = new taxReportMain(taxReport);
  let errResponse: Isuccess;

  const saved = await newTaxReport.save()
    .catch(err => {
      taxReportRoutesLogger.error('create - err: ', err);
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
    addParentToLocals(res, saved._id, taxReportMain.collection.collectionName, 'makeTrackEdit');
  }

  return res.status(200).send({ success: true });
});

/**
 * Get a single tax report by UR ID
 * @name GET /getone/:urId
 * @function
 * @memberof module:taxReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} - Promise object representing the response
 */
taxReportRoutes.get('/getone/:urId/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'read'), async(req, res) => {
  const { urId } = req.params;
  const { filter } = makeCompanyBasedQuery(req);
  const taxReport = await taxReportLean
    .findOne({ urId, ...filter })
    .lean()
    .populate({ path: 'estimates', model: estimateLean })
    .populate({ path: 'payments', model: paymentLean });

  if (taxReport) {
    addParentToLocals(res, taxReport._id, taxReportMain.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(taxReport);
});

/**
 * Get all tax reports with pagination
 * @name GET /getall/:offset/:limit
 * @function
 * @memberof module:taxReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} - Promise object representing the response
 */
taxReportRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'read'), async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const { filter } = makeCompanyBasedQuery(req);
  const all = await Promise.all([
    taxReportLean
      .find({ ...filter })
      .skip(offset)
      .limit(limit)
      .lean()
      .populate({ path: 'estimates', model: estimateLean })
      .populate({ path: 'payments', model: paymentLean }),
    taxReportLean.countDocuments({ ...filter })
  ]);
  const response: IdataArrayResponse = {
    count: all[1],
    data: all[0]
  };

  for (const val of all[0]) {
    addParentToLocals(res, val._id, taxReportMain.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(response);
});

/**
 * Delete a single tax report by ID
 * @name DELETE /deleteone/:id
 * @function
 * @memberof module:taxReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} - Promise object representing the response
 */
taxReportRoutes.delete('/deleteone/:id/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'delete'), async(req, res) => {
  const { id } = req.params;
  const { filter } = makeCompanyBasedQuery(req);
  // eslint-disable-next-line @typescript-eslint/naming-convention
  // const deleted = await taxReportMain.findOneAndDelete({ _id: id, ...filter });
  const deleted = await taxReportMain.updateOne({ _id: id, ...filter }, { $set: { isDeleted: true } });

  if (Boolean(deleted)) {
    addParentToLocals(res, id, taxReportMain.collection.collectionName, 'trackDataDelete');

    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
});

/**
 * Search for tax reports with pagination
 * @name POST /search/:offset/:limit
 * @function
 * @memberof module:taxReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} - Promise object representing the response
 */
taxReportRoutes.post('/search/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'read'), async(req, res) => {
  const { searchterm, searchKey } = req.body;
  const { filter } = makeCompanyBasedQuery(req);
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);

  const all = await Promise.all([
    taxReportLean
      .find({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
      .skip(offset)
      .limit(limit)
      .lean()
      .populate({ path: 'estimates', model: estimateLean })
      .populate({ path: 'payments', model: paymentLean }),
    taxReportLean.countDocuments({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
  ]);
  const response: IdataArrayResponse = {
    count: all[1],
    data: all[0]
  };

  for (const val of all[0]) {
    addParentToLocals(res, val._id, taxReportMain.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(response);
});

/**
 * Delete multiple tax reports by ID
 * @name PUT /deletemany
 * @function
 * @memberof module:taxReportRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} - Promise object representing the response
 */
taxReportRoutes.put('/deletemany/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'delete'), async(req, res) => {
  const { ids } = req.body;
  const { filter } = makeCompanyBasedQuery(req);

  /* const deleted = await taxReportMain
    .deleteMany({ ...filter, _id: { $in: ids } })
    .catch(err => {
      taxReportRoutesLogger.error('deletemany - err: ', err);

      return null;
    }); */

  const deleted = await taxReportMain
    .updateMany({ ...filter, _id: { $in: ids } }, {
      $set: { isDeleted: true }
    })
    .catch(err => {
      taxReportRoutesLogger.error('deletemany - err: ', err);

      return null;
    });


  if (Boolean(deleted)) {
    for (const val of ids) {
      addParentToLocals(res, val, taxReportMain.collection.collectionName, 'trackDataDelete');
    }

    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
  }
});
