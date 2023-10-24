/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
/** model interface for promocode by*/
/** */
export interface Ipromocode extends Document {
    urId: string;
    code: string;
    amount: number;
    items: string[];
    roomId: string;
    state: string;
    expireAt: string;
}
/** main connection for promocodes Operations*/
export declare let promocodeMain: Model<Ipromocode>;
/** lean connection for promocodes Operations*/
export declare let promocodeLean: Model<Ipromocode>;
/** primary selection object
 * for promocode
 */
/** */
export declare const promocodeSelect: {
    urId: number;
    code: number;
    amount: number;
    items: number;
    roomId: number;
    used: number;
};
/** */
export declare const createPromocodeModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
