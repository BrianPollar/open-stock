"use strict";
/* eslint-disable @typescript-eslint/no-misused-promises */
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceRelateRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const log4js_1 = require("log4js");
const receipt_model_1 = require("../../../models/printables/receipt.model");
const invoicerelated_model_1 = require("../../../models/printables/related/invoicerelated.model");
const invoicerelated_1 = require("./invoicerelated");
/** Logger for file storage */
const fileStorageLogger = (0, log4js_1.getLogger)('routes/FileStorage');
/**
 * Router for handling invoice related routes.
 */
exports.invoiceRelateRoutes = express_1.default.Router();
/**
 * Get a single invoice related product by ID
 * @param id - The ID of the invoice related product to retrieve
 * @returns The retrieved invoice related product
 */
exports.invoiceRelateRoutes.get('/getone/:id/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'read'), async (req, res) => {
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const { id } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const related = await invoicerelated_model_1.invoiceRelatedLean
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOne({ _id: id, queryId })
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
/**
 * Get all invoice related products with pagination
 * @param offset - The offset to start retrieving invoice related products from
 * @param limit - The maximum number of invoice related products to retrieve
 * @returns The retrieved invoice related products
 */
exports.invoiceRelateRoutes.get('/getall/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const all = await Promise.all([
        invoicerelated_model_1.invoiceRelatedLean
            .find({ companyId: queryId })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate({ path: 'billingUserId', model: stock_auth_server_1.userLean })
            .populate({ path: 'payments', model: receipt_model_1.receiptLean })
            .catch(err => {
            fileStorageLogger.error('getall - err: ', err);
            return null;
        }),
        invoicerelated_model_1.invoiceRelatedLean.countDocuments({ companyId: queryId })
    ]);
    const response = {
        count: all[1],
        data: null
    };
    if (all[0]) {
        const returned = all[0]
            .map(val => (0, invoicerelated_1.makeInvoiceRelatedPdct)(val, val
            .billingUserId));
        response.data = returned;
        return res.status(200).send(response);
    }
    else {
        return res.status(200).send(response);
    }
});
/**
 * Search for invoice related products with pagination
 * @param searchterm - The search term to use for searching invoice related products
 * @param searchKey - The key to search for the search term in
 * @param offset - The offset to start retrieving invoice related products from
 * @param limit - The maximum number of invoice related products to retrieve
 * @returns The retrieved invoice related products
 */
exports.invoiceRelateRoutes.post('/search/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const all = await Promise.all([
        invoicerelated_model_1.invoiceRelatedLean
            .find({ queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate({ path: 'billingUserId', model: stock_auth_server_1.userLean })
            .populate({ path: 'payments', model: receipt_model_1.receiptLean })
            .catch(err => {
            fileStorageLogger.error('getall - err: ', err);
            return null;
        }),
        invoicerelated_model_1.invoiceRelatedLean.countDocuments({ queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
    ]);
    const response = {
        count: all[1],
        data: null
    };
    if (all[0]) {
        const returned = all[0]
            .map(val => (0, invoicerelated_1.makeInvoiceRelatedPdct)(val, val
            .billingUserId));
        response.data = returned;
        return res.status(200).send(response);
    }
    else {
        return res.status(200).send(response);
    }
});
/**
 * Update an invoicereturned product
 * @param invoiceRelated - The updated invoice related product
 * @returns A success message if the update was successful
 */
exports.invoiceRelateRoutes.put('/update/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'update'), async (req, res) => {
    const { invoiceRelated } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    invoiceRelated.companyId = queryId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([invoiceRelated.invoiceRelated, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    await (0, invoicerelated_1.updateInvoiceRelated)(invoiceRelated, companyId);
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=invoicerelated.route.js.map