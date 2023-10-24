"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFaqModel = exports.faqSelect = exports.faqLean = exports.faqMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const faqSchema = new mongoose_1.Schema({
    urId: { type: String, unique: true },
    posterName: { type: String },
    posterEmail: { type: String, required: [true, 'cannot be empty.'], index: true },
    userId: { type: String },
    qn: { type: String, required: [true, 'cannot be empty.'], index: true }
}, { timestamps: true });
// Apply the uniqueValidator plugin to faqSchema.
faqSchema.plugin(uniqueValidator);
/** primary selection object
 * for faq
 */
const faqselect = {
    urId: 1,
    posterName: 1,
    posterEmail: 1,
    userId: 1,
    qn: 1
};
/** primary selection object
 * for faq
 */
/** */
exports.faqSelect = faqselect;
/** */
const createFaqModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl);
    }
    if (main) {
        exports.faqMain = database_controller_1.mainConnection.model('Faq', faqSchema);
    }
    if (lean) {
        exports.faqLean = database_controller_1.mainConnectionLean.model('Faq', faqSchema);
    }
};
exports.createFaqModel = createFaqModel;
//# sourceMappingURL=faq.model.js.map