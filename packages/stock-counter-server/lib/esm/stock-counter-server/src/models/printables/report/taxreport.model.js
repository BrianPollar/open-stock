import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
const taxReportSchema = new Schema({
    trackEdit: { type: Schema.ObjectId },
    trackView: { type: Schema.ObjectId },
    urId: { type: String },
    companyId: { type: String, required: [true, 'cannot be empty.'], index: true },
    totalAmount: { type: Number },
    date: { type: Date },
    estimates: [],
    invoiceRelateds: []
}, { timestamps: true });
// Apply the uniqueValidator plugin to taxReportSchema.
taxReportSchema.plugin(uniqueValidator);
/** primary selection object
 * for taxReport
 */
const taxReportselect = {
    trackEdit: 1,
    trackView: 1,
    urId: 1,
    companyId: 1,
    totalAmount: 1,
    date: 1,
    estimates: 1,
    invoiceRelateds: 1
};
/**
 * Represents the main tax report model.
 */
export let taxReportMain;
/**
 * Represents a lean tax report model.
 */
export let taxReportLean;
/** primary selection object
 * for taxReport
 */
export const taxReportSelect = taxReportselect;
/**
 * Creates a tax report model with the given database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main connection or not. Defaults to true.
 * @param lean Whether to create the lean connection or not. Defaults to true.
 */
export const createTaxReportModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl, dbOptions);
    }
    if (main) {
        taxReportMain = mainConnection.model('taxReport', taxReportSchema);
    }
    if (lean) {
        taxReportLean = mainConnectionLean.model('taxReport', taxReportSchema);
    }
};
//# sourceMappingURL=taxreport.model.js.map