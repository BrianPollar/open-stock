import { connectDatabase, createExpireDocIndex, isDbConnected, mainConnection, mainConnectionLean, preUpdateDocExpire, withUrIdAndCompanySchemaObj, withUrIdAndCompanySelectObj } from '@open-stock/stock-universal-server';
import { Schema } from 'mongoose';
const uniqueValidator = require('mongoose-unique-validator');
const itemOfferSchema = new Schema({
    ...withUrIdAndCompanySchemaObj,
    items: [Schema.Types.ObjectId],
    expireAt: { type: Date },
    type: { type: String },
    header: {
        type: String,
        minLength: [1, 'cannot be less than 1.'],
        maxLength: [150, 'cannot be more than 150.']
    },
    subHeader: {
        type: String,
        minLength: [1, 'cannot be less than 1.'],
        maxLength: [150, 'cannot be more than 150.']
    },
    amount: {
        type: Number,
        min: [0, 'cannot be less than 0.']
    },
    currency: { type: String, default: 'USD' }
}, { timestamps: true, collection: 'itemoffers' });
itemOfferSchema.index({ expireAt: 1 }, { expireAfterSeconds: 2628003 });
// Apply the uniqueValidator plugin to itemOfferSchema.
itemOfferSchema.plugin(uniqueValidator);
itemOfferSchema.pre('updateOne', function (next) {
    return preUpdateDocExpire(this, next);
});
itemOfferSchema.pre('updateMany', function (next) {
    return preUpdateDocExpire(this, next);
});
/** primary selection object
 * for itemOffer
 */
const itemOfferselect = {
    ...withUrIdAndCompanySelectObj,
    items: 1,
    expireAt: 1,
    type: 1,
    header: 1,
    subHeader: 1,
    amount: 1,
    currency: 1
};
/**
 * Represents the main item offer model.
 */
export let itemOfferMain;
/**
 * Represents a lean item offer model.
 */
export let itemOfferLean;
/**
 * Represents the item offer select function.
 */
export const itemOfferSelect = itemOfferselect;
/**
 * Creates an instance of the ItemOffer model with the specified database URL.
 * @param {string} dbUrl - The URL of the database to connect to.
 * @param {boolean} [main=true] - Whether to create the main connection model.
 * @param {boolean} [lean=true] - Whether to create the lean connection model.
 * @returns {Promise<void>} - A promise that resolves when the models have been created.
 */
export const createItemOfferModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    createExpireDocIndex(itemOfferSchema);
    if (!isDbConnected) {
        await connectDatabase(dbUrl, dbOptions);
    }
    if (main) {
        itemOfferMain = mainConnection
            .model('ItemOffer', itemOfferSchema);
    }
    if (lean) {
        itemOfferLean = mainConnectionLean
            .model('ItemOffer', itemOfferSchema);
    }
};
//# sourceMappingURL=itemoffer.model.js.map