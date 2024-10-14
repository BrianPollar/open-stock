import { connectDatabase, createExpireDocIndex, isDbConnected, mainConnection, mainConnectionLean, preUpdateDocExpire, withUrIdAndCompanySchemaObj, withUrIdAndCompanySelectObj } from '@open-stock/stock-universal-server';
import { Schema } from 'mongoose';
const uniqueValidator = require('mongoose-unique-validator');
const profitandlossReportSchema = new Schema({
    ...withUrIdAndCompanySchemaObj,
    totalAmount: {
        type: Number,
        min: [0, 'cannot be less than 0.']
    },
    date: { type: Date },
    expenses: [Schema.Types.ObjectId],
    invoiceRelateds: [Schema.Types.ObjectId],
    currency: { type: String, default: 'USD' }
}, { timestamps: true, collection: 'profitandlossreports' });
// Apply the uniqueValidator plugin to profitandlossReportSchema.
profitandlossReportSchema.plugin(uniqueValidator);
profitandlossReportSchema.pre('updateOne', function (next) {
    return preUpdateDocExpire(this, next);
});
profitandlossReportSchema.pre('updateMany', function (next) {
    return preUpdateDocExpire(this, next);
});
/** primary selection object
 * for profitandlossReport
 */
const profitandlossReportselect = {
    ...withUrIdAndCompanySelectObj,
    totalAmount: 1,
    date: 1,
    expenses: 1,
    invoiceRelateds: 1,
    currency: 1
};
/**
 * Represents the main profit and loss report model.
 */
export let profitandlossReportMain;
/**
 * Represents the lean version of the profit and loss report model.
 */
export let profitandlossReportLean;
/**
 * Selects the profit and loss report.
 */
export const profitandlossReportSelect = profitandlossReportselect;
/**
 * Creates a Profit and Loss Report model.
 * @param dbUrl - The URL of the database to connect to.
 * @param main - Whether to create the main connection model. Defaults to true.
 * @param lean - Whether to create the lean connection model. Defaults to true.
 */
export const createProfitandlossReportModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    createExpireDocIndex(profitandlossReportSchema);
    if (!isDbConnected) {
        await connectDatabase(dbUrl, dbOptions);
    }
    if (main) {
        profitandlossReportMain = mainConnection
            .model('profitandlossReport', profitandlossReportSchema);
    }
    if (lean) {
        profitandlossReportLean = mainConnectionLean
            .model('profitandlossReport', profitandlossReportSchema);
    }
};
//# sourceMappingURL=profitandlossreport.model.js.map