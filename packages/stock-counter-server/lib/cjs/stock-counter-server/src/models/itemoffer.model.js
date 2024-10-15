"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createItemOfferModel = exports.itemOfferSelect = exports.itemOfferLean = exports.itemOfferMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const itemOfferSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withUrIdAndCompanySchemaObj,
    items: [mongoose_1.Schema.Types.ObjectId],
    expireAt: { type: Date },
    type: { type: String },
    header: {
        type: String,
        minLength: [1, 'cannot be less than 1.'],
        maxLength: [150, 'cannot be more than 150.']
    },
    subHeader: {
        type: String,
        minLength: [1, 'cannot be less than 1.'],
        maxLength: [150, 'cannot be more than 150.']
    },
    amount: {
        type: Number,
        min: [0, 'cannot be less than 0.']
    },
    currency: { type: String, default: 'USD' }
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
    amount: 1,
    currency: 1
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
    if (!stock_universal_server_1.isDbConnected) {
        await (0, stock_universal_server_1.connectDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.itemOfferMain = stock_universal_server_1.mainConnection
            .model('ItemOffer', itemOfferSchema);
    }
    if (lean) {
        exports.itemOfferLean = stock_universal_server_1.mainConnectionLean
            .model('ItemOffer', itemOfferSchema);
    }
};
exports.createItemOfferModel = createItemOfferModel;
//# sourceMappingURL=itemoffer.model.js.map