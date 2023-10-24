"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProfitandlossReportModel = exports.profitandlossReportSelect = exports.profitandlossReportLean = exports.profitandlossReportMain = void 0;
/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../../../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const profitandlossReportSchema = new mongoose_1.Schema({
    urId: { type: String, unique: true },
    totalAmount: { type: Number },
    date: { type: Date },
    expenses: [],
    invoiceRelateds: []
}, { timestamps: true });
// Apply the uniqueValidator plugin to profitandlossReportSchema.
profitandlossReportSchema.plugin(uniqueValidator);
/** primary selection object
 * for profitandlossReport
 */
const profitandlossReportselect = {
    urId: 1,
    totalAmount: 1,
    date: 1,
    expenses: 1,
    invoiceRelateds: 1
};
/** primary selection object
 * for profitandlossReport
 */
/** */
exports.profitandlossReportSelect = profitandlossReportselect;
/** */
const createProfitandlossReportModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl);
    }
    if (main) {
        exports.profitandlossReportMain = database_controller_1.mainConnection.model('profitandlossReport', profitandlossReportSchema);
    }
    if (lean) {
        exports.profitandlossReportLean = database_controller_1.mainConnectionLean.model('profitandlossReport', profitandlossReportSchema);
    }
};
exports.createProfitandlossReportModel = createProfitandlossReportModel;
//# sourceMappingURL=profitandlossreport.model.js.map