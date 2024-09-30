"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../stock-counter-client");
const payment_define_1 = require("./payment.define");
class Order extends payment_define_1.PaymentRelated {
    constructor(data) {
        super(data);
        this.price = data.price;
        this.paymentMethod = data.paymentMethod;
        this.deliveryDate = data.deliveryDate;
        this.status = data.status;
    }
    static async removeMany(credentials) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/order/delete/many', { credentials });
        const deleted = await (0, rxjs_1.lastValueFrom)(observer$);
        return deleted;
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/order/all/${offset}/${limit}`);
        const orders = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: orders.count,
            orders: orders.data.map(val => new Order(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/order/filter', filter);
        const orders = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: orders.count,
            orders: orders.data.map(val => new Order(val))
        };
    }
    static async getOne(_id) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/order/one/${_id}`);
        const order = await (0, rxjs_1.lastValueFrom)(observer$);
        return new Order(order);
    }
    static directOrder(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/order/makeorder', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    static add(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/order/add', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    update(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/order/update', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    updateDeliveryStatus(status) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut(`/appendDelivery/${this._id}/${status}`, {});
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.Order = Order;
//# sourceMappingURL=order.define.js.map