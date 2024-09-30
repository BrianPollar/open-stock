"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invoice = exports.InvoiceRelatedWithReceipt = void 0;
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../stock-counter-client");
const receipt_define_1 = require("./receipt.define");
class InvoiceRelatedWithReceipt extends receipt_define_1.InvoiceRelated {
    /**
     * Constructs a new instance of the Invoice class.
     * @param data The required data for the invoice.
     */
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
    /**
     * Gets all invoice related to receipts.
  
     * @param url The URL to get the invoice related to receipts from.
     * @param offset The offset to start getting invoice related to receipts from.
     * @param limit The maximum number of invoice related to receipts to get.
     * @returns An array of invoice related to receipts.
     */
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
    /**
     * Searches for invoice related to receipts.
  
     * @param searchterm The search term to use.
     * @param searchKey The search key to use.
     * @param offset The offset to start getting invoice related to receipts from.
     * @param limit The maximum number of invoice related to receipts to get.
     * @returns An array of invoice related to receipts.
     */
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
    /**
     * Gets a single invoice related to a receipt.
  
     * @param _id The ID of the invoice related to the receipt.
     * @returns The invoice related to the receipt.
     */
    static async getOneInvoiceRelated(_id) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/invoicerelated/one/${_id}`);
        const invoiceRelated = await (0, rxjs_1.lastValueFrom)(observer$);
        return new InvoiceRelatedWithReceipt(invoiceRelated);
    }
}
exports.InvoiceRelatedWithReceipt = InvoiceRelatedWithReceipt;
/**
 * Represents an invoice related with a receipt.
 */
class Invoice extends InvoiceRelatedWithReceipt {
    /**
     * Creates an instance of Invoice.
     * @param data - The required data to create an invoice.
     */
    constructor(data) {
        super(data);
        this.dueDate = data.dueDate;
        this.urId = data.urId;
    }
    /**
     * Retrieves all invoices.
  
     * @param url - The URL to retrieve the invoices from.
     * @param offset - The offset to start retrieving invoices from.
     * @param limit - The maximum number of invoices to retrieve.
     * @returns An array of invoices.
     */
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
    /**
     * Retrieves a single invoice.
  
     * @param invoiceId - The ID of the invoice to retrieve.
     * @returns An instance of Invoice.
     */
    static async getOne(urId) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/invoice/one/${urId}`);
        const invoice = await (0, rxjs_1.lastValueFrom)(observer$);
        return new Invoice(invoice);
    }
    /**
     * Adds an invoice.
  
     * @param invoice - The invoice to add.
     * @param invoiceRelated - The related invoice.
     * @returns A success message.
     */
    static async add(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/invoice/add', vals);
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Deletes multiple invoices.
  
     * @param credentials - The credentials to delete the invoices.
     * @returns A success message.
     */
    static removeMany(val) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/invoice/delete/many', val);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Updates an invoice.
  
     * @param updatedInvoice - The updated invoice.
     * @param invoiceRelated - The related invoice.
     * @returns A success message.
     */
    update(vals) {
        vals.invoice._id = this._id;
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/invoice/update', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.Invoice = Invoice;
//# sourceMappingURL=invoice.define.js.map