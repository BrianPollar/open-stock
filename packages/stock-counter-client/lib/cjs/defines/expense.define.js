"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Expense = void 0;
const stock_universal_1 = require("@open-stock/stock-universal");
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../stock-counter-client");
const item_define_1 = require("./item.define");
class Expense extends stock_universal_1.DatabaseAuto {
    /**
     * Creates an instance of Expense.
     * @param {Iexpense} data - The data to initialize the expense.
     */
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.companyId = data.companyId;
        this.name = data.name;
        this.person = data.person;
        this.cost = data.cost;
        this.category = data.category;
        this.note = data.note;
        if (data.items) {
            this.items = data.items.map((val) => new item_define_1.Item(val));
        }
        this.currency = data.currency;
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
    static async getAll(offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/expense/all/${offset}/${limit}`);
        const expenses = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: expenses.count,
            expenses: expenses.data.map((val) => new Expense(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/expense/filter', filter);
        const expenses = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: expenses.count,
            expenses: expenses.data.map((val) => new Expense(val))
        };
    }
    /**
     * Retrieves a single expense from the server.
     * @static
     * @async
  
     * @param {string} urId - The unique identifier of the expense to retrieve.
     * @returns {Promise<Expense>} A single Expense instance.
     */
    static async getOne(urId) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/expense/one/${urId}`);
        const expense = await (0, rxjs_1.lastValueFrom)(observer$);
        return new Expense(expense);
    }
    /**
     * Creates a new expense on the server.
     * @static
     * @async
  
     * @param {Iexpense} vals - The values to create the expense with.
     * @returns {Promise<IsubscriptionFeatureState>} A success response.
     */
    static add(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/expense/add', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Deletes multiple expenses from the server.
     * @static
     * @async
  
     * @param {string[]} _ids - The unique identifiers of the expenses to delete.
     * @returns {Promise<Isuccess>} A success response.
     */
    static removeMany(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/expense/delete/many', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Updates the current expense on the server.
     * @async
  
     * @param {Iexpense} vals - The values to update the expense with.
     * @returns {Promise<Isuccess>} A success response.
     */
    update(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/expense/update', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Deletes the current expense from the server.
     * @async
  
     * @returns {Promise<Isuccess>} A success response.
     */
    remove() {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makeDelete(`/expense/delete/one/${this._id}`);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.Expense = Expense;
//# sourceMappingURL=expense.define.js.map