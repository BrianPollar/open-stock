import { populateTrackEdit, populateTrackView, requireActiveCompany } from '@open-stock/stock-auth-server';
import {
  IcustomRequest, IdataArrayResponse,
  IdeleteMany,
  IfileMeta, IfilterAggResponse,
  IfilterProps, IinvoiceSetting, IinvoiceSettingsGeneral
} from '@open-stock/stock-universal';
import {
  addParentToLocals, appendBody,
  constructFiltersFromBody, deleteAllFiles, deleteFiles,
  handleMongooseErr,
  lookupFacet,
  lookupTrackEdit, lookupTrackView,
  mainLogger,
  makeCompanyBasedQuery, offsetLimitRelegator, requireAuth, roleAuthorisation,
  saveMetaToDb, uploadFiles, verifyObjectId
} from '@open-stock/stock-universal-server';
import express from 'express';
import { Error } from 'mongoose';
import {
  TinvoiceSetting, invoiceSettingLean, invoiceSettingMain
} from '../../../models/printables/settings/invoicesettings.model';
import { populateSignature, populateStamp } from '../../../utils/query';

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


    const savedRes = await newJobCard.save()
      .catch((err: Error) => err);

    if (savedRes instanceof Error) {
      const errResponse = handleMongooseErr(savedRes);

      return res.status(errResponse.status).send(errResponse);
    }

    addParentToLocals(res, savedRes._id, invoiceSettingLean.collection.collectionName, 'makeTrackEdit');

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

    const savedRes = await newStn.save()
      .catch((err: Error) => err);

    if (savedRes instanceof Error) {
      const errResponse = handleMongooseErr(savedRes);

      return res.status(errResponse.status).send(errResponse);
    }

    addParentToLocals(res, savedRes._id, invoiceSettingLean.collection.collectionName, 'makeTrackEdit');

    return res.status(200).send({ success: true });
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

    mainLogger.debug('updatedInvoiceSetting ', updatedInvoiceSetting);

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

    mainLogger.debug('generalSettings', generalSettings);


    const updateRes = await invoiceSettingMain.updateOne({ _id }, { $set: {
      generalSettings, taxSettings: invoiceSetting.taxSettings,
      bankSettings: invoiceSetting.bankSettings,
      printDetails: invoiceSetting.printDetails
    } })
      .catch((err: Error) => err);


    if (updateRes instanceof Error) {
      const errResponse = handleMongooseErr(updateRes);

      return res.status(errResponse.status).send(errResponse);
    }

    addParentToLocals(res, invoiceSetting._id, invoiceSettingLean.collection.collectionName, 'makeTrackEdit');

    return res.status(200).send({ success: true });
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

    if (!found) {
      return res.status(404).send({ success: false });
    }
    const invoiceSetting = await invoiceSettingMain
      .findOne({ _id, ...filter })
      .lean();

    mainLogger.debug('all new Files', req.body.newPhotos);

    mainLogger.info('found ', found);

    if (!invoiceSetting) {
      return res.status(404).send({ success: false });
    }
    const filesWithDir: IfileMeta[] = [];

    if (!invoiceSetting.generalSettings) {
      invoiceSetting.generalSettings = {} as IinvoiceSettingsGeneral;
    }

    mainLogger.debug('updatedInvoiceSetting ', updatedInvoiceSetting);

    mainLogger.error('settings newPhotos', req.body.newPhotos);

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
    mainLogger.info('b4 verify updatedInvoiceSetting', updatedInvoiceSetting.generalSettings);
    mainLogger
      .info('ALLL IN verify', verifyObjectId(updatedInvoiceSetting.generalSettings.defaultDigitalSignature as string));
    if (verifyObjectId(updatedInvoiceSetting.generalSettings.defaultDigitalSignature as string)) {
      mainLogger
        .info('passed signature', updatedInvoiceSetting.generalSettings.defaultDigitalSignature as string);
      generalSettings.defaultDigitalSignature = updatedInvoiceSetting.generalSettings.defaultDigitalSignature;
    }
    if (verifyObjectId(updatedInvoiceSetting.generalSettings.defaultDigitalStamp as string)) {
      mainLogger.info('passed stamp ', updatedInvoiceSetting.generalSettings.defaultDigitalStamp);
      generalSettings.defaultDigitalStamp = updatedInvoiceSetting.generalSettings.defaultDigitalStamp;
    }

    invoiceSetting.generalSettings = generalSettings;
    invoiceSetting.taxSettings = updatedInvoiceSetting.taxSettings || invoiceSetting.taxSettings;
    invoiceSetting.bankSettings = updatedInvoiceSetting.bankSettings || invoiceSetting.bankSettings;
    invoiceSetting.printDetails = updatedInvoiceSetting.printDetails || invoiceSetting.printDetails;

    mainLogger.debug('generalSettings b4 update', generalSettings);
    mainLogger.info('get the repeat ', invoiceSetting.generalSettings);


    const updateRes = await invoiceSettingMain.updateOne({ _id }, { $set: {
      generalSettings, taxSettings: invoiceSetting.taxSettings,
      bankSettings: invoiceSetting.bankSettings,
      printDetails: invoiceSetting.printDetails
    } })
      .catch((err: Error) => err);

    if (updateRes instanceof Error) {
      const errResponse = handleMongooseErr(updateRes);

      return res.status(errResponse.status).send(errResponse);
    }

    addParentToLocals(res, found._id, invoiceSettingLean.collection.collectionName, 'makeTrackEdit');

    return res.status(200).send({ success: true });
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
    const updateRes = await invoiceSettingMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } })
      .catch((err: Error) => err);

    if (updateRes instanceof Error) {
      const errResponse = handleMongooseErr(updateRes);

      return res.status(errResponse.status).send(errResponse);
    }

    addParentToLocals(res, _id, invoiceSettingLean.collection.collectionName, 'trackDataDelete');

    return res.status(200).send({ success: true });
  }
);

invoiceSettingRoutes.post(
  '/filter',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('invoices', 'read'),
  async(req: IcustomRequest<never, IfilterProps>, res) => {
    const { propSort, returnEmptyArr } = req.body;
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
      ...lookupFacet(offset, limit, propSort, returnEmptyArr)
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

    const updateRes = await invoiceSettingMain
      .updateMany({ ...filter, _id: { $in: _ids } }, {
        $set: { isDeleted: true }
      }).catch((err: Error) => err);

    if (updateRes instanceof Error) {
      const errResponse = handleMongooseErr(updateRes);

      return res.status(errResponse.status).send(errResponse);
    }

    for (const val of _ids) {
      addParentToLocals(res, val, invoiceSettingLean.collection.collectionName, 'trackDataDelete');
    }

    return res.status(200).send({ success: true });
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


    const updateRes = await invoiceSettingMain.updateOne({
      _id, ...filter
    }, {
      $set: {
        generalSettings: invoiceSetting.generalSettings

      }
    }).catch((err: Error) => err);

    if (updateRes instanceof Error) {
      const errResponse = handleMongooseErr(updateRes);

      return res.status(errResponse.status).send(errResponse);
    }

    addParentToLocals(res, invoiceSetting._id, invoiceSettingLean.collection.collectionName, 'makeTrackEdit');

    return res.status(200).send({ success: true });
  }
);
