/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { lastValueFrom } from 'rxjs';
import { DatabaseAuto } from '@open-stock/stock-universal';
import { StockCounterClient } from '../../stock-counter-client';
import { Expense } from '../expense.define';
/** The  ExpenseReport  class represents an expense report object. It extends the  DatabaseAuto  class, which provides common properties like ID and timestamps. It has properties like  urId ,  totalAmount ,  date , and  expenses . The constructor takes in an object of type  IexpenseReport  and assigns the properties accordingly. It also converts the  expenses  array into an array of  Expense  objects. The class has several static methods for interacting with the expense report API. The  getExpenseReports  method retrieves a list of expense reports from the API. It takes optional parameters for the URL, offset, and limit of the API request. It returns an array of  ExpenseReport  objects. */
export class ExpenseReport extends DatabaseAuto {
    /** */
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.totalAmount = data.totalAmount;
        this.date = data.date;
        if (data.expenses) {
            this.expenses = data.expenses
                .map(val => new Expense(val));
        }
    }
    /** */
    static async getExpenseReports(url = 'getall', offset = 0, limit = 10) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/expensereport/${url}/${offset}/${limit}`);
        const expensereports = await lastValueFrom(observer$);
        return expensereports
            .map((val) => new ExpenseReport(val));
    }
    /** The  getOneExpenseReport  method retrieves a single expense report from the API. It takes the  urId  parameter to specify the ID of the report to retrieve. It returns a single  ExpenseReport  object. */
    static async getOneExpenseReport(urId) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/expensereport/getone/${urId}`);
        const expensereport = await lastValueFrom(observer$);
        return new ExpenseReport(expensereport);
    }
    /** The  addExpenseReport  method adds a new expense report to the API. It takes an object of type  IexpenseReport  as the parameter, which contains the data for the new report. It returns a success message.*/
    static async addExpenseReport(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/expensereport/create', vals);
        return await lastValueFrom(observer$);
    }
    /** The  deleteExpenseReports  method deletes multiple expense reports from the API. It takes an array of report IDs as the parameter. It returns a success message. */
    static async deleteExpenseReports(ids) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/expensereport/deletemany', { ids });
        return await lastValueFrom(observer$);
    }
}
//# sourceMappingURL=expensereport.define.js.map