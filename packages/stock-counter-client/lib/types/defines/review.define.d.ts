import { User } from '@open-stock/stock-auth-client';
import { DatabaseAuto, IfilterProps, IreviewMain, Isuccess } from '@open-stock/stock-universal';
export declare class Review extends DatabaseAuto {
    urId: string;
    companyId: string;
    image: string;
    name: string;
    email: string;
    comment: string;
    rating: number;
    images: string[];
    userId: User | string;
    itemId: string;
    /**
     * Creates a new Review object.
     * @param data An object containing the data for the review.
     */
    constructor(data: IreviewMain);
    /**
     * Gets all reviews for a given item.
  
     * @param itemId The ID of the item to get reviews for.
     * @param url The URL to use for the request. Defaults to 'getall'.
     * @param offset The offset to use for the request. Defaults to 0.
     * @param limit The limit to use for the request. Defaults to 0.
     * @returns An array of Review objects.
     */
    static getAll(itemId: string, // TODO
    offset?: number, limit?: number): Promise<{
        count: number;
        reviews: Review[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        reviews: Review[];
    }>;
    static getRatingCount(_id: string, rating: number): Promise<{
        count: number;
    }>;
    /**
     * Gets a single review by ID.
  
     * @param _id The ID of the review to get.
     * @returns A Review object.
     */
    static getOne(_id: string): Promise<Review>;
    /**
     * Creates a new review.
  
     * @param review An object containing the data for the new review.
     * @returns An object indicating whether the operation was successful.
     */
    static add(review: IreviewMain): Promise<Isuccess>;
    /**
     * Deletes the current review.
  
     * @returns An object indicating whether the operation was successful.
     */
    remove(): Promise<Isuccess>;
}
