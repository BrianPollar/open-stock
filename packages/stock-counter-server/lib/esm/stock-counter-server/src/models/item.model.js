import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
/** Mongoose schema for the item model */
const itemSchema = new Schema({
    urId: { type: String },
    companyId: { type: String, required: [true, 'cannot be empty.'], index: true },
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
    // computer
    brand: { type: String },
    ecomerceCompat: { type: Boolean, default: false }
}, { timestamps: true });
itemSchema.index({ createdAt: -1 });
// Apply the uniqueValidator plugin to itemSchema.
itemSchema.plugin(uniqueValidator);
/** Primary selection object for item */
const itemselect = {
    urId: 1,
    companyId: 1,
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
    ecomerceCompat: 1
};
/**
 * Represents the main item model.
 */
export let itemMain;
/**
 * Represents the lean version of the item model.
 */
export let itemLean;
/**
 * Represents the item select function.
 */
export const itemSelect = itemselect;
/**
 * Creates the item model and connects to the database.
 * @param dbUrl - The URL of the database to connect to
 * @param main - Whether to create the main connection for item operations (default: true)
 * @param lean - Whether to create the lean connection for item operations (default: true)
 */
export const createItemModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl, dbOptions);
    }
    if (main) {
        itemMain = mainConnection.model('Item', itemSchema);
    }
    if (lean) {
        itemLean = mainConnectionLean.model('Item', itemSchema);
    }
};
//# sourceMappingURL=item.model.js.map