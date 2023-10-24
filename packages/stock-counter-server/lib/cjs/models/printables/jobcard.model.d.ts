/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { IjobCard } from '@open-stock/stock-universal';
/** model type for jobCard by */
/** */
export type TjobCard = Document & IjobCard;
/** main connection for jobCards Operations*/
export declare let jobCardMain: Model<TjobCard>;
/** lean connection for jobCards Operations*/
export declare let jobCardLean: Model<TjobCard>;
/** primary selection object
 * for jobCard
 */
/** */
export declare const jobCardSelect: {
    urId: number;
    client: number;
    machine: number;
    problem: number;
    cost: number;
};
/** */
export declare const createJobCardModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
