import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { PaymentRelated } from './payment.define';
export class Order extends PaymentRelated {
    constructor(data) {
        super(data);
        this.price = data.price;
        this.paymentMethod = data.paymentMethod;
        this.deliveryDate = data.deliveryDate;
        this.status = data.status;
        this.orderStatus = data.orderStatus;
    }
    static async removeMany(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/order/delete/many', vals);
        const deleted = await lastValueFrom(observer$);
        return deleted;
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/order/all/${offset}/${limit}`);
        const orders = await lastValueFrom(observer$);
        return {
            count: orders.count,
            orders: orders.data.map(val => new Order(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/order/filter', filter);
        const orders = await lastValueFrom(observer$);
        return {
            count: orders.count,
            orders: orders.data.map(val => new Order(val))
        };
    }
    static async getOne(id) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/order/one/${id}`);
        const order = await lastValueFrom(observer$);
        return new Order(order);
    }
    static directOrder(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/order/makeorder', vals);
        return lastValueFrom(observer$);
    }
    static add(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/order/add', vals);
        return lastValueFrom(observer$);
    }
    update(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/order/update', vals);
        return lastValueFrom(observer$);
    }
    updateDeliveryStatus(status) {
        const observer$ = StockCounterClient.ehttp
            .makePut(`/order/appendDelivery/${this._id}/${status}`, {});
        return lastValueFrom(observer$);
    }
    remove() {
        const observer$ = StockCounterClient.ehttp
            .makeDelete(`/order/delete/one/${this._id}`);
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=order.define.js.map