import { connectDatabase, createExpireDocIndex, isDbConnected, mainConnection, mainConnectionLean, preUpdateDocExpire, withUrIdAndCompanySchemaObj, withUrIdAndCompanySelectObj } from '@open-stock/stock-universal-server';
import { Schema } from 'mongoose';
const uniqueValidator = require('mongoose-unique-validator');
/** FAQ schema */
const faqSchema = new Schema({
    ...withUrIdAndCompanySchemaObj,
    posterName: {
        type: String,
        minlength: [3, 'cannot be less than 3.'],
        maxlength: [100, 'cannot be more than 100.']
    },
    posterEmail: {
        type: String,
        required: [true, 'cannot be empty.'],
        index: true,
        validator: checkEmail,
        message: props => `${props.value} is invalid phone!`
    },
    userId: { type: Schema.Types.ObjectId },
    qn: {
        type: String,
        required: [true, 'cannot be empty.'],
        index: true,
        minlength: [10, 'cannot be less than 10.'],
        maxlength: [400, 'cannot be more than 400.']
    }
}, { timestamps: true, collection: 'faqs' });
function checkEmail(email) {
    // eslint-disable-next-line max-len
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
faqSchema.pre('updateOne', function (next) {
    return preUpdateDocExpire(this, next);
});
faqSchema.pre('updateMany', function (next) {
    return preUpdateDocExpire(this, next);
});
// Apply the uniqueValidator plugin to faqSchema.
faqSchema.plugin(uniqueValidator);
/** Primary selection object for FAQ */
const faqselect = {
    ...withUrIdAndCompanySelectObj,
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
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create a main connection.
 * @param lean Whether to create a lean connection.
 */
export const createFaqModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    createExpireDocIndex(faqSchema);
    if (!isDbConnected) {
        await connectDatabase(dbUrl, dbOptions);
    }
    if (main) {
        faqMain = mainConnection
            .model('Faq', faqSchema);
    }
    if (lean) {
        faqLean = mainConnectionLean
            .model('Faq', faqSchema);
    }
};
//# sourceMappingURL=faq.model.js.map