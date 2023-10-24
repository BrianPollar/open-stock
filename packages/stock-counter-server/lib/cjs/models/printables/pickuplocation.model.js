"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPickupLocationModel = exports.pickupLocationSelect = exports.pickupLocationLean = exports.pickupLocationMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const pickupLocationSchema = new mongoose_1.Schema({
    name: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
    contact: {}
}, { timestamps: true });
// Apply the uniqueValidator plugin to pickupLocationSchema.
pickupLocationSchema.plugin(uniqueValidator);
/** primary selection object
 * for pickupLocation
 */
const pickupLocationselect = {
    name: 1,
    contact: 1
};
/** primary selection object
 * for pickupLocation
 */
/** */
exports.pickupLocationSelect = pickupLocationselect;
/** */
/**
 * Creates a new PickupLocation model with the specified database URL, main connection and lean connection.
 * @param dbUrl The database URL to connect to.
 * @param main Whether to create the model for the main connection.
 * @param lean Whether to create the model for the lean connection.
 */
const createPickupLocationModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl);
    }
    if (main) {
        exports.pickupLocationMain = database_controller_1.mainConnection.model('PickupLocation', pickupLocationSchema);
    }
    if (lean) {
        exports.pickupLocationLean = database_controller_1.mainConnectionLean.model('PickupLocation', pickupLocationSchema);
    }
};
exports.createPickupLocationModel = createPickupLocationModel;
//# sourceMappingURL=pickuplocation.model.js.map