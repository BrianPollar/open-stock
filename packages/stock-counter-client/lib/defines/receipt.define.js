/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { InvoiceRelatedWithReceipt } from './invoice.define';
/** The  InvoiceRelated  class is a subclass of the  DatabaseAuto  class and represents an invoice-related object. It has properties such as invoice related ID, creation type, estimate ID, invoice ID, billing user, items (an array of invoice-related product objects), billing user ID, billing user photo, stage, status, cost, payment made, tax, balance due, sub total, total, from date, to date, and payments (an array of payment install objects). The class also has methods for retrieving invoice-related objects from the server, adding and deleting invoice payments, and updating invoice payments. */
export class InvoiceRelated extends DatabaseAuto {
    /** */
    constructor(data) {
        super(data);
        this.invoiceRelated = data.invoiceRelated;
        this.creationType = data.creationType;
        this.invoiceId = data.invoiceId;
        this.billingUser = data.billingUser;
        this.extraCompanyDetails = data.extraCompanyDetails;
        this.items = data.items;
        this.billingUserId = data.billingUserId;
        this.billingUserPhoto = data.billingUserPhoto;
        this.stage = data.stage;
        this.estimateId = data.estimateId;
        this.status = data.status;
        this.cost = data.cost;
        this.tax = data.tax;
        this.balanceDue = data.balanceDue;
        this.subTotal = data.subTotal;
        this.total = data.total;
        this.fromDate = data.fromDate;
        this.toDate = data.toDate;
    }
    /** */
    static async getInvoiceRelateds(url = 'getall', offset = 0, limit = 0) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/invoicerelated/${url}/${offset}/${limit}`);
        const invoiceRelateds = await lastValueFrom(observer$);
        return invoiceRelateds
            .map(val => new InvoiceRelatedWithReceipt(val));
    }
    /** */
    static async searchInvoiceRelateds(searchterm, searchKey, offset = 0, limit = 0) {
        const body = {
            searchterm,
            searchKey
        };
        const observer$ = StockCounterClient.ehttp
            .makePost(`/invoicerelated/search/${offset}/${limit}`, body);
        const invoiceRelateds = await lastValueFrom(observer$);
        return invoiceRelateds
            .map(val => new InvoiceRelatedWithReceipt(val));
    }
    /** */
    static async getOneInvoiceRelated(id) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/invoicerelated/getone/${id}`);
        const invoiceRelated = await lastValueFrom(observer$);
        return new InvoiceRelatedWithReceipt(invoiceRelated);
    }
    /** */
    static async getInvoicePayments() {
        const observer$ = StockCounterClient.ehttp
            .makeGet('/invoice/getallpayments');
        const invoicepays = await lastValueFrom(observer$);
        return invoicepays
            .map(val => new Receipt(val));
    }
    /** */
    static async getOneInvoicePayment(urId) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/invoice/getonepayment/${urId}`);
        const invoicepay = await lastValueFrom(observer$);
        return new Receipt(invoicepay);
    }
    /** */
    static async addInvoicePayment(payment) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/invoice/createpayment', payment);
        return await lastValueFrom(observer$);
    }
    /** */
    static async deleteInvoicePayments(ids) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/invoice/deletemanypayments', { ids });
        return await lastValueFrom(observer$);
    }
    /** */
    static async updateInvoicePayment(updatedInvoice, invoiceRelated) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/invoice/updatepayment', { updatedInvoice, invoiceRelated });
        return await lastValueFrom(observer$);
    }
    /** */
    static async updateInvoiceRelated(invoiceRelated) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/invoicerelated/update', { invoiceRelated });
        return await lastValueFrom(observer$);
    }
}
/** */
export class Receipt extends InvoiceRelated {
    /** */
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.ammountRcievd = data.ammountRcievd;
        this.paymentMode = data.paymentMode;
        this.type = data.type;
        this.date = data.toDate;
        this.amount = data.amount;
    }
    /** */
    static async getReceipts(url = 'getall', offset = 0, limit = 0) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/receipt/${url}/${offset}/${limit}`);
        const receipts = await lastValueFrom(observer$);
        return receipts
            .map(val => new Receipt(val));
    }
    /** */
    static async getOneReceipt(urId) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/receipt/getone/${urId}`);
        const receipt = await lastValueFrom(observer$);
        return new Receipt(receipt);
    }
    /** */
    static async addReceipt(receipt, invoiceRelated) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/receipt/create', { receipt, invoiceRelated });
        return await lastValueFrom(observer$);
    }
    /** */
    static async deleteReceipts(credentials) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/receipt/deletemany', { credentials });
        return await lastValueFrom(observer$);
    }
    /** */
    async updateReciept(updatedReceipt, invoiceRelated) {
        updatedReceipt._id = this._id;
        const observer$ = StockCounterClient.ehttp
            .makePut('/receipt/update', { updatedReceipt, invoiceRelated });
        return await lastValueFrom(observer$);
    }
}
//# sourceMappingURL=receipt.define.js.map