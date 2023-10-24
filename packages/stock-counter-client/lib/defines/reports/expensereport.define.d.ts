import { DatabaseAuto, IexpenseReport, Isuccess } from '@open-stock/stock-universal';
import { Expense } from '../expense.define';
/** The  ExpenseReport  class represents an expense report object. It extends the  DatabaseAuto  class, which provides common properties like ID and timestamps. It has properties like  urId ,  totalAmount ,  date , and  expenses . The constructor takes in an object of type  IexpenseReport  and assigns the properties accordingly. It also converts the  expenses  array into an array of  Expense  objects. The class has several static methods for interacting with the expense report API. The  getExpenseReports  method retrieves a list of expense reports from the API. It takes optional parameters for the URL, offset, and limit of the API request. It returns an array of  ExpenseReport  objects. */
export declare class ExpenseReport extends DatabaseAuto {
    /** */
    urId: string;
    /** */
    totalAmount: number;
    /** */
    date: Date;
    /** */
    expenses: Expense[];
    /** */
    constructor(data: IexpenseReport);
    /** */
    static getExpenseReports(url?: string, offset?: number, limit?: number): Promise<ExpenseReport[]>;
    /** The  getOneExpenseReport  method retrieves a single expense report from the API. It takes the  urId  parameter to specify the ID of the report to retrieve. It returns a single  ExpenseReport  object. */
    static getOneExpenseReport(urId: string): Promise<ExpenseReport>;
    /** The  addExpenseReport  method adds a new expense report to the API. It takes an object of type  IexpenseReport  as the parameter, which contains the data for the new report. It returns a success message.*/
    static addExpenseReport(vals: IexpenseReport): Promise<Isuccess>;
    /** The  deleteExpenseReports  method deletes multiple expense reports from the API. It takes an array of report IDs as the parameter. It returns a success message. */
    static deleteExpenseReports(ids: string[]): Promise<Isuccess>;
}
