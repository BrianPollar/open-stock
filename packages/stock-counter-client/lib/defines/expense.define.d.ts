import { DatabaseAuto, Iexpense, Isuccess, TexpenseCategory } from '@open-stock/stock-universal';
import { Item } from './item.define';
/** The  Expense  class extends the  DatabaseAuto  class, which is not shown in the code snippet. It has properties such as  urId ,  name ,  person ,  cost ,  category ,  note , and  items . The constructor initializes these properties based on the provided data. */
export declare class Expense extends DatabaseAuto {
    /** */
    urId: string;
    /** */
    name: string;
    /** */
    person: string;
    /** */
    cost: number;
    /** */
    category: TexpenseCategory;
    /** */
    note: string;
    /** */
    items: Item[];
    /** */
    constructor(data: Iexpense);
    /** The  getExpenses  static method retrieves a list of expenses from the server by making a GET request to the specified URL. It returns an array of  Expense  instances. */
    static getExpenses(url?: string, offset?: number, limit?: number): Promise<Expense[]>;
    /** The  getOneExpense  static method retrieves a single expense from the server by making a GET request with the provided  urId . It returns a single  Expense  instance. */
    static getOneExpense(urId: string): Promise<Expense>;
    /** The  addExpense  static method sends a POST request to the server to create a new expense with the provided values. It returns a success response. */
    static addExpense(vals: Iexpense): Promise<Isuccess>;
    /** The  deleteExpenses  static method sends a PUT request to the server to delete multiple expenses specified by their IDs. It also takes an array of file paths with directories to delete associated files. It returns a success response. */
    static deleteExpenses(ids: string[]): Promise<Isuccess>;
    /** The  updateExpense  method sends a PUT request to update the current expense with the provided values. It returns a success response. */
    updateExpense(vals: Iexpense): Promise<Isuccess>;
    /** The  deleteExpense  method sends a DELETE request to delete the current expense from the server. It returns a success response. */
    deleteExpense(): Promise<Isuccess>;
}
