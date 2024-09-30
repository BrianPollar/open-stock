"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = exports.PaymentRelated = void 0;
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../stock-counter-client");
const invoice_define_1 = require("./invoice.define");
class PaymentRelated extends invoice_define_1.InvoiceRelatedWithReceipt {
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
class Payment extends PaymentRelated {
    constructor(data) {
        super(data);
        this.order = data.order;
    }
    static add(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/payment/add', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
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
    static async getOne(_id) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/payment/one/${_id}`);
        const payment = await (0, rxjs_1.lastValueFrom)(observer$);
        return new Payment(payment);
    }
    static removeMany(credentials) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/payment/delete/many', { credentials });
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    update(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/payment/update', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    remove() {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makeDelete(`/payment/delete/one/${this._id}`);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.Payment = Payment;
//# sourceMappingURL=payment.define.js.map