"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceSettingRoutes = void 0;
const tslib_1 = require("tslib");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const log4js_1 = require("log4js");
const invoicesettings_model_1 = require("../../../models/printables/settings/invoicesettings.model");
/** Logger for invoice setting routes */
const invoiceSettingRoutesLogger = (0, log4js_1.getLogger)('routes/invoiceSettingRoutes');
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
exports.invoiceSettingRoutes.post('/create/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables', 'create'), async (req, res) => {
    const invoiceSetting = req.body.invoicesettings;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    invoiceSetting.companyId = queryId;
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
exports.invoiceSettingRoutes.post('/createimg/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables', 'create'), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, async (req, res) => {
    const invoiceSetting = req.body.invoicesettings;
    const { companyId } = req.user;
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
exports.invoiceSettingRoutes.put('/update/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables', 'update'), async (req, res) => {
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
exports.invoiceSettingRoutes.put('/updateimg/:companyIdParam', stock_universal_server_1.requireAuth, stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, stock_universal_server_1.deleteFiles, async (req, res) => {
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
exports.invoiceSettingRoutes.get('/getone/:id/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables', 'read'), async (req, res) => {
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
        .lean();
    return res.status(200).send(invoiceSetting);
});
exports.invoiceSettingRoutes.get('/getall/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const all = await Promise.all([
        invoicesettings_model_1.invoiceSettingLean
            .find({ companyId: queryId })
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
exports.invoiceSettingRoutes.post('/search/:limit/:offset/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
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
exports.invoiceSettingRoutes.put('/deletemany/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables', 'delete'), async (req, res) => {
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
//# sourceMappingURL=invoicesettings.routes.js.map