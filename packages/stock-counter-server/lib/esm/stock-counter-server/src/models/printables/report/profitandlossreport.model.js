import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
const profitandlossReportSchema = new Schema({
    urId: { type: String },
    companyId: { type: String, required: [true, 'cannot be empty.'], index: true },
    totalAmount: { type: Number },
    date: { type: Date },
    expenses: [],
    invoiceRelateds: []
}, { timestamps: true });
// Apply the uniqueValidator plugin to profitandlossReportSchema.
profitandlossReportSchema.plugin(uniqueValidator);
/** primary selection object
 * for profitandlossReport
 */
const profitandlossReportselect = {
    urId: 1,
    companyId: 1,
    totalAmount: 1,
    date: 1,
    expenses: 1,
    invoiceRelateds: 1
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
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl, dbOptions);
    }
    if (main) {
        profitandlossReportMain = mainConnection.model('profitandlossReport', profitandlossReportSchema);
    }
    if (lean) {
        profitandlossReportLean = mainConnectionLean.model('profitandlossReport', profitandlossReportSchema);
    }
};
//# sourceMappingURL=profitandlossreport.model.js.map