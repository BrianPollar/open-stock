/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { lastValueFrom } from 'rxjs';
import { PaymentRelated } from './payment.define';
import { StockCounterClient } from '../stock-counter-client';
/** */
export class Order extends PaymentRelated {
    /** */
    constructor(data) {
        super(data);
        this.price = data.price;
        this.paymentMethod = data.paymentMethod;
        this.deliveryDate = data.deliveryDate;
        this.status = data.status;
    }
    /** */
    static async searchOrders(searchterm, searchKey) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/order/search', { searchterm, searchKey });
        const orders = await lastValueFrom(observer$);
        return orders.map(val => new Order(val));
    }
    /** */
    static async deleteOrders(credentials) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/order/deletemany', { credentials });
        const deleted = await lastValueFrom(observer$);
        return deleted;
    }
    /** */
    static async getOrders(url = 'getall', offset = 0, limit = 0) {
        const observer$ = StockCounterClient.ehttp.makeGet(`/order/${url}/${offset}/${limit}`);
        const orders = await lastValueFrom(observer$);
        return orders.map(val => new Order(val));
    }
    /** */
    static async getOneOrder(id) {
        const observer$ = StockCounterClient.ehttp.makeGet(`/order/getone/${id}`);
        const order = await lastValueFrom(observer$);
        return new Order(order);
    }
    /** */
    static async makeOrder(paymentRelated, invoiceRelated, order, payment, bagainCred, nonce) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/order/makeorder', {
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
    static async createOrder(paymentRelated, invoiceRelated, order, payment, bagainCred, nonce) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/order/create', {
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
    async updateOrder(updatedOrder, paymentRelated, invoiceRelated) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/order/update', { updatedOrder, paymentRelated, invoiceRelated });
        return await lastValueFrom(observer$);
    }
    /** */
    async appendDelivery(status) {
        const observer$ = StockCounterClient.ehttp
            .makePut(`/appendDelivery/${this._id}/${status}`, {});
        return await lastValueFrom(observer$);
    }
}
//# sourceMappingURL=order.define.js.map