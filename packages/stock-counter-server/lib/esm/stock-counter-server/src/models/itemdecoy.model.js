import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
const itemDecoySchema = new Schema({
    urId: { type: String },
    companyId: { type: String, required: [true, 'cannot be empty.'], index: true },
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
    companyId: 1,
    type: 1,
    items: 1
};
/**
 * Represents the main item decoy model.
 */
export let itemDecoyMain;
/**
 * Represents the itemDecoyLean model.
 */
export let itemDecoyLean;
/**
 * Selects the item decoy.
 */
export const itemDecoySelect = itemDecoyselect;
/**
 * Creates an ItemDecoy model with the specified database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main connection or not. Defaults to true.
 * @param lean Whether to create the lean connection or not. Defaults to true.
 */
export const createItemDecoyModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl, dbOptions);
    }
    if (main) {
        itemDecoyMain = mainConnection.model('ItemDecoy', itemDecoySchema);
    }
    if (lean) {
        itemDecoyLean = mainConnectionLean.model('ItemDecoy', itemDecoySchema);
    }
};
//# sourceMappingURL=itemdecoy.model.js.map