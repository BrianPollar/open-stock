import { connectDatabase, createExpireDocIndex, isDbConnected, mainConnection, mainConnectionLean, preUpdateDocExpire, withUrIdAndCompanySchemaObj, withUrIdAndCompanySelectObj } from '@open-stock/stock-universal-server';
import { Schema } from 'mongoose';
const uniqueValidator = require('mongoose-unique-validator');
/** Defines the schema for the customer model. */
const customerSchema = new Schema({
    ...withUrIdAndCompanySchemaObj,
    user: { type: Schema.Types.ObjectId, unique: true, required: [true, 'cannot be empty.'], index: true },
    startDate: { type: Date },
    endDate: { type: Date,
        validator: checkEndDate,
        message: props => `${props.value} is invalid, must be greater than start date!`
    },
    occupation: { type: String },
    otherAddresses: []
}, { timestamps: true, collection: 'customers' });
function checkEndDate(endDate) {
    return new Date(endDate) > new Date(this.startDate);
}
customerSchema.pre('updateOne', function (next) {
    return preUpdateDocExpire(this, next);
});
customerSchema.pre('updateMany', function (next) {
    return preUpdateDocExpire(this, next);
});
// Apply the uniqueValidator plugin to customerSchema.
customerSchema.plugin(uniqueValidator);
/** Defines the main selection object for customer. */
const customerselect = {
    ...withUrIdAndCompanySelectObj,
    user: 1,
    salutation: 1,
    endDate: 1,
    occupation: 1,
    otherAddresses: 1
};
/**
 * The main customer model.
 */
export let customerMain;
/**
 * Represents a lean customer model.
 */
export let customerLean;
/**
 * Represents a customer select statement.
 */
export const customerSelect = customerselect;
/**
 * Creates a new customer model and connects to the database.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main connection.
 * @param lean Whether to create the lean connection.
 */
export const createCustomerModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    createExpireDocIndex(customerSchema);
    if (!isDbConnected) {
        await connectDatabase(dbUrl, dbOptions);
    }
    if (main) {
        customerMain = mainConnection
            .model('Customer', customerSchema);
    }
    if (lean) {
        customerLean = mainConnectionLean
            .model('Customer', customerSchema);
    }
};
//# sourceMappingURL=customer.model.js.map