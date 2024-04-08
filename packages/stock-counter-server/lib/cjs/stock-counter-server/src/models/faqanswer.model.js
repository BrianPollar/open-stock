"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFaqanswerModel = exports.faqanswerSelect = exports.faqanswerLean = exports.faqanswerMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const faqanswerSchema = new mongoose_1.Schema({
    urId: { type: String, unique: true },
    companyId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
    faq: { type: String, required: [true, 'cannot be empty.'], index: true },
    userId: { type: String, required: [true, 'cannot be empty.'] },
    ans: { type: String, required: [true, 'cannot be empty.'], index: true }
}, { timestamps: true });
// Apply the uniqueValidator plugin to faqanswerSchema.
faqanswerSchema.plugin(uniqueValidator);
/** primary selection object
 * for faq ans
 */
const faqanswerselect = {
    urId: 1,
    companyId: 1,
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
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.faqanswerMain = database_controller_1.mainConnection.model('Faqanswer', faqanswerSchema);
    }
    if (lean) {
        exports.faqanswerLean = database_controller_1.mainConnectionLean.model('Faqanswer', faqanswerSchema);
    }
};
exports.createFaqanswerModel = createFaqanswerModel;
//# sourceMappingURL=faqanswer.model.js.map