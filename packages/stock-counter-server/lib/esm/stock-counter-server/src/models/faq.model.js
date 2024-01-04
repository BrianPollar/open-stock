import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
/** FAQ schema */
const faqSchema = new Schema({
    urId: { type: String, unique: true },
    companyId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
    posterName: { type: String },
    posterEmail: { type: String, required: [true, 'cannot be empty.'], index: true },
    userId: { type: String },
    qn: { type: String, required: [true, 'cannot be empty.'], index: true }
}, { timestamps: true });
// Apply the uniqueValidator plugin to faqSchema.
faqSchema.plugin(uniqueValidator);
/** Primary selection object for FAQ */
const faqselect = {
    urId: 1,
    companyId: 1,
    posterName: 1,
    posterEmail: 1,
    userId: 1,
    qn: 1
};
/**
 * Represents the main FAQ model.
 */
export let faqMain;
/**
 * Represents a lean FAQ model.
 */
export let faqLean;
/**
 * Selects the faqselect constant from the faq.model module.
 */
export const faqSelect = faqselect;
/**
 * Creates a new FAQ model.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create a main connection.
 * @param lean Whether to create a lean connection.
 */
export const createFaqModel = async (dbUrl, main = true, lean = true) => {
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl);
    }
    if (main) {
        faqMain = mainConnection.model('Faq', faqSchema);
    }
    if (lean) {
        faqLean = mainConnectionLean.model('Faq', faqSchema);
    }
};
//# sourceMappingURL=faq.model.js.map