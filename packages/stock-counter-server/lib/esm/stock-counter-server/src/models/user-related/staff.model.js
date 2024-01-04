import mongoose, { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
/** Defines the schema for the staff model. */
const staffSchema = new Schema({
    companyId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
    user: { type: mongoose.Types.ObjectId, unique: true, required: [true, 'cannot be empty.'], index: true },
    startDate: { type: Date, required: [true, 'cannot be empty.'] },
    endDate: { type: Date, required: [true, 'cannot be empty.'] },
    occupation: { type: String },
    employmentType: { type: String },
    salary: {}
}, { timestamps: true });
// Apply the uniqueValidator plugin to staffSchema.
staffSchema.plugin(uniqueValidator);
/** Defines the primary selection object for staff. */
const staffselect = {
    companyId: 1,
    user: 1,
    startDate: 1,
    endDate: 1,
    occupation: 1,
    employmentType: 1,
    salary: 1
};
/**
 * The main staff model.
 */
export let staffMain;
/**
 * Represents a lean staff model.
 */
export let staffLean;
/** Defines the primary selection object for staff. */
/**
 * The staffSelect constant represents the selection of staff members.
 */
export const staffSelect = staffselect;
/**
 * Creates a new staff model with the given database URL.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the main connection for staff operations.
 * @param lean Whether to create the lean connection for staff operations.
 */
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