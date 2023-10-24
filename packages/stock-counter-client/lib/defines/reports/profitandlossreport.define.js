/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { lastValueFrom } from 'rxjs';
import { InvoiceRelatedWithReceipt } from '../invoice.define';
import { DatabaseAuto } from '@open-stock/stock-universal';
import { StockCounterClient } from '../../stock-counter-client';
import { Expense } from '../expense.define';
/** The  ProfitAndLossReport  class extends the  DatabaseAuto  class. It has properties such as  urId ,  totalAmount ,  date ,  expenses , and  invoiceRelateds . The constructor takes an object  data  as an argument and assigns its properties to the corresponding class properties. It also converts the  expenses  and  invoiceRelateds  arrays into instances of the  Expense  and  InvoiceRelated  classes, respectively.

The class has several static methods:
-  getProfitAndLossReports : Retrieves profit and loss reports from the server. It takes optional parameters  url ,  offset , and  limit  to specify the API endpoint and pagination options. */
export class ProfitAndLossReport extends DatabaseAuto {
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.totalAmount = data.totalAmount;
        this.date = data.date;
        if (data.expenses) {
            this.expenses = data.expenses
                .map(val => new Expense(val));
        }
        if (data.invoiceRelateds) {
            this.invoiceRelateds = data.invoiceRelateds
                .map(val => new InvoiceRelatedWithReceipt(val));
        }
    }
    /**
  The class has several static methods:
  -  getProfitAndLossReports : Retrieves profit and loss reports from the server. It takes optional parameters  url ,  offset , and  limit  to specify the API endpoint and pagination options. */
    static async getProfitAndLossReports(url = 'getall', offset = 0, limit = 0) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/profitandlossreport//${url}/${offset}/${limit}`);
        const profitandlossreports = await lastValueFrom(observer$);
        return profitandlossreports
            .map((val) => new ProfitAndLossReport(val));
    }
    /** getOneProfitAndLossReport : Retrieves a single profit and loss report based on the provided  urId . */
    static async getOneProfitAndLossReport(urId) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/profitandlossreport/getone/${urId}`);
        const profitandlossreport = await lastValueFrom(observer$);
        return new ProfitAndLossReport(profitandlossreport);
    }
    /** addProfitAndLossReport : Adds a new profit and loss report to the server. It takes an object  vals  containing the report data.*/
    static async addProfitAndLossReport(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/profitandlossreport/create', vals);
        return await lastValueFrom(observer$);
    }
    /** deleteProfitAndLossReports : Deletes multiple profit and loss reports from the server. It takes an array of report IDs to be deleted.*/
    static async deleteProfitAndLossReports(ids) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/profitandlossreport/deletemany', { ids });
        return await lastValueFrom(observer$);
    }
}
//# sourceMappingURL=profitandlossreport.define.js.map