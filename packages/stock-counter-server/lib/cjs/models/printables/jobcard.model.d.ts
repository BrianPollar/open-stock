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
/**
 * Creates a job card model with the given database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create a main connection or not. Defaults to true.
 * @param lean Whether to create a lean connection or not. Defaults to true.
 */
export declare const createJobCardModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
