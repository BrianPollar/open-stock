"use strict";
/* eslint-disable @typescript-eslint/no-misused-promises */
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceRelateRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const invoicerelated_model_1 = require("../../../models/printables/related/invoicerelated.model");
const query_1 = require("../../../utils/query");
const invoicerelated_1 = require("./invoicerelated");
/** Logger for file storage */
const fileStorageLogger = tracer.colorConsole({
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
 * Router for handling invoice related routes.
 */
exports.invoiceRelateRoutes = express_1.default.Router();
/**
 * Get a single invoice related product by ID
 * @param id - The ID of the invoice related product to retrieve
 * @returns The retrieved invoice related product
 */
exports.invoiceRelateRoutes.get('/getone/:id/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'read'), async (req, res) => {
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const { id } = req.params;
    const related = await invoicerelated_model_1.invoiceRelatedLean
        .findOne({ _id: id, ...filter })
        .lean()
        .populate([(0, query_1.populateBillingUser)(), (0, query_1.populatePayments)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()]);
    let returned;
    if (related) {
        returned = (0, invoicerelated_1.makeInvoiceRelatedPdct)(related, related
            .billingUserId);
        (0, stock_universal_server_1.addParentToLocals)(res, related._id, 'invoicerelateds', 'trackDataView');
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
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const all = await Promise.all([
        invoicerelated_model_1.invoiceRelatedLean
            .find({ ...filter })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate([(0, query_1.populateBillingUser)(), (0, query_1.populatePayments)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()])
            .catch(err => {
            fileStorageLogger.error('getall - err: ', err);
            return null;
        }),
        invoicerelated_model_1.invoiceRelatedLean.countDocuments({ ...filter })
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
        for (const val of all[0]) {
            (0, stock_universal_server_1.addParentToLocals)(res, val._id, 'invoicerelateds', 'trackDataView');
        }
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
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const all = await Promise.all([
        invoicerelated_model_1.invoiceRelatedLean
            .find({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate([(0, query_1.populateBillingUser)(), (0, query_1.populatePayments)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()])
            .catch(err => {
            fileStorageLogger.error('getall - err: ', err);
            return null;
        }),
        invoicerelated_model_1.invoiceRelatedLean.countDocuments({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
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
    await (0, invoicerelated_1.updateInvoiceRelated)(res, invoiceRelated, companyId);
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=invoicerelated.route.js.map