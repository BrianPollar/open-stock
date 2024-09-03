"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaxReportModel = exports.taxReportSelect = exports.taxReportLean = exports.taxReportMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const database_1 = require("../../../utils/database");
const uniqueValidator = require('mongoose-unique-validator');
const taxReportSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withUrIdAndCompanySchemaObj,
    totalAmount: { type: Number },
    date: { type: Date },
    estimates: [],
    invoiceRelateds: [],
    currency: { type: String, default: 'USD' }
}, { timestamps: true, collection: 'taxreports' });
// Apply the uniqueValidator plugin to taxReportSchema.
taxReportSchema.plugin(uniqueValidator);
taxReportSchema.pre('updateOne', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
taxReportSchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
/** primary selection object
 * for taxReport
 */
const taxReportselect = {
    ...stock_universal_server_1.withUrIdAndCompanySelectObj,
    totalAmount: 1,
    date: 1,
    estimates: 1,
    invoiceRelateds: 1,
    currency: 1
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
    (0, stock_universal_server_1.createExpireDocIndex)(taxReportSchema);
    if (!database_1.isStockDbConnected) {
        await (0, database_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.taxReportMain = database_1.mainConnection.model('taxReport', taxReportSchema);
    }
    if (lean) {
        exports.taxReportLean = database_1.mainConnectionLean.model('taxReport', taxReportSchema);
    }
};
exports.createTaxReportModel = createTaxReportModel;
//# sourceMappingURL=taxreport.model.js.map