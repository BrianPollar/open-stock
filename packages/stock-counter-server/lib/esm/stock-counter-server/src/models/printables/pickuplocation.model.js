import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
const pickupLocationSchema = new Schema({
    trackEdit: { type: Schema.ObjectId },
    trackView: { type: Schema.ObjectId },
    companyId: { type: String, required: [true, 'cannot be empty.'], index: true },
    name: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
    contact: {}
}, { timestamps: true });
// Apply the uniqueValidator plugin to pickupLocationSchema.
pickupLocationSchema.plugin(uniqueValidator);
/** primary selection object
 * for pickupLocation
 */
const pickupLocationselect = {
    trackEdit: 1,
    trackView: 1,
    companyId: 1,
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
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl, dbOptions);
    }
    if (main) {
        pickupLocationMain = mainConnection.model('PickupLocation', pickupLocationSchema);
    }
    if (lean) {
        pickupLocationLean = mainConnectionLean.model('PickupLocation', pickupLocationSchema);
    }
};
//# sourceMappingURL=pickuplocation.model.js.map