import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
const faqanswerSchema = new Schema({
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
/** main connection for faq ans Operations*/
export let faqanswerMain;
/** lean connection for faq ans Operations*/
export let faqanswerLean;
/** primary selection object
 * for faq ans
 */
/** */
export const faqanswerSelect = faqanswerselect;
/** */
export const createFaqanswerModel = async (dbUrl, main = true, lean = true) => {
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl);
    }
    if (main) {
        faqanswerMain = mainConnection.model('Faqanswer', faqanswerSchema);
    }
    if (lean) {
        faqanswerLean = mainConnectionLean.model('Faqanswer', faqanswerSchema);
    }
};
//# sourceMappingURL=faqanswer.model.js.map