"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceRelatedModel = exports.invoiceRelatedSelect = exports.invoiceRelatedLean = exports.invoiceRelatedMain = void 0;
/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../../../controllers/database.controller");
const invoiceRelatedSchema = new mongoose_1.Schema({
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
    payments: []
}, { timestamps: true });
// Apply the uniqueValidator plugin to invoiceRelatedSchema.
// invoiceRelatedSchema.plugin(uniqueValidator);
/** primary selection object
 * for invoiceRelated
 */
const invoiceRelatedselect = {
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
    payments: 1
};
/** primary selection object
 * for invoiceRelated
 */
/** */
exports.invoiceRelatedSelect = invoiceRelatedselect;
/** */
const createInvoiceRelatedModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl);
    }
    if (main) {
        exports.invoiceRelatedMain = database_controller_1.mainConnection.model('invoiceRelated', invoiceRelatedSchema);
    }
    if (lean) {
        exports.invoiceRelatedLean = database_controller_1.mainConnectionLean.model('invoiceRelated', invoiceRelatedSchema);
    }
};
exports.createInvoiceRelatedModel = createInvoiceRelatedModel;
//# sourceMappingURL=invoicerelated.model.js.map