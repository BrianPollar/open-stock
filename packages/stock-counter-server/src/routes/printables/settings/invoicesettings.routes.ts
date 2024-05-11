import { requireActiveCompany } from '@open-stock/stock-auth-server';
import { Icustomrequest, IdataArrayResponse, IfileMeta, Isuccess } from '@open-stock/stock-universal';
import { appendBody, deleteFiles, fileMetaLean, offsetLimitRelegator, requireAuth, roleAuthorisation, saveMetaToDb, stringifyMongooseErr, uploadFiles, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { invoiceSettingLean, invoiceSettingMain } from '../../../models/printables/settings/invoicesettings.model';

/** Logger for invoice setting routes */
const invoiceSettingRoutesLogger = tracer.colorConsole(
  {
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
invoiceSettingRoutes.post('/create/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'create'), async(req, res, next) => {
  const invoiceSetting = req.body.invoicesettings;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectId(queryId);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  invoiceSetting.companyId = queryId;
  const newJobCard = new invoiceSettingMain(invoiceSetting);
  let errResponse: Isuccess;
  await newJobCard.save()
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
      return errResponse;
    });

  if (errResponse) {
    return res.status(403).send(errResponse);
  }
  return res.status(200).send({ success: true });
});

/**
 * Route for creating a new invoice setting with image
 * @name POST /createimg
 * @function
 * @memberof module:routes/invoiceSettingRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
invoiceSettingRoutes.post('/createimg/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'create'), uploadFiles, appendBody, saveMetaToDb, async(req, res) => {
  const invoiceSetting = req.body.invoicesettings;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectId(queryId);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  invoiceSetting.companyId = queryId;
  if (req.body.newPhotos) {
    if (invoiceSetting.generalSettings.defaultDigitalSignature === 'true' &&
    invoiceSetting.generalSettings.defaultDigitalStamp) {
      invoiceSetting.generalSettings.defaultDigitalSignature = req.body.newPhotos[0];
      invoiceSetting.generalSettings.defaultDigitalStamp = req.body.newPhotos[1];
    }

    if (invoiceSetting.generalSettings.defaultDigitalSignature === 'true' &&
    invoiceSetting.generalSettings.defaultDigitalSignature === 'false') {
      invoiceSetting.generalSettings.defaultDigitalSignature = req.body.newPhotos[0];
    }

    if (invoiceSetting.generalSettings.defaultDigitalSignature === 'false' &&
    invoiceSetting.generalSettings.defaultDigitalSignature === 'true') {
      invoiceSetting.generalSettings.defaultDigitalStamp = req.body.newPhotos[0];
    }
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
      return errResponse;
    });

  if (errResponse) {
    return res.status(403).send(errResponse);
  }
  return res.status(200).send({ success: Boolean(saved) });
});

/**
 * Route for updating an existing invoice setting
 * @name PUT /update
 * @function
 * @memberof module:routes/invoiceSettingRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
invoiceSettingRoutes.put('/update/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'update'), async(req, res) => {
  const updatedInvoiceSetting = req.body.invoicesettings;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  updatedInvoiceSetting.companyId = queryId;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { _id } = updatedInvoiceSetting;
  const isValid = verifyObjectIds([_id, queryId]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const invoiceSetting = await invoiceSettingMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .findOneAndUpdate({ _id, companyId: queryId });
  if (!invoiceSetting) {
    return res.status(404).send({ success: false });
  }
  invoiceSetting['generalSettings'] = updatedInvoiceSetting.generalSettings || invoiceSetting['generalSettings'];
  invoiceSetting['taxSettings'] = updatedInvoiceSetting.taxSettings || invoiceSetting['taxSettings'];
  invoiceSetting['bankSettings'] = updatedInvoiceSetting.bankSettings || invoiceSetting['bankSettings'];
  let errResponse: Isuccess;
  const updated = await invoiceSetting.save()
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

  if (errResponse) {
    return res.status(403).send(errResponse);
  }
  return res.status(200).send({ success: Boolean(updated) });
});

/**
 * Route for updating an existing invoice setting with image
 * @name PUT /updateimg
 * @function
 * @memberof module:routes/invoiceSettingRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
invoiceSettingRoutes.put('/updateimg/:companyIdParam', requireAuth, requireActiveCompany, uploadFiles, appendBody, saveMetaToDb, deleteFiles, async(req, res) => {
  const updatedInvoiceSetting = req.body.invoicesettings;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  updatedInvoiceSetting.companyId = queryId;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { _id } = updatedInvoiceSetting;
  const isValid = verifyObjectIds([_id, queryId]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const invoiceSetting = await invoiceSettingMain
  // eslint-disable-next-line @typescript-eslint/naming-convention
    .findOneAndUpdate({ _id, companyId: queryId });
  if (!invoiceSetting) {
    return res.status(404).send({ success: false });
  }
  if (req.body.newPhotos) {
    if (invoiceSetting['generalSettings'].defaultDigitalSignature === 'true' &&
    invoiceSetting['generalSettings'].defaultDigitalStamp) {
      invoiceSetting['generalSettings'].defaultDigitalSignature = req.body.newPhotos[0];
      invoiceSetting['generalSettings'].defaultDigitalStamp = req.body.newPhotos[1];
    }

    if (invoiceSetting['generalSettings'].defaultDigitalSignature === 'true' &&
    invoiceSetting['generalSettings'].defaultDigitalStamp === 'false') {
      invoiceSetting['generalSettings'].defaultDigitalSignature = req.body.newPhotos[0];
    }

    if (invoiceSetting['generalSettings'].defaultDigitalSignature === 'false' &&
    invoiceSetting['generalSettings'].defaultDigitalStamp === 'true') {
      invoiceSetting['generalSettings'].defaultDigitalStamp = req.body.newPhotos[0];
    }
  }
  invoiceSetting['generalSettings'] = updatedInvoiceSetting.generalSettings || invoiceSetting['generalSettings'];
  invoiceSetting['taxSettings'] = updatedInvoiceSetting.taxSettings || invoiceSetting['taxSettings'];
  invoiceSetting['bankSettings'] = updatedInvoiceSetting.bankSettings || invoiceSetting['bankSettings'];
  let errResponse: Isuccess;
  const updated = await invoiceSetting.save()
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
  return res.status(200).send({ success: Boolean(updated) });
});

invoiceSettingRoutes.get('/getone/:id/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'read'), async(req, res) => {
  const { id } = req.params;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectIds([id, queryId]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const invoiceSetting = await invoiceSettingLean
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .findOne({ _id: id, companyId: queryId })
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .populate({ path: 'generalSettings.defaultDigitalSignature', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .populate({ path: 'generalSettings.defaultDigitalStamp', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
    .lean();
  return res.status(200).send(invoiceSetting);
});

invoiceSettingRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'read'), async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectId(queryId);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const all = await Promise.all([
    invoiceSettingLean
      .find({ companyId: queryId })
      // eslint-disable-next-line @typescript-eslint/naming-convention
      .populate({ path: 'generalSettings.defaultDigitalSignature', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
      // eslint-disable-next-line @typescript-eslint/naming-convention
      .populate({ path: 'generalSettings.defaultDigitalStamp', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
      .skip(offset)
      .limit(limit)
      .lean(),
    invoiceSettingLean.countDocuments({ companyId: queryId })
  ]);

  const response: IdataArrayResponse = {
    count: all[1],
    data: all[0]
  };
  return res.status(200).send(response);
});

invoiceSettingRoutes.delete('/deleteone/:id/:companyIdParam', requireAuth, async(req, res) => {
  const { id } = req.params;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectIds([id, queryId]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const deleted = await invoiceSettingMain.findOneAndDelete({ _id: id, companyId: queryId });
  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
});

invoiceSettingRoutes.post('/search/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'read'), async(req, res) => {
  const { searchterm, searchKey } = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectId(queryId);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const all = await Promise.all([
    invoiceSettingLean
      .find({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
      .skip(offset)
      .limit(limit)
      .lean(),
    invoiceSettingLean.countDocuments({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
  ]);
  const response: IdataArrayResponse = {
    count: all[1],
    data: all[0]
  };
  return res.status(200).send(response);
});

invoiceSettingRoutes.put('/deletemany/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'delete'), async(req, res) => {
  const { ids } = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectIds([...ids, ...[queryId]]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const deleted = await invoiceSettingMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .deleteMany({ companyId: queryId, _id: { $in: ids } })
    .catch(err => {
      invoiceSettingRoutesLogger.error('deletemany - err: ', err);
      return null;
    });
  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
  }
});


invoiceSettingRoutes.put('/deleteimages/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'delete'), deleteFiles, async(req, res) => {
  const filesWithDir: IfileMeta[] = req.body.filesWithDir;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  if (filesWithDir && !filesWithDir.length) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const updatedProduct = req.body.item;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { _id } = updatedProduct;
  const isValid = verifyObjectIds([_id, queryId]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const invoiceSetting = await invoiceSettingMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .findOneAndUpdate({ _id, companyId: queryId });
  if (!invoiceSetting) {
    return res.status(404).send({ success: false, err: 'item not found' });
  }
  const filesWithDirIds = filesWithDir.map(val => val._id);
  if (filesWithDirIds.includes(invoiceSetting.generalSettings.defaultDigitalSignature as unknown as string)) {
    invoiceSetting.generalSettings.defaultDigitalSignature = '';
  }

  if (filesWithDirIds.includes(invoiceSetting.generalSettings.defaultDigitalStamp as unknown as string)) {
    invoiceSetting.generalSettings.defaultDigitalStamp = '';
  }

  let errResponse: Isuccess;
  await invoiceSetting.save().catch(err => {
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

  return res.status(200).send({ success: true });
});
