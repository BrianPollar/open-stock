import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../controllers/database.controller';
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
const invoiceRelatedSchema = new Schema({
    trackEdit: { type: Schema.ObjectId },
    trackView: { type: Schema.ObjectId },
    companyId: { type: String, required: [true, 'cannot be empty.'], index: true },
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
    ecommerceSalePercentage: { type: Number, index: true, default: 0 }
}, { timestamps: true });
// Apply the uniqueValidator plugin to invoiceRelatedSchema.
// invoiceRelatedSchema.plugin(uniqueValidator);
/** primary selection object
 * for invoiceRelated
 */
const invoiceRelatedselect = {
    trackEdit: 1,
    trackView: 1,
    companyId: 1,
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
    ecommerceSalePercentage: 1
};
/**
 * Represents the main invoice related model.
 */
export let invoiceRelatedMain;
/**
 * Represents a lean version of the invoice related model.
 */
export let invoiceRelatedLean;
/**
 * Selects the invoice related fields for querying.
 */
export const invoiceRelatedSelect = invoiceRelatedselect;
/**
 * Creates the InvoiceRelated model.
 * @param dbUrl - The URL of the database.
 * @param main - Indicates whether to create the main connection model. Default is true.
 * @param lean - Indicates whether to create the lean connection model. Default is true.
 */
export const createInvoiceRelatedModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl, dbOptions);
    }
    if (main) {
        invoiceRelatedMain = mainConnection.model('invoiceRelated', invoiceRelatedSchema);
    }
    if (lean) {
        invoiceRelatedLean = mainConnectionLean.model('invoiceRelated', invoiceRelatedSchema);
    }
};
//# sourceMappingURL=invoicerelated.model.js.map