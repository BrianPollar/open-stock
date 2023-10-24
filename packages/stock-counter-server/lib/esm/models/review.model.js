import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
const reviewSchema = new Schema({
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
/** main connection for reviews Operations*/
export let reviewMain;
/** lean connection for reviews Operations*/
export let reviewLean;
/** primary selection object
 * for review
 */
/** */
export const reviewSelect = reviewselect;
/** */
export const createReviewModel = async (dbUrl, main = true, lean = true) => {
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl);
    }
    if (main) {
        reviewMain = mainConnection.model('Review', reviewSchema);
    }
    if (lean) {
        reviewLean = mainConnectionLean.model('Review', reviewSchema);
    }
};
//# sourceMappingURL=review.model.js.map