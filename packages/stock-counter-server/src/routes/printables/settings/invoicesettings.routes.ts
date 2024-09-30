import { populateTrackEdit, populateTrackView, requireActiveCompany } from '@open-stock/stock-auth-server';
import {
  IcustomRequest, IdataArrayResponse,
  IdeleteMany,
  IfileMeta, IfilterAggResponse,
  IfilterProps, IinvoiceSetting, IinvoiceSettingsGeneral, Isuccess
} from '@open-stock/stock-universal';
import {
  addParentToLocals, appendBody,
  constructFiltersFromBody, deleteAllFiles, deleteFiles,
  lookupLimit, lookupOffset, lookupSort, lookupTrackEdit, lookupTrackView,
  makeCompanyBasedQuery, offsetLimitRelegator, requireAuth, roleAuthorisation,
  saveMetaToDb, stringifyMongooseErr, uploadFiles, verifyObjectId
} from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import {
  TinvoiceSetting, invoiceSettingLean, invoiceSettingMain
} from '../../../models/printables/settings/invoicesettings.model';
import { populateSignature, populateStamp } from '../../../utils/query';

/** Logger for invoice setting routes */
const invoiceSettingRoutesLogger = tracer.colorConsole({
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
 * Router for invoice settings.
 */
export const invoiceSettingRoutes = express.Router();

/**
 * Route for creating a new invoice setting
 * @name POST /create
 * @function
 * @memberof module:routes/invoiceSettingRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
invoiceSettingRoutes.post(
  '/add',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('invoices', 'create'),
  async(req: IcustomRequest<never, { invoicesettings: IinvoiceSetting}>, res) => {
    const invoiceSetting = req.body.invoicesettings;

    // remove signature and stamp if there
    if (invoiceSetting.generalSettings.defaultDigitalSignature) {
      delete invoiceSetting.generalSettings.defaultDigitalSignature;
    }
    if (invoiceSetting.generalSettings.defaultDigitalStamp) {
      delete invoiceSetting.generalSettings.defaultDigitalStamp;
    }

    const { filter } = makeCompanyBasedQuery(req);

    invoiceSetting.companyId = filter.companyId;
    const newJobCard = new invoiceSettingMain(invoiceSetting);
    let errResponse: Isuccess;

    const saved = await newJobCard.save()
      .catch(err => {
        invoiceSettingRoutesLogger.error('create - err: ', err);
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
      addParentToLocals(res, saved._id, invoiceSettingLean.collection.collectionName, 'makeTrackEdit');
    }

    return res.status(200).send({ success: true });
  }
);

invoiceSettingRoutes.post(
  '/add/img',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('invoices', 'create'),
  uploadFiles,
  appendBody,
  saveMetaToDb,
  async(req: IcustomRequest<never, { invoicesettings: IinvoiceSetting; newPhotos: string[]}>, res) => {
    const invoiceSetting = req.body.invoicesettings;
    const { filter } = makeCompanyBasedQuery(req);

    invoiceSetting.companyId = filter.companyId;
    if (req.body.newPhotos) {
      if (invoiceSetting.generalSettings.defaultDigitalSignature === 'true' &&
    invoiceSetting.generalSettings.defaultDigitalStamp === 'true') {
        invoiceSetting.generalSettings.defaultDigitalSignature = req.body.newPhotos[0];
        invoiceSetting.generalSettings.defaultDigitalStamp = req.body.newPhotos[1];
      }

      if (invoiceSetting.generalSettings.defaultDigitalSignature === 'true' &&
    invoiceSetting.generalSettings.defaultDigitalStamp === 'false') {
        invoiceSetting.generalSettings.defaultDigitalSignature = req.body.newPhotos[0];
      }

      if (invoiceSetting.generalSettings.defaultDigitalSignature === 'false' &&
    invoiceSetting.generalSettings.defaultDigitalStamp === 'true') {
        invoiceSetting.generalSettings.defaultDigitalStamp = req.body.newPhotos[0];
      }
    }

    // remove signature and stamp are not valid object _ids
    if (!verifyObjectId(invoiceSetting.generalSettings.defaultDigitalSignature as string)) {
      delete invoiceSetting.generalSettings.defaultDigitalSignature;
    }
    if (!verifyObjectId(invoiceSetting.generalSettings.defaultDigitalStamp as string)) {
      delete invoiceSetting.generalSettings.defaultDigitalStamp;
    }

    const newStn = new invoiceSettingMain(invoiceSetting);
    let errResponse: Isuccess;
    const saved = await newStn.save()
      .catch(err => {
        invoiceSettingRoutesLogger.error('createimg - err: ', err);
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
      addParentToLocals(res, saved._id, invoiceSettingLean.collection.collectionName, 'makeTrackEdit');
    }

    return res.status(200).send({ success: Boolean(saved) });
  }
);

invoiceSettingRoutes.put(
  '/update',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('invoices', 'update'),
  async(req: IcustomRequest<never, IinvoiceSetting>, res) => {
    const updatedInvoiceSetting = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    invoiceSettingRoutesLogger.debug('updatedInvoiceSetting ', updatedInvoiceSetting);

    updatedInvoiceSetting.companyId = filter.companyId;

    const { _id } = updatedInvoiceSetting;

    const invoiceSetting = await invoiceSettingMain
      .findOne({ _id, ...filter }).lean();

    if (!invoiceSetting) {
      return res.status(404).send({ success: false });
    }

    if (!invoiceSetting.generalSettings) {
      invoiceSetting.generalSettings = {} as IinvoiceSettingsGeneral;
    }

    const generalSettings = Object.assign({}, invoiceSetting.generalSettings);

    if (updatedInvoiceSetting?.generalSettings?.currency) {
      generalSettings.currency = updatedInvoiceSetting.generalSettings.currency;
    }

    if (updatedInvoiceSetting?.generalSettings?.defaultDueTime) {
      generalSettings.defaultDueTime = updatedInvoiceSetting.generalSettings.defaultDueTime;
    }

    invoiceSetting.generalSettings = generalSettings;
    invoiceSetting.taxSettings = updatedInvoiceSetting.taxSettings || invoiceSetting.taxSettings;
    invoiceSetting.bankSettings = updatedInvoiceSetting.bankSettings || invoiceSetting.bankSettings;
    invoiceSetting.printDetails = updatedInvoiceSetting.printDetails || invoiceSetting.printDetails;
    invoiceSetting.isDeleted = updatedInvoiceSetting.isDeleted || invoiceSetting.isDeleted;

    invoiceSettingRoutesLogger.debug('generalSettings', generalSettings);
    let errResponse: Isuccess;

    const updated = await invoiceSettingMain.updateOne({ _id }, { $set: {
      generalSettings, taxSettings: invoiceSetting.taxSettings,
      bankSettings: invoiceSetting.bankSettings,
      printDetails: invoiceSetting.printDetails
    } })
      .catch(err => {
        invoiceSettingRoutesLogger.error('update - err: ', err);
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

    invoiceSettingRoutesLogger.debug('updated ', updated);


    if (errResponse) {
      return res.status(403).send(errResponse);
    }

    addParentToLocals(res, invoiceSetting._id, invoiceSettingLean.collection.collectionName, 'makeTrackEdit');

    return res.status(200).send({ success: Boolean(updated) });
  }
);

invoiceSettingRoutes.post(
  '/update/img',
  requireAuth,
  requireActiveCompany,
  uploadFiles,
  appendBody,
  saveMetaToDb,
  async(req: IcustomRequest<never, { invoicesettings: IinvoiceSetting; newPhotos: IfileMeta[] | string[] }>, res) => {
    const updatedInvoiceSetting = req.body.invoicesettings;
    const { filter } = makeCompanyBasedQuery(req);

    updatedInvoiceSetting.companyId = filter.companyId;

    const { _id } = updatedInvoiceSetting;


    const found = await invoiceSettingMain.findOne({ _id, ...filter })

    /* .populate({ path: 'generalSettings.defaultDigitalSignature',
    model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
      .populate({ path: 'generalSettings.defaultDigitalStamp',
      model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
    */
      .lean();
    const invoiceSetting = await invoiceSettingMain
      .findOne({ _id, ...filter })
      .lean();

    invoiceSettingRoutesLogger.debug('all new Files', req.body.newPhotos);

    invoiceSettingRoutesLogger.info('found ', found);

    if (!invoiceSetting) {
      return res.status(404).send({ success: false });
    }
    const filesWithDir: IfileMeta[] = [];

    if (!invoiceSetting.generalSettings) {
      invoiceSetting.generalSettings = {} as IinvoiceSettingsGeneral;
    }

    invoiceSettingRoutesLogger.debug('updatedInvoiceSetting ', updatedInvoiceSetting);

    invoiceSettingRoutesLogger.error('settings newPhotos', req.body.newPhotos);

    if (req.body.newPhotos) {
      if (updatedInvoiceSetting.generalSettings.defaultDigitalSignature === 'true' &&
    updatedInvoiceSetting.generalSettings.defaultDigitalStamp === 'true') {
        if (invoiceSetting.generalSettings.defaultDigitalSignature) {
          filesWithDir.push(found.generalSettings.defaultDigitalSignature as IfileMeta);
        }
        if (invoiceSetting.generalSettings.defaultDigitalStamp) {
          filesWithDir.push(found.generalSettings.defaultDigitalStamp as IfileMeta);
        }
        updatedInvoiceSetting.generalSettings.defaultDigitalSignature = req.body.newPhotos[0];
        updatedInvoiceSetting.generalSettings.defaultDigitalStamp = req.body.newPhotos[1];
      }

      if (updatedInvoiceSetting.generalSettings.defaultDigitalSignature === 'true' &&
    updatedInvoiceSetting.generalSettings.defaultDigitalStamp === 'false') {
        if (invoiceSetting.generalSettings.defaultDigitalSignature) {
          filesWithDir.push(found.generalSettings.defaultDigitalSignature as IfileMeta);
        }
        updatedInvoiceSetting.generalSettings.defaultDigitalSignature = req.body.newPhotos[0];
      }

      if (updatedInvoiceSetting.generalSettings.defaultDigitalSignature === 'false' &&
    updatedInvoiceSetting.generalSettings.defaultDigitalStamp === 'true') {
        if (invoiceSetting.generalSettings.defaultDigitalStamp) {
          filesWithDir.push(found.generalSettings.defaultDigitalStamp as IfileMeta);
        }
        updatedInvoiceSetting.generalSettings.defaultDigitalStamp = req.body.newPhotos[0];
      }
    }
    await deleteAllFiles(filesWithDir, true);

    const generalSettings = Object.assign({}, invoiceSetting.generalSettings);

    if (updatedInvoiceSetting?.generalSettings?.currency) {
      generalSettings.currency = updatedInvoiceSetting.generalSettings.currency;
    }
    if (updatedInvoiceSetting?.generalSettings?.defaultDueTime) {
      generalSettings.defaultDueTime = updatedInvoiceSetting.generalSettings.defaultDueTime;
    }

    // add signature and stamp if are valid object _ids
    invoiceSettingRoutesLogger.info('b4 verify updatedInvoiceSetting', updatedInvoiceSetting.generalSettings);
    invoiceSettingRoutesLogger
      .info('ALLL IN verify', verifyObjectId(updatedInvoiceSetting.generalSettings.defaultDigitalSignature as string));
    if (verifyObjectId(updatedInvoiceSetting.generalSettings.defaultDigitalSignature as string)) {
      invoiceSettingRoutesLogger
        .info('passed signature', updatedInvoiceSetting.generalSettings.defaultDigitalSignature as string);
      generalSettings.defaultDigitalSignature = updatedInvoiceSetting.generalSettings.defaultDigitalSignature;
    }
    if (verifyObjectId(updatedInvoiceSetting.generalSettings.defaultDigitalStamp as string)) {
      invoiceSettingRoutesLogger.info('passed stamp ', updatedInvoiceSetting.generalSettings.defaultDigitalStamp);
      generalSettings.defaultDigitalStamp = updatedInvoiceSetting.generalSettings.defaultDigitalStamp;
    }

    invoiceSetting.generalSettings = generalSettings;
    invoiceSetting.taxSettings = updatedInvoiceSetting.taxSettings || invoiceSetting.taxSettings;
    invoiceSetting.bankSettings = updatedInvoiceSetting.bankSettings || invoiceSetting.bankSettings;
    invoiceSetting.printDetails = updatedInvoiceSetting.printDetails || invoiceSetting.printDetails;

    invoiceSettingRoutesLogger.debug('generalSettings b4 update', generalSettings);
    invoiceSettingRoutesLogger.info('get the repeat ', invoiceSetting.generalSettings);
    let errResponse: Isuccess;

    const updated = await invoiceSettingMain.updateOne({ _id }, { $set: {
      generalSettings, taxSettings: invoiceSetting.taxSettings,
      bankSettings: invoiceSetting.bankSettings,
      printDetails: invoiceSetting.printDetails
    } })
      .catch(err => {
        invoiceSettingRoutesLogger.error('updateimg - err: ', err);
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

    addParentToLocals(res, found._id, invoiceSettingLean.collection.collectionName, 'makeTrackEdit');

    invoiceSettingRoutesLogger.debug('updated', updated);

    return res.status(200).send({ success: Boolean(updated) });
  }
);

invoiceSettingRoutes.get(
  '/one/:_id',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('invoices', 'read'),
  async(req: IcustomRequest<{ _id: string }, null>, res) => {
    const { _id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const invoiceSetting = await invoiceSettingLean
      .findOne({ _id, ...filter })
      .populate([populateSignature(), populateStamp(), populateTrackEdit(), populateTrackView()])
      .lean();

    if (!invoiceSetting) {
      return res.status(404).send({ success: false, err: 'not found' });
    }

    addParentToLocals(res, invoiceSetting._id, invoiceSettingLean.collection.collectionName, 'trackDataView');

    return res.status(200).send(invoiceSetting);
  }
);

invoiceSettingRoutes.get(
  '/all/:offset/:limit',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('invoices', 'read'),
  async(req: IcustomRequest<{ offset: string; limit: string }, null>, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { filter } = makeCompanyBasedQuery(req);
    const all = await Promise.all([
      invoiceSettingLean
        .find({ ...filter })
        .populate([populateSignature(), populateStamp(), populateTrackEdit(), populateTrackView()])
        .skip(offset)
        .limit(limit)
        .lean(),
      invoiceSettingLean.countDocuments({ ...filter })
    ]);

    const response: IdataArrayResponse<TinvoiceSetting> = {
      count: all[1],
      data: all[0]
    };

    for (const val of all[0]) {
      addParentToLocals(res, val._id, invoiceSettingLean.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

invoiceSettingRoutes.delete(
  '/delete/one/:_id',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('invoices', 'delete'),
  async(req: IcustomRequest<never, unknown>, res) => {
    const { _id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);

    // const deleted = await invoiceSettingMain.findOneAndDelete({ _id, ...filter });
    const deleted = await invoiceSettingMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } });

    if (Boolean(deleted)) {
      addParentToLocals(res, _id, invoiceSettingLean.collection.collectionName, 'trackDataDelete');

      return res.status(200).send({ success: Boolean(deleted) });
    } else {
      return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
  }
);

invoiceSettingRoutes.post(
  '/filter',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('invoices', 'read'),
  async(req: IcustomRequest<never, IfilterProps>, res) => {
    const { propSort } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);

    const filter = constructFiltersFromBody(req);

    const aggCursor = invoiceSettingLean.aggregate<IfilterAggResponse<TinvoiceSetting>>([
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
      {
        $facet: {
          data: [...lookupSort(propSort), ...lookupOffset(offset), ...lookupLimit(limit)],
          total: [{ $count: 'count' }]
        }
      },
      {
        $unwind: {
          path: '$total',
          preserveNullAndEmptyArrays: true
        }
      }
    ]);
    const dataArr: IfilterAggResponse<TinvoiceSetting>[] = [];

    for await (const data of aggCursor) {
      dataArr.push(data);
    }

    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;

    const response: IdataArrayResponse<TinvoiceSetting> = {
      count,
      data: all
    };

    for (const val of all) {
      addParentToLocals(res, val._id, invoiceSettingLean.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

invoiceSettingRoutes.put(
  '/delete/many',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('invoices', 'delete'),
  async(req: IcustomRequest<never, IdeleteMany>, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    /* const deleted = await invoiceSettingMain
    .deleteMany({ ...filter, _id: { $in: _ids } })
    .catch(err => {
      invoiceSettingRoutesLogger.error('deletemany - err: ', err);

      return null;
    }); */

    const deleted = await invoiceSettingMain
      .updateMany({ ...filter, _id: { $in: _ids } }, {
        $set: { isDeleted: true }
      })
      .catch(err => {
        invoiceSettingRoutesLogger.error('deletemany - err: ', err);

        return null;
      });

    if (Boolean(deleted)) {
      for (const val of _ids) {
        addParentToLocals(res, val, invoiceSettingLean.collection.collectionName, 'trackDataDelete');
      }

      return res.status(200).send({ success: Boolean(deleted) });
    } else {
      return res.status(404).send({
        success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
  }
);


invoiceSettingRoutes.put(
  '/delete/images',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('invoices', 'delete'),
  deleteFiles(true),
  async(req: IcustomRequest<never, { filesWithDir: IfileMeta[]; item}>, res) => {
    const filesWithDir: IfileMeta[] = req.body.filesWithDir;
    const { filter } = makeCompanyBasedQuery(req);

    if (filesWithDir && !filesWithDir.length) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const updatedProduct = req.body.item;

    const { _id } = updatedProduct;

    const invoiceSetting = await invoiceSettingMain
      .findOne({ _id, ...filter })
      .lean();

    if (!invoiceSetting) {
      return res.status(404).send({ success: false, err: 'item not found' });
    }
    const filesWithDirIds = filesWithDir.map(val => val._id);

    if (filesWithDirIds.includes(invoiceSetting.generalSettings.defaultDigitalSignature as unknown as string)) {
      delete invoiceSetting.generalSettings.defaultDigitalSignature;
    }

    if (filesWithDirIds.includes(invoiceSetting.generalSettings.defaultDigitalStamp as unknown as string)) {
      delete invoiceSetting.generalSettings.defaultDigitalStamp;
    }

    let errResponse: Isuccess;

    await invoiceSettingMain.updateOne({
      _id, ...filter
    }, {
      $set: {
        generalSettings: invoiceSetting.generalSettings

      }
    }).catch(err => {
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

    addParentToLocals(res, invoiceSetting._id, invoiceSettingLean.collection.collectionName, 'makeTrackEdit');

    return res.status(200).send({ success: true });
  }
);
