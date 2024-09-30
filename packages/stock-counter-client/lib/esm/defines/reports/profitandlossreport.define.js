import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';
import { Expense } from '../expense.define';
import { InvoiceRelatedWithReceipt } from '../invoice.define';
export class ProfitAndLossReport extends DatabaseAuto {
    /**
     * Creates a new instance of ProfitAndLossReport.
     * @param data - The data to initialize the report with.
     */
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.companyId = data.companyId;
        this.totalAmount = data.totalAmount;
        this.date = data.date;
        if (data.expenses) {
            this.expenses = data.expenses.map(val => new Expense(val));
        }
        if (data.invoiceRelateds) {
            this.invoiceRelateds = data.invoiceRelateds.map(val => new InvoiceRelatedWithReceipt(val));
        }
        this.currency = data.currency;
    }
    /**
     * Retrieves profit and loss reports from the server.
  
     * @param url - The API endpoint to use. Defaults to 'getall'.
     * @param offset - The offset to use for pagination. Defaults to 0.
     * @param limit - The limit to use for pagination. Defaults to 0.
     * @returns An array of ProfitAndLossReport instances.
     */
    static async getAll(offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/profitandlossreport/all/${offset}/${limit}`);
        const profitandlossreports = await lastValueFrom(observer$);
        return {
            count: profitandlossreports.count,
            profitandlossreports: profitandlossreports.data.map((val) => new ProfitAndLossReport(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/profitandlossreport/filter', filter);
        const profitandlossreports = await lastValueFrom(observer$);
        return {
            count: profitandlossreports.count,
            profitandlossreports: profitandlossreports.data.map((val) => new ProfitAndLossReport(val))
        };
    }
    /**
     * Retrieves a single profit and loss report based on the provided urId.
  
     * @param urId - The ID of the report to retrieve.
     * @returns A ProfitAndLossReport instance.
     */
    static async getOne(urId) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/profitandlossreport/one/${urId}`);
        const profitandlossreport = await lastValueFrom(observer$);
        return new ProfitAndLossReport(profitandlossreport);
    }
    /**
     * Adds a new profit and loss report to the server.
  
     * @param vals - The data for the new report.
     * @returns An Isuccess object.
     */
    static add(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/profitandlossreport/add', vals);
        return lastValueFrom(observer$);
    }
    /**
     * Deletes multiple profit and loss reports from the server.
  
     * @param _ids - An array of report IDs to be deleted.
     * @returns An Isuccess object.
     */
    static removeMany(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/profitandlossreport/delete/many', vals);
        return lastValueFrom(observer$);
    }
    remove() {
        const observer$ = StockCounterClient.ehttp
            .makeDelete('/profitandlossreport/delete/one');
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=profitandlossreport.define.js.map