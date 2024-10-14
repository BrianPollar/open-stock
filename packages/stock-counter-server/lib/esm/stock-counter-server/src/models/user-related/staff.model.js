import { connectDatabase, createExpireDocIndex, isDbConnected, mainConnection, mainConnectionLean, preUpdateDocExpire, withUrIdAndCompanySchemaObj, withUrIdAndCompanySelectObj } from '@open-stock/stock-universal-server';
import { Schema } from 'mongoose';
const uniqueValidator = require('mongoose-unique-validator');
/** Defines the schema for the staff model. */
const staffSchema = new Schema({
    ...withUrIdAndCompanySchemaObj,
    user: { type: Schema.Types.ObjectId, unique: true, required: [true, 'cannot be empty.'], index: true },
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
    return preUpdateDocExpire(this, next);
});
staffSchema.pre('updateMany', function (next) {
    return preUpdateDocExpire(this, next);
});
// Apply the uniqueValidator plugin to staffSchema.
staffSchema.plugin(uniqueValidator);
/** Defines the primary selection object for staff. */
const staffselect = {
    ...withUrIdAndCompanySelectObj,
    user: 1,
    startDate: 1,
    endDate: 1,
    occupation: 1,
    employmentType: 1,
    salary: 1
};
/**
 * The main staff model.
 */
export let staffMain;
/**
 * Represents a lean staff model.
 */
export let staffLean;
/** Defines the primary selection object for staff. */
/**
 * The staffSelect constant represents the selection of staff members.
 */
export const staffSelect = staffselect;
/**
 * Creates a new staff model with the given database URL.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main connection for staff operations.
 * @param lean Whether to create the lean connection for staff operations.
 */
export const createStaffModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    createExpireDocIndex(staffSchema);
    if (!isDbConnected) {
        await connectDatabase(dbUrl, dbOptions);
    }
    if (main) {
        staffMain = mainConnection
            .model('Staff', staffSchema);
    }
    if (lean) {
        staffLean = mainConnectionLean
            .model('Staff', staffSchema);
    }
};
//# sourceMappingURL=staff.model.js.map