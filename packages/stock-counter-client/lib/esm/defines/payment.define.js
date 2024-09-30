import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { InvoiceRelatedWithReceipt } from './invoice.define';
export class PaymentRelated extends InvoiceRelatedWithReceipt {
    /**
     * Constructs a new instance of the Payment class.
     * @param data The required data for the Payment object.
     */
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.companyId = data.companyId;
        this.paymentRelated = data.paymentRelated;
        this.creationType = data.creationType;
        this.orderDate = data.orderDate;
        this.paymentDate = data.paymentDate;
        this.billingAddress = data.billingAddress;
        this.shippingAddress = data.shippingAddress;
        this.tax = data.tax;
        this.currency = data.currency;
        this.isBurgain = data.isBurgain;
        this.shipping = data.shipping;
        this.manuallyAdded = data.manuallyAdded;
        this.status = data.status;
        this.paymentMethod = data.paymentMethod;
    }
}
/**
 * Represents a payment object.
 * @extends PaymentRelated
 */
export class Payment extends PaymentRelated {
    /**
     * Creates a new Payment object.
     * @param data - The payment data.
     */
    constructor(data) {
        super(data);
        this.order = data.order;
    }
    /**
     * Creates a new payment.
  
     * @param paymentRelated - The payment related data.
     * @param invoiceRelated - The invoice related data.
     * @param order - The order data.
     * @param payment - The payment data.
     * @param bagainCred - The bagain credential data.
     * @param nonce - The payment nonce.
     * @returns A Promise that resolves to a success object.
     */
    static add(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/payment/add', vals);
        return lastValueFrom(observer$);
    }
    /**
     * Retrieves payments.
  
     * @param url - The URL to retrieve payments from.
     * @param offset - The offset to start retrieving payments from.
     * @param limit - The maximum number of payments to retrieve.
     * @returns A Promise that resolves to an array of Payment objects.
     */
    static async getAll(offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/payment/all/${offset}/${limit}`);
        const payments = await lastValueFrom(observer$);
        return {
            count: payments.count,
            payments: payments.data.map(val => new Payment(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/payment/filter', filter);
        const payments = await lastValueFrom(observer$);
        return {
            count: payments.count,
            payments: payments.data.map(val => new Payment(val))
        };
    }
    /**
     * Retrieves a single payment.
  
     * @param _id - The ID of the payment to retrieve.
     * @returns A Promise that resolves to a Payment object.
     */
    static async getOne(_id) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/payment/one/${_id}`);
        const payment = await lastValueFrom(observer$);
        return new Payment(payment);
    }
    /**
     * Deletes multiple payments.
  
     * @param credentials - The credentials to delete the payments.
     * @returns A Promise that resolves to a success object.
     */
    static removeMany(credentials) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/payment/delete/many', { credentials });
        return lastValueFrom(observer$);
    }
    /**
     * Updates a payment.
  
     * @param updatedPayment - The updated payment data.
     * @param paymentRelated - The updated payment related data.
     * @param invoiceRelated - The updated invoice related data.
     * @returns A Promise that resolves to a success object.
     */
    update(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/payment/update', vals);
        return lastValueFrom(observer$);
    }
    /**
     * Deletes a payment.
  
     * @returns A Promise that resolves to a success object.
     */
    remove() {
        const observer$ = StockCounterClient.ehttp.makeDelete(`/payment/delete/one/${this._id}`);
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=payment.define.js.map