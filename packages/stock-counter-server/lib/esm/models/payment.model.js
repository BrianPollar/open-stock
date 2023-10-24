import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
const paymentSchema = new Schema({
    paymentRelated: { type: String, unique: true },
    invoiceRelated: { type: String, unique: true },
    order: { type: String }
}, { timestamps: true });
// Apply the uniqueValidator plugin to paymentSchema.
paymentSchema.plugin(uniqueValidator);
/** primary selection object
 * for payment
 */
const paymentselect = {
    paymentRelated: 1,
    invoiceRelated: 1,
    order: 1
};
/** main connection for payments Operations*/
export let paymentMain;
/** lean connection for payments Operations*/
export let paymentLean;
/** primary selection object
 * for payment
 */
/** */
export const paymentSelect = paymentselect;
/** */
/**
 * Creates a payment model with the specified database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the payment model for the main connection.
 * @param lean Whether to create the payment model for the lean connection.
 */
export const createPaymentModel = async (dbUrl, main = true, lean = true) => {
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl);
    }
    if (main) {
        paymentMain = mainConnection.model('Payment', paymentSchema);
    }
    if (lean) {
        paymentLean = mainConnectionLean.model('Payment', paymentSchema);
    }
};
//# sourceMappingURL=payment.model.js.map