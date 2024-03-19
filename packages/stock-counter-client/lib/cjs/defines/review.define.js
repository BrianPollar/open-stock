"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = void 0;
const stock_auth_client_1 = require("@open-stock/stock-auth-client");
const stock_universal_1 = require("@open-stock/stock-universal");
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../stock-counter-client");
/**
 * Represents a review object.
 */
class Review extends stock_universal_1.DatabaseAuto {
    /**
     * Creates a new Review object.
     * @param data An object containing the data for the review.
     */
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.companyId = data.companyId;
        this.image = data.image;
        this.name = data.name;
        this.email = data.email;
        this.comment = data.comment;
        this.rating = data.rating;
        this.images = data.images;
        if (data.userId) {
            this.userId = new stock_auth_client_1.User(data.userId);
        }
        else {
            this.userId = data.userId;
        }
        this.itemId = data.itemId;
    }
    /**
     * Gets all reviews for a given item.
     * @param companyId - The ID of the company
     * @param itemId The ID of the item to get reviews for.
     * @param url The URL to use for the request. Defaults to 'getall'.
     * @param offset The offset to use for the request. Defaults to 0.
     * @param limit The limit to use for the request. Defaults to 0.
     * @returns An array of Review objects.
     */
    static async getreviews(companyId, itemId, url = 'getall', offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/review/${url}/${itemId}/${offset}/${limit}/${companyId}`);
        const reviews = await (0, rxjs_1.lastValueFrom)(observer$);
        return reviews.map(val => new Review(val));
    }
    /**
     * Gets a single review by ID.
     * @param companyId - The ID of the company
     * @param id The ID of the review to get.
     * @returns A Review object.
     */
    static async getOnereview(companyId, id) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makeGet(`/review/getone/${id}/${companyId}`);
        const review = await (0, rxjs_1.lastValueFrom)(observer$);
        return new Review(review);
    }
    /**
     * Creates a new review.
     * @param companyId - The ID of the company
     * @param review An object containing the data for the new review.
     * @returns An object indicating whether the operation was successful.
     */
    static async createreview(companyId, review) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost(`/review/create/${companyId}`, {
            review
        });
        const added = await (0, rxjs_1.lastValueFrom)(observer$);
        return added;
    }
    /**
     * Deletes the current review.
     * @param companyId - The ID of the company
     * @returns An object indicating whether the operation was successful.
     */
    async deleteReview(companyId) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeDelete(`/review/deleteone/${this._id}/${this.itemId}/${this.rating}/${companyId}`);
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.Review = Review;
//# sourceMappingURL=review.define.js.map