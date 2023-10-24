import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
const itemOfferSchema = new Schema({
    urId: { type: String, unique: true },
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
    items: 1,
    expireAt: 1,
    type: 1,
    header: 1,
    subHeader: 1,
    ammount: 1
};
/** main connection for itemOffers Operations*/
export let itemOfferMain;
/** lean connection for itemOffers Operations*/
export let itemOfferLean;
/** primary selection object
 * for itemOffer
 */
/** */
export const itemOfferSelect = itemOfferselect;
/** */
export const createItemOfferModel = async (dbUrl, main = true, lean = true) => {
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl);
    }
    if (main) {
        itemOfferMain = mainConnection.model('ItemOffer', itemOfferSchema);
    }
    if (lean) {
        itemOfferLean = mainConnectionLean.model('ItemOffer', itemOfferSchema);
    }
};
//# sourceMappingURL=itemoffer.model.js.map