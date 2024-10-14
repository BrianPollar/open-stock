"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invoice = exports.InvoiceRelatedWithReceipt = void 0;
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../stock-counter-client");
const receipt_define_1 = require("./receipt.define");
class InvoiceRelatedWithReceipt extends receipt_define_1.InvoiceRelated {
    constructor(data) {
        super(data);
        this.payments = [];
        if (data.payments?.length) {
            this.payments = data.payments
                .map(val => new receipt_define_1.Receipt(val));
            this.paymentMade = this.payments
                .reduce((acc, val) => acc + val.amount, 0);
        }
    }
    static async getInvoiceRelateds(offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/invoicerelated/all/${offset}/${limit}`);
        const invoiceRelateds = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: invoiceRelateds.count,
            invoiceRelateds: invoiceRelateds.data
                .map(val => new InvoiceRelatedWithReceipt(val))
        };
    }
    static async filterInvoiceRelateds(filter) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/invoicerelated/filter', filter);
        const invoiceRelateds = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: invoiceRelateds.count,
            invoiceRelateds: invoiceRelateds.data
                .map(val => new InvoiceRelatedWithReceipt(val))
        };
    }
    static async getOneInvoiceRelated(_id) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/invoicerelated/one/${_id}`);
        const invoiceRelated = await (0, rxjs_1.lastValueFrom)(observer$);
        return new InvoiceRelatedWithReceipt(invoiceRelated);
    }
}
exports.InvoiceRelatedWithReceipt = InvoiceRelatedWithReceipt;
class Invoice extends InvoiceRelatedWithReceipt {
    constructor(data) {
        super(data);
        this.dueDate = data.dueDate;
        this.urId = data.urId;
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/invoice/all/${offset}/${limit}`);
        const invoices = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: invoices.count,
            invoices: invoices.data
                .map(val => new Invoice(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/invoice/filter', filter);
        const invoices = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: invoices.count,
            invoices: invoices.data
                .map(val => new Invoice(val))
        };
    }
    static async getOne(urIdOr_id) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/invoice/one/${urIdOr_id}`);
        const invoice = await (0, rxjs_1.lastValueFrom)(observer$);
        return new Invoice(invoice);
    }
    static async add(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/invoice/add', vals);
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
    static removeMany(val) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/invoice/delete/many', val);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    update(vals) {
        vals.invoice._id = this._id;
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/invoice/update', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    remove() {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeDelete(`/invoice/delete/one/${this._id}`);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.Invoice = Invoice;
//# sourceMappingURL=invoice.define.js.map