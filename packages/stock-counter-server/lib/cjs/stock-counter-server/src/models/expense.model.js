"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExpenseModel = exports.expenseSelect = exports.expenseLean = exports.expenseMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const expenseSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withUrIdAndCompanySchemaObj,
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
    items: [mongoose_1.Schema.Types.ObjectId],
    currency: { type: String, default: 'USD' }
}, { timestamps: true, collection: 'expenses' });
expenseSchema.pre('updateOne', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
expenseSchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
// Apply the uniqueValidator plugin to expenseSchema.
expenseSchema.plugin(uniqueValidator);
/** primary selection object
 * for expense
 */
const expenseselect = {
    ...stock_universal_server_1.withUrIdAndCompanySelectObj,
    name: 1,
    person: 1,
    cost: 1,
    category: 1,
    note: 1,
    items: 1,
    currency: 1
};
/**
 * Represents the expense select function.
 */
exports.expenseSelect = expenseselect;
/**
 * Creates an expense model with the given database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the model for the main connection.
 * @param lean Whether to create the model for the lean connection.
 */
const createExpenseModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    (0, stock_universal_server_1.createExpireDocIndex)(expenseSchema);
    if (!stock_universal_server_1.isDbConnected) {
        await (0, stock_universal_server_1.connectDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.expenseMain = stock_universal_server_1.mainConnection
            .model('Expense', expenseSchema);
    }
    if (lean) {
        exports.expenseLean = stock_universal_server_1.mainConnectionLean
            .model('Expense', expenseSchema);
    }
};
exports.createExpenseModel = createExpenseModel;
//# sourceMappingURL=expense.model.js.map