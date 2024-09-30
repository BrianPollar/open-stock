import { DatabaseAuto, IdeleteMany, Iexpense, IfilterProps, IsubscriptionFeatureState, Isuccess, TexpenseCategory } from '@open-stock/stock-universal';
import { Item } from './item.define';
export declare class Expense extends DatabaseAuto {
    urId: string;
    companyId: string;
    name: string;
    person: string;
    cost: number;
    category: TexpenseCategory;
    note: string;
    items: Item[];
    readonly currency: string;
    /**
     * Creates an instance of Expense.
     * @param {Iexpense} data - The data to initialize the expense.
     */
    constructor(data: Iexpense);
    /**
     * Retrieves a list of expenses from the server.
     * @static
     * @async
  
     * @param {string} [url='getall'] - The URL to retrieve the expenses from.
     * @param {number} [offset=0] - The offset to start retrieving expenses from.
     * @param {number} [limit=0] - The maximum number of expenses to retrieve.
     * @returns {Promise<Expense[]>} An array of Expense instances.
     */
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        expenses: Expense[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        expenses: Expense[];
    }>;
    /**
     * Retrieves a single expense from the server.
     * @static
     * @async
  
     * @param {string} urId - The unique identifier of the expense to retrieve.
     * @returns {Promise<Expense>} A single Expense instance.
     */
    static getOne(urId: string): Promise<Expense>;
    /**
     * Creates a new expense on the server.
     * @static
     * @async
  
     * @param {Iexpense} vals - The values to create the expense with.
     * @returns {Promise<IsubscriptionFeatureState>} A success response.
     */
    static add(vals: Iexpense): Promise<IsubscriptionFeatureState>;
    /**
     * Deletes multiple expenses from the server.
     * @static
     * @async
  
     * @param {string[]} _ids - The unique identifiers of the expenses to delete.
     * @returns {Promise<Isuccess>} A success response.
     */
    static removeMany(vals: IdeleteMany): Promise<Isuccess>;
    /**
     * Updates the current expense on the server.
     * @async
  
     * @param {Iexpense} vals - The values to update the expense with.
     * @returns {Promise<Isuccess>} A success response.
     */
    update(vals: Iexpense): Promise<Isuccess>;
    /**
     * Deletes the current expense from the server.
     * @async
  
     * @returns {Promise<Isuccess>} A success response.
     */
    remove(): Promise<Isuccess>;
}
