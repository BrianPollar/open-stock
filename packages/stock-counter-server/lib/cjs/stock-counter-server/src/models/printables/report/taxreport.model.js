"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaxReportModel = exports.taxReportSelect = exports.taxReportLean = exports.taxReportMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../../../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const taxReportSchema = new mongoose_1.Schema({
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
    urId: 1,
    companyId: 1,
    totalAmount: 1,
    date: 1,
    estimates: 1,
    invoiceRelateds: 1
};
/** primary selection object
 * for taxReport
 */
exports.taxReportSelect = taxReportselect;
/**
 * Creates a tax report model with the given database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main connection or not. Defaults to true.
 * @param lean Whether to create the lean connection or not. Defaults to true.
 */
const createTaxReportModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.taxReportMain = database_controller_1.mainConnection.model('taxReport', taxReportSchema);
    }
    if (lean) {
        exports.taxReportLean = database_controller_1.mainConnectionLean.model('taxReport', taxReportSchema);
    }
};
exports.createTaxReportModel = createTaxReportModel;
//# sourceMappingURL=taxreport.model.js.map