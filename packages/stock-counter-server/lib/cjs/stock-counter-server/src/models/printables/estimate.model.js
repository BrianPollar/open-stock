"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEstimateModel = exports.estimateSelect = exports.estimateLean = exports.estimateMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const database_1 = require("../../utils/database");
const estimateSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withCompanySchemaObj,
    invoiceRelated: { type: String }
}, { timestamps: true, collection: 'estimates' });
estimateSchema.pre('updateOne', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
estimateSchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
/** primary selection object
 * for estimate
 */
const estimateselect = {
    ...stock_universal_server_1.withCompanySelectObj,
    invoiceRelated: 1
};
/**
 * Represents the estimate select function.
 */
exports.estimateSelect = estimateselect;
/**
 * Creates an Estimate model with the given database URL, main flag, and lean flag.
 * @param dbUrl - The URL of the database to connect to.
 * @param main - A flag indicating whether to create the main connection model.
 * @param lean - A flag indicating whether to create the lean connection model.
 */
const createEstimateModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    (0, stock_universal_server_1.createExpireDocIndex)(estimateSchema);
    if (!database_1.isStockDbConnected) {
        await (0, database_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.estimateMain = database_1.mainConnection.model('Estimate', estimateSchema);
    }
    if (lean) {
        exports.estimateLean = database_1.mainConnectionLean.model('Estimate', estimateSchema);
    }
};
exports.createEstimateModel = createEstimateModel;
//# sourceMappingURL=estimate.model.js.map