/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { lastValueFrom } from 'rxjs';
import { InvoiceRelatedWithReceipt } from './invoice.define';
import { StockCounterClient } from '../stock-counter-client';
/** */
export class PaymentRelated extends InvoiceRelatedWithReceipt {
    constructor(data) {
        super(data);
        this.urId = data.urId;
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
/** */
export class Payment extends PaymentRelated {
    /** */ constructor(data) {
        super(data);
        this.order = data.order;
    }
    // Braintree shit
    /** */
    static async getBrainTreeToken() {
        const observer$ = StockCounterClient.ehttp
            .makePost('/payment/braintreeclenttoken', {});
        const token = await lastValueFrom(observer$);
        return token.token;
    }
    /** */
    static async createPayment(paymentRelated, invoiceRelated, order, payment, bagainCred, nonce) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/payment/create', {
            paymentRelated,
            invoiceRelated,
            order,
            payment,
            bagainCred,
            nonce
        });
        return await lastValueFrom(observer$);
    }
    /** */
    static async searchPayments(searchterm, searchKey) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/payment/search', { searchterm, searchKey });
        const payments = await lastValueFrom(observer$);
        return payments.map(val => new Payment(val));
    }
    /** */
    static async getPayments(url = 'getall', offset = 0, limit = 0) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/payment/${url}/${offset}/${limit}`);
        const payments = await lastValueFrom(observer$);
        return payments.map(val => new Payment(val));
    }
    /** */
    static async getOnePayment(id) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/payment/getone/${id}`);
        const payment = await lastValueFrom(observer$);
        return new Payment(payment);
    }
    /** */
    static async deletePayments(credentials) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/payment/deletemany', { credentials });
        return await lastValueFrom(observer$);
    }
    /** */
    async updatePayment(updatedPayment, paymentRelated, invoiceRelated) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/payment/update', { updatedPayment, paymentRelated, invoiceRelated });
        return await lastValueFrom(observer$);
    }
    /** */
    async deletePayment() {
        const observer$ = StockCounterClient.ehttp
            .makeDelete(`/payment/deleteone/${this._id}`);
        return await lastValueFrom(observer$);
    }
}
//# sourceMappingURL=payment.define.js.map