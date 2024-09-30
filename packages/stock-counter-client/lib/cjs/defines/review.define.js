"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = void 0;
const stock_auth_client_1 = require("@open-stock/stock-auth-client");
const stock_universal_1 = require("@open-stock/stock-universal");
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../stock-counter-client");
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
  
     * @param itemId The ID of the item to get reviews for.
     * @param url The URL to use for the request. Defaults to 'getall'.
     * @param offset The offset to use for the request. Defaults to 0.
     * @param limit The limit to use for the request. Defaults to 0.
     * @returns An array of Review objects.
     */
    static async getAll(itemId, // TODO
    offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/review/all/${itemId}/${offset}/${limit}`);
        const reviews = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: reviews.count,
            reviews: reviews.data.map(val => new Review(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/review/filter', filter);
        const reviews = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: reviews.count,
            reviews: reviews.data.map(val => new Review(val))
        };
    }
    static async getRatingCount(_id, rating // 0 - 10
    ) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/review/getratingcount/${_id}/${rating}`);
        const count = await (0, rxjs_1.lastValueFrom)(observer$);
        return count;
    }
    /**
     * Gets a single review by ID.
  
     * @param _id The ID of the review to get.
     * @returns A Review object.
     */
    static async getOne(_id) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/review/one/${_id}`);
        const review = await (0, rxjs_1.lastValueFrom)(observer$);
        return new Review(review);
    }
    /**
     * Creates a new review.
  
     * @param review An object containing the data for the new review.
     * @returns An object indicating whether the operation was successful.
     */
    static async add(review) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/review/add', review);
        const added = await (0, rxjs_1.lastValueFrom)(observer$);
        return added;
    }
    /**
     * Deletes the current review.
  
     * @returns An object indicating whether the operation was successful.
     */
    remove() {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeDelete(`/review/delete/one/${this._id}/${this.itemId}/${this.rating}`);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.Review = Review;
//# sourceMappingURL=review.define.js.map