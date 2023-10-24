/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { IinvoiceRelatedRef } from '@open-stock/stock-universal';
/** model type for estimate by */
/** */
export type Testimate = Document & IinvoiceRelatedRef;
/** main connection for estimates Operations*/
export declare let estimateMain: Model<Testimate>;
/** lean connection for estimates Operations*/
export declare let estimateLean: Model<Testimate>;
/** primary selection object
 * for estimate
 */
/** */
export declare const estimateSelect: {
    invoiceRelated: number;
};
/** */
export declare const createEstimateModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
