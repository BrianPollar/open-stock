import { createExpireDocIndex, preUpdateDocExpire, withCompanySchemaObj, withCompanySelectObj } from '@open-stock/stock-universal-server';
import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../utils/database';
const uniqueValidator = require('mongoose-unique-validator');
const deliverycitySchema = new Schema({
    ...withCompanySchemaObj,
    name: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
    shippingCost: { type: Number, required: [true, 'cannot be empty.'] },
    currency: { type: String, required: [true, 'cannot be empty.'] },
    deliversInDays: { type: Number, required: [true, 'cannot be empty.'] }
}, { timestamps: true, collection: 'deliverycities' });
deliverycitySchema.pre('updateOne', function (next) {
    return preUpdateDocExpire(this, next);
});
deliverycitySchema.pre('updateMany', function (next) {
    return preUpdateDocExpire(this, next);
});
// Apply the uniqueValidator plugin to deliverycitySchema.
deliverycitySchema.plugin(uniqueValidator);
/** primary selection object
 * for deliverycity
 */
const deliverycityselect = {
    ...withCompanySelectObj,
    name: 1,
    shippingCost: 1,
    currency: 1,
    deliversInDays: 1
};
/**
 * Represents the main delivery city model.
 */
export let deliverycityMain;
/**
 * Represents a variable that holds a lean model of the delivery city.
 */
export let deliverycityLean;
/**
 * Represents the selection of delivery cities.
 */
export const deliverycitySelect = deliverycityselect;
/**
 * Creates a delivery city model with the specified database URL, main connection and lean connection.
 * @param dbUrl The database URL to connect to.
 * @param main Whether to create a main connection or not.
 * @param lean Whether to create a lean connection or not.
 */
export const createDeliverycityModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    createExpireDocIndex(deliverycitySchema);
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl, dbOptions);
    }
    if (main) {
        deliverycityMain = mainConnection.model('Deliverycity', deliverycitySchema);
    }
    if (lean) {
        deliverycityLean = mainConnectionLean.model('Deliverycity', deliverycitySchema);
    }
};
//# sourceMappingURL=deliverycity.model.js.map