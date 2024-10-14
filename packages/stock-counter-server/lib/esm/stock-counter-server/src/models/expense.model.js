import { connectDatabase, createExpireDocIndex, isDbConnected, mainConnection, mainConnectionLean, preUpdateDocExpire, withUrIdAndCompanySchemaObj, withUrIdAndCompanySelectObj } from '@open-stock/stock-universal-server';
import { Schema } from 'mongoose';
const uniqueValidator = require('mongoose-unique-validator');
const expenseSchema = new Schema({
    ...withUrIdAndCompanySchemaObj,
    name: {
        type: String,
        required: [true, 'cannot be empty.'],
        index: true,
        min: [1, 'cannot be less than 1.'],
        max: [200, 'cannot be greater than 200.']
    },
    person: {
        type: String,
        min: [1, 'cannot be less than 1.'],
        max: [200, 'cannot be greater than 200.']
    },
    cost: {
        type: Number,
        required: [true, 'cannot be empty.'],
        index: true,
        min: [0, 'cannot be less than 0.']
    },
    category: { type: String,
        max: [200, 'cannot be greater than 200.']
    },
    note: {
        type: String,
        max: [300, 'cannot be greater than 300.']
    },
    items: [Schema.Types.ObjectId],
    currency: { type: String, default: 'USD' }
}, { timestamps: true, collection: 'expenses' });
expenseSchema.pre('updateOne', function (next) {
    return preUpdateDocExpire(this, next);
});
expenseSchema.pre('updateMany', function (next) {
    return preUpdateDocExpire(this, next);
});
// Apply the uniqueValidator plugin to expenseSchema.
expenseSchema.plugin(uniqueValidator);
/** primary selection object
 * for expense
 */
const expenseselect = {
    ...withUrIdAndCompanySelectObj,
    name: 1,
    person: 1,
    cost: 1,
    category: 1,
    note: 1,
    items: 1,
    currency: 1
};
/**
 * Represents the main expense model.
 */
export let expenseMain;
/**
 * Represents a lean expense model.
 */
export let expenseLean;
/**
 * Represents the expense select function.
 */
export const expenseSelect = expenseselect;
/**
 * Creates an expense model with the given database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the model for the main connection.
 * @param lean Whether to create the model for the lean connection.
 */
export const createExpenseModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    createExpireDocIndex(expenseSchema);
    if (!isDbConnected) {
        await connectDatabase(dbUrl, dbOptions);
    }
    if (main) {
        expenseMain = mainConnection
            .model('Expense', expenseSchema);
    }
    if (lean) {
        expenseLean = mainConnectionLean
            .model('Expense', expenseSchema);
    }
};
//# sourceMappingURL=expense.model.js.map