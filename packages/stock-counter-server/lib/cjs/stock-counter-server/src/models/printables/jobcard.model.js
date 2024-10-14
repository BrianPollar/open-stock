"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJobCardModel = exports.jobCardSelect = exports.jobCardLean = exports.jobCardMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const jobCardSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withUrIdAndCompanySchemaObj,
    client: {
        userId: { type: mongoose_1.Schema.Types.ObjectId },
        name: { type: String },
        phone: { type: String },
        email: { type: String }
    },
    machine: {
        name: { type: String },
        model: { type: String },
        serialNo: { type: String }
    },
    problem: {
        reportedIssue: { type: String },
        details: { type: String },
        issueOnFirstLook: { type: String }
    },
    cost: { type: Number, min: [0, 'cannot be less than 0.'] }
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
    if (!stock_universal_server_1.isDbConnected) {
        await (0, stock_universal_server_1.connectDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.jobCardMain = stock_universal_server_1.mainConnection
            .model('JobCard', jobCardSchema);
    }
    if (lean) {
        exports.jobCardLean = stock_universal_server_1.mainConnectionLean
            .model('JobCard', jobCardSchema);
    }
};
exports.createJobCardModel = createJobCardModel;
//# sourceMappingURL=jobcard.model.js.map