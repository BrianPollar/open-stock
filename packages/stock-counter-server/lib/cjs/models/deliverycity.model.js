"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDeliverycityModel = exports.deliverycitySelect = exports.deliverycityLean = exports.deliverycityMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const deliverycitySchema = new mongoose_1.Schema({
    name: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
    shippingCost: { type: Number, required: [true, 'cannot be empty.'] },
    currency: { type: String, required: [true, 'cannot be empty.'] },
    deliversInDays: { type: Number, required: [true, 'cannot be empty.'] }
}, { timestamps: true });
// Apply the uniqueValidator plugin to deliverycitySchema.
deliverycitySchema.plugin(uniqueValidator);
/** primary selection object
 * for deliverycity
 */
const deliverycityselect = {
    name: 1,
    shippingCost: 1,
    currency: 1,
    deliversInDays: 1
};
/** primary selection object
 * for deliverycity
 */
/** */
exports.deliverycitySelect = deliverycityselect;
/** */
/**
 * Creates a delivery city model with the specified database URL, main connection and lean connection.
 * @param dbUrl The database URL to connect to.
 * @param main Whether to create a main connection or not.
 * @param lean Whether to create a lean connection or not.
 */
const createDeliverycityModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl);
    }
    if (main) {
        exports.deliverycityMain = database_controller_1.mainConnection.model('Deliverycity', deliverycitySchema);
    }
    if (lean) {
        exports.deliverycityLean = database_controller_1.mainConnectionLean.model('Deliverycity', deliverycitySchema);
    }
};
exports.createDeliverycityModel = createDeliverycityModel;
//# sourceMappingURL=deliverycity.model.js.map