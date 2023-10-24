/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { DatabaseAuto, Iexpense, Isuccess, TexpenseCategory } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { Item } from './item.define';

/**
 * Represents an expense.
 * @extends DatabaseAuto
 */
export class Expense extends DatabaseAuto {
  /** The unique identifier of the expense. */
  urId: string;

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
  constructor(data: Iexpense) {
    super(data);
    this.urId = data.urId as string;
    this.name = data.name;
    this.person = data.person;
    this.cost = data.cost;
    this.category = data.category;
    this.note = data.note;
    if (data.items) {
      this.items = data.items.map((val) => new Item(val));
    }
  }

  /**
   * Retrieves a list of expenses from the server.
   * @static
   * @async
   * @param {string} [url='getall'] - The URL to retrieve the expenses from.
   * @param {number} [offset=0] - The offset to start retrieving expenses from.
   * @param {number} [limit=0] - The maximum number of expenses to retrieve.
   * @returns {Promise<Expense[]>} An array of Expense instances.
   */
  static async getExpenses(url = 'getall', offset = 0, limit = 0) {
    const observer$ = StockCounterClient.ehttp.makeGet(`/expense/${url}/${offset}/${limit}`);
    const expenses = await lastValueFrom(observer$) as Iexpense[];
    return expenses.map((val) => new Expense(val));
  }

  /**
   * Retrieves a single expense from the server.
   * @static
   * @async
   * @param {string} urId - The unique identifier of the expense to retrieve.
   * @returns {Promise<Expense>} A single Expense instance.
   */
  static async getOneExpense(urId: string) {
    const observer$ = StockCounterClient.ehttp.makeGet(`/expense/getone/${urId}`);
    const expense = await lastValueFrom(observer$) as Iexpense;
    return new Expense(expense);
  }

  /**
   * Creates a new expense on the server.
   * @static
   * @async
   * @param {Iexpense} vals - The values to create the expense with.
   * @returns {Promise<Isuccess>} A success response.
   */
  static async addExpense(vals: Iexpense) {
    const observer$ = StockCounterClient.ehttp.makePost('/expense/create', vals);
    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Deletes multiple expenses from the server.
   * @static
   * @async
   * @param {string[]} ids - The unique identifiers of the expenses to delete.
   * @returns {Promise<Isuccess>} A success response.
   */
  static async deleteExpenses(ids: string[]) {
    const observer$ = StockCounterClient.ehttp.makePut('/expense/deletemany', { ids });
    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Updates the current expense on the server.
   * @async
   * @param {Iexpense} vals - The values to update the expense with.
   * @returns {Promise<Isuccess>} A success response.
   */
  async updateExpense(vals: Iexpense) {
    const observer$ = StockCounterClient.ehttp.makePut('/expense/update', vals);
    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Deletes the current expense from the server.
   * @async
   * @returns {Promise<Isuccess>} A success response.
   */
  async deleteExpense() {
    const observer$ = StockCounterClient.ehttp.makeDelete(`/expense/deleteone/${this._id}`);
    return await lastValueFrom(observer$) as Isuccess;
  }
}
