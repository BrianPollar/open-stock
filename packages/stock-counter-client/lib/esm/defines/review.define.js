import { User } from '@open-stock/stock-auth-client';
import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
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
  
     * @param itemId The ID of the item to get reviews for.
     * @param url The URL to use for the request. Defaults to 'getall'.
     * @param offset The offset to use for the request. Defaults to 0.
     * @param limit The limit to use for the request. Defaults to 0.
     * @returns An array of Review objects.
     */
    static async getAll(itemId, // TODO
    offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/review/all/${itemId}/${offset}/${limit}`);
        const reviews = await lastValueFrom(observer$);
        return {
            count: reviews.count,
            reviews: reviews.data.map(val => new Review(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/review/filter', filter);
        const reviews = await lastValueFrom(observer$);
        return {
            count: reviews.count,
            reviews: reviews.data.map(val => new Review(val))
        };
    }
    static async getRatingCount(_id, rating // 0 - 10
    ) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/review/getratingcount/${_id}/${rating}`);
        const count = await lastValueFrom(observer$);
        return count;
    }
    /**
     * Gets a single review by ID.
  
     * @param _id The ID of the review to get.
     * @returns A Review object.
     */
    static async getOne(_id) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/review/one/${_id}`);
        const review = await lastValueFrom(observer$);
        return new Review(review);
    }
    /**
     * Creates a new review.
  
     * @param review An object containing the data for the new review.
     * @returns An object indicating whether the operation was successful.
     */
    static async add(review) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/review/add', review);
        const added = await lastValueFrom(observer$);
        return added;
    }
    /**
     * Deletes the current review.
  
     * @returns An object indicating whether the operation was successful.
     */
    remove() {
        const observer$ = StockCounterClient.ehttp
            .makeDelete(`/review/delete/one/${this._id}/${this.itemId}/${this.rating}`);
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=review.define.js.map