"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceSettingRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const invoicesettings_model_1 = require("../../../models/printables/settings/invoicesettings.model");
const query_1 = require("../../../utils/query");
/** Logger for invoice setting routes */
const invoiceSettingRoutesLogger = tracer.colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
        // eslint-disable-next-line no-console
        console.log(data.output);
        const logDir = path_1.default.join(process.cwd() + '/openstockLog/');
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
exports.invoiceSettingRoutes = express_1.default.Router();
/**
 * Route for creating a new invoice setting
 * @name POST /create
 * @function
 * @memberof module:routes/invoiceSettingRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
exports.invoiceSettingRoutes.post('/create/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'create'), async (req, res) => {
    const invoiceSetting = req.body.invoicesettings;
    // remove signature and stamp if there
    if (invoiceSetting.generalSettings.defaultDigitalSignature) {
        delete invoiceSetting.generalSettings.defaultDigitalSignature;
    }
    if (invoiceSetting.generalSettings.defaultDigitalStamp) {
        delete invoiceSetting.generalSettings.defaultDigitalStamp;
    }
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    invoiceSetting.companyId = filter.companyId;
    const newJobCard = new invoicesettings_model_1.invoiceSettingMain(invoiceSetting);
    let errResponse;
    const saved = await newJobCard.save()
        .catch(err => {
        invoiceSettingRoutesLogger.error('create - err: ', err);
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
        return err;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    if (saved && saved._id) {
        (0, stock_universal_server_1.addParentToLocals)(res, saved._id, invoicesettings_model_1.invoiceSettingLean.collection.collectionName, 'makeTrackEdit');
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
exports.invoiceSettingRoutes.post('/createimg/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'create'), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, async (req, res) => {
    const invoiceSetting = req.body.invoicesettings;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
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
    if (!(0, stock_universal_server_1.verifyObjectId)(invoiceSetting.generalSettings.defaultDigitalSignature)) {
        delete invoiceSetting.generalSettings.defaultDigitalSignature;
    }
    if (!(0, stock_universal_server_1.verifyObjectId)(invoiceSetting.generalSettings.defaultDigitalStamp)) {
        delete invoiceSetting.generalSettings.defaultDigitalStamp;
    }
    const newStn = new invoicesettings_model_1.invoiceSettingMain(invoiceSetting);
    let errResponse;
    const saved = await newStn.save()
        .catch(err => {
        invoiceSettingRoutesLogger.error('createimg - err: ', err);
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
        return err;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    if (saved && saved._id) {
        (0, stock_universal_server_1.addParentToLocals)(res, saved._id, invoicesettings_model_1.invoiceSettingLean.collection.collectionName, 'makeTrackEdit');
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
exports.invoiceSettingRoutes.put('/update/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'update'), async (req, res) => {
    const updatedInvoiceSetting = req.body.invoicesettings;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    invoiceSettingRoutesLogger.debug('updatedInvoiceSetting ', updatedInvoiceSetting);
    updatedInvoiceSetting.companyId = filter.companyId;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedInvoiceSetting;
    const invoiceSetting = await invoicesettings_model_1.invoiceSettingMain
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
    const updated = await invoicesettings_model_1.invoiceSettingMain.updateOne({ _id }, { $set: {
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
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
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
    (0, stock_universal_server_1.addParentToLocals)(res, invoiceSetting._id, invoicesettings_model_1.invoiceSettingLean.collection.collectionName, 'makeTrackEdit');
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
exports.invoiceSettingRoutes.post('/updateimg/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, async (req, res) => {
    const updatedInvoiceSetting = req.body.invoicesettings;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    updatedInvoiceSetting.companyId = filter.companyId;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedInvoiceSetting;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const found = await invoicesettings_model_1.invoiceSettingMain.findOne({ _id, ...filter })
        // eslint-disable-next-line @typescript-eslint/naming-convention
        //  .populate({ path: 'generalSettings.defaultDigitalSignature', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        // eslint-disable-next-line @typescript-eslint/naming-convention
        //  .populate({ path: 'generalSettings.defaultDigitalStamp', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .lean();
    const invoiceSetting = await invoicesettings_model_1.invoiceSettingMain
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
    await (0, stock_universal_server_1.deleteAllFiles)(filesWithDir, true);
    const generalSettings = Object.assign({}, invoiceSetting.generalSettings);
    if (updatedInvoiceSetting?.generalSettings?.currency) {
        generalSettings.currency = updatedInvoiceSetting.generalSettings.currency;
    }
    if (updatedInvoiceSetting?.generalSettings?.defaultDueTime) {
        generalSettings.defaultDueTime = updatedInvoiceSetting.generalSettings.defaultDueTime;
    }
    // add signature and stamp if are valid object ids
    invoiceSettingRoutesLogger.info('b4 verify updatedInvoiceSetting', updatedInvoiceSetting.generalSettings);
    invoiceSettingRoutesLogger.info('ALLL IN verify', (0, stock_universal_server_1.verifyObjectId)(updatedInvoiceSetting.generalSettings.defaultDigitalSignature));
    if ((0, stock_universal_server_1.verifyObjectId)(updatedInvoiceSetting.generalSettings.defaultDigitalSignature)) {
        invoiceSettingRoutesLogger.info('passed signature', updatedInvoiceSetting.generalSettings.defaultDigitalSignature);
        generalSettings.defaultDigitalSignature = updatedInvoiceSetting.generalSettings.defaultDigitalSignature;
    }
    if ((0, stock_universal_server_1.verifyObjectId)(updatedInvoiceSetting.generalSettings.defaultDigitalStamp)) {
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
    const updated = await invoicesettings_model_1.invoiceSettingMain.updateOne({ _id }, { $set: {
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
    (0, stock_universal_server_1.addParentToLocals)(res, found._id, invoicesettings_model_1.invoiceSettingLean.collection.collectionName, 'makeTrackEdit');
    invoiceSettingRoutesLogger.debug('updated', updated);
    return res.status(200).send({ success: Boolean(updated) });
});
exports.invoiceSettingRoutes.get('/getone/:id/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'read'), async (req, res) => {
    const { id } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const invoiceSetting = await invoicesettings_model_1.invoiceSettingLean
        .findOne({ _id: id, ...filter })
        .populate([(0, query_1.populateSignature)(), (0, query_1.populateStamp)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()])
        .lean();
    if (invoiceSetting) {
        (0, stock_universal_server_1.addParentToLocals)(res, invoiceSetting._id, invoicesettings_model_1.invoiceSettingLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(invoiceSetting);
});
exports.invoiceSettingRoutes.get('/getall/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const all = await Promise.all([
        invoicesettings_model_1.invoiceSettingLean
            .find({ ...filter })
            .populate([(0, query_1.populateSignature)(), (0, query_1.populateStamp)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()])
            .skip(offset)
            .limit(limit)
            .lean(),
        invoicesettings_model_1.invoiceSettingLean.countDocuments({ ...filter })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, invoicesettings_model_1.invoiceSettingLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.invoiceSettingRoutes.delete('/deleteone/:id/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'delete'), async (req, res) => {
    const { id } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    // const deleted = await invoiceSettingMain.findOneAndDelete({ _id: id, ...filter });
    const deleted = await invoicesettings_model_1.invoiceSettingMain.updateOne({ _id: id, ...filter }, { $set: { isDeleted: true } });
    if (Boolean(deleted)) {
        (0, stock_universal_server_1.addParentToLocals)(res, id, invoicesettings_model_1.invoiceSettingLean.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.invoiceSettingRoutes.post('/search/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const all = await Promise.all([
        invoicesettings_model_1.invoiceSettingLean
            .find({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
            .skip(offset)
            .limit(limit)
            .lean(),
        invoicesettings_model_1.invoiceSettingLean.countDocuments({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
});
exports.invoiceSettingRoutes.put('/deletemany/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'delete'), async (req, res) => {
    const { ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    /* const deleted = await invoiceSettingMain
      .deleteMany({ ...filter, _id: { $in: ids } })
      .catch(err => {
        invoiceSettingRoutesLogger.error('deletemany - err: ', err);
  
        return null;
      }); */
    const deleted = await invoicesettings_model_1.invoiceSettingMain
        .updateMany({ ...filter, _id: { $in: ids } }, {
        $set: { isDeleted: true }
    })
        .catch(err => {
        invoiceSettingRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        for (const val of ids) {
            (0, stock_universal_server_1.addParentToLocals)(res, val, invoicesettings_model_1.invoiceSettingLean.collection.collectionName, 'trackDataDelete');
        }
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
exports.invoiceSettingRoutes.put('/deleteimages/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'delete'), (0, stock_universal_server_1.deleteFiles)(true), async (req, res) => {
    const filesWithDir = req.body.filesWithDir;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    if (filesWithDir && !filesWithDir.length) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const updatedProduct = req.body.item;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedProduct;
    const invoiceSetting = await invoicesettings_model_1.invoiceSettingMain
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
    await invoicesettings_model_1.invoiceSettingMain.updateOne({
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
    (0, stock_universal_server_1.addParentToLocals)(res, invoiceSetting._id, invoicesettings_model_1.invoiceSettingLean.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=invoicesettings.routes.js.map