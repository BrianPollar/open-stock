import express from 'express';
import { appendBody, deleteFiles, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, uploadFiles, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import { invoiceSettingLean, invoiceSettingMain } from '../../../models/printables/settings/invoicesettings.model';
import { getLogger } from 'log4js';
/** Logger for invoice setting routes */
const invoiceSettingRoutesLogger = getLogger('routes/invoiceSettingRoutes');
/** Express router for invoice setting routes */
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
invoiceSettingRoutes.post('/create', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const invoiceSetting = req.body.invoicesettings;
    const newJobCard = new invoiceSettingMain(invoiceSetting);
    let errResponse;
    const saved = await newJobCard.save()
        .catch(err => {
        invoiceSettingRoutesLogger.error('create - err: ', err);
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
/**
 * Route for creating a new invoice setting with image
 * @name POST /createimg
 * @function
 * @memberof module:routes/invoiceSettingRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
invoiceSettingRoutes.post('/createimg', requireAuth, roleAuthorisation('printables'), uploadFiles, appendBody, async (req, res) => {
    const invoiceSetting = req.body.invoicesettings;
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
    let errResponse;
    const saved = await newStn.save()
        .catch(err => {
        invoiceSettingRoutesLogger.error('createimg - err: ', err);
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
/**
 * Route for updating an existing invoice setting
 * @name PUT /update
 * @function
 * @memberof module:routes/invoiceSettingRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
invoiceSettingRoutes.put('/update', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const updatedInvoiceSetting = req.body.invoicesettings;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedInvoiceSetting;
    const isValid = verifyObjectId(_id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    console.log('INCOMING ISSSSSSSSSS', updatedInvoiceSetting);
    const invoiceSetting = await invoiceSettingMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findByIdAndUpdate(_id);
    if (!invoiceSetting) {
        return res.status(404).send({ success: false });
    }
    invoiceSetting['generalSettings'] = updatedInvoiceSetting.generalSettings || invoiceSetting['generalSettings'];
    invoiceSetting['taxSettings'] = updatedInvoiceSetting.taxSettings || invoiceSetting['taxSettings'];
    invoiceSetting['bankSettings'] = updatedInvoiceSetting.bankSettings || invoiceSetting['bankSettings'];
    let errResponse;
    const updated = await invoiceSetting.save()
        .catch(err => {
        invoiceSettingRoutesLogger.error('update - err: ', err);
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
invoiceSettingRoutes.put('/updateimg', requireAuth, uploadFiles, appendBody, deleteFiles, async (req, res) => {
    const updatedInvoiceSetting = req.body.invoicesettings;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedInvoiceSetting;
    const isValid = verifyObjectId(_id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const invoiceSetting = await invoiceSettingMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findByIdAndUpdate(_id);
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
    let errResponse;
    const updated = await invoiceSetting.save()
        .catch(err => {
        invoiceSettingRoutesLogger.error('updateimg - err: ', err);
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
    return res.status(200).send({ success: Boolean(updated) });
});
invoiceSettingRoutes.get('/getone/:id', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { id } = req.params;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const invoiceSetting = await invoiceSettingLean
        .findById(id)
        .lean();
    return res.status(200).send(invoiceSetting);
});
invoiceSettingRoutes.get('/getall/:offset/:limit', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const invoiceSettings = await invoiceSettingLean
        .find({})
        .skip(offset)
        .limit(limit)
        .lean();
    return res.status(200).send(invoiceSettings);
});
invoiceSettingRoutes.delete('/deleteone/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await invoiceSettingMain.findByIdAndDelete(id);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
invoiceSettingRoutes.post('/search/:limit/:offset', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const invoiceSettings = await invoiceSettingLean
        .find({ [searchKey]: { $regex: searchterm, $options: 'i' } })
        .skip(offset)
        .limit(limit)
        .lean();
    return res.status(200).send(invoiceSettings);
});
invoiceSettingRoutes.put('/deletemany', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { ids } = req.body;
    const isValid = verifyObjectIds(ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await invoiceSettingMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ _id: { $in: ids } })
        .catch(err => {
        invoiceSettingRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
//# sourceMappingURL=invoicesettings.routes.js.map