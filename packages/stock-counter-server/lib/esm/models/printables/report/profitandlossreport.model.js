/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
const profitandlossReportSchema = new Schema({
    urId: { type: String, unique: true },
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
    totalAmount: 1,
    date: 1,
    expenses: 1,
    invoiceRelateds: 1
};
/** main connection for profitandlossReports Operations*/
export let profitandlossReportMain;
/** lean connection for profitandlossReports Operations*/
export let profitandlossReportLean;
/** primary selection object
 * for profitandlossReport
 */
/** */
export const profitandlossReportSelect = profitandlossReportselect;
/** */
/**
 * Creates a Profit and Loss Report model.
 * @param dbUrl - The URL of the database to connect to.
 * @param main - Whether to create the main connection model. Defaults to true.
 * @param lean - Whether to create the lean connection model. Defaults to true.
 */
export const createProfitandlossReportModel = async (dbUrl, main = true, lean = true) => {
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl);
    }
    if (main) {
        profitandlossReportMain = mainConnection.model('profitandlossReport', profitandlossReportSchema);
    }
    if (lean) {
        profitandlossReportLean = mainConnectionLean.model('profitandlossReport', profitandlossReportSchema);
    }
};
//# sourceMappingURL=profitandlossreport.model.js.map