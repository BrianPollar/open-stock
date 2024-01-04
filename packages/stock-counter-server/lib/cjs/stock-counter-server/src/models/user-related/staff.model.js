"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStaffModel = exports.staffSelect = exports.staffLean = exports.staffMain = void 0;
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importStar(require("mongoose"));
const database_controller_1 = require("../../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
/** Defines the schema for the staff model. */
const staffSchema = new mongoose_1.Schema({
    companyId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
    user: { type: mongoose_1.default.Types.ObjectId, unique: true, required: [true, 'cannot be empty.'], index: true },
    startDate: { type: Date, required: [true, 'cannot be empty.'] },
    endDate: { type: Date, required: [true, 'cannot be empty.'] },
    occupation: { type: String },
    employmentType: { type: String },
    salary: {}
}, { timestamps: true });
// Apply the uniqueValidator plugin to staffSchema.
staffSchema.plugin(uniqueValidator);
/** Defines the primary selection object for staff. */
const staffselect = {
    companyId: 1,
    user: 1,
    startDate: 1,
    endDate: 1,
    occupation: 1,
    employmentType: 1,
    salary: 1
};
/** Defines the primary selection object for staff. */
/**
 * The staffSelect constant represents the selection of staff members.
 */
exports.staffSelect = staffselect;
/**
 * Creates a new staff model with the given database URL.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the main connection for staff operations.
 * @param lean Whether to create the lean connection for staff operations.
 */
const createStaffModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl);
    }
    if (main) {
        exports.staffMain = database_controller_1.mainConnection.model('Staff', staffSchema);
    }
    if (lean) {
        exports.staffLean = database_controller_1.mainConnectionLean.model('Staff', staffSchema);
    }
};
exports.createStaffModel = createStaffModel;
//# sourceMappingURL=staff.model.js.map