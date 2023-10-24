import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
const orderSchema = new Schema({
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
    paymentRelated: 1,
    invoiceRelated: 1,
    deliveryDate: 1
};
/** main connection for orders Operations*/
export let orderMain;
/** lean connection for orders Operations*/
export let orderLean;
/** primary selection object
 * for order
 */
/** */
export const orderSelect = orderselect;
/** */
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