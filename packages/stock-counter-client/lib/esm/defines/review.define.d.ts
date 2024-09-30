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
    constructor(data: IreviewMain);
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
    static getOne(_id: string): Promise<Review>;
    static add(review: IreviewMain): Promise<Isuccess>;
    remove(): Promise<Isuccess>;
}
