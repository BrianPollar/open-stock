"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPromocodeModel = exports.promocodeSelect = exports.promocodeLean = exports.promocodeMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
/**
 * Defines the schema for the promocode model.
 * @param {string} urId - The unique identifier for the promocode.
 * @param {string} code - The unique code for the promocode.
 * @param {string[]} items - The items associated with the promocode.
 * @param {number} amount - The amount of the promocode.
 * @param {string} roomId - The room identifier for the promocode.
 * @param {string} state - The state of the promocode.
 * @param {string} expireAt - The expiration date of the promocode.
 * @param {boolean} timestamps - The timestamps for the promocode.
 */
const promocodeSchema = new mongoose_1.Schema({
    urId: { type: String, unique: true },
    companyId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
    code: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
    items: [{ type: String, required: [true, 'cannot be empty.'] }],
    amount: { type: Number, required: [true, 'cannot be empty.'] },
    roomId: { type: String, required: [true, 'cannot be empty.'] },
    state: { type: String, default: 'virgin' },
    expireAt: { type: String }
}, { timestamps: true });
promocodeSchema.index({ expireAt: 1 }, { expireAfterSeconds: 3600 }); // after 1 hour
// Apply the uniqueValidator plugin to promocodeSchema.
promocodeSchema.plugin(uniqueValidator);
/** primary selection object
 * for promocode
 */
const promocodeselect = {
    urId: 1,
    companyId: 1,
    code: 1,
    amount: 1,
    items: 1,
    roomId: 1,
    used: 1
};
/**
 * Selects the promocode from the database.
 * @param promocodeselect - The promocode select query.
 * @returns The selected promocode.
 */
exports.promocodeSelect = promocodeselect;
/**
 * Creates a promocode model with the specified database URL.
 * @param dbUrl The URL of the database.
 * @param main Optional parameter indicating whether to create the main promocode model. Default is true.
 * @param lean Optional parameter indicating whether to create the lean promocode model. Default is true.
 */
const createPromocodeModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl);
    }
    if (main) {
        exports.promocodeMain = database_controller_1.mainConnection.model('promocode', promocodeSchema);
    }
    if (lean) {
        exports.promocodeLean = database_controller_1.mainConnectionLean.model('promocode', promocodeSchema);
    }
};
exports.createPromocodeModel = createPromocodeModel;
//# sourceMappingURL=promocode.model.js.map