"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJobCardModel = exports.jobCardSelect = exports.jobCardLean = exports.jobCardMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const jobCardSchema = new mongoose_1.Schema({
    trackEdit: { type: mongoose_1.Schema.ObjectId },
    trackView: { type: mongoose_1.Schema.ObjectId },
    urId: { type: String },
    companyId: { type: String, required: [true, 'cannot be empty.'], index: true },
    client: {},
    machine: {},
    problem: {},
    cost: { type: Number }
}, { timestamps: true });
// Apply the uniqueValidator plugin to jobCardSchema.
jobCardSchema.plugin(uniqueValidator);
/** primary selection object
 * for jobCard
 */
const jobCardselect = {
    trackEdit: 1,
    trackView: 1,
    urId: 1,
    companyId: 1,
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
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.jobCardMain = database_controller_1.mainConnection.model('JobCard', jobCardSchema);
    }
    if (lean) {
        exports.jobCardLean = database_controller_1.mainConnectionLean.model('JobCard', jobCardSchema);
    }
};
exports.createJobCardModel = createJobCardModel;
//# sourceMappingURL=jobcard.model.js.map