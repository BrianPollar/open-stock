import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
const itemLimittedSchema = new Schema({
    urId: { type: String, unique: true },
    name: { type: String }
}, { timestamps: true });
// Apply the uniqueValidator plugin to userSchema.
itemLimittedSchema.plugin(uniqueValidator);
/** primary selection object
 * for itemLimitted
 */
const itemLimittedselect = {
    urId: 1,
    name: 1
};
/** main connection for itemLimitteds Operations*/
export let itemLimittedMain;
/** lean connection for itemLimitteds Operations*/
export let itemLimittedLean;
/** primary selection object
 * for itemLimitted
 */
/** */
export const itemLimittedSelect = itemLimittedselect;
/** */
export const createItemLimittedModel = async (dbUrl, main = true, lean = true) => {
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl);
    }
    if (main) {
        itemLimittedMain = mainConnection.model('ItemLimitted', itemLimittedSchema);
    }
    if (lean) {
        itemLimittedLean = mainConnectionLean.model('ItemLimitted', itemLimittedSchema);
    }
};
//# sourceMappingURL=itemlimitted.model.js.map