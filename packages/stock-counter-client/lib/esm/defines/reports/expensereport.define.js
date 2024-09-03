import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';
import { Expense } from '../expense.define';
/**
 * The `ExpenseReport` class represents an expense report object.
 * It extends the `DatabaseAuto` class, which provides common properties
 * like ID and timestamps. It has properties like `urId`, `totalAmount`, `date`, and `expenses`. The constructor takes in an object of type `IexpenseReport` and assigns the properties accordingly. It also converts the `expenses` array into an array of `Expense` objects. The class has several static methods for interacting with the expense report API. The `getExpenseReports` method retrieves a list of expense reports from the API. It takes optional parameters for the URL, offset, and limit of the API request. It returns an array of `ExpenseReport` objects.
 */
export class ExpenseReport extends DatabaseAuto {
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
            this.expenses = data.expenses.map((val) => new Expense(val));
        }
        this.currency = data.currency;
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
        const observer$ = StockCounterClient.ehttp.makeGet(`/expensereport/${url}/${offset}/${limit}/${companyId}`);
        const expensereports = await lastValueFrom(observer$);
        return {
            count: expensereports.count,
            expensereports: expensereports.data.map((val) => new ExpenseReport(val))
        };
    }
    /**
     * Retrieves a single expense report from the API.
     * @param companyId - The ID of the company
     * @param urId The ID of the expense report to retrieve.
     * @returns A single `ExpenseReport` object.
     */
    static async getOneExpenseReport(companyId, urId) {
        const observer$ = StockCounterClient.ehttp.makeGet(`/expensereport/getone/${urId}/${companyId}`);
        const expensereport = await lastValueFrom(observer$);
        return new ExpenseReport(expensereport);
    }
    /**
     * Adds a new expense report to the API.
     * @param companyId - The ID of the company
     * @param vals An object of type `IexpenseReport` containing the data for the new expense report.
     * @returns A success message.
     */
    static async addExpenseReport(companyId, vals) {
        const observer$ = StockCounterClient.ehttp.makePost(`/expensereport/create/${companyId}`, vals);
        return await lastValueFrom(observer$);
    }
    /**
     * Deletes multiple expense reports from the API.
     * @param companyId - The ID of the company
     * @param ids An array of expense report IDs to delete.
     * @returns A success message.
     */
    static async deleteExpenseReports(companyId, ids) {
        const observer$ = StockCounterClient.ehttp.makePut(`/expensereport/deletemany/${companyId}`, { ids });
        return await lastValueFrom(observer$);
    }
}
//# sourceMappingURL=expensereport.define.js.map