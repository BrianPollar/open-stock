import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { InvoiceRelated, Receipt } from './receipt.define';
export class InvoiceRelatedWithReceipt extends InvoiceRelated {
    constructor(data) {
        super(data);
        this.payments = [];
        if (data.payments?.length) {
            this.payments = data.payments
                .map(val => new Receipt(val));
            this.paymentMade = this.payments
                .reduce((acc, val) => acc + val.amount, 0);
        }
    }
    static async getInvoiceRelateds(offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/invoicerelated/all/${offset}/${limit}`);
        const invoiceRelateds = await lastValueFrom(observer$);
        return {
            count: invoiceRelateds.count,
            invoiceRelateds: invoiceRelateds.data
                .map(val => new InvoiceRelatedWithReceipt(val))
        };
    }
    static async filterInvoiceRelateds(filter) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/invoicerelated/filter', filter);
        const invoiceRelateds = await lastValueFrom(observer$);
        return {
            count: invoiceRelateds.count,
            invoiceRelateds: invoiceRelateds.data
                .map(val => new InvoiceRelatedWithReceipt(val))
        };
    }
    static async getOneInvoiceRelated(_id) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/invoicerelated/one/${_id}`);
        const invoiceRelated = await lastValueFrom(observer$);
        return new InvoiceRelatedWithReceipt(invoiceRelated);
    }
}
export class Invoice extends InvoiceRelatedWithReceipt {
    constructor(data) {
        super(data);
        this.dueDate = data.dueDate;
        this.urId = data.urId;
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/invoice/all/${offset}/${limit}`);
        const invoices = await lastValueFrom(observer$);
        return {
            count: invoices.count,
            invoices: invoices.data
                .map(val => new Invoice(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/invoice/filter', filter);
        const invoices = await lastValueFrom(observer$);
        return {
            count: invoices.count,
            invoices: invoices.data
                .map(val => new Invoice(val))
        };
    }
    static async getOne(urId) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/invoice/one/${urId}`);
        const invoice = await lastValueFrom(observer$);
        return new Invoice(invoice);
    }
    static async add(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/invoice/add', vals);
        return await lastValueFrom(observer$);
    }
    static removeMany(val) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/invoice/delete/many', val);
        return lastValueFrom(observer$);
    }
    update(vals) {
        vals.invoice._id = this._id;
        const observer$ = StockCounterClient.ehttp
            .makePut('/invoice/update', vals);
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=invoice.define.js.map