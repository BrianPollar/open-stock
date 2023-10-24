import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
const faqSchema = new Schema({
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
/** main connection for faqs Operations*/
export let faqMain;
/** lean connection for faqs Operations*/
export let faqLean;
/** primary selection object
 * for faq
 */
/** */
export const faqSelect = faqselect;
/** */
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