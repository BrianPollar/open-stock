"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReviewModel = exports.reviewSelect = exports.reviewLean = exports.reviewMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
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
const reviewSchema = new mongoose_1.Schema({
    urId: { type: String },
    companyId: { type: mongoose_1.Schema.Types.ObjectId, required: [true, 'cannot be empty.'], index: true },
    image: { type: String },
    name: { type: String, required: [true, 'cannot be empty.'], index: true },
    email: {
        type: String,
        validator: checkEmail,
        message: props => `${props.value} is invalid phone!`
    },
    comment: {
        type: String,
        required: [true, 'cannot be empty.'],
        index: true,
        minLength: [1, 'cannot be less than 1.'],
        maxLength: [350, 'cannot be more than 350.']
    },
    rating: {
        type: Number,
        min: [0, 'cannot be less than 0.'],
        max: [10, 'cannot be more than 10.']
    }, // upto 10
    images: [String],
    userId: { type: mongoose_1.Schema.Types.ObjectId },
    itemId: { type: mongoose_1.Schema.Types.ObjectId }
}, { timestamps: true, collection: 'reviews' });
function checkEmail(email) {
    // eslint-disable-next-line max-len
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
// Apply the uniqueValidator plugin to reviewSchema.
reviewSchema.plugin(uniqueValidator);
reviewSchema.pre('updateOne', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
reviewSchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
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
 * Represents the review select function.
 */
exports.reviewSelect = reviewselect;
/**
 * Creates a review model with the specified database URL, main connection flag, and lean flag.
 * @param dbUrl The URL of the database.
 * @param main Indicates whether to create the main connection model.
 * @param lean Indicates whether to create the lean connection model.
 */
const createReviewModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!stock_universal_server_1.isDbConnected) {
        await (0, stock_universal_server_1.connectDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.reviewMain = stock_universal_server_1.mainConnection
            .model('Review', reviewSchema);
    }
    if (lean) {
        exports.reviewLean = stock_universal_server_1.mainConnectionLean
            .model('Review', reviewSchema);
    }
};
exports.createReviewModel = createReviewModel;
//# sourceMappingURL=review.model.js.map