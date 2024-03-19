"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = exports.PaymentRelated = void 0;
const rxjs_1 = require("rxjs");
const invoice_define_1 = require("./invoice.define");
const stock_counter_client_1 = require("../stock-counter-client");
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
     * @param companyId - The ID of the company
     * @param paymentRelated - The payment related data.
     * @param invoiceRelated - The invoice related data.
     * @param order - The order data.
     * @param payment - The payment data.
     * @param bagainCred - The bagain credential data.
     * @param nonce - The payment nonce.
     * @returns A Promise that resolves to a success object.
     */
    static async createPayment(companyId, paymentRelated, invoiceRelated, order, payment, bagainCred, nonce) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makePost(`/payment/create/${companyId}`, {
            paymentRelated,
            invoiceRelated,
            order,
            payment,
            bagainCred,
            nonce
        });
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Searches for payments.
     * @param companyId - The ID of the company
     * @param searchterm - The search term.
     * @param searchKey - The search key.
     * @returns A Promise that resolves to an array of Payment objects.
     */
    static async searchPayments(companyId, searchterm, searchKey) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makePost(`/payment/search/${companyId}`, { searchterm, searchKey });
        const payments = await (0, rxjs_1.lastValueFrom)(observer$);
        return payments.map(val => new Payment(val));
    }
    /**
     * Retrieves payments.
     * @param companyId - The ID of the company
     * @param url - The URL to retrieve payments from.
     * @param offset - The offset to start retrieving payments from.
     * @param limit - The maximum number of payments to retrieve.
     * @returns A Promise that resolves to an array of Payment objects.
     */
    static async getPayments(companyId, url = 'getall', offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makeGet(`/payment/${url}/${offset}/${limit}/${companyId}`);
        const payments = await (0, rxjs_1.lastValueFrom)(observer$);
        return payments.map(val => new Payment(val));
    }
    /**
     * Retrieves a single payment.
     * @param companyId - The ID of the company
     * @param id - The ID of the payment to retrieve.
     * @returns A Promise that resolves to a Payment object.
     */
    static async getOnePayment(companyId, id) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makeGet(`/payment/getone/${id}/${companyId}`);
        const payment = await (0, rxjs_1.lastValueFrom)(observer$);
        return new Payment(payment);
    }
    /**
     * Deletes multiple payments.
     * @param companyId - The ID of the company
     * @param credentials - The credentials to delete the payments.
     * @returns A Promise that resolves to a success object.
     */
    static async deletePayments(companyId, credentials) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makePut(`/payment/deletemany/${companyId}`, { credentials });
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Updates a payment.
     * @param companyId - The ID of the company
     * @param updatedPayment - The updated payment data.
     * @param paymentRelated - The updated payment related data.
     * @param invoiceRelated - The updated invoice related data.
     * @returns A Promise that resolves to a success object.
     */
    async updatePayment(companyId, updatedPayment, paymentRelated, invoiceRelated) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makePut(`/payment/update/${companyId}`, { updatedPayment, paymentRelated, invoiceRelated });
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Deletes a payment.
     * @param companyId - The ID of the company
     * @returns A Promise that resolves to a success object.
     */
    async deletePayment(companyId) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makeDelete(`/payment/deleteone/${this._id}/${companyId}`);
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.Payment = Payment;
//# sourceMappingURL=payment.define.js.map