"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createItemLimittedModel = exports.itemLimittedSelect = exports.itemLimittedLean = exports.itemLimittedMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const itemLimittedSchema = new mongoose_1.Schema({
    urId: { type: String },
    companyId: { type: String, required: [true, 'cannot be empty.'], index: true },
    name: { type: String }
}, { timestamps: true });
// Apply the uniqueValidator plugin to userSchema.
itemLimittedSchema.plugin(uniqueValidator);
/** primary selection object
 * for itemLimitted
 */
const itemLimittedselect = {
    urId: 1,
    companyId: 1,
    name: 1
};
/**
 * Represents the itemLimittedSelect function.
 */
exports.itemLimittedSelect = itemLimittedselect;
/**
 * Creates an ItemLimitted model with the specified database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the model for the main connection.
 * @param lean Whether to create the model for the lean connection.
 */
const createItemLimittedModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.itemLimittedMain = database_controller_1.mainConnection.model('ItemLimitted', itemLimittedSchema);
    }
    if (lean) {
        exports.itemLimittedLean = database_controller_1.mainConnectionLean.model('ItemLimitted', itemLimittedSchema);
    }
};
exports.createItemLimittedModel = createItemLimittedModel;
//# sourceMappingURL=itemlimitted.model.js.map