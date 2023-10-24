import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
const itemDecoySchema = new Schema({
    urId: { type: String, unique: true },
    type: { type: String },
    items: []
}, { timestamps: true });
// Apply the uniqueValidator plugin to userSchema.
itemDecoySchema.plugin(uniqueValidator);
/** primary selection object
 * for itemDecoy
 */
const itemDecoyselect = {
    urId: 1,
    type: 1,
    items: 1
};
/** main connection for itemDecoys Operations*/
export let itemDecoyMain;
/** lean connection for itemDecoys Operations*/
export let itemDecoyLean;
/** primary selection object
 * for itemDecoy
 */
/** */
export const itemDecoySelect = itemDecoyselect;
/** */
/**
 * Creates an ItemDecoy model with the specified database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the main connection or not. Defaults to true.
 * @param lean Whether to create the lean connection or not. Defaults to true.
 */
export const createItemDecoyModel = async (dbUrl, main = true, lean = true) => {
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl);
    }
    if (main) {
        itemDecoyMain = mainConnection.model('ItemDecoy', itemDecoySchema);
    }
    if (lean) {
        itemDecoyLean = mainConnectionLean.model('ItemDecoy', itemDecoySchema);
    }
};
//# sourceMappingURL=itemdecoy.model.js.map