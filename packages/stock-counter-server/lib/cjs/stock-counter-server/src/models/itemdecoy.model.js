"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createItemDecoyModel = exports.itemDecoySelect = exports.itemDecoyLean = exports.itemDecoyMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const database_1 = require("../utils/database");
const uniqueValidator = require('mongoose-unique-validator');
const itemDecoySchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withUrIdAndCompanySchemaObj,
    type: { type: String },
    items: []
}, { timestamps: true, collection: 'itemdecoys' });
// Apply the uniqueValidator plugin to userSchema.
itemDecoySchema.plugin(uniqueValidator);
itemDecoySchema.pre('updateOne', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
itemDecoySchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
/** primary selection object
 * for itemDecoy
 */
const itemDecoyselect = {
    ...stock_universal_server_1.withUrIdAndCompanySelectObj,
    type: 1,
    items: 1
};
/**
 * Selects the item decoy.
 */
exports.itemDecoySelect = itemDecoyselect;
/**
 * Creates an ItemDecoy model with the specified database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main connection or not. Defaults to true.
 * @param lean Whether to create the lean connection or not. Defaults to true.
 */
const createItemDecoyModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    (0, stock_universal_server_1.createExpireDocIndex)(itemDecoySchema);
    if (!database_1.isStockDbConnected) {
        await (0, database_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.itemDecoyMain = database_1.mainConnection
            .model('ItemDecoy', itemDecoySchema);
    }
    if (lean) {
        exports.itemDecoyLean = database_1.mainConnectionLean
            .model('ItemDecoy', itemDecoySchema);
    }
};
exports.createItemDecoyModel = createItemDecoyModel;
//# sourceMappingURL=itemdecoy.model.js.map