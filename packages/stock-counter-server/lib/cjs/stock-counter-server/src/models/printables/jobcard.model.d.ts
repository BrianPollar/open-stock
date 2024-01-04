/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { IjobCard } from '@open-stock/stock-universal';
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
 * @param main Whether to create a main connection or not. Defaults to true.
 * @param lean Whether to create a lean connection or not. Defaults to true.
 */
export declare const createJobCardModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
