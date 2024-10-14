"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPickupLocationModel = exports.pickupLocationSelect = exports.pickupLocationLean = exports.pickupLocationMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const pickupLocationSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withUrIdAndCompanySchemaObj,
    name: {
        type: String,
        unique: true,
        required: [true, 'cannot be empty.'],
        index: true,
        minlength: [3, 'cannot be less than 3.'],
        maxlength: [150, 'cannot be more than 150.']
    },
    contact: {
        name: { type: String },
        phone: { type: String },
        email: { type: String }
    }
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
    if (!stock_universal_server_1.isDbConnected) {
        await (0, stock_universal_server_1.connectDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.pickupLocationMain = stock_universal_server_1.mainConnection
            .model('PickupLocation', pickupLocationSchema);
    }
    if (lean) {
        exports.pickupLocationLean = stock_universal_server_1.mainConnectionLean
            .model('PickupLocation', pickupLocationSchema);
    }
};
exports.createPickupLocationModel = createPickupLocationModel;
//# sourceMappingURL=pickuplocation.model.js.map