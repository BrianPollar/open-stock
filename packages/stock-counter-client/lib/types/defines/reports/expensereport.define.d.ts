import { DatabaseAuto, IexpenseReport, Isuccess } from '@open-stock/stock-universal';
import { Expense } from '../expense.define';
/**
 * The `ExpenseReport` class represents an expense report object.
 * It extends the `DatabaseAuto` class, which provides common properties
 * like ID and timestamps. It has properties like `urId`, `totalAmount`, `date`, and `expenses`. The constructor takes in an object of type `IexpenseReport` and assigns the properties accordingly. It also converts the `expenses` array into an array of `Expense` objects. The class has several static methods for interacting with the expense report API. The `getExpenseReports` method retrieves a list of expense reports from the API. It takes optional parameters for the URL, offset, and limit of the API request. It returns an array of `ExpenseReport` objects.
 */
export declare class ExpenseReport extends DatabaseAuto {
    /** The ID of the user who created the expense report. */
    urId: string;
    /** The user's company ID. */
    companyId: string;
    /** The total amount of the expense report. */
    totalAmount: number;
    /** The date of the expense report. */
    date: Date;
    /** An array of `Expense` objects associated with the expense report. */
    expenses: Expense[];
    /**
     * Creates an instance of `ExpenseReport`.
     * @param data An object of type `IexpenseReport` containing the data for the expense report.
     */
    constructor(data: IexpenseReport);
    /**
     * Retrieves a list of expense reports from the API.
     * @param companyId - The ID of the company
     * @param url Optional URL for the API request.
     * @param offset Optional offset for the API request.
     * @param limit Optional limit for the API request.
     * @returns An array of `ExpenseReport` objects.
     */
    static getExpenseReports(companyId: string, url?: string, offset?: number, limit?: number): Promise<{
        count: number;
        expensereports: ExpenseReport[];
    }>;
    /**
     * Retrieves a single expense report from the API.
     * @param companyId - The ID of the company
     * @param urId The ID of the expense report to retrieve.
     * @returns A single `ExpenseReport` object.
     */
    static getOneExpenseReport(companyId: string, urId: string): Promise<ExpenseReport>;
    /**
     * Adds a new expense report to the API.
     * @param companyId - The ID of the company
     * @param vals An object of type `IexpenseReport` containing the data for the new expense report.
     * @returns A success message.
     */
    static addExpenseReport(companyId: string, vals: IexpenseReport): Promise<Isuccess>;
    /**
     * Deletes multiple expense reports from the API.
     * @param companyId - The ID of the company
     * @param ids An array of expense report IDs to delete.
     * @returns A success message.
     */
    static deleteExpenseReports(companyId: string, ids: string[]): Promise<Isuccess>;
}
