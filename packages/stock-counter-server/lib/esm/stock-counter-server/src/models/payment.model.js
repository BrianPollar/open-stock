import { connectDatabase, createExpireDocIndex, isDbConnected, mainConnection, mainConnectionLean, preUpdateDocExpire } from '@open-stock/stock-universal-server';
import { Schema } from 'mongoose';
const uniqueValidator = require('mongoose-unique-validator');
const paymentSchema = new Schema({
    companyId: { type: Schema.Types.ObjectId, required: [true, 'cannot be empty.'], index: true },
    paymentRelated: { type: Schema.Types.ObjectId, unique: true },
    invoiceRelated: { type: Schema.Types.ObjectId, unique: true },
    order: { type: String }
}, { timestamps: true, collection: 'payments' });
// Apply the uniqueValidator plugin to paymentSchema.
paymentSchema.plugin(uniqueValidator);
paymentSchema.pre('updateOne', function (next) {
    return preUpdateDocExpire(this, next);
});
paymentSchema.pre('updateMany', function (next) {
    return preUpdateDocExpire(this, next);
});
/** primary selection object
 * for payment
 */
const paymentselect = {
    companyId: 1,
    paymentRelated: 1,
    invoiceRelated: 1,
    order: 1
};
/**
 * Represents the main payment model.
 */
export let paymentMain;
/**
 * Represents a lean payment model.
 */
export let paymentLean;
/**
 * Represents a payment select function.
 */
export const paymentSelect = paymentselect;
/**
 * Creates a payment model with the specified database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the payment model for the main connection.
 * @param lean Whether to create the payment model for the lean connection.
 */
export const createPaymentModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    createExpireDocIndex(paymentSchema);
    if (!isDbConnected) {
        await connectDatabase(dbUrl, dbOptions);
    }
    if (main) {
        paymentMain = mainConnection
            .model('Payment', paymentSchema);
    }
    if (lean) {
        paymentLean = mainConnectionLean
            .model('Payment', paymentSchema);
    }
};
//# sourceMappingURL=payment.model.js.map