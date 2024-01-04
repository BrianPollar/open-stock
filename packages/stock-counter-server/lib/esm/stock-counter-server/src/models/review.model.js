import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
/**
 * Defines the schema for a review object.
 * @typedef {Object} Treview
 * @property {string} urId - The unique identifier for the review.
 * @property {string} image - The URL of the image associated with the review.
 * @property {string} name - The name of the reviewer.
 * @property {string} email - The email address of the reviewer.
 * @property {string} comment - The text of the review.
 * @property {number} rating - The rating given by the reviewer.
 * @property {Array} images - An array of URLs of images associated with the review.
 * @property {string} userId - The unique identifier of the user who created the review.
 * @property {string} itemId - The unique identifier of the item being reviewed.
 */
const reviewSchema = new Schema({
    urId: { type: String, unique: true },
    companyId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
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
    companyId: 1,
    image: 1,
    name: 1,
    email: 1,
    comment: 1,
    rating: 1,
    images: 1,
    userId: 1,
    itemId: 1
};
/**
 * Represents the main review model.
 */
export let reviewMain;
/** lean connection for reviews Operations*/
/**
 * Represents a lean review model.
 */
export let reviewLean;
/**
 * Represents the review select function.
 */
export const reviewSelect = reviewselect;
/**
 * Creates a review model with the specified database URL, main connection flag, and lean flag.
 * @param dbUrl The URL of the database.
 * @param main Indicates whether to create the main connection model.
 * @param lean Indicates whether to create the lean connection model.
 */
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