"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFaqanswerModel = exports.faqanswerSelect = exports.faqanswerLean = exports.faqanswerMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const database_1 = require("../utils/database");
const uniqueValidator = require('mongoose-unique-validator');
const faqanswerSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withUrIdAndCompanySchemaObj,
    faq: { type: String, required: [true, 'cannot be empty.'], index: true },
    userId: { type: String, required: [true, 'cannot be empty.'] },
    ans: { type: String, required: [true, 'cannot be empty.'], index: true }
}, { timestamps: true, collection: 'faqanswers' });
faqanswerSchema.pre('updateOne', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
faqanswerSchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
// Apply the uniqueValidator plugin to faqanswerSchema.
faqanswerSchema.plugin(uniqueValidator);
/** primary selection object
 * for faq ans
 */
const faqanswerselect = {
    ...stock_universal_server_1.withUrIdAndCompanySelectObj,
    faq: 1,
    userId: 1,
    ans: 1
};
/**
 * Selects the faqanswer object.
 */
exports.faqanswerSelect = faqanswerselect;
/**
 * Creates a Faqanswer model with the specified database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the Faqanswer model for the main connection.
 * @param lean Whether to create the Faqanswer model for the lean connection.
 */
const createFaqanswerModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    (0, stock_universal_server_1.createExpireDocIndex)(faqanswerSchema);
    if (!database_1.isStockDbConnected) {
        await (0, database_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.faqanswerMain = database_1.mainConnection.model('Faqanswer', faqanswerSchema);
    }
    if (lean) {
        exports.faqanswerLean = database_1.mainConnectionLean.model('Faqanswer', faqanswerSchema);
    }
};
exports.createFaqanswerModel = createFaqanswerModel;
//# sourceMappingURL=faqanswer.model.js.map