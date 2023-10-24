/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { InvoiceRelated, Receipt } from './receipt.define';
export class InvoiceRelatedWithReceipt extends InvoiceRelated {
    constructor(data) {
        super(data);
        /** */
        this.payments = [];
        if (data.payments?.length) {
            this.payments = data.payments
                .map(val => new Receipt(val));
            this.paymentMade = this.payments
                .reduce((acc, val) => acc + val.amount, 0);
        }
    }
}
/** */
export class Invoice extends InvoiceRelatedWithReceipt {
    /** */
    constructor(data) {
        super(data);
        this.dueDate = data.dueDate;
        /** if (data.items) {
          this.items = data.items
            .map(val => ProductBase.constructProduct(StockCounterClient.ehttp, val));
        }*/
    }
    /** */
    static async getInvoices(url = 'getall', offset = 0, limit = 0) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/invoice/${url}/${offset}/${limit}`);
        const invoices = await lastValueFrom(observer$);
        return invoices
            .map(val => new Invoice(val));
    }
    /** */
    static async getOneInvoice(invoiceId) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/invoice/getone/${invoiceId}`);
        const invoice = await lastValueFrom(observer$);
        return new Invoice(invoice);
    }
    /** */
    static async addInvoice(invoice, invoiceRelated) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/invoice/create', { invoice, invoiceRelated });
        return await lastValueFrom(observer$);
    }
    /** */
    static async deleteInvoices(credentials) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/invoice/deletemany', { credentials });
        return await lastValueFrom(observer$);
    }
    /** */
    async update(updatedInvoice, invoiceRelated) {
        updatedInvoice._id = this._id;
        const observer$ = StockCounterClient.ehttp
            .makePut('/invoice/update', { updatedInvoice, invoiceRelated });
        return await lastValueFrom(observer$);
    }
}
//# sourceMappingURL=invoice.define.js.map