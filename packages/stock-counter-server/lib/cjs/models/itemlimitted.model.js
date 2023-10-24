"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createItemLimittedModel = exports.itemLimittedSelect = exports.itemLimittedLean = exports.itemLimittedMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const itemLimittedSchema = new mongoose_1.Schema({
    urId: { type: String, unique: true },
    name: { type: String }
}, { timestamps: true });
// Apply the uniqueValidator plugin to userSchema.
itemLimittedSchema.plugin(uniqueValidator);
/** primary selection object
 * for itemLimitted
 */
const itemLimittedselect = {
    urId: 1,
    name: 1
};
/** primary selection object
 * for itemLimitted
 */
/** */
exports.itemLimittedSelect = itemLimittedselect;
/** */
const createItemLimittedModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl);
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