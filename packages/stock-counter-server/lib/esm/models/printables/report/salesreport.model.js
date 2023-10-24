/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
const salesReportSchema = new Schema({
    urId: { type: String, unique: true },
    totalAmount: { type: Number },
    date: { type: Date },
    estimates: [],
    invoiceRelateds: []
}, { timestamps: true });
// Apply the uniqueValidator plugin to salesReportSchema.
salesReportSchema.plugin(uniqueValidator);
/** primary selection object
 * for salesReport
 */
const salesReportselect = {
    urId: 1,
    totalAmount: 1,
    date: 1,
    estimates: 1,
    invoiceRelateds: 1
};
/** main connection for salesReports Operations*/
export let salesReportMain;
/** lean connection for salesReports Operations*/
export let salesReportLean;
/** primary selection object
 * for salesReport
 */
/** */
export const salesReportSelect = salesReportselect;
/** */
/**
 * Creates a sales report model with the given database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create a main connection or not. Defaults to true.
 * @param lean Whether to create a lean connection or not. Defaults to true.
 */
export const createSalesReportModel = async (dbUrl, main = true, lean = true) => {
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl);
    }
    if (main) {
        salesReportMain = mainConnection.model('salesReport', salesReportSchema);
    }
    if (lean) {
        salesReportLean = mainConnectionLean.model('salesReport', salesReportSchema);
    }
};
//# sourceMappingURL=salesreport.model.js.map