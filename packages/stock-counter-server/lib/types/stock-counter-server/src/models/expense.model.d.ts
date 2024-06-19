/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
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
