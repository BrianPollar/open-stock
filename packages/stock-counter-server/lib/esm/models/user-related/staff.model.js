import mongoose, { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
const staffSchema = new Schema({
    user: { type: mongoose.Types.ObjectId, unique: true, required: [true, 'cannot be empty.'], index: true },
    startDate: { type: Date, required: [true, 'cannot be empty.'] },
    endDate: { type: Date, required: [true, 'cannot be empty.'] },
    occupation: { type: String },
    employmentType: { type: String },
    salary: {}
}, { timestamps: true });
// Apply the uniqueValidator plugin to staffSchema.
staffSchema.plugin(uniqueValidator);
/** primary selection object
 * for staff
 */
const staffselect = {
    user: 1,
    startDate: 1,
    endDate: 1,
    occupation: 1,
    employmentType: 1,
    salary: 1
};
/** main connection for staffs Operations*/
export let staffMain;
/** lean connection for staffs Operations*/
export let staffLean;
/** primary selection object
 * for staff
 */
/** */
export const staffSelect = staffselect;
/** */
export const createStaffModel = async (dbUrl, main = true, lean = true) => {
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl);
    }
    if (main) {
        staffMain = mainConnection.model('Staff', staffSchema);
    }
    if (lean) {
        staffLean = mainConnectionLean.model('Staff', staffSchema);
    }
};
//# sourceMappingURL=staff.model.js.map