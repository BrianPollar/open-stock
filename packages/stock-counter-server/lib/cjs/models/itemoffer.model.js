"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createItemOfferModel = exports.itemOfferSelect = exports.itemOfferLean = exports.itemOfferMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const itemOfferSchema = new mongoose_1.Schema({
    urId: { type: String, unique: true },
    items: [],
    expireAt: { type: Date },
    type: { type: String },
    header: { type: String },
    subHeader: { type: String },
    ammount: { type: Number }
}, { timestamps: true });
itemOfferSchema.index({ expireAt: 1 }, { expireAfterSeconds: 2628003 });
// Apply the uniqueValidator plugin to itemOfferSchema.
itemOfferSchema.plugin(uniqueValidator);
/** primary selection object
 * for itemOffer
 */
const itemOfferselect = {
    urId: 1,
    items: 1,
    expireAt: 1,
    type: 1,
    header: 1,
    subHeader: 1,
    ammount: 1
};
/** primary selection object
 * for itemOffer
 */
/** */
exports.itemOfferSelect = itemOfferselect;
/** */
const createItemOfferModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl);
    }
    if (main) {
        exports.itemOfferMain = database_controller_1.mainConnection.model('ItemOffer', itemOfferSchema);
    }
    if (lean) {
        exports.itemOfferLean = database_controller_1.mainConnectionLean.model('ItemOffer', itemOfferSchema);
    }
};
exports.createItemOfferModel = createItemOfferModel;
//# sourceMappingURL=itemoffer.model.js.map