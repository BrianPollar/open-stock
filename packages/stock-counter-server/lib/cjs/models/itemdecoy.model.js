"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createItemDecoyModel = exports.itemDecoySelect = exports.itemDecoyLean = exports.itemDecoyMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const itemDecoySchema = new mongoose_1.Schema({
    urId: { type: String, unique: true },
    type: { type: String },
    items: []
}, { timestamps: true });
// Apply the uniqueValidator plugin to userSchema.
itemDecoySchema.plugin(uniqueValidator);
/** primary selection object
 * for itemDecoy
 */
const itemDecoyselect = {
    urId: 1,
    type: 1,
    items: 1
};
/** primary selection object
 * for itemDecoy
 */
/** */
exports.itemDecoySelect = itemDecoyselect;
/** */
const createItemDecoyModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl);
    }
    if (main) {
        exports.itemDecoyMain = database_controller_1.mainConnection.model('ItemDecoy', itemDecoySchema);
    }
    if (lean) {
        exports.itemDecoyLean = database_controller_1.mainConnectionLean.model('ItemDecoy', itemDecoySchema);
    }
};
exports.createItemDecoyModel = createItemDecoyModel;
//# sourceMappingURL=itemdecoy.model.js.map