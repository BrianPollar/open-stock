import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
const orderSchema = new Schema({
    companyId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
    paymentRelated: { type: String, unique: true },
    invoiceRelated: { type: String, unique: true },
    deliveryDate: { type: Date, required: [true, 'cannot be empty.'], index: true }
}, { timestamps: true });
// Apply the uniqueValidator plugin to orderSchema.
orderSchema.plugin(uniqueValidator);
/** primary selection object
 * for order
 */
const orderselect = {
    companyId: 1,
    paymentRelated: 1,
    invoiceRelated: 1,
    deliveryDate: 1
};
/**
 * Represents the main order model.
 */
export let orderMain;
/**
 * Represents a lean order model.
 */
export let orderLean;
/**
 * Represents the order select function.
 */
export const orderSelect = orderselect;
/**
 * Creates an order model with the given database URL, main flag, and lean flag.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the main connection model.
 * @param lean Whether to create the lean connection model.
 */
export const createOrderModel = async (dbUrl, main = true, lean = true) => {
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl);
    }
    if (main) {
        orderMain = mainConnection.model('Order', orderSchema);
    }
    if (lean) {
        orderLean = mainConnectionLean.model('Order', orderSchema);
    }
};
//# sourceMappingURL=order.model.js.map