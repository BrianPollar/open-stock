import { User } from '@open-stock/stock-auth-client';
import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
/**
 * Represents a review object.
 */
export class Review extends DatabaseAuto {
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
            this.userId = new User(data.userId);
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
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/review/${url}/${itemId}/${offset}/${limit}/${companyId}`);
        const reviews = await lastValueFrom(observer$);
        return {
            count: reviews.count,
            reviews: reviews.data.map(val => new Review(val))
        };
    }
    /**
     * Gets a single review by ID.
     * @param companyId - The ID of the company
     * @param id The ID of the review to get.
     * @returns A Review object.
     */
    static async getOnereview(companyId, id) {
        const observer$ = StockCounterClient.ehttp.makeGet(`/review/getone/${id}/${companyId}`);
        const review = await lastValueFrom(observer$);
        return new Review(review);
    }
    /**
     * Creates a new review.
     * @param companyId - The ID of the company
     * @param review An object containing the data for the new review.
     * @returns An object indicating whether the operation was successful.
     */
    static async createreview(companyId, review) {
        const observer$ = StockCounterClient.ehttp
            .makePost(`/review/create/${companyId}`, {
            review
        });
        const added = await lastValueFrom(observer$);
        return added;
    }
    /**
     * Deletes the current review.
     * @param companyId - The ID of the company
     * @returns An object indicating whether the operation was successful.
     */
    async deleteReview(companyId) {
        const observer$ = StockCounterClient.ehttp
            .makeDelete(`/review/deleteone/${this._id}/${this.itemId}/${this.rating}/${companyId}`);
        return await lastValueFrom(observer$);
    }
}
//# sourceMappingURL=review.define.js.map