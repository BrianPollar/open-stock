/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { Item } from './item.define';
/** The  Expense  class extends the  DatabaseAuto  class, which is not shown in the code snippet. It has properties such as  urId ,  name ,  person ,  cost ,  category ,  note , and  items . The constructor initializes these properties based on the provided data. */
export class Expense extends DatabaseAuto {
    /** */
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.name = data.name;
        this.person = data.person;
        this.cost = data.cost;
        this.category = data.category;
        this.note = data.note;
        if (data.items) {
            this.items = data.items
                .map(val => new Item(val));
        }
    }
    /** The  getExpenses  static method retrieves a list of expenses from the server by making a GET request to the specified URL. It returns an array of  Expense  instances. */
    static async getExpenses(url = 'getall', offset = 0, limit = 0) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/expense/${url}/${offset}/${limit}`);
        const expenses = await lastValueFrom(observer$);
        return expenses
            .map(val => new Expense(val));
    }
    /** The  getOneExpense  static method retrieves a single expense from the server by making a GET request with the provided  urId . It returns a single  Expense  instance. */
    static async getOneExpense(urId) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/expense/getone/${urId}`);
        const expense = await lastValueFrom(observer$);
        return new Expense(expense);
    }
    /** The  addExpense  static method sends a POST request to the server to create a new expense with the provided values. It returns a success response. */
    static async addExpense(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/expense/create', vals);
        return await lastValueFrom(observer$);
    }
    /** The  deleteExpenses  static method sends a PUT request to the server to delete multiple expenses specified by their IDs. It also takes an array of file paths with directories to delete associated files. It returns a success response. */
    static async deleteExpenses(ids) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/expense/deletemany', { ids });
        return await lastValueFrom(observer$);
    }
    /** The  updateExpense  method sends a PUT request to update the current expense with the provided values. It returns a success response. */
    async updateExpense(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/expense/update', vals);
        return await lastValueFrom(observer$);
    }
    /** The  deleteExpense  method sends a DELETE request to delete the current expense from the server. It returns a success response. */
    async deleteExpense() {
        const observer$ = StockCounterClient.ehttp
            .makeDelete(`/expense/deleteone/${this._id}`);
        return await lastValueFrom(observer$);
    }
}
//# sourceMappingURL=expense.define.js.map