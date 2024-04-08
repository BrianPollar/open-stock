/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { IjobCard } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model } from 'mongoose';
/**
 * Represents a job card document.
 */
export type TjobCard = Document & IjobCard;
/**
 * Represents the main job card model.
 */
export declare let jobCardMain: Model<TjobCard>;
/**
 * Represents a job card lean model.
 */
export declare let jobCardLean: Model<TjobCard>;
/**
 * Represents a job card select.
 */
export declare const jobCardSelect: {
    urId: number;
    companyId: number;
    client: number;
    machine: number;
    problem: number;
    cost: number;
};
/**
 * Creates a job card model with the given database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create a main connection or not. Defaults to true.
 * @param lean Whether to create a lean connection or not. Defaults to true.
 */
export declare const createJobCardModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
