"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStaffModel = exports.staffSelect = exports.staffLean = exports.staffMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
/** Defines the schema for the staff model. */
const staffSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withUrIdAndCompanySchemaObj,
    user: { type: mongoose_1.Schema.Types.ObjectId, unique: true, required: [true, 'cannot be empty.'], index: true },
    startDate: { type: Date },
    endDate: {
        type: Date,
        validator: checkEndDate,
        message: props => `${props.value} is invalid, endDate cannot be less than startDate!`
    },
    occupation: { type: String },
    employmentType: { type: String },
    salary: {
        employmentType: { type: String },
        salary: { type: String }
    }
}, { timestamps: true, collection: 'staffs' });
function checkEndDate(endDate) {
    return new Date(endDate) > new Date(this.startDate);
}
staffSchema.pre('updateOne', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
staffSchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
// Apply the uniqueValidator plugin to staffSchema.
staffSchema.plugin(uniqueValidator);
/** Defines the primary selection object for staff. */
const staffselect = {
    ...stock_universal_server_1.withUrIdAndCompanySelectObj,
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
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main connection for staff operations.
 * @param lean Whether to create the lean connection for staff operations.
 */
const createStaffModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    (0, stock_universal_server_1.createExpireDocIndex)(staffSchema);
    if (!stock_universal_server_1.isDbConnected) {
        await (0, stock_universal_server_1.connectDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.staffMain = stock_universal_server_1.mainConnection
            .model('Staff', staffSchema);
    }
    if (lean) {
        exports.staffLean = stock_universal_server_1.mainConnectionLean
            .model('Staff', staffSchema);
    }
};
exports.createStaffModel = createStaffModel;
//# sourceMappingURL=staff.model.js.map