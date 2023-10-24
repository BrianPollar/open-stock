/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { Iexpense } from '@open-stock/stock-universal';
/** model type for expense by */
/** */
export type Texpense = Document & Iexpense;
/** main connection for expenses Operations*/
export declare let expenseMain: Model<Texpense>;
/** lean connection for expenses Operations*/
export declare let expenseLean: Model<Texpense>;
/** primary selection object
 * for expense
 */
/** */
export declare const expenseSelect: {
    urId: number;
    name: number;
    person: number;
    cost: number;
    category: number;
    items: number;
};
/** */
export declare const createExpenseModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
