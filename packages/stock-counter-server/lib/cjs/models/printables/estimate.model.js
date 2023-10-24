"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEstimateModel = exports.estimateSelect = exports.estimateLean = exports.estimateMain = void 0;
/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../../controllers/database.controller");
const estimateSchema = new mongoose_1.Schema({
    invoiceRelated: { type: String }
}, { timestamps: true });
/** primary selection object
 * for estimate
 */
const estimateselect = {
    invoiceRelated: 1
};
/** primary selection object
 * for estimate
 */
/** */
exports.estimateSelect = estimateselect;
/** */
/**
 * Creates an Estimate model with the given database URL, main flag, and lean flag.
 * @param dbUrl - The URL of the database to connect to.
 * @param main - A flag indicating whether to create the main connection model.
 * @param lean - A flag indicating whether to create the lean connection model.
 */
const createEstimateModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl);
    }
    if (main) {
        exports.estimateMain = database_controller_1.mainConnection.model('Estimate', estimateSchema);
    }
    if (lean) {
        exports.estimateLean = database_controller_1.mainConnectionLean.model('Estimate', estimateSchema);
    }
};
exports.createEstimateModel = createEstimateModel;
//# sourceMappingURL=estimate.model.js.map