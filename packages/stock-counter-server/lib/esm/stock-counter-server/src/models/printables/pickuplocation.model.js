import { createExpireDocIndex, preUpdateDocExpire, withUrIdAndCompanySchemaObj, withUrIdAndCompanySelectObj } from '@open-stock/stock-universal-server';
import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../utils/database';
const uniqueValidator = require('mongoose-unique-validator');
const pickupLocationSchema = new Schema({
    ...withUrIdAndCompanySchemaObj,
    name: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
    contact: {}
}, { timestamps: true, collection: 'pickuplocations' });
pickupLocationSchema.pre('updateOne', function (next) {
    return preUpdateDocExpire(this, next);
});
pickupLocationSchema.pre('updateMany', function (next) {
    return preUpdateDocExpire(this, next);
});
// Apply the uniqueValidator plugin to pickupLocationSchema.
pickupLocationSchema.plugin(uniqueValidator);
/** primary selection object
 * for pickupLocation
 */
const pickupLocationselect = {
    ...withUrIdAndCompanySelectObj,
    name: 1,
    contact: 1
};
/**
 * Represents the main pickup location model.
 */
export let pickupLocationMain;
/**
 * Represents a lean pickup location model.
 */
export let pickupLocationLean;
/**
 * Represents a pickup location select.
 */
export const pickupLocationSelect = pickupLocationselect;
/**
 * Creates a new PickupLocation model with the specified database URL, main connection and lean connection.
 * @param dbUrl The database URL to connect to.
 * @param main Whether to create the model for the main connection.
 * @param lean Whether to create the model for the lean connection.
 */
export const createPickupLocationModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    createExpireDocIndex(pickupLocationSchema);
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl, dbOptions);
    }
    if (main) {
        pickupLocationMain = mainConnection
            .model('PickupLocation', pickupLocationSchema);
    }
    if (lean) {
        pickupLocationLean = mainConnectionLean
            .model('PickupLocation', pickupLocationSchema);
    }
};
//# sourceMappingURL=pickuplocation.model.js.map