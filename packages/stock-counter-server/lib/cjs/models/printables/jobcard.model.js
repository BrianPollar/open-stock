"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJobCardModel = exports.jobCardSelect = exports.jobCardLean = exports.jobCardMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const jobCardSchema = new mongoose_1.Schema({
    urId: { type: String, unique: true },
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
    urId: 1,
    client: 1,
    machine: 1,
    problem: 1,
    cost: 1
};
/** primary selection object
 * for jobCard
 */
/** */
exports.jobCardSelect = jobCardselect;
/** */
const createJobCardModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl);
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