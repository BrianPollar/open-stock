"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReviewModel = exports.reviewSelect = exports.reviewLean = exports.reviewMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const reviewSchema = new mongoose_1.Schema({
    urId: { type: String, unique: true },
    image: { type: String },
    name: { type: String, required: [true, 'cannot be empty.'], index: true },
    email: { type: String },
    comment: { type: String, required: [true, 'cannot be empty.'], index: true },
    rating: { type: Number },
    images: [],
    userId: { type: String },
    itemId: { type: String }
}, { timestamps: true });
// Apply the uniqueValidator plugin to reviewSchema.
reviewSchema.plugin(uniqueValidator);
/** primary selection object
 * for review
 */
const reviewselect = {
    urId: 1,
    image: 1,
    name: 1,
    email: 1,
    comment: 1,
    rating: 1,
    images: 1,
    userId: 1,
    itemId: 1
};
/** primary selection object
 * for review
 */
/** */
exports.reviewSelect = reviewselect;
/** */
const createReviewModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl);
    }
    if (main) {
        exports.reviewMain = database_controller_1.mainConnection.model('Review', reviewSchema);
    }
    if (lean) {
        exports.reviewLean = database_controller_1.mainConnectionLean.model('Review', reviewSchema);
    }
};
exports.createReviewModel = createReviewModel;
//# sourceMappingURL=review.model.js.map