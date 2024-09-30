import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
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
  
     * @returns An array of invoice payments.
     */
    static async getInvoicePayments() {
        const observer$ = StockCounterClient.ehttp
            .makeGet('/invoice/getallpayments');
        const invoicepays = await lastValueFrom(observer$);
        return {
            count: invoicepays.count,
            invoicepays: invoicepays.data
                .map(val => new Receipt(val))
        };
    }
    /**
     * Gets a single invoice payment.
  
     * @param urId The ID of the invoice payment.
     * @returns The invoice payment.
     */
    static async getOneInvoicePayment(urId) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/invoice/getonepayment/${urId}`);
        const invoicepay = await lastValueFrom(observer$);
        return new Receipt(invoicepay);
    }
    /**
     * Adds an invoice payment.
  
     * @param payment The invoice payment to add.
     * @returns The success status of the operation.
     */
    static addInvoicePayment(payment) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/invoice/createpayment', payment);
        return lastValueFrom(observer$);
    }
    /**
     * Deletes multiple invoice payments.
  
     * @param _ids The IDs of the invoice payments to delete.
     * @returns The success status of the operation.
     */
    static deleteInvoicePayments(_ids) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/invoice/deletemanypayments', { _ids });
        return lastValueFrom(observer$);
    }
    /**
     * Updates an invoice payment.
  
     * @param updatedInvoice The updated invoice.
     * @param invoiceRelated The related invoice.
     * @returns The success status of the operation.
     */
    static updateInvoicePayment(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/invoice/updatepayment', vals);
        return lastValueFrom(observer$);
    }
    /**
     * Updates an invoice related to a receipt.
  
     * @param invoiceRelated The invoice related to the receipt to update.
     * @returns The success status of the operation.
     */
    static updateInvoiceRelated(invoiceRelated) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/invoicerelated/update', invoiceRelated);
        return lastValueFrom(observer$);
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
     .
     * @param url - The URL for the API endpoint. Default value is 'getall'.
     * @param offset - The offset for pagination. Default value is 0.
     * @param limit - The limit for pagination. Default value is 0.
     * @returns An array of receipts.
     */
    static async getAll(offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/receipt/all/${offset}/${limit}`);
        const receipts = await lastValueFrom(observer$);
        return {
            count: receipts.count,
            receipts: receipts.data
                .map(val => new Receipt(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/receipt/filter', filter);
        const receipts = await lastValueFrom(observer$);
        return {
            count: receipts.count,
            receipts: receipts.data
                .map(val => new Receipt(val))
        };
    }
    /**
     * Retrieves a single receipt based on the company ID and user ID.
     .
     * @param urId - The ID of the user.
     * @returns A Promise that resolves to a new instance of the Receipt class.
     */
    static async getOne(urId) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/receipt/one/${urId}`);
        const receipt = await lastValueFrom(observer$);
        return new Receipt(receipt);
    }
    /**
     * Adds a receipt to the system.
     .
     * @param receipt - The receipt object to be added.
     * @param invoiceRelated - The related invoice information.
     * @returns A promise that resolves to the success response.
     */
    static add(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/receipt/create', vals);
        return lastValueFrom(observer$);
    }
    /**
     * Deletes multiple receipts for a given company.
     .
     * @param credentials - An array of delete credentials for each receipt.
     * @returns A promise that resolves to the success response.
     */
    static removeMany(val) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/receipt/delete/many', val);
        return lastValueFrom(observer$);
    }
    /**
     * Updates a receipt.
     .
     * @param updatedReceipt - The updated receipt object.
     * @param invoiceRelated - The invoice related object.
     * @returns A promise that resolves to the success response.
     */
    update(vals) {
        vals.receipt._id = this._id;
        const observer$ = StockCounterClient.ehttp
            .makePut('/receipt/update', vals);
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=receipt.define.js.map