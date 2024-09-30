import { DatabaseAuto, IdeleteMany, IexpenseReport, IfilterProps, Isuccess } from '@open-stock/stock-universal';
import { Expense } from '../expense.define';
export declare class ExpenseReport extends DatabaseAuto {
    urId: string;
    companyId: string;
    totalAmount: number;
    date: Date;
    expenses: Expense[];
    readonly currency: string;
    /**
     * Creates an instance of `ExpenseReport`.
     * @param data An object of type `IexpenseReport` containing the data for the expense report.
     */
    constructor(data: IexpenseReport);
    /**
     * Retrieves a list of expense reports from the API.
  
     * @param url Optional URL for the API request.
     * @param offset Optional offset for the API request.
     * @param limit Optional limit for the API request.
     * @returns An array of `ExpenseReport` objects.
     */
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        expensereports: ExpenseReport[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        expensereports: ExpenseReport[];
    }>;
    /**
     * Retrieves a single expense report from the API.
  
     * @param urId The ID of the expense report to retrieve.
     * @returns A single `ExpenseReport` object.
     */
    static getOne(urId: string): Promise<ExpenseReport>;
    /**
     * Adds a new expense report to the API.
  
     * @param vals An object of type `IexpenseReport` containing the data for the new expense report.
     * @returns A success message.
     */
    static add(vals: IexpenseReport): Promise<Isuccess>;
    /**
     * Deletes multiple expense reports from the API.
  
     * @param _ids An array of expense report IDs to delete.
     * @returns A success message.
     */
    static removeMany(val: IdeleteMany): Promise<Isuccess>;
    remove(): Promise<Isuccess>;
}
