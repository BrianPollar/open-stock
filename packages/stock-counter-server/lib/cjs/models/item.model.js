"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createItemModel = exports.itemSelect = exports.itemLean = exports.itemMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const itemSchema = new mongoose_1.Schema({
    urId: { type: String, unique: true },
    numbersInstock: { type: Number, required: [true, 'cannot be empty.'], index: true },
    name: { type: String, required: [true, 'cannot be empty.'], index: true },
    type: { type: String, required: [true, 'cannot be empty.'] },
    category: { type: String },
    state: { type: String, required: [true, 'cannot be empty.'] },
    photos: [{ type: String }],
    colors: [],
    model: { type: String, required: [true, 'cannot be empty.'] },
    origin: { type: String, required: [true, 'cannot be empty.'] },
    anyKnownProblems: { type: String },
    costMeta: {},
    description: { type: String },
    numberBought: { type: Number, default: 0 },
    sponsored: [{ type: String }],
    buyerGuarantee: { type: String },
    reviewedBy: [],
    reviewCount: { type: Number, default: 0 },
    reviewWeight: { type: Number, default: 0 },
    reviewRatingsTotal: { type: Number, default: 0 },
    likes: [],
    likesCount: { type: Number, default: 0 },
    timesViewed: { type: Number, default: 0, index: true },
    inventoryMeta: [],
    // computer
    brand: { type: String },
    cpuModel: {},
    ramModel: {},
    graphics: [],
    pheripheral: {},
    screen: {},
    storageDrive: {},
    os: { type: String },
    // laptop
    keyBoard: {},
    // desktop
    withScreen: { type: Boolean }
}, { timestamps: true });
itemSchema.index({ createdAt: -1 });
// Apply the uniqueValidator plugin to itemSchema.
itemSchema.plugin(uniqueValidator);
/** primary selection object
 * for item
 */
const itemselect = {
    urId: 1,
    numbersInstock: 1,
    name: 1,
    purchase: 1,
    type: 1,
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
    cpuModel: 1,
    ramModel: 1,
    graphics: 1,
    pheripheral: 1,
    screen: 1,
    storageDrives: 1,
    os: 1,
    keyBoard: 1,
    withScreen: 1,
    inventoryMeta: 1
};
/** primary selection object
 * for item
 */
/** */
exports.itemSelect = itemselect;
/** */
const createItemModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl);
    }
    if (main) {
        exports.itemMain = database_controller_1.mainConnection.model('Item', itemSchema);
    }
    if (lean) {
        exports.itemLean = database_controller_1.mainConnectionLean.model('Item', itemSchema);
    }
};
exports.createItemModel = createItemModel;
//# sourceMappingURL=item.model.js.map