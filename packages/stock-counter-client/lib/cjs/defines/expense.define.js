"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Expense = void 0;
const stock_universal_1 = require("@open-stock/stock-universal");
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../stock-counter-client");
const item_define_1 = require("./item.define");
/**
 * Represents an expense.
 * @extends DatabaseAuto
 */
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
    }
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
    static async getExpenses(companyId, url = 'getall', offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makeGet(`/expense/${url}/${offset}/${limit}/${companyId}`);
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
     * @param companyId - The ID of the company
     * @param {string} urId - The unique identifier of the expense to retrieve.
     * @returns {Promise<Expense>} A single Expense instance.
     */
    static async getOneExpense(companyId, urId) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makeGet(`/expense/getone/${urId}/${companyId}`);
        const expense = await (0, rxjs_1.lastValueFrom)(observer$);
        return new Expense(expense);
    }
    /**
     * Creates a new expense on the server.
     * @static
     * @async
     * @param companyId - The ID of the company
     * @param {Iexpense} vals - The values to create the expense with.
     * @returns {Promise<IsubscriptionFeatureState>} A success response.
     */
    static async addExpense(companyId, vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makePost(`/expense/create/${companyId}`, vals);
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Deletes multiple expenses from the server.
     * @static
     * @async
     * @param companyId - The ID of the company
     * @param {string[]} ids - The unique identifiers of the expenses to delete.
     * @returns {Promise<Isuccess>} A success response.
     */
    static async deleteExpenses(companyId, ids) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makePut(`/expense/deletemany/${companyId}`, { ids });
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Updates the current expense on the server.
     * @async
     * @param companyId - The ID of the company
     * @param {Iexpense} vals - The values to update the expense with.
     * @returns {Promise<Isuccess>} A success response.
     */
    async updateExpense(companyId, vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makePut(`/expense/update/${companyId}`, vals);
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Deletes the current expense from the server.
     * @async
     * @param companyId - The ID of the company
     * @returns {Promise<Isuccess>} A success response.
     */
    async deleteExpense(companyId) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makeDelete(`/expense/deleteone/${this._id}/${companyId}`);
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.Expense = Expense;
//# sourceMappingURL=expense.define.js.map