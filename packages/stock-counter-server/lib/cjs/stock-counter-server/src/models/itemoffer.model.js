"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createItemOfferModel = exports.itemOfferSelect = exports.itemOfferLean = exports.itemOfferMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const database_1 = require("../utils/database");
const uniqueValidator = require('mongoose-unique-validator');
const itemOfferSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withUrIdAndCompanySchemaObj,
    items: [],
    expireAt: { type: Date },
    type: { type: String },
    header: { type: String },
    subHeader: { type: String },
    ammount: { type: Number }
}, { timestamps: true, collection: 'itemoffers' });
itemOfferSchema.index({ expireAt: 1 }, { expireAfterSeconds: 2628003 });
// Apply the uniqueValidator plugin to itemOfferSchema.
itemOfferSchema.plugin(uniqueValidator);
itemOfferSchema.pre('updateOne', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
itemOfferSchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
/** primary selection object
 * for itemOffer
 */
const itemOfferselect = {
    ...stock_universal_server_1.withUrIdAndCompanySelectObj,
    items: 1,
    expireAt: 1,
    type: 1,
    header: 1,
    subHeader: 1,
    ammount: 1
};
/**
 * Represents the item offer select function.
 */
exports.itemOfferSelect = itemOfferselect;
/**
 * Creates an instance of the ItemOffer model with the specified database URL.
 * @param {string} dbUrl - The URL of the database to connect to.
 * @param {boolean} [main=true] - Whether to create the main connection model.
 * @param {boolean} [lean=true] - Whether to create the lean connection model.
 * @returns {Promise<void>} - A promise that resolves when the models have been created.
 */
const createItemOfferModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    (0, stock_universal_server_1.createExpireDocIndex)(itemOfferSchema);
    if (!database_1.isStockDbConnected) {
        await (0, database_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.itemOfferMain = database_1.mainConnection.model('ItemOffer', itemOfferSchema);
    }
    if (lean) {
        exports.itemOfferLean = database_1.mainConnectionLean.model('ItemOffer', itemOfferSchema);
    }
};
exports.createItemOfferModel = createItemOfferModel;
//# sourceMappingURL=itemoffer.model.js.map