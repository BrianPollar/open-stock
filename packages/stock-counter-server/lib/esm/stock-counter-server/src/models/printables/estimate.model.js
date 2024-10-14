import { connectDatabase, createExpireDocIndex, isDbConnected, mainConnection, mainConnectionLean, preUpdateDocExpire, withUrIdAndCompanySchemaObj, withUrIdAndCompanySelectObj } from '@open-stock/stock-universal-server';
import { Schema } from 'mongoose';
const estimateSchema = new Schema({
    ...withUrIdAndCompanySchemaObj,
    invoiceRelated: { type: Schema.Types.ObjectId }
}, { timestamps: true, collection: 'estimates' });
estimateSchema.pre('updateOne', function (next) {
    return preUpdateDocExpire(this, next);
});
estimateSchema.pre('updateMany', function (next) {
    return preUpdateDocExpire(this, next);
});
/** primary selection object
 * for estimate
 */
const estimateselect = {
    ...withUrIdAndCompanySelectObj,
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
export const createEstimateModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    createExpireDocIndex(estimateSchema);
    if (!isDbConnected) {
        await connectDatabase(dbUrl, dbOptions);
    }
    if (main) {
        estimateMain = mainConnection
            .model('Estimate', estimateSchema);
    }
    if (lean) {
        estimateLean = mainConnectionLean
            .model('Estimate', estimateSchema);
    }
};
//# sourceMappingURL=estimate.model.js.map