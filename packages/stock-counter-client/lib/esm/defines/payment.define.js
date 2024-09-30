import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { InvoiceRelatedWithReceipt } from './invoice.define';
export class PaymentRelated extends InvoiceRelatedWithReceipt {
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
export class Payment extends PaymentRelated {
    constructor(data) {
        super(data);
        this.order = data.order;
    }
    static add(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/payment/add', vals);
        return lastValueFrom(observer$);
    }
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
    static async getOne(_id) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/payment/one/${_id}`);
        const payment = await lastValueFrom(observer$);
        return new Payment(payment);
    }
    static removeMany(credentials) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/payment/delete/many', { credentials });
        return lastValueFrom(observer$);
    }
    update(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/payment/update', vals);
        return lastValueFrom(observer$);
    }
    remove() {
        const observer$ = StockCounterClient.ehttp.makeDelete(`/payment/delete/one/${this._id}`);
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=payment.define.js.map