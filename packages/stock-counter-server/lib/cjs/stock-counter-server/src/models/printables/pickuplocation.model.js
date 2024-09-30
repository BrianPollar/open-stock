"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPickupLocationModel = exports.pickupLocationSelect = exports.pickupLocationLean = exports.pickupLocationMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const database_1 = require("../../utils/database");
const uniqueValidator = require('mongoose-unique-validator');
const pickupLocationSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withUrIdAndCompanySchemaObj,
    name: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
    contact: {}
}, { timestamps: true, collection: 'pickuplocations' });
pickupLocationSchema.pre('updateOne', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
pickupLocationSchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
// Apply the uniqueValidator plugin to pickupLocationSchema.
pickupLocationSchema.plugin(uniqueValidator);
/** primary selection object
 * for pickupLocation
 */
const pickupLocationselect = {
    ...stock_universal_server_1.withUrIdAndCompanySelectObj,
    name: 1,
    contact: 1
};
/**
 * Represents a pickup location select.
 */
exports.pickupLocationSelect = pickupLocationselect;
/**
 * Creates a new PickupLocation model with the specified database URL, main connection and lean connection.
 * @param dbUrl The database URL to connect to.
 * @param main Whether to create the model for the main connection.
 * @param lean Whether to create the model for the lean connection.
 */
const createPickupLocationModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    (0, stock_universal_server_1.createExpireDocIndex)(pickupLocationSchema);
    if (!database_1.isStockDbConnected) {
        await (0, database_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.pickupLocationMain = database_1.mainConnection
            .model('PickupLocation', pickupLocationSchema);
    }
    if (lean) {
        exports.pickupLocationLean = database_1.mainConnectionLean
            .model('PickupLocation', pickupLocationSchema);
    }
};
exports.createPickupLocationModel = createPickupLocationModel;
//# sourceMappingURL=pickuplocation.model.js.map