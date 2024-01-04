import express from 'express';
import { appendBody, deleteFiles, offsetLimitRelegator, requireAuth, roleAuthorisation, saveMetaToDb, stringifyMongooseErr, uploadFiles, verifyObjectIds } from '@open-stock/stock-universal-server';
import { invoiceSettingLean, invoiceSettingMain } from '../../../models/printables/settings/invoicesettings.model';
import { getLogger } from 'log4js';
import { Icustomrequest, Isuccess } from '@open-stock/stock-universal';

/** Logger for invoice setting routes */
const invoiceSettingRoutesLogger = getLogger('routes/invoiceSettingRoutes');

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
invoiceSettingRoutes.post('/create/:companyIdParam', requireAuth, roleAuthorisation('printables', 'create'), async(req, res) => {
  const invoiceSetting = req.body.invoicesettings;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  invoiceSetting.companyId = queryId;
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
      return errResponse;
    });

  if (errResponse) {
    return res.status(403).send(errResponse);
  }
  return res.status(200).send({ success: Boolean(saved) });
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
invoiceSettingRoutes.post('/createimg/:companyIdParam', requireAuth, roleAuthorisation('printables', 'create'), uploadFiles, appendBody, saveMetaToDb, async(req, res) => {
  const invoiceSetting = req.body.invoicesettings;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  invoiceSetting.companyId = queryId;
  if (req.body.newFiles) {
    if (invoiceSetting.generalSettings.defaultDigitalSignature === 'true' &&
    invoiceSetting.generalSettings.defaultDigitalStamp) {
      invoiceSetting.generalSettings.defaultDigitalSignature = req.body.newFiles[0];
      invoiceSetting.generalSettings.defaultDigitalStamp = req.body.newFiles[1];
    }

    if (invoiceSetting.generalSettings.defaultDigitalSignature === 'true' &&
    invoiceSetting.generalSettings.defaultDigitalSignature === 'false') {
      invoiceSetting.generalSettings.defaultDigitalSignature = req.body.newFiles[0];
    }

    if (invoiceSetting.generalSettings.defaultDigitalSignature === 'false' &&
    invoiceSetting.generalSettings.defaultDigitalSignature === 'true') {
      invoiceSetting.generalSettings.defaultDigitalStamp = req.body.newFiles[0];
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
invoiceSettingRoutes.put('/update/:companyIdParam', requireAuth, roleAuthorisation('printables', 'update'), async(req, res) => {
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
invoiceSettingRoutes.put('/updateimg/:companyIdParam', requireAuth, uploadFiles, appendBody, saveMetaToDb, deleteFiles, async(req, res) => {
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
  if (req.body.newFiles) {
    if (invoiceSetting['generalSettings'].defaultDigitalSignature === 'true' &&
    invoiceSetting['generalSettings'].defaultDigitalStamp) {
      invoiceSetting['generalSettings'].defaultDigitalSignature = req.body.newFiles[0];
      invoiceSetting['generalSettings'].defaultDigitalStamp = req.body.newFiles[1];
    }

    if (invoiceSetting['generalSettings'].defaultDigitalSignature === 'true' &&
    invoiceSetting['generalSettings'].defaultDigitalStamp === 'false') {
      invoiceSetting['generalSettings'].defaultDigitalSignature = req.body.newFiles[0];
    }

    if (invoiceSetting['generalSettings'].defaultDigitalSignature === 'false' &&
    invoiceSetting['generalSettings'].defaultDigitalStamp === 'true') {
      invoiceSetting['generalSettings'].defaultDigitalStamp = req.body.newFiles[0];
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

invoiceSettingRoutes.get('/getone/:id/:companyIdParam', requireAuth, roleAuthorisation('printables', 'read'), async(req, res) => {
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
    .lean();
  return res.status(200).send(invoiceSetting);
});

invoiceSettingRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, roleAuthorisation('printables', 'read'), async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const invoiceSettings = await invoiceSettingLean
    .find({ companyId: queryId })
    .skip(offset)
    .limit(limit)
    .lean();
  return res.status(200).send(invoiceSettings);
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

invoiceSettingRoutes.post('/search/:limit/:offset/:companyIdParam', requireAuth, roleAuthorisation('printables', 'read'), async(req, res) => {
  const { searchterm, searchKey } = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const invoiceSettings = await invoiceSettingLean
    .find({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
    .skip(offset)
    .limit(limit)
    .lean();
  return res.status(200).send(invoiceSettings);
});

invoiceSettingRoutes.put('/deletemany/:companyIdParam', requireAuth, roleAuthorisation('printables', 'delete'), async(req, res) => {
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
