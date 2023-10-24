import mongoose, { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
const customerSchema = new Schema({
    user: { type: mongoose.Types.ObjectId, unique: true, required: [true, 'cannot be empty.'], index: true },
    startDate: { type: Date, required: [true, 'cannot be empty.'] },
    endDate: { type: Date, required: [true, 'cannot be empty.'] },
    occupation: { type: String },
    otherAddresses: []
}, { timestamps: true });
// Apply the uniqueValidator plugin to customerSchema.
customerSchema.plugin(uniqueValidator);
/** primary selection object
 * for customer
 */
const customerselect = {
    user: 1,
    salutation: 1,
    endDate: 1,
    occupation: 1,
    otherAddresses: 1
};
/** main connection for customers Operations*/
export let customerMain;
/** lean connection for customers Operations*/
export let customerLean;
/** primary selection object
 * for customer
 */
/** */
export const customerSelect = customerselect;
/** */
export const createCustomerModel = async (dbUrl, main = true, lean = true) => {
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl);
    }
    if (main) {
        customerMain = mainConnection.model('Customer', customerSchema);
    }
    if (lean) {
        customerLean = mainConnectionLean.model('Customer', customerSchema);
    }
};
//# sourceMappingURL=customer.model.js.map