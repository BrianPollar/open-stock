/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../controllers/database.controller';
const estimateSchema = new Schema({
    companyId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
    invoiceRelated: { type: String }
}, { timestamps: true });
/** primary selection object
 * for estimate
 */
const estimateselect = {
    companyId: 1,
    invoiceRelated: 1
};
/**
 * Represents the main estimate model.
 */
export let estimateMain;
/**
 * Represents an estimateLean model.
 */
export let estimateLean;
/**
 * Represents the estimate select function.
 */
export const estimateSelect = estimateselect;
/**
 * Creates an Estimate model with the given database URL, main flag, and lean flag.
 * @param dbUrl - The URL of the database to connect to.
 * @param main - A flag indicating whether to create the main connection model.
 * @param lean - A flag indicating whether to create the lean connection model.
 */
export const createEstimateModel = async (dbUrl, main = true, lean = true) => {
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl);
    }
    if (main) {
        estimateMain = mainConnection.model('Estimate', estimateSchema);
    }
    if (lean) {
        estimateLean = mainConnectionLean.model('Estimate', estimateSchema);
    }
};
//# sourceMappingURL=estimate.model.js.map