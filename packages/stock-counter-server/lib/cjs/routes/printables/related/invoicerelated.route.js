"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceRelateRoutes = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-misused-promises */
const express_1 = tslib_1.__importDefault(require("express"));
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const invoicerelated_1 = require("./invoicerelated");
const log4js_1 = require("log4js");
const invoicerelated_model_1 = require("../../../models/printables/related/invoicerelated.model");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const receipt_model_1 = require("../../../models/printables/receipt.model");
/** */
const fileStorageLogger = (0, log4js_1.getLogger)('routes/FileStorage');
/** */
exports.invoiceRelateRoutes = express_1.default.Router();
exports.invoiceRelateRoutes.get('/getone/:id', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { id } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const related = await invoicerelated_model_1.invoiceRelatedLean
        .findById(id)
        .lean()
        .populate({ path: 'billingUserId', model: stock_auth_server_1.userLean })
        .populate({ path: 'payments', model: receipt_model_1.receiptLean });
    let returned;
    if (related) {
        returned = (0, invoicerelated_1.makeInvoiceRelatedPdct)(related, related
            .billingUserId);
    }
    return res.status(200).send(returned);
});
exports.invoiceRelateRoutes.get('/getall/:offset/:limit', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const relateds = await invoicerelated_model_1.invoiceRelatedLean
        .find({})
        .skip(offset)
        .limit(limit)
        .lean()
        .populate({ path: 'billingUserId', model: stock_auth_server_1.userLean })
        .populate({ path: 'payments', model: receipt_model_1.receiptLean })
        .catch(err => {
        fileStorageLogger.error('getall - err: ', err);
        return null;
    });
    if (relateds) {
        const returned = relateds
            .map(val => (0, invoicerelated_1.makeInvoiceRelatedPdct)(val, val
            .billingUserId));
        return res.status(200).send(returned);
    }
    else {
        return res.status(200).send([]);
    }
});
exports.invoiceRelateRoutes.post('/search/:offset/:limit', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const relateds = await invoicerelated_model_1.invoiceRelatedLean
        .find({ [searchKey]: { $regex: searchterm, $options: 'i' } })
        .skip(offset)
        .limit(limit)
        .lean()
        .populate({ path: 'billingUserId', model: stock_auth_server_1.userLean })
        .populate({ path: 'payments', model: receipt_model_1.receiptLean })
        .catch(err => {
        fileStorageLogger.error('getall - err: ', err);
        return null;
    });
    if (relateds) {
        const returned = relateds
            .map(val => (0, invoicerelated_1.makeInvoiceRelatedPdct)(val, val
            .billingUserId));
        return res.status(200).send(returned);
    }
    else {
        return res.status(200).send([]);
    }
});
exports.invoiceRelateRoutes.put('/update', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('printables'), async (req, res) => {
    const { invoiceRelated } = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(invoiceRelated.invoiceRelated);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    await (0, invoicerelated_1.updateInvoiceRelated)(invoiceRelated);
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=invoicerelated.route.js.map