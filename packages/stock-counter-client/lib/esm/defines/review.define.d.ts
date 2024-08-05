import { User } from '@open-stock/stock-auth-client';
import { DatabaseAuto, IreviewMain, Isuccess } from '@open-stock/stock-universal';
/**
 * Represents a review object.
 */
export declare class Review extends DatabaseAuto {
    /** The user ID associated with the review. */
    urId: string;
    /** The user's company ID. */
    companyId: string;
    /** The image associated with the review. */
    image: string;
    /** The name of the user who left the review. */
    name: string;
    /** The email of the user who left the review. */
    email: string;
    /** The comment left by the user. */
    comment: string;
    /** The rating given by the user. */
    rating: number;
    /** An array of images associated with the review. */
    images: string[];
    /** The user ID associated with the review. */
    userId: User | string;
    /** The ID of the item being reviewed. */
    itemId: string;
    /**
     * Creates a new Review object.
     * @param data An object containing the data for the review.
     */
    constructor(data: IreviewMain);
    /**
     * Gets all reviews for a given item.
     * @param companyId - The ID of the company
     * @param itemId The ID of the item to get reviews for.
     * @param url The URL to use for the request. Defaults to 'getall'.
     * @param offset The offset to use for the request. Defaults to 0.
     * @param limit The limit to use for the request. Defaults to 0.
     * @returns An array of Review objects.
     */
    static getreviews(companyId: string, itemId: string, url?: string, offset?: number, limit?: number): Promise<{
        count: number;
        reviews: Review[];
    }>;
    static getRatingCount(id: string, rating: number): Promise<{
        count: number;
    }>;
    /**
     * Gets a single review by ID.
     * @param companyId - The ID of the company
     * @param id The ID of the review to get.
     * @returns A Review object.
     */
    static getOnereview(companyId: string, id: string): Promise<Review>;
    /**
     * Creates a new review.
     * @param companyId - The ID of the company
     * @param review An object containing the data for the new review.
     * @returns An object indicating whether the operation was successful.
     */
    static createreview(companyId: string, review: IreviewMain): Promise<Isuccess>;
    /**
     * Deletes the current review.
     * @param companyId - The ID of the company
     * @returns An object indicating whether the operation was successful.
     */
    deleteReview(companyId: string): Promise<Isuccess>;
}
