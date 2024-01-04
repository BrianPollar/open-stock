"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSalesReportModel = exports.salesReportSelect = exports.salesReportLean = exports.salesReportMain = void 0;
/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../../../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const salesReportSchema = new mongoose_1.Schema({
    urId: { type: String, unique: true },
    companyId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
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
    companyId: 1,
    totalAmount: 1,
    date: 1,
    estimates: 1,
    invoiceRelateds: 1
};
/**
 * Represents the sales report select statement.
 */
exports.salesReportSelect = salesReportselect;
/**
 * Creates a sales report model with the given database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create a main connection or not. Defaults to true.
 * @param lean Whether to create a lean connection or not. Defaults to true.
 */
const createSalesReportModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl);
    }
    if (main) {
        exports.salesReportMain = database_controller_1.mainConnection.model('salesReport', salesReportSchema);
    }
    if (lean) {
        exports.salesReportLean = database_controller_1.mainConnectionLean.model('salesReport', salesReportSchema);
    }
};
exports.createSalesReportModel = createSalesReportModel;
//# sourceMappingURL=salesreport.model.js.map