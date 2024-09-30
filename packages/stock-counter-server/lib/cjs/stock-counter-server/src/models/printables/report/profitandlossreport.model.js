"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProfitandlossReportModel = exports.profitandlossReportSelect = exports.profitandlossReportLean = exports.profitandlossReportMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const database_1 = require("../../../utils/database");
const uniqueValidator = require('mongoose-unique-validator');
const profitandlossReportSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withUrIdAndCompanySchemaObj,
    totalAmount: { type: Number },
    date: { type: Date },
    expenses: [],
    invoiceRelateds: [],
    currency: { type: String, default: 'USD' }
}, { timestamps: true, collection: 'profitandlossreports' });
// Apply the uniqueValidator plugin to profitandlossReportSchema.
profitandlossReportSchema.plugin(uniqueValidator);
profitandlossReportSchema.pre('updateOne', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
profitandlossReportSchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
/** primary selection object
 * for profitandlossReport
 */
const profitandlossReportselect = {
    ...stock_universal_server_1.withUrIdAndCompanySelectObj,
    totalAmount: 1,
    date: 1,
    expenses: 1,
    invoiceRelateds: 1,
    currency: 1
};
/**
 * Selects the profit and loss report.
 */
exports.profitandlossReportSelect = profitandlossReportselect;
/**
 * Creates a Profit and Loss Report model.
 * @param dbUrl - The URL of the database to connect to.
 * @param main - Whether to create the main connection model. Defaults to true.
 * @param lean - Whether to create the lean connection model. Defaults to true.
 */
const createProfitandlossReportModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    (0, stock_universal_server_1.createExpireDocIndex)(profitandlossReportSchema);
    if (!database_1.isStockDbConnected) {
        await (0, database_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.profitandlossReportMain = database_1.mainConnection
            .model('profitandlossReport', profitandlossReportSchema);
    }
    if (lean) {
        exports.profitandlossReportLean = database_1.mainConnectionLean
            .model('profitandlossReport', profitandlossReportSchema);
    }
};
exports.createProfitandlossReportModel = createProfitandlossReportModel;
//# sourceMappingURL=profitandlossreport.model.js.map