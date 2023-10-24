"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFaqanswerModel = exports.faqanswerSelect = exports.faqanswerLean = exports.faqanswerMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const faqanswerSchema = new mongoose_1.Schema({
    urId: { type: String, unique: true },
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
    faq: 1,
    userId: 1,
    ans: 1
};
/** primary selection object
 * for faq ans
 */
/** */
exports.faqanswerSelect = faqanswerselect;
/** */
const createFaqanswerModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl);
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