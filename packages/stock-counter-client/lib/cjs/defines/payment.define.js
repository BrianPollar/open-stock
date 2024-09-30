"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = exports.PaymentRelated = void 0;
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../stock-counter-client");
const invoice_define_1 = require("./invoice.define");
class PaymentRelated extends invoice_define_1.InvoiceRelatedWithReceipt {
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
exports.PaymentRelated = PaymentRelated;
/**
 * Represents a payment object.
 * @extends PaymentRelated
 */
class Payment extends PaymentRelated {
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
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/payment/add', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Retrieves payments.
  
     * @param url - The URL to retrieve payments from.
     * @param offset - The offset to start retrieving payments from.
     * @param limit - The maximum number of payments to retrieve.
     * @returns A Promise that resolves to an array of Payment objects.
     */
    static async getAll(offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/payment/all/${offset}/${limit}`);
        const payments = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: payments.count,
            payments: payments.data.map(val => new Payment(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/payment/filter', filter);
        const payments = await (0, rxjs_1.lastValueFrom)(observer$);
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
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/payment/one/${_id}`);
        const payment = await (0, rxjs_1.lastValueFrom)(observer$);
        return new Payment(payment);
    }
    /**
     * Deletes multiple payments.
  
     * @param credentials - The credentials to delete the payments.
     * @returns A Promise that resolves to a success object.
     */
    static removeMany(credentials) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/payment/delete/many', { credentials });
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Updates a payment.
  
     * @param updatedPayment - The updated payment data.
     * @param paymentRelated - The updated payment related data.
     * @param invoiceRelated - The updated invoice related data.
     * @returns A Promise that resolves to a success object.
     */
    update(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/payment/update', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Deletes a payment.
  
     * @returns A Promise that resolves to a success object.
     */
    remove() {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makeDelete(`/payment/delete/one/${this._id}`);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.Payment = Payment;
//# sourceMappingURL=payment.define.js.map