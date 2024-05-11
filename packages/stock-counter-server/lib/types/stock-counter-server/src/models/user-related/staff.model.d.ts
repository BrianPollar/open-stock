import { Istaff } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model } from 'mongoose';
/**
 * Represents a staff member.
 * @typedef {Document & Istaff} Tstaff
 */
export type Tstaff = Document & Istaff;
/**
 * The main staff model.
 */
export declare let staffMain: Model<Tstaff>;
/**
 * Represents a lean staff model.
 */
export declare let staffLean: Model<Tstaff>;
/** Defines the primary selection object for staff. */
/**
 * The staffSelect constant represents the selection of staff members.
 */
export declare const staffSelect: {
    companyId: number;
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
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main connection for staff operations.
 * @param lean Whether to create the lean connection for staff operations.
 */
export declare const createStaffModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
