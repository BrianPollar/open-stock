"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceSettingRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const mongoose_1 = require("mongoose");
const invoicesettings_model_1 = require("../../../models/printables/settings/invoicesettings.model");
const query_1 = require("../../../utils/query");
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
exports.invoiceSettingRoutes.post('/add', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'create'), async (req, res) => {
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
    const savedRes = await newJobCard.save()
        .catch((err) => err);
    if (savedRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, savedRes._id, invoicesettings_model_1.invoiceSettingLean.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: true });
});
exports.invoiceSettingRoutes.post('/add/img', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'create'), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, async (req, res) => {
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
    // remove signature and stamp are not valid object _ids
    if (!(0, stock_universal_server_1.verifyObjectId)(invoiceSetting.generalSettings.defaultDigitalSignature)) {
        delete invoiceSetting.generalSettings.defaultDigitalSignature;
    }
    if (!(0, stock_universal_server_1.verifyObjectId)(invoiceSetting.generalSettings.defaultDigitalStamp)) {
        delete invoiceSetting.generalSettings.defaultDigitalStamp;
    }
    const newStn = new invoicesettings_model_1.invoiceSettingMain(invoiceSetting);
    const savedRes = await newStn.save()
        .catch((err) => err);
    if (savedRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, savedRes._id, invoicesettings_model_1.invoiceSettingLean.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: true });
});
exports.invoiceSettingRoutes.put('/update', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'update'), async (req, res) => {
    const updatedInvoiceSetting = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    stock_universal_server_1.mainLogger.debug('updatedInvoiceSetting ', updatedInvoiceSetting);
    updatedInvoiceSetting.companyId = filter.companyId;
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
    stock_universal_server_1.mainLogger.debug('generalSettings', generalSettings);
    const updateRes = await invoicesettings_model_1.invoiceSettingMain.updateOne({ _id }, { $set: {
            generalSettings, taxSettings: invoiceSetting.taxSettings,
            bankSettings: invoiceSetting.bankSettings,
            printDetails: invoiceSetting.printDetails
        } })
        .catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, invoiceSetting._id, invoicesettings_model_1.invoiceSettingLean.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: true });
});
exports.invoiceSettingRoutes.post('/update/img', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, async (req, res) => {
    const updatedInvoiceSetting = req.body.invoicesettings;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    updatedInvoiceSetting.companyId = filter.companyId;
    const { _id } = updatedInvoiceSetting;
    const found = await invoicesettings_model_1.invoiceSettingMain.findOne({ _id, ...filter })
        /* .populate({ path: 'generalSettings.defaultDigitalSignature',
        model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
          .populate({ path: 'generalSettings.defaultDigitalStamp',
          model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        */
        .lean();
    if (!found) {
        return res.status(404).send({ success: false });
    }
    const invoiceSetting = await invoicesettings_model_1.invoiceSettingMain
        .findOne({ _id, ...filter })
        .lean();
    stock_universal_server_1.mainLogger.debug('all new Files', req.body.newPhotos);
    stock_universal_server_1.mainLogger.info('found ', found);
    if (!invoiceSetting) {
        return res.status(404).send({ success: false });
    }
    const filesWithDir = [];
    if (!invoiceSetting.generalSettings) {
        invoiceSetting.generalSettings = {};
    }
    stock_universal_server_1.mainLogger.debug('updatedInvoiceSetting ', updatedInvoiceSetting);
    stock_universal_server_1.mainLogger.error('settings newPhotos', req.body.newPhotos);
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
    // add signature and stamp if are valid object _ids
    stock_universal_server_1.mainLogger.info('b4 verify updatedInvoiceSetting', updatedInvoiceSetting.generalSettings);
    stock_universal_server_1.mainLogger
        .info('ALLL IN verify', (0, stock_universal_server_1.verifyObjectId)(updatedInvoiceSetting.generalSettings.defaultDigitalSignature));
    if ((0, stock_universal_server_1.verifyObjectId)(updatedInvoiceSetting.generalSettings.defaultDigitalSignature)) {
        stock_universal_server_1.mainLogger
            .info('passed signature', updatedInvoiceSetting.generalSettings.defaultDigitalSignature);
        generalSettings.defaultDigitalSignature = updatedInvoiceSetting.generalSettings.defaultDigitalSignature;
    }
    if ((0, stock_universal_server_1.verifyObjectId)(updatedInvoiceSetting.generalSettings.defaultDigitalStamp)) {
        stock_universal_server_1.mainLogger.info('passed stamp ', updatedInvoiceSetting.generalSettings.defaultDigitalStamp);
        generalSettings.defaultDigitalStamp = updatedInvoiceSetting.generalSettings.defaultDigitalStamp;
    }
    invoiceSetting.generalSettings = generalSettings;
    invoiceSetting.taxSettings = updatedInvoiceSetting.taxSettings || invoiceSetting.taxSettings;
    invoiceSetting.bankSettings = updatedInvoiceSetting.bankSettings || invoiceSetting.bankSettings;
    invoiceSetting.printDetails = updatedInvoiceSetting.printDetails || invoiceSetting.printDetails;
    stock_universal_server_1.mainLogger.debug('generalSettings b4 update', generalSettings);
    stock_universal_server_1.mainLogger.info('get the repeat ', invoiceSetting.generalSettings);
    const updateRes = await invoicesettings_model_1.invoiceSettingMain.updateOne({ _id }, { $set: {
            generalSettings, taxSettings: invoiceSetting.taxSettings,
            bankSettings: invoiceSetting.bankSettings,
            printDetails: invoiceSetting.printDetails
        } })
        .catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, found._id, invoicesettings_model_1.invoiceSettingLean.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: true });
});
exports.invoiceSettingRoutes.get('/one/:_id', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'read'), async (req, res) => {
    const { _id } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const invoiceSetting = await invoicesettings_model_1.invoiceSettingLean
        .findOne({ _id, ...filter })
        .populate([(0, query_1.populateSignature)(), (0, query_1.populateStamp)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()])
        .lean();
    if (!invoiceSetting) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    (0, stock_universal_server_1.addParentToLocals)(res, invoiceSetting._id, invoicesettings_model_1.invoiceSettingLean.collection.collectionName, 'trackDataView');
    return res.status(200).send(invoiceSetting);
});
exports.invoiceSettingRoutes.get('/all/:offset/:limit', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'read'), async (req, res) => {
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
exports.invoiceSettingRoutes.delete('/delete/one/:_id', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'delete'), async (req, res) => {
    const { _id } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    // const deleted = await invoiceSettingMain.findOneAndDelete({ _id, ...filter });
    const updateRes = await invoicesettings_model_1.invoiceSettingMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } })
        .catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, _id, invoicesettings_model_1.invoiceSettingLean.collection.collectionName, 'trackDataDelete');
    return res.status(200).send({ success: true });
});
exports.invoiceSettingRoutes.post('/filter', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'read'), async (req, res) => {
    const { propSort, returnEmptyArr } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const filter = (0, stock_universal_server_1.constructFiltersFromBody)(req);
    const aggCursor = invoicesettings_model_1.invoiceSettingLean.aggregate([
        {
            $match: {
                $and: [
                    // { status: 'pending' },
                    ...filter
                ]
            }
        },
        ...(0, stock_universal_server_1.lookupTrackEdit)(),
        ...(0, stock_universal_server_1.lookupTrackView)(),
        ...(0, stock_universal_server_1.lookupFacet)(offset, limit, propSort, returnEmptyArr)
    ]);
    const dataArr = [];
    for await (const data of aggCursor) {
        dataArr.push(data);
    }
    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;
    const response = {
        count,
        data: all
    };
    for (const val of all) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, invoicesettings_model_1.invoiceSettingLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.invoiceSettingRoutes.put('/delete/many', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const updateRes = await invoicesettings_model_1.invoiceSettingMain
        .updateMany({ ...filter, _id: { $in: _ids } }, {
        $set: { isDeleted: true }
    }).catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    for (const val of _ids) {
        (0, stock_universal_server_1.addParentToLocals)(res, val, invoicesettings_model_1.invoiceSettingLean.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
exports.invoiceSettingRoutes.put('/delete/images', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'delete'), (0, stock_universal_server_1.deleteFiles)(true), async (req, res) => {
    const filesWithDir = req.body.filesWithDir;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    if (filesWithDir && !filesWithDir.length) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const updatedProduct = req.body.item;
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
    const updateRes = await invoicesettings_model_1.invoiceSettingMain.updateOne({
        _id, ...filter
    }, {
        $set: {
            generalSettings: invoiceSetting.generalSettings
        }
    }).catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, invoiceSetting._id, invoicesettings_model_1.invoiceSettingLean.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=invoicesettings.routes.js.map