import { connectDatabase, createExpireDocIndex, isDbConnected, mainConnection, mainConnectionLean, preUpdateDocExpire, withUrIdAndCompanySchemaObj, withUrIdAndCompanySelectObj } from '@open-stock/stock-universal-server';
import { Schema } from 'mongoose';
const uniqueValidator = require('mongoose-unique-validator');
const faqanswerSchema = new Schema({
    ...withUrIdAndCompanySchemaObj,
    faq: { type: Schema.Types.ObjectId, required: [true, 'cannot be empty.'], index: true },
    userId: { type: Schema.Types.ObjectId, required: [true, 'cannot be empty.'] },
    ans: {
        type: String,
        required: [true, 'cannot be empty.'],
        index: true,
        minlength: [10, 'cannot be less than 10.'],
        maxlength: [3000, 'cannot be more than 3000.']
    }
}, { timestamps: true, collection: 'faqanswers' });
faqanswerSchema.pre('updateOne', function (next) {
    return preUpdateDocExpire(this, next);
});
faqanswerSchema.pre('updateMany', function (next) {
    return preUpdateDocExpire(this, next);
});
// Apply the uniqueValidator plugin to faqanswerSchema.
faqanswerSchema.plugin(uniqueValidator);
/** primary selection object
 * for faq ans
 */
const faqanswerselect = {
    ...withUrIdAndCompanySelectObj,
    faq: 1,
    userId: 1,
    ans: 1
};
/**
 * The main faqanswer model.
 */
export let faqanswerMain;
/**
 * Represents a lean version of the FAQ answer model.
 */
export let faqanswerLean;
/**
 * Selects the faqanswer object.
 */
export const faqanswerSelect = faqanswerselect;
/**
 * Creates a Faqanswer model with the specified database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the Faqanswer model for the main connection.
 * @param lean Whether to create the Faqanswer model for the lean connection.
 */
export const createFaqanswerModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    createExpireDocIndex(faqanswerSchema);
    if (!isDbConnected) {
        await connectDatabase(dbUrl, dbOptions);
    }
    if (main) {
        faqanswerMain = mainConnection
            .model('Faqanswer', faqanswerSchema);
    }
    if (lean) {
        faqanswerLean = mainConnectionLean
            .model('Faqanswer', faqanswerSchema);
    }
};
//# sourceMappingURL=faqanswer.model.js.map