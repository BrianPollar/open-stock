import { DatabaseAuto, Iexpense, Isuccess, TexpenseCategory } from '@open-stock/stock-universal';
import { Item } from './item.define';
/**
 * Represents an expense.
 * @extends DatabaseAuto
 */
export declare class Expense extends DatabaseAuto {
    /** The unique identifier of the expense. */
    urId: string;
    /** The user's company ID. */
    companyId: string;
    /** The name of the expense. */
    name: string;
    /** The person who made the expense. */
    person: string;
    /** The cost of the expense. Always in UGX. If other currency, convert first. */
    cost: number;
    /** The category of the expense. */
    category: TexpenseCategory;
    /** The note of the expense. */
    note: string;
    /** The items of the expense. */
    items: Item[];
    /**
     * Creates an instance of Expense.
     * @param {Iexpense} data - The data to initialize the expense.
     */
    constructor(data: Iexpense);
    /**
     * Retrieves a list of expenses from the server.
     * @static
     * @async
     * @param companyId - The ID of the company
     * @param {string} [url='getall'] - The URL to retrieve the expenses from.
     * @param {number} [offset=0] - The offset to start retrieving expenses from.
     * @param {number} [limit=0] - The maximum number of expenses to retrieve.
     * @returns {Promise<Expense[]>} An array of Expense instances.
     */
    static getExpenses(companyId: string, url?: string, offset?: number, limit?: number): Promise<{
        count: number;
        expenses: Expense[];
    }>;
    /**
     * Retrieves a single expense from the server.
     * @static
     * @async
     * @param companyId - The ID of the company
     * @param {string} urId - The unique identifier of the expense to retrieve.
     * @returns {Promise<Expense>} A single Expense instance.
     */
    static getOneExpense(companyId: string, urId: string): Promise<Expense>;
    /**
     * Creates a new expense on the server.
     * @static
     * @async
     * @param companyId - The ID of the company
     * @param {Iexpense} vals - The values to create the expense with.
     * @returns {Promise<Isuccess>} A success response.
     */
    static addExpense(companyId: string, vals: Iexpense): Promise<Isuccess>;
    /**
     * Deletes multiple expenses from the server.
     * @static
     * @async
     * @param companyId - The ID of the company
     * @param {string[]} ids - The unique identifiers of the expenses to delete.
     * @returns {Promise<Isuccess>} A success response.
     */
    static deleteExpenses(companyId: string, ids: string[]): Promise<Isuccess>;
    /**
     * Updates the current expense on the server.
     * @async
     * @param companyId - The ID of the company
     * @param {Iexpense} vals - The values to update the expense with.
     * @returns {Promise<Isuccess>} A success response.
     */
    updateExpense(companyId: string, vals: Iexpense): Promise<Isuccess>;
    /**
     * Deletes the current expense from the server.
     * @async
     * @param companyId - The ID of the company
     * @returns {Promise<Isuccess>} A success response.
     */
    deleteExpense(companyId: string): Promise<Isuccess>;
}
