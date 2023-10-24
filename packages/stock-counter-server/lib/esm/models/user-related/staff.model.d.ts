/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { Istaff } from '@open-stock/stock-universal';
/** Represents a staff member in the system. */
export interface Tstaff extends Document, Istaff {
}
/** The main connection for staff operations. */
export declare let staffMain: Model<Tstaff>;
/** The lean connection for staff operations. */
export declare let staffLean: Model<Tstaff>;
/** Defines the primary selection object for staff. */
export declare const staffSelect: {
    user: number;
    startDate: number;
    endDate: number;
    occupation: number;
    employmentType: number;
    salary: number;
};
/**
 * Creates a new staff model with the given database URL.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the main connection for staff operations.
 * @param lean Whether to create the lean connection for staff operations.
 */
export declare const createStaffModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
