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
exports.invoiceSettingRoutes.post('/create/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'create'), async (req, res, next) => {
    const invoiceSetting = req.body.invoicesettings;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    invoiceSetting.companyId = queryId;
    const newJobCard = new invoicesettings_model_1.invoiceSettingMain(invoiceSetting);
    let errResponse;
    await newJobCard.save()
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
exports.invoiceSettingRoutes.post('/createimg/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'create'), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, async (req, res) => {
    const invoiceSetting = req.body.invoicesettings;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
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
exports.invoiceSettingRoutes.put('/update/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'update'), async (req, res) => {
    const updatedInvoiceSetting = req.body.invoicesettings;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    updatedInvoiceSetting.companyId = queryId;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedInvoiceSetting;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const invoiceSetting = await invoicesettings_model_1.invoiceSettingMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndUpdate({ _id, companyId: queryId });
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
exports.invoiceSettingRoutes.put('/updateimg/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, stock_universal_server_1.deleteFiles, async (req, res) => {
    const updatedInvoiceSetting = req.body.invoicesettings;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    updatedInvoiceSetting.companyId = queryId;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedInvoiceSetting;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const invoiceSetting = await invoicesettings_model_1.invoiceSettingMain
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
    let errResponse;
    const updated = await invoiceSetting.save()
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
    return res.status(200).send({ success: Boolean(updated) });
});
exports.invoiceSettingRoutes.get('/getone/:id/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'read'), async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const invoiceSetting = await invoicesettings_model_1.invoiceSettingLean
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOne({ _id: id, companyId: queryId })
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .populate({ path: 'generalSettings.defaultDigitalSignature', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .populate({ path: 'generalSettings.defaultDigitalStamp', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .lean();
    return res.status(200).send(invoiceSetting);
});
exports.invoiceSettingRoutes.get('/getall/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const all = await Promise.all([
        invoicesettings_model_1.invoiceSettingLean
            .find({ companyId: queryId })
            // eslint-disable-next-line @typescript-eslint/naming-convention
            .populate({ path: 'generalSettings.defaultDigitalSignature', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
            // eslint-disable-next-line @typescript-eslint/naming-convention
            .populate({ path: 'generalSettings.defaultDigitalStamp', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
            .skip(offset)
            .limit(limit)
            .lean(),
        invoicesettings_model_1.invoiceSettingLean.countDocuments({ companyId: queryId })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
});
exports.invoiceSettingRoutes.delete('/deleteone/:id/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const deleted = await invoicesettings_model_1.invoiceSettingMain.findOneAndDelete({ _id: id, companyId: queryId });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.invoiceSettingRoutes.post('/search/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const all = await Promise.all([
        invoicesettings_model_1.invoiceSettingLean
            .find({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
            .skip(offset)
            .limit(limit)
            .lean(),
        invoicesettings_model_1.invoiceSettingLean.countDocuments({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
});
exports.invoiceSettingRoutes.put('/deletemany/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'delete'), async (req, res) => {
    const { ids } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([...ids, ...[queryId]]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await invoicesettings_model_1.invoiceSettingMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ companyId: queryId, _id: { $in: ids } })
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
exports.invoiceSettingRoutes.put('/deleteimages/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'delete'), stock_universal_server_1.deleteFiles, async (req, res) => {
    const filesWithDir = req.body.filesWithDir;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    if (filesWithDir && !filesWithDir.length) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const updatedProduct = req.body.item;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedProduct;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const invoiceSetting = await invoicesettings_model_1.invoiceSettingMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndUpdate({ _id, companyId: queryId });
    if (!invoiceSetting) {
        return res.status(404).send({ success: false, err: 'item not found' });
    }
    const filesWithDirIds = filesWithDir.map(val => val._id);
    if (filesWithDirIds.includes(invoiceSetting.generalSettings.defaultDigitalSignature)) {
        invoiceSetting.generalSettings.defaultDigitalSignature = '';
    }
    if (filesWithDirIds.includes(invoiceSetting.generalSettings.defaultDigitalStamp)) {
        invoiceSetting.generalSettings.defaultDigitalStamp = '';
    }
    let errResponse;
    await invoiceSetting.save().catch(err => {
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
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=invoicesettings.routes.js.map