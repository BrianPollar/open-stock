import { connectDatabase, createExpireDocIndex, isDbConnected, mainConnection, mainConnectionLean, preUpdateDocExpire, withUrIdAndCompanySchemaObj, withUrIdAndCompanySelectObj } from '@open-stock/stock-universal-server';
import { Schema } from 'mongoose';
const uniqueValidator = require('mongoose-unique-validator');
const receiptSchema = new Schema({
    ...withUrIdAndCompanySchemaObj,
    invoiceRelated: { type: Schema.Types.ObjectId },
    ammountRcievd: {
        type: Number,
        min: [0, 'cannot be less than 0.']
    },
    paymentMode: { type: String },
    type: { type: String },
    amount: {
        type: Number,
        min: [0, 'cannot be less than 0.']
    },
    date: { type: Date }
}, { timestamps: true, collection: 'receipts' });
receiptSchema.pre('updateOne', function (next) {
    return preUpdateDocExpire(this, next);
});
receiptSchema.pre('updateMany', function (next) {
    return preUpdateDocExpire(this, next);
});
// Apply the uniqueValidator plugin to receiptSchema.
receiptSchema.plugin(uniqueValidator);
/** primary selection object
 * for receipt
 */
const receiptselect = {
    ...withUrIdAndCompanySelectObj,
    invoiceRelated: 1,
    ammountRcievd: 1,
    paymentMode: 1,
    type: 1,
    amount: 1,
    date: 1
};
/**
 * Represents the main receipt model.
 */
export let receiptMain;
/**
 * Represents a lean receipt model.
 */
export let receiptLean;
/**
 * Represents the receipt select function.
 */
export const receiptSelect = receiptselect;
/**
 * Creates a new receipt model with the given database URL.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main connection model.
 * @param lean Whether to create the lean connection model.
 */
export const createReceiptModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    createExpireDocIndex(receiptSchema);
    if (!isDbConnected) {
        await connectDatabase(dbUrl, dbOptions);
    }
    if (main) {
        receiptMain = mainConnection
            .model('Receipt', receiptSchema);
    }
    if (lean) {
        receiptLean = mainConnectionLean
            .model('Receipt', receiptSchema);
    }
};
//# sourceMappingURL=receipt.model.js.map