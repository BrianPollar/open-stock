/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { User } from '@open-stock/stock-auth-client';
import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
/** */
export class Review extends DatabaseAuto {
    /** */
    constructor(data) {
        super(data);
        this.urId = data.urId;
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
    /** */
    static async getreviews(itemId, url = 'getall', offset = 0, limit = 0) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/review/${url}/${itemId}/${offset}/${limit}`);
        const reviews = await lastValueFrom(observer$);
        return reviews.map(val => new Review(val));
    }
    /** */
    static async getOnereview(id) {
        const observer$ = StockCounterClient.ehttp.makeGet(`/review/getone/${id}`);
        const review = await lastValueFrom(observer$);
        return new Review(review);
    }
    /** */
    static async createreview(review) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/review/create', {
            review
        });
        const added = await lastValueFrom(observer$);
        return added;
    }
    /** */
    async deleteReview() {
        const observer$ = StockCounterClient.ehttp
            .makeDelete(`/review/deleteone/${this._id}/${this.itemId}/${this.rating}`);
        return await lastValueFrom(observer$);
    }
}
//# sourceMappingURL=review.define.js.map