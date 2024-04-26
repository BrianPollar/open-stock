import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
const itemOfferSchema = new Schema({
    urId: { type: String },
    companyId: { type: String, required: [true, 'cannot be empty.'], index: true },
    items: [],
    expireAt: { type: Date },
    type: { type: String },
    header: { type: String },
    subHeader: { type: String },
    ammount: { type: Number }
}, { timestamps: true });
itemOfferSchema.index({ expireAt: 1 }, { expireAfterSeconds: 2628003 });
// Apply the uniqueValidator plugin to itemOfferSchema.
itemOfferSchema.plugin(uniqueValidator);
/** primary selection object
 * for itemOffer
 */
const itemOfferselect = {
    urId: 1,
    companyId: 1,
    items: 1,
    expireAt: 1,
    type: 1,
    header: 1,
    subHeader: 1,
    ammount: 1
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
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl, dbOptions);
    }
    if (main) {
        itemOfferMain = mainConnection.model('ItemOffer', itemOfferSchema);
    }
    if (lean) {
        itemOfferLean = mainConnectionLean.model('ItemOffer', itemOfferSchema);
    }
};
//# sourceMappingURL=itemoffer.model.js.map