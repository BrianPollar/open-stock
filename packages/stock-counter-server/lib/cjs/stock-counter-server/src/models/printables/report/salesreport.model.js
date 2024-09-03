"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSalesReportModel = exports.salesReportSelect = exports.salesReportLean = exports.salesReportMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const database_1 = require("../../../utils/database");
const uniqueValidator = require('mongoose-unique-validator');
const salesReportSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withUrIdAndCompanySchemaObj,
    totalAmount: { type: Number },
    date: { type: Date },
    estimates: [],
    invoiceRelateds: [],
    currency: { type: String, default: 'USD' }
}, { timestamps: true, collection: 'salesreports' });
// Apply the uniqueValidator plugin to salesReportSchema.
salesReportSchema.plugin(uniqueValidator);
salesReportSchema.pre('updateOne', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
salesReportSchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
/** primary selection object
 * for salesReport
 */
const salesReportselect = {
    ...stock_universal_server_1.withUrIdAndCompanySelectObj,
    totalAmount: 1,
    date: 1,
    estimates: 1,
    invoiceRelateds: 1,
    currency: 1
};
/**
 * Represents the sales report select statement.
 */
exports.salesReportSelect = salesReportselect;
/**
 * Creates a sales report model with the given database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create a main connection or not. Defaults to true.
 * @param lean Whether to create a lean connection or not. Defaults to true.
 */
const createSalesReportModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    (0, stock_universal_server_1.createExpireDocIndex)(salesReportSchema);
    if (!database_1.isStockDbConnected) {
        await (0, database_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.salesReportMain = database_1.mainConnection.model('salesReport', salesReportSchema);
    }
    if (lean) {
        exports.salesReportLean = database_1.mainConnectionLean.model('salesReport', salesReportSchema);
    }
};
exports.createSalesReportModel = createSalesReportModel;
//# sourceMappingURL=salesreport.model.js.map