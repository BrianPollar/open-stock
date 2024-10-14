"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceRelatedModel = exports.invoiceRelatedSelect = exports.invoiceRelatedLean = exports.invoiceRelatedMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const itemsSchema = new mongoose_1.Schema({
    item: { type: mongoose_1.Schema.Types.ObjectId },
    itemName: { type: String, minlength: [3, 'cannot be less than 3'], maxlength: [150, 'cannot be more than 150'] },
    itemPhoto: { type: String },
    quantity: { type: Number, min: [1, 'cannot be less than 1'] },
    rate: { type: Number, min: [1, 'cannot be less than 1'] },
    amount: { type: Number, min: [1, 'cannot be less than 1'] },
    currency: { type: String }
});
const invoiceRelatedSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withUrIdAndCompanySchemaObj,
    creationType: {
        type: String,
        validator: checkCreationType,
        message: props => `${props.value} is invalid phone!`
    },
    estimateId: { type: Number },
    invoiceId: { type: Number },
    billingUser: { type: String },
    billingUserId: { type: mongoose_1.Schema.Types.ObjectId },
    items: [itemsSchema],
    fromDate: { type: Date },
    toDate: {
        type: Date,
        validator: checkToDate,
        message: props => `${props.value} is invalid, it must be less than from date!`
    },
    status: {
        type: String,
        validator: checkStatus,
        message: props => `${props.value} is invalid phone!`
    },
    stage: {
        type: String,
        validator: checkStage,
        message: props => `${props.value} is invalid phone!`
    },
    cost: {
        type: Number,
        min: [0, 'cannot be less than 0!']
    },
    tax: {
        type: Number,
        min: [0, 'cannot be less than 0!']
    },
    balanceDue: {
        type: Number,
        min: [0, 'cannot be less than 0!']
    },
    subTotal: {
        type: Number,
        min: [0, 'cannot be less than 0!']
    },
    total: {
        type: Number,
        min: [0, 'cannot be less than 0!']
    },
    payments: [mongoose_1.Schema.Types.ObjectId],
    payType: { type: String, index: true },
    ecommerceSale: { type: Boolean, index: true, default: false },
    ecommerceSalePercentage: {
        type: Number,
        min: [0, 'cannot be less than 0!'],
        max: [100, 'cannot be greater than 100!']
    },
    currency: { type: String, default: 'USD' }
}, { timestamps: true, collection: 'invoicerelateds' });
function checkCreationType(creationType) {
    return creationType === 'estimate' || creationType === 'invoice' ||
        creationType === 'deliverynote' || creationType === 'receipt';
}
function checkToDate(toDate) {
    return toDate < this.fromDate;
}
function checkStatus(status) {
    return status === 'paid' || status === 'pending' ||
        status === 'overdue' || status === 'draft' ||
        status === 'unpaid' || status === 'cancelled';
}
function checkStage(stage) {
    return stage === 'estimate' || stage === 'invoice' || stage === 'deliverynote' || stage === 'receipt';
}
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
    if (!stock_universal_server_1.isDbConnected) {
        await (0, stock_universal_server_1.connectDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.invoiceRelatedMain = stock_universal_server_1.mainConnection
            .model('invoiceRelated', invoiceRelatedSchema);
    }
    if (lean) {
        exports.invoiceRelatedLean = stock_universal_server_1.mainConnectionLean
            .model('invoiceRelated', invoiceRelatedSchema);
    }
};
exports.createInvoiceRelatedModel = createInvoiceRelatedModel;
//# sourceMappingURL=invoicerelated.model.js.map