/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
/** model type for itemLimitted by */
/** */
export interface IitemLimitted extends Document {
    urId: string;
    name: string;
}
/** main connection for itemLimitteds Operations*/
export declare let itemLimittedMain: Model<IitemLimitted>;
/** lean connection for itemLimitteds Operations*/
export declare let itemLimittedLean: Model<IitemLimitted>;
/** primary selection object
 * for itemLimitted
 */
/** */
export declare const itemLimittedSelect: {
    urId: number;
    name: number;
};
/** */
export declare const createItemLimittedModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
