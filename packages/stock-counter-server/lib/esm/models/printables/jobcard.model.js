import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
const jobCardSchema = new Schema({
    urId: { type: String, unique: true },
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
    client: 1,
    machine: 1,
    problem: 1,
    cost: 1
};
/** main connection for jobCards Operations*/
export let jobCardMain;
/** lean connection for jobCards Operations*/
export let jobCardLean;
/** primary selection object
 * for jobCard
 */
/** */
export const jobCardSelect = jobCardselect;
/** */
export const createJobCardModel = async (dbUrl, main = true, lean = true) => {
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl);
    }
    if (main) {
        jobCardMain = mainConnection.model('JobCard', jobCardSchema);
    }
    if (lean) {
        jobCardLean = mainConnectionLean.model('JobCard', jobCardSchema);
    }
};
//# sourceMappingURL=jobcard.model.js.map