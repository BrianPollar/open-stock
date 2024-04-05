"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfitAndLossReport = void 0;
const stock_universal_1 = require("@open-stock/stock-universal");
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../../stock-counter-client");
const expense_define_1 = require("../expense.define");
const invoice_define_1 = require("../invoice.define");
/** The  ProfitAndLossReport  class extends the  DatabaseAuto  class. It has properties such as  urId ,  totalAmount ,  date ,  expenses , and  invoiceRelateds . The constructor takes an object  data  as an argument and assigns its properties to the corresponding class properties. It also converts the  expenses  and  invoiceRelateds  arrays into instances of the  Expense  and  InvoiceRelated  classes, respectively.

The class has several static methods:
-  getProfitAndLossReports : Retrieves profit and loss reports from the server. It takes optional parameters  url ,  offset , and  limit  to specify the API endpoint and pagination options. */
/**
 * Represents a Profit and Loss Report.
 */
class ProfitAndLossReport extends stock_universal_1.DatabaseAuto {
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
            this.expenses = data.expenses.map(val => new expense_define_1.Expense(val));
        }
        if (data.invoiceRelateds) {
            this.invoiceRelateds = data.invoiceRelateds.map(val => new invoice_define_1.InvoiceRelatedWithReceipt(val));
        }
    }
    /**
     * Retrieves profit and loss reports from the server.
     * @param companyId - The ID of the company
     * @param url - The API endpoint to use. Defaults to 'getall'.
     * @param offset - The offset to use for pagination. Defaults to 0.
     * @param limit - The limit to use for pagination. Defaults to 0.
     * @returns An array of ProfitAndLossReport instances.
     */
    static async getProfitAndLossReports(companyId, url = 'getall', offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makeGet(`/profitandlossreport//${url}/${offset}/${limit}/${companyId}`);
        const profitandlossreports = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: profitandlossreports.count,
            profitandlossreports: profitandlossreports.data.map((val) => new ProfitAndLossReport(val))
        };
    }
    /**
     * Retrieves a single profit and loss report based on the provided urId.
     * @param companyId - The ID of the company
     * @param urId - The ID of the report to retrieve.
     * @returns A ProfitAndLossReport instance.
     */
    static async getOneProfitAndLossReport(companyId, urId) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makeGet(`/profitandlossreport/getone/${urId}/${companyId}`);
        const profitandlossreport = await (0, rxjs_1.lastValueFrom)(observer$);
        return new ProfitAndLossReport(profitandlossreport);
    }
    /**
     * Adds a new profit and loss report to the server.
     * @param companyId - The ID of the company
     * @param vals - The data for the new report.
     * @returns An Isuccess object.
     */
    static async addProfitAndLossReport(companyId, vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makePost(`/profitandlossreport/create/${companyId}`, vals);
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Deletes multiple profit and loss reports from the server.
     * @param companyId - The ID of the company
     * @param ids - An array of report IDs to be deleted.
     * @returns An Isuccess object.
     */
    static async deleteProfitAndLossReports(companyId, ids) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makePut(`/profitandlossreport/deletemany/${companyId}`, { ids });
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.ProfitAndLossReport = ProfitAndLossReport;
//# sourceMappingURL=profitandlossreport.define.js.map