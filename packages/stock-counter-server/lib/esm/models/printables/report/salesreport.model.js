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