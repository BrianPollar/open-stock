"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceRelatedModel = exports.invoiceRelatedSelect = exports.invoiceRelatedLean = exports.invoiceRelatedMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const database_1 = require("../../../utils/database");
/**
 * Represents the schema for the invoice related model.
 * @typedef {Object} TinvoiceRelated
 * @property {string} creationType - The type of creation.
 * @property {number} estimateId - The ID of the estimate.
 * @property {number} invoiceId - The ID of the invoice.
 * @property {string} billingUser - The user who is being billed.
 * @property {string} billingUserId - The ID of the user who is being billed.
 * @property {Array} items - The items in the invoice.
 * @property {Date} fromDate - The start date of the invoice.
 * @property {Date} toDate - The end date of the invoice.
 * @property {string} status - The status of the invoice.
 * @property {string} stage - The stage of the invoice.
 * @property {number} cost - The cost of the invoice.
 * @property {number} tax - The tax of the invoice.
 * @property {number} balanceDue - The balance due on the invoice.
 * @property {number} subTotal - The subtotal of the invoice.
 * @property {number} total - The total of the invoice.
 * @property {Array} payments - The payments made on the invoice.
 */
const invoiceRelatedSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withCompanySchemaObj,
    creationType: { type: String },
    estimateId: { type: Number },
    invoiceId: { type: Number },
    billingUser: { type: String },
    billingUserId: { type: String },
    items: [],
    fromDate: { type: Date },
    toDate: { type: Date },
    status: { type: String },
    stage: { type: String },
    cost: { type: Number },
    tax: { type: Number },
    balanceDue: { type: Number },
    subTotal: { type: Number },
    total: { type: Number },
    payments: [],
    payType: { type: String, index: true },
    ecommerceSale: { type: Boolean, index: true, default: false },
    ecommerceSalePercentage: { type: Number, index: true, default: 0 },
    currency: { type: String, default: 'USD' }
}, { timestamps: true, collection: 'invoicerelateds' });
invoiceRelatedSchema.pre('updateOne', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
invoiceRelatedSchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
// Apply the uniqueValidator plugin to invoiceRelatedSchema.
// invoiceRelatedSchema.plugin(uniqueValidator);
/** primary selection object
 * for invoiceRelated
 */
const invoiceRelatedselect = {
    ...stock_universal_server_1.withCompanySelectObj,
    creationType: 1,
    estimateId: 1,
    invoiceId: 1,
    billingUser: 1,
    billingUserId: 1,
    items: 1,
    fromDate: 1,
    toDate: 1,
    status: 1,
    stage: 1,
    cost: 1,
    tax: 1,
    balanceDue: 1,
    subTotal: 1,
    total: 1,
    payments: 1,
    payType: 1,
    ecommerceSale: 1,
    ecommerceSalePercentage: 1,
    currency: 1
};
/**
 * Selects the invoice related fields for querying.
 */
exports.invoiceRelatedSelect = invoiceRelatedselect;
/**
 * Creates the InvoiceRelated model.
 * @param dbUrl - The URL of the database.
 * @param main - Indicates whether to create the main connection model. Default is true.
 * @param lean - Indicates whether to create the lean connection model. Default is true.
 */
const createInvoiceRelatedModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    (0, stock_universal_server_1.createExpireDocIndex)(invoiceRelatedSchema);
    if (!database_1.isStockDbConnected) {
        await (0, database_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.invoiceRelatedMain = database_1.mainConnection.model('invoiceRelated', invoiceRelatedSchema);
    }
    if (lean) {
        exports.invoiceRelatedLean = database_1.mainConnectionLean.model('invoiceRelated', invoiceRelatedSchema);
    }
};
exports.createInvoiceRelatedModel = createInvoiceRelatedModel;
//# sourceMappingURL=invoicerelated.model.js.map