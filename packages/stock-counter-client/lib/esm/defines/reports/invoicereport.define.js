import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';
import { Invoice } from '../invoice.define';
export class InvoiceReport extends DatabaseAuto {
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.companyId = data.companyId;
        this.totalAmount = data.totalAmount;
        this.date = data.date;
        if (data.invoices) {
            this.invoices = data.invoices.map(val => new Invoice(val));
        }
        this.currency = data.currency;
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/invoicesreport/all/${offset}/${limit}`);
        const invoicesreports = await lastValueFrom(observer$);
        return {
            count: invoicesreports.count,
            invoicesreports: invoicesreports.data.map((val) => new InvoiceReport(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/invoicesreport/filter', filter);
        const invoicesreports = await lastValueFrom(observer$);
        return {
            count: invoicesreports.count,
            invoicesreports: invoicesreports.data.map((val) => new InvoiceReport(val))
        };
    }
    static async getOne(urId) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/invoicesreport/one/${urId}`);
        const invoicesreport = await lastValueFrom(observer$);
        return new InvoiceReport(invoicesreport);
    }
    static add(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/invoicesreport/add', vals);
        return lastValueFrom(observer$);
    }
    static removeMany(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/invoicesreport/delete/many', vals);
        return lastValueFrom(observer$);
    }
    remove() {
        const observer$ = StockCounterClient.ehttp
            .makeDelete(`/invoicesreport/delete/one/${this._id}`);
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=invoicereport.define.js.map