import { Iexpense } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model } from 'mongoose';
/**
 * Represents a type that combines the Document interface with the Iexpense interface.
 */
export type Texpense = Document & Iexpense;
/**
 * Represents the main expense model.
 */
export declare let expenseMain: Model<Texpense>;
/**
 * Represents a lean expense model.
 */
export declare let expenseLean: Model<Texpense>;
/**
 * Represents the expense select function.
 */
export declare const expenseSelect: {
    urId: number;
    companyId: number;
    name: number;
    person: number;
    cost: number;
    category: number;
    note: number;
    items: number;
};
/**
 * Creates an expense model with the given database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the model for the main connection.
 * @param lean Whether to create the model for the lean connection.
 */
export declare const createExpenseModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
