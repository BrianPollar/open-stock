import { createExpireDocIndex, preUpdateDocExpire, withUrIdAndCompanySchemaObj, withUrIdAndCompanySelectObj } from '@open-stock/stock-universal-server';
import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../utils/database';
const uniqueValidator = require('mongoose-unique-validator');
const itemDecoySchema = new Schema({
    ...withUrIdAndCompanySchemaObj,
    type: { type: String },
    items: []
}, { timestamps: true, collection: 'itemdecoys' });
// Apply the uniqueValidator plugin to userSchema.
itemDecoySchema.plugin(uniqueValidator);
itemDecoySchema.pre('updateOne', function (next) {
    return preUpdateDocExpire(this, next);
});
itemDecoySchema.pre('updateMany', function (next) {
    return preUpdateDocExpire(this, next);
});
/** primary selection object
 * for itemDecoy
 */
const itemDecoyselect = {
    ...withUrIdAndCompanySelectObj,
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
    createExpireDocIndex(itemDecoySchema);
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl, dbOptions);
    }
    if (main) {
        itemDecoyMain = mainConnection
            .model('ItemDecoy', itemDecoySchema);
    }
    if (lean) {
        itemDecoyLean = mainConnectionLean
            .model('ItemDecoy', itemDecoySchema);
    }
};
//# sourceMappingURL=itemdecoy.model.js.map