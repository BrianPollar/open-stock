import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
const jobCardSchema = new Schema({
    urId: { type: String },
    companyId: { type: String, required: [true, 'cannot be empty.'], index: true },
    client: {},
    machine: {},
    problem: {},
    cost: { type: Number }
}, { timestamps: true });
// Apply the uniqueValidator plugin to jobCardSchema.
jobCardSchema.plugin(uniqueValidator);
/** primary selection object
 * for jobCard
 */
const jobCardselect = {
    urId: 1,
    companyId: 1,
    client: 1,
    machine: 1,
    problem: 1,
    cost: 1
};
/**
 * Represents the main job card model.
 */
export let jobCardMain;
/**
 * Represents a job card lean model.
 */
export let jobCardLean;
/**
 * Represents a job card select.
 */
export const jobCardSelect = jobCardselect;
/**
 * Creates a job card model with the given database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create a main connection or not. Defaults to true.
 * @param lean Whether to create a lean connection or not. Defaults to true.
 */
export const createJobCardModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl, dbOptions);
    }
    if (main) {
        jobCardMain = mainConnection.model('JobCard', jobCardSchema);
    }
    if (lean) {
        jobCardLean = mainConnectionLean.model('JobCard', jobCardSchema);
    }
};
//# sourceMappingURL=jobcard.model.js.map