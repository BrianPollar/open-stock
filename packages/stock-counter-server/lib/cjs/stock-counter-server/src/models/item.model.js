"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createItemModel = exports.itemSelect = exports.itemLean = exports.itemMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const database_1 = require("../utils/database");
const uniqueValidator = require('mongoose-unique-validator');
const itemSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withUrIdAndCompanySchemaObj,
    numbersInstock: { type: Number, required: [true, 'cannot be empty.'], index: true },
    name: { type: String, required: [true, 'cannot be empty.'], index: true },
    category: { type: String },
    subCategory: { type: String },
    state: { type: String },
    photos: [],
    video: { type: String },
    colors: [],
    model: { type: String },
    origin: { type: String },
    anyKnownProblems: { type: String },
    costMeta: {},
    description: { type: String },
    numberBought: { type: Number, default: 0 },
    sponsored: [{ type: String }],
    buyerGuarantee: { type: String },
    reviewedBy: [],
    reviewCount: { type: Number, default: 0, index: true },
    reviewWeight: { type: Number, default: 0 },
    reviewRatingsTotal: { type: Number, default: 0, index: true },
    likes: [],
    likesCount: { type: Number, default: 0, index: true },
    timesViewed: { type: Number, default: 0, index: true },
    inventoryMeta: [],
    brand: { type: String },
    ecomerceCompat: { type: Boolean, default: false },
    soldCount: { type: Number, default: 0, index: true } // TODO update fields related to this
}, { timestamps: true, collection: 'items' });
itemSchema.index({ createdAt: -1 });
// Apply the uniqueValidator plugin to itemSchema.
itemSchema.plugin(uniqueValidator);
itemSchema.pre('updateOne', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
itemSchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
/** Primary selection object for item */
const itemselect = {
    ...stock_universal_server_1.withUrIdAndCompanySelectObj,
    numbersInstock: 1,
    name: 1,
    purchase: 1,
    subCategory: 1,
    category: 1,
    state: 1,
    photos: 1,
    colors: 1,
    model: 1,
    origin: 1,
    anyKnownProblems: 1,
    createdAt: 1,
    updatedAt: 1,
    costMeta: 1,
    description: 1,
    numberBought: 1,
    sponsored: 1,
    sizing: 1,
    buyerGuarantee: 1,
    reviewedBy: 1,
    reviewCount: 1,
    reviewWeight: 1,
    reviewRatingsTotal: 1,
    likes: 1,
    likesCount: 1,
    timesViewed: 1,
    brand: 1,
    inventoryMeta: 1,
    ecomerceCompat: 1,
    soldCount: 1
};
/**
 * Represents the item select function.
 */
exports.itemSelect = itemselect;
/**
 * Creates the item model and connects to the database.
 * @param dbUrl - The URL of the database to connect to
 * @param main - Whether to create the main connection for item operations (default: true)
 * @param lean - Whether to create the lean connection for item operations (default: true)
 */
const createItemModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    (0, stock_universal_server_1.createExpireDocIndex)(itemSchema);
    if (!database_1.isStockDbConnected) {
        await (0, database_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.itemMain = database_1.mainConnection
            .model('Item', itemSchema);
    }
    if (lean) {
        exports.itemLean = database_1.mainConnectionLean
            .model('Item', itemSchema);
    }
};
exports.createItemModel = createItemModel;
//# sourceMappingURL=item.model.js.map