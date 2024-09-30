"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJobCardModel = exports.jobCardSelect = exports.jobCardLean = exports.jobCardMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const database_1 = require("../../utils/database");
const uniqueValidator = require('mongoose-unique-validator');
const jobCardSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withUrIdAndCompanySchemaObj,
    client: {},
    machine: {},
    problem: {},
    cost: { type: Number }
}, { timestamps: true, collection: 'jobcards' });
jobCardSchema.pre('updateOne', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
jobCardSchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
// Apply the uniqueValidator plugin to jobCardSchema.
jobCardSchema.plugin(uniqueValidator);
/** primary selection object
 * for jobCard
 */
const jobCardselect = {
    ...stock_universal_server_1.withUrIdAndCompanySelectObj,
    client: 1,
    machine: 1,
    problem: 1,
    cost: 1
};
/**
 * Represents a job card select.
 */
exports.jobCardSelect = jobCardselect;
/**
 * Creates a job card model with the given database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create a main connection or not. Defaults to true.
 * @param lean Whether to create a lean connection or not. Defaults to true.
 */
const createJobCardModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    (0, stock_universal_server_1.createExpireDocIndex)(jobCardSchema);
    if (!database_1.isStockDbConnected) {
        await (0, database_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.jobCardMain = database_1.mainConnection
            .model('JobCard', jobCardSchema);
    }
    if (lean) {
        exports.jobCardLean = database_1.mainConnectionLean
            .model('JobCard', jobCardSchema);
    }
};
exports.createJobCardModel = createJobCardModel;
//# sourceMappingURL=jobcard.model.js.map