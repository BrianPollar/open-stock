import { populateTrackEdit, populateTrackView, requireActiveCompany } from '@open-stock/stock-auth-server';
import { addParentToLocals, appendBody, deleteAllFiles, deleteFiles, makeCompanyBasedQuery, offsetLimitRelegator, requireAuth, roleAuthorisation, saveMetaToDb, stringifyMongooseErr, uploadFiles, verifyObjectId } from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { invoiceSettingLean, invoiceSettingMain } from '../../../models/printables/settings/invoicesettings.model';
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
invoiceSettingRoutes.post('/create/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'create'), async (req, res) => {
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
        return err;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    if (saved && saved._id) {
        addParentToLocals(res, saved._id, invoiceSettingLean.collection.collectionName, 'makeTrackEdit');
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
invoiceSettingRoutes.post('/createimg/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'create'), uploadFiles, appendBody, saveMetaToDb, async (req, res) => {
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
    // remove signature and stamp are not valid object ids
    if (!verifyObjectId(invoiceSetting.generalSettings.defaultDigitalSignature)) {
        delete invoiceSetting.generalSettings.defaultDigitalSignature;
    }
    if (!verifyObjectId(invoiceSetting.generalSettings.defaultDigitalStamp)) {
        delete invoiceSetting.generalSettings.defaultDigitalStamp;
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
        return err;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    if (saved && saved._id) {
        addParentToLocals(res, saved._id, invoiceSettingLean.collection.collectionName, 'makeTrackEdit');
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
invoiceSettingRoutes.put('/update/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'update'), async (req, res) => {
    const updatedInvoiceSetting = req.body.invoicesettings;
    const { filter } = makeCompanyBasedQuery(req);
    invoiceSettingRoutesLogger.debug('updatedInvoiceSetting ', updatedInvoiceSetting);
    updatedInvoiceSetting.companyId = filter.companyId;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedInvoiceSetting;
    const invoiceSetting = await invoiceSettingMain
        .findOne({ _id, ...filter }).lean();
    if (!invoiceSetting) {
        return res.status(404).send({ success: false });
    }
    if (!invoiceSetting.generalSettings) {
        invoiceSetting.generalSettings = {};
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
    let errResponse;
    // eslint-disable-next-line @typescript-eslint/naming-convention
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
        }
        else {
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
invoiceSettingRoutes.post('/updateimg/:companyIdParam', requireAuth, requireActiveCompany, uploadFiles, appendBody, saveMetaToDb, async (req, res) => {
    const updatedInvoiceSetting = req.body.invoicesettings;
    const { filter } = makeCompanyBasedQuery(req);
    updatedInvoiceSetting.companyId = filter.companyId;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedInvoiceSetting;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const found = await invoiceSettingMain.findOne({ _id, ...filter })
        // eslint-disable-next-line @typescript-eslint/naming-convention
        //  .populate({ path: 'generalSettings.defaultDigitalSignature', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        // eslint-disable-next-line @typescript-eslint/naming-convention
        //  .populate({ path: 'generalSettings.defaultDigitalStamp', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .lean();
    const invoiceSetting = await invoiceSettingMain
        .findOne({ _id, ...filter })
        .lean();
    invoiceSettingRoutesLogger.debug('all new Files', req.body.newPhotos);
    invoiceSettingRoutesLogger.info('found ', found);
    if (!invoiceSetting) {
        return res.status(404).send({ success: false });
    }
    const filesWithDir = [];
    if (!invoiceSetting.generalSettings) {
        invoiceSetting.generalSettings = {};
    }
    invoiceSettingRoutesLogger.debug('updatedInvoiceSetting ', updatedInvoiceSetting);
    invoiceSettingRoutesLogger.error('settings newPhotos', req.body.newPhotos);
    if (req.body.newPhotos) {
        if (updatedInvoiceSetting.generalSettings.defaultDigitalSignature === 'true' &&
            updatedInvoiceSetting.generalSettings.defaultDigitalStamp === 'true') {
            if (invoiceSetting.generalSettings.defaultDigitalSignature) {
                filesWithDir.push(found.generalSettings.defaultDigitalSignature);
            }
            if (invoiceSetting.generalSettings.defaultDigitalStamp) {
                filesWithDir.push(found.generalSettings.defaultDigitalStamp);
            }
            updatedInvoiceSetting.generalSettings.defaultDigitalSignature = req.body.newPhotos[0];
            updatedInvoiceSetting.generalSettings.defaultDigitalStamp = req.body.newPhotos[1];
        }
        if (updatedInvoiceSetting.generalSettings.defaultDigitalSignature === 'true' &&
            updatedInvoiceSetting.generalSettings.defaultDigitalStamp === 'false') {
            if (invoiceSetting.generalSettings.defaultDigitalSignature) {
                filesWithDir.push(found.generalSettings.defaultDigitalSignature);
            }
            updatedInvoiceSetting.generalSettings.defaultDigitalSignature = req.body.newPhotos[0];
        }
        if (updatedInvoiceSetting.generalSettings.defaultDigitalSignature === 'false' &&
            updatedInvoiceSetting.generalSettings.defaultDigitalStamp === 'true') {
            if (invoiceSetting.generalSettings.defaultDigitalStamp) {
                filesWithDir.push(found.generalSettings.defaultDigitalStamp);
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
    // add signature and stamp if are valid object ids
    invoiceSettingRoutesLogger.info('b4 verify updatedInvoiceSetting', updatedInvoiceSetting.generalSettings);
    invoiceSettingRoutesLogger.info('ALLL IN verify', verifyObjectId(updatedInvoiceSetting.generalSettings.defaultDigitalSignature));
    if (verifyObjectId(updatedInvoiceSetting.generalSettings.defaultDigitalSignature)) {
        invoiceSettingRoutesLogger.info('passed signature', updatedInvoiceSetting.generalSettings.defaultDigitalSignature);
        generalSettings.defaultDigitalSignature = updatedInvoiceSetting.generalSettings.defaultDigitalSignature;
    }
    if (verifyObjectId(updatedInvoiceSetting.generalSettings.defaultDigitalStamp)) {
        invoiceSettingRoutesLogger.info('passed stamp ', updatedInvoiceSetting.generalSettings.defaultDigitalStamp);
        generalSettings.defaultDigitalStamp = updatedInvoiceSetting.generalSettings.defaultDigitalStamp;
    }
    invoiceSetting.generalSettings = generalSettings;
    invoiceSetting.taxSettings = updatedInvoiceSetting.taxSettings || invoiceSetting.taxSettings;
    invoiceSetting.bankSettings = updatedInvoiceSetting.bankSettings || invoiceSetting.bankSettings;
    invoiceSetting.printDetails = updatedInvoiceSetting.printDetails || invoiceSetting.printDetails;
    invoiceSettingRoutesLogger.debug('generalSettings b4 update', generalSettings);
    invoiceSettingRoutesLogger.info('get the repeat ', invoiceSetting.generalSettings);
    let errResponse;
    // eslint-disable-next-line @typescript-eslint/naming-convention
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
    addParentToLocals(res, found._id, invoiceSettingLean.collection.collectionName, 'makeTrackEdit');
    invoiceSettingRoutesLogger.debug('updated', updated);
    return res.status(200).send({ success: Boolean(updated) });
});
invoiceSettingRoutes.get('/getone/:id/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'read'), async (req, res) => {
    const { id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const invoiceSetting = await invoiceSettingLean
        .findOne({ _id: id, ...filter })
        .populate([populateSignature(), populateStamp(), populateTrackEdit(), populateTrackView()])
        .lean();
    if (invoiceSetting) {
        addParentToLocals(res, invoiceSetting._id, invoiceSettingLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(invoiceSetting);
});
invoiceSettingRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'read'), async (req, res) => {
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
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        addParentToLocals(res, val._id, invoiceSettingLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
invoiceSettingRoutes.delete('/deleteone/:id/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'delete'), async (req, res) => {
    const { id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    // const deleted = await invoiceSettingMain.findOneAndDelete({ _id: id, ...filter });
    const deleted = await invoiceSettingMain.updateOne({ _id: id, ...filter }, { $set: { isDeleted: true } });
    if (Boolean(deleted)) {
        addParentToLocals(res, id, invoiceSettingLean.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
invoiceSettingRoutes.post('/search/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const all = await Promise.all([
        invoiceSettingLean
            .find({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
            .skip(offset)
            .limit(limit)
            .lean(),
        invoiceSettingLean.countDocuments({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
});
invoiceSettingRoutes.put('/deletemany/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'delete'), async (req, res) => {
    const { ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    /* const deleted = await invoiceSettingMain
      .deleteMany({ ...filter, _id: { $in: ids } })
      .catch(err => {
        invoiceSettingRoutesLogger.error('deletemany - err: ', err);
  
        return null;
      }); */
    const deleted = await invoiceSettingMain
        .updateMany({ ...filter, _id: { $in: ids } }, {
        $set: { isDeleted: true }
    })
        .catch(err => {
        invoiceSettingRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        for (const val of ids) {
            addParentToLocals(res, val, invoiceSettingLean.collection.collectionName, 'trackDataDelete');
        }
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
invoiceSettingRoutes.put('/deleteimages/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'delete'), deleteFiles(true), async (req, res) => {
    const filesWithDir = req.body.filesWithDir;
    const { filter } = makeCompanyBasedQuery(req);
    if (filesWithDir && !filesWithDir.length) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const updatedProduct = req.body.item;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedProduct;
    const invoiceSetting = await invoiceSettingMain
        .findOne({ _id, ...filter })
        .lean();
    if (!invoiceSetting) {
        return res.status(404).send({ success: false, err: 'item not found' });
    }
    const filesWithDirIds = filesWithDir.map(val => val._id);
    if (filesWithDirIds.includes(invoiceSetting.generalSettings.defaultDigitalSignature)) {
        delete invoiceSetting.generalSettings.defaultDigitalSignature;
    }
    if (filesWithDirIds.includes(invoiceSetting.generalSettings.defaultDigitalStamp)) {
        delete invoiceSetting.generalSettings.defaultDigitalStamp;
    }
    let errResponse;
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
    addParentToLocals(res, invoiceSetting._id, invoiceSettingLean.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=invoicesettings.routes.js.map