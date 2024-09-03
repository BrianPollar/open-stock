import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
/** The  InvoiceRelated  class is a subclass of the  DatabaseAuto  class and represents an invoice-related object. It has properties such as invoice related ID, creation type, estimate ID, invoice ID, billing user, items (an array of invoice-related product objects), billing user ID, billing user photo, stage, status, cost, payment made, tax, balance due, sub total, total, from date, to date, and payments (an array of payment install objects). The class also has methods for retrieving invoice-related objects from the server, adding and deleting invoice payments, and updating invoice payments. */
/**
 * Represents an invoice related to a receipt.
 */
export class InvoiceRelated extends DatabaseAuto {
    /**
     * Creates a new instance of the InvoiceRelated class.
     * @param data The data to initialize the instance with.
     */
    constructor(data) {
        super(data);
        this.ecommerceSale = false;
        this.ecommerceSalePercentage = 0;
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
        this.ecommerceSale = data.ecommerceSale || false;
        this.ecommerceSalePercentage = data.ecommerceSalePercentage || 0;
        this.currency = data.currency;
    }
    /**
     * Gets all invoice payments.
     * @param companyId - The ID of the company
     * @returns An array of invoice payments.
     */
    static async getInvoicePayments(companyId) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/invoice/getallpayments/${companyId}`);
        const invoicepays = await lastValueFrom(observer$);
        return {
            count: invoicepays.count,
            invoicepays: invoicepays.data
                .map(val => new Receipt(val))
        };
    }
    /**
     * Gets a single invoice payment.
     * @param companyId - The ID of the company
     * @param urId The ID of the invoice payment.
     * @returns The invoice payment.
     */
    static async getOneInvoicePayment(companyId, urId) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/invoice/getonepayment/${urId}/${companyId}`);
        const invoicepay = await lastValueFrom(observer$);
        return new Receipt(invoicepay);
    }
    /**
     * Adds an invoice payment.
     * @param companyId - The ID of the company
     * @param payment The invoice payment to add.
     * @returns The success status of the operation.
     */
    static async addInvoicePayment(companyId, payment) {
        const observer$ = StockCounterClient.ehttp
            .makePost(`/invoice/createpayment/${companyId}`, payment);
        return await lastValueFrom(observer$);
    }
    /**
     * Deletes multiple invoice payments.
     * @param companyId - The ID of the company
     * @param ids The IDs of the invoice payments to delete.
     * @returns The success status of the operation.
     */
    static async deleteInvoicePayments(companyId, ids) {
        const observer$ = StockCounterClient.ehttp
            .makePut(`/invoice/deletemanypayments/${companyId}`, { ids });
        return await lastValueFrom(observer$);
    }
    /**
     * Updates an invoice payment.
     * @param companyId - The ID of the company
     * @param updatedInvoice The updated invoice.
     * @param invoiceRelated The related invoice.
     * @returns The success status of the operation.
     */
    static async updateInvoicePayment(companyId, updatedInvoice, invoiceRelated) {
        const observer$ = StockCounterClient.ehttp
            .makePost(`/invoice/updatepayment/${companyId}`, { updatedInvoice, invoiceRelated });
        return await lastValueFrom(observer$);
    }
    /**
     * Updates an invoice related to a receipt.
     * @param companyId - The ID of the company
     * @param invoiceRelated The invoice related to the receipt to update.
     * @returns The success status of the operation.
     */
    static async updateInvoiceRelated(companyId, invoiceRelated) {
        const observer$ = StockCounterClient.ehttp
            .makePut(`/invoicerelated/update/${companyId}`, { invoiceRelated });
        return await lastValueFrom(observer$);
    }
}
export class Receipt extends InvoiceRelated {
    /**
     * Constructs a new Receipt object.
     * @param data - The required data for the Receipt.
     */
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.companyId = data.companyId;
        this.ammountRcievd = data.ammountRcievd;
        this.paymentMode = data.paymentMode;
        this.type = data.type;
        this.date = data.toDate;
        this.amount = data.amount;
    }
    /**
     * Retrieves receipts for a specific company.
     * @param companyId - The ID of the company.
     * @param url - The URL for the API endpoint. Default value is 'getall'.
     * @param offset - The offset for pagination. Default value is 0.
     * @param limit - The limit for pagination. Default value is 0.
     * @returns An array of receipts.
     */
    static async getReceipts(companyId, url = 'getall', offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/receipt/${url}/${offset}/${limit}/${companyId}`);
        const receipts = await lastValueFrom(observer$);
        return {
            count: receipts.count,
            receipts: receipts.data
                .map(val => new Receipt(val))
        };
    }
    /**
     * Retrieves a single receipt based on the company ID and user ID.
     * @param companyId - The ID of the company.
     * @param urId - The ID of the user.
     * @returns A Promise that resolves to a new instance of the Receipt class.
     */
    static async getOneReceipt(companyId, urId) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/receipt/getone/${urId}/${companyId}`);
        const receipt = await lastValueFrom(observer$);
        return new Receipt(receipt);
    }
    /**
     * Adds a receipt to the system.
     * @param companyId - The ID of the company.
     * @param receipt - The receipt object to be added.
     * @param invoiceRelated - The related invoice information.
     * @returns A promise that resolves to the success response.
     */
    static async addReceipt(companyId, receipt, invoiceRelated) {
        const observer$ = StockCounterClient.ehttp
            .makePost(`/receipt/create/${companyId}`, { receipt, invoiceRelated });
        return await lastValueFrom(observer$);
    }
    /**
     * Deletes multiple receipts for a given company.
     * @param companyId - The ID of the company.
     * @param credentials - An array of delete credentials for each receipt.
     * @returns A promise that resolves to the success response.
     */
    static async deleteReceipts(companyId, credentials) {
        const observer$ = StockCounterClient.ehttp
            .makePut(`/receipt/deletemany/${companyId}`, { credentials });
        return await lastValueFrom(observer$);
    }
    /**
     * Updates a receipt.
     * @param companyId - The ID of the company.
     * @param updatedReceipt - The updated receipt object.
     * @param invoiceRelated - The invoice related object.
     * @returns A promise that resolves to the success response.
     */
    async updateReciept(companyId, updatedReceipt, invoiceRelated) {
        updatedReceipt._id = this._id;
        const observer$ = StockCounterClient.ehttp
            .makePut(`/receipt/update/${companyId}`, { updatedReceipt, invoiceRelated });
        return await lastValueFrom(observer$);
    }
}
//# sourceMappingURL=receipt.define.js.map