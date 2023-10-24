import { User } from '@open-stock/stock-auth-client';
import { DatabaseAuto, IreviewMain, Isuccess } from '@open-stock/stock-universal';
/** */
export declare class Review extends DatabaseAuto {
    /** */
    urId: string;
    /** */
    image: string;
    /** */
    name: string;
    /** */
    email: string;
    /** */
    comment: string;
    /** */
    rating: number;
    /** */
    images: string[];
    /** */
    userId: User | string;
    /** */
    itemId: string;
    /** */
    constructor(data: IreviewMain);
    /** */
    static getreviews(itemId: string, url?: string, offset?: number, limit?: number): Promise<Review[]>;
    /** */
    static getOnereview(id: string): Promise<Review>;
    /** */
    static createreview(review: IreviewMain): Promise<Isuccess>;
    /** */
    deleteReview(): Promise<Isuccess>;
}
