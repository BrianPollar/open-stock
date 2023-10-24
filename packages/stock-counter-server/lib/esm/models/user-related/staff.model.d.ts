/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { Istaff } from '@open-stock/stock-universal';
/** model type for staff*/
/** */
export type Tstaff = Document & Istaff;
/** main connection for staffs Operations*/
export declare let staffMain: Model<Tstaff>;
/** lean connection for staffs Operations*/
export declare let staffLean: Model<Tstaff>;
/** primary selection object
 * for staff
 */
/** */
export declare const staffSelect: {
    user: number;
    startDate: number;
    endDate: number;
    occupation: number;
    employmentType: number;
    salary: number;
};
/** */
export declare const createStaffModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
