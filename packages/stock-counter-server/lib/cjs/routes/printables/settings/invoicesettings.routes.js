"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceSettingRoutes = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const invoicesettings_model_1 = require("../../../models/printables/settings/invoicesettings.model");
const log4js_1 = require("log4js");
/** Logger for invoice setting routes */
const invoiceSettingRoutesLogger = (0, log4js_1.getLogger)('routes/invoiceSettingRoutes');
/** Express router for invoice setting routes */
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
exports.invoiceSettingRoutes.post('/create', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const invoiceSetting = req.body.invoicesettings;
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
exports.invoiceSettingRoutes.post('/createimg', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, async (req, res) => {
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
exports.invoiceSettingRoutes.put('/update', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const updatedInvoiceSetting = req.body.invoicesettings;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedInvoiceSetting;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(_id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    console.log('INCOMING ISSSSSSSSSS', updatedInvoiceSetting);
    const invoiceSetting = await invoicesettings_model_1.invoiceSettingMain
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
exports.invoiceSettingRoutes.put('/updateimg', stock_universal_server_1.requireAuth, stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.deleteFiles, async (req, res) => {
    const updatedInvoiceSetting = req.body.invoicesettings;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedInvoiceSetting;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(_id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const invoiceSetting = await invoicesettings_model_1.invoiceSettingMain
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
exports.invoiceSettingRoutes.get('/getone/:id', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { id } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const invoiceSetting = await invoicesettings_model_1.invoiceSettingLean
        .findById(id)
        .lean();
    return res.status(200).send(invoiceSetting);
});
exports.invoiceSettingRoutes.get('/getall/:offset/:limit', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const invoiceSettings = await invoicesettings_model_1.invoiceSettingLean
        .find({})
        .skip(offset)
        .limit(limit)
        .lean();
    return res.status(200).send(invoiceSettings);
});
exports.invoiceSettingRoutes.delete('/deleteone/:id', stock_universal_server_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await invoicesettings_model_1.invoiceSettingMain.findByIdAndDelete(id);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.invoiceSettingRoutes.post('/search/:limit/:offset', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const invoiceSettings = await invoicesettings_model_1.invoiceSettingLean
        .find({ [searchKey]: { $regex: searchterm, $options: 'i' } })
        .skip(offset)
        .limit(limit)
        .lean();
    return res.status(200).send(invoiceSettings);
});
exports.invoiceSettingRoutes.put('/deletemany', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { ids } = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)(ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await invoicesettings_model_1.invoiceSettingMain
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