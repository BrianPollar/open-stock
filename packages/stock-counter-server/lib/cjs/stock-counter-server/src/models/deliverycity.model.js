"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDeliverycityModel = exports.deliverycitySelect = exports.deliverycityLean = exports.deliverycityMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const database_1 = require("../utils/database");
const uniqueValidator = require('mongoose-unique-validator');
const deliverycitySchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withCompanySchemaObj,
    name: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
    shippingCost: { type: Number, required: [true, 'cannot be empty.'] },
    currency: { type: String, required: [true, 'cannot be empty.'] },
    deliversInDays: { type: Number, required: [true, 'cannot be empty.'] }
}, { timestamps: true, collection: 'deliverycities' });
deliverycitySchema.pre('updateOne', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
deliverycitySchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
// Apply the uniqueValidator plugin to deliverycitySchema.
deliverycitySchema.plugin(uniqueValidator);
/** primary selection object
 * for deliverycity
 */
const deliverycityselect = {
    ...stock_universal_server_1.withCompanySelectObj,
    name: 1,
    shippingCost: 1,
    currency: 1,
    deliversInDays: 1
};
/**
 * Represents the selection of delivery cities.
 */
exports.deliverycitySelect = deliverycityselect;
/**
 * Creates a delivery city model with the specified database URL, main connection and lean connection.
 * @param dbUrl The database URL to connect to.
 * @param main Whether to create a main connection or not.
 * @param lean Whether to create a lean connection or not.
 */
const createDeliverycityModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    (0, stock_universal_server_1.createExpireDocIndex)(deliverycitySchema);
    if (!database_1.isStockDbConnected) {
        await (0, database_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.deliverycityMain = database_1.mainConnection.model('Deliverycity', deliverycitySchema);
    }
    if (lean) {
        exports.deliverycityLean = database_1.mainConnectionLean.model('Deliverycity', deliverycitySchema);
    }
};
exports.createDeliverycityModel = createDeliverycityModel;
//# sourceMappingURL=deliverycity.model.js.map