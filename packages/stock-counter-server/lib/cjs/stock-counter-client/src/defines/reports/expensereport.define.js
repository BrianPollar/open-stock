"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseReport = void 0;
const rxjs_1 = require("rxjs");
const stock_universal_1 = require("@open-stock/stock-universal");
const stock_counter_client_1 = require("../../stock-counter-client");
const expense_define_1 = require("../expense.define");
/**
 * The `ExpenseReport` class represents an expense report object. It extends the `DatabaseAuto` class, which provides common properties like ID and timestamps. It has properties like `urId`, `totalAmount`, `date`, and `expenses`. The constructor takes in an object of type `IexpenseReport` and assigns the properties accordingly. It also converts the `expenses` array into an array of `Expense` objects. The class has several static methods for interacting with the expense report API. The `getExpenseReports` method retrieves a list of expense reports from the API. It takes optional parameters for the URL, offset, and limit of the API request. It returns an array of `ExpenseReport` objects.
 */
class ExpenseReport extends stock_universal_1.DatabaseAuto {
    /**
     * Creates an instance of `ExpenseReport`.
     * @param data An object of type `IexpenseReport` containing the data for the expense report.
     */
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.companyId = data.companyId;
        this.totalAmount = data.totalAmount;
        this.date = data.date;
        if (data.expenses) {
            this.expenses = data.expenses.map((val) => new expense_define_1.Expense(val));
        }
    }
    /**
     * Retrieves a list of expense reports from the API.
     * @param companyId - The ID of the company
     * @param url Optional URL for the API request.
     * @param offset Optional offset for the API request.
     * @param limit Optional limit for the API request.
     * @returns An array of `ExpenseReport` objects.
     */
    static async getExpenseReports(companyId, url = 'getall', offset = 0, limit = 10) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makeGet(`/expensereport/${url}/${offset}/${limit}/${companyId}`);
        const expensereports = await (0, rxjs_1.lastValueFrom)(observer$);
        return expensereports.map((val) => new ExpenseReport(val));
    }
    /**
     * Retrieves a single expense report from the API.
     * @param companyId - The ID of the company
     * @param urId The ID of the expense report to retrieve.
     * @returns A single `ExpenseReport` object.
     */
    static async getOneExpenseReport(companyId, urId) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makeGet(`/expensereport/getone/${urId}/${companyId}`);
        const expensereport = await (0, rxjs_1.lastValueFrom)(observer$);
        return new ExpenseReport(expensereport);
    }
    /**
     * Adds a new expense report to the API.
     * @param companyId - The ID of the company
     * @param vals An object of type `IexpenseReport` containing the data for the new expense report.
     * @returns A success message.
     */
    static async addExpenseReport(companyId, vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makePost(`/expensereport/create/${companyId}`, vals);
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Deletes multiple expense reports from the API.
     * @param companyId - The ID of the company
     * @param ids An array of expense report IDs to delete.
     * @returns A success message.
     */
    static async deleteExpenseReports(companyId, ids) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makePut(`/expensereport/deletemany/${companyId}`, { ids });
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.ExpenseReport = ExpenseReport;
//# sourceMappingURL=expensereport.define.js.map