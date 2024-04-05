"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../stock-counter-client");
const payment_define_1 = require("./payment.define");
/**
 * Represents an order with payment and delivery information.
 * @extends PaymentRelated
 */
class Order extends payment_define_1.PaymentRelated {
    /**
     * Creates a new Order instance.
     * @param data - The data to initialize the order with.
     */
    constructor(data) {
        super(data);
        this.price = data.price;
        this.paymentMethod = data.paymentMethod;
        this.deliveryDate = data.deliveryDate;
        this.status = data.status;
    }
    /**
     * Searches for orders based on a search term and key.
     * @param companyId - The ID of the company
     * @param searchterm - The search term to use.
     * @param searchKey - The search key to use.
     * @returns An array of orders that match the search criteria.
     */
    static async searchOrders(companyId, searchterm, searchKey) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makePost(`/order/search/${companyId}`, { searchterm, searchKey });
        const orders = await (0, rxjs_1.lastValueFrom)(observer$);
        return orders.data.map(val => new Order(val));
    }
    /**
     * Deletes multiple orders.
     * @param companyId - The ID of the company
     * @param credentials - The credentials to use for authentication.
     * @returns An object indicating whether the deletion was successful.
     */
    static async deleteOrders(companyId, credentials) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makePut(`/order/deletemany/${companyId}`, { credentials });
        const deleted = await (0, rxjs_1.lastValueFrom)(observer$);
        return deleted;
    }
    /**
     * Gets a list of orders.
     * @param companyId - The ID of the company
     * @param url - The URL to use for the request.
     * @param offset - The offset to use for pagination.
     * @param limit - The limit to use for pagination.
     * @returns An array of orders.
     */
    static async getOrders(companyId, url = 'getall', offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makeGet(`/order/${url}/${offset}/${limit}/${companyId}`);
        const orders = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: orders.count,
            orders: orders.data.map(val => new Order(val))
        };
    }
    /**
     * Gets a single order by ID.
     * @param companyId - The ID of the company
     * @param id - The ID of the order to get.
     * @returns The order with the specified ID.
     */
    static async getOneOrder(companyId, id) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makeGet(`/order/getone/${id}`);
        const order = await (0, rxjs_1.lastValueFrom)(observer$);
        return new Order(order);
    }
    /**
     * Creates a new order.
     * @param companyId - The ID of the company
     * @param paymentRelated - The payment related information for the order.
     * @param invoiceRelated - The invoice related information for the order.
     * @param order - The order information.
     * @param payment - The payment information.
     * @param bagainCred - The bagain credential information.
     * @param nonce - The nonce to use for the request.
     * @returns An object indicating whether the creation was successful.
     */
    static async makeOrder(companyId, paymentRelated, invoiceRelated, order, payment, bagainCred, nonce) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost(`/order/makeorder/${companyId}`, {
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
     * Creates a new order.
     * @param companyId - The ID of the company
     * @param paymentRelated - The payment related information for the order.
     * @param invoiceRelated - The invoice related information for the order.
     * @param order - The order information.
     * @param payment - The payment information.
     * @param bagainCred - The bagain credential information.
     * @param nonce - The nonce to use for the request.
     * @returns An object indicating whether the creation was successful.
     */
    static async createOrder(companyId, paymentRelated, invoiceRelated, order, payment, bagainCred, nonce) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost(`/order/create/${companyId}`, {
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
     * Updates the order with new information.
     * @param companyId - The ID of the company
     * @param updatedOrder - The updated order information.
     * @param paymentRelated - The updated payment related information.
     * @param invoiceRelated - The updated invoice related information.
     * @returns An object indicating whether the update was successful.
     */
    async updateOrder(companyId, updatedOrder, paymentRelated, invoiceRelated) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut(`/order/update/${companyId}`, { updatedOrder, paymentRelated, invoiceRelated });
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Appends delivery information to the order.
     * @param companyId - The ID of the company
     * @param status - The status to append.
     * @returns An object indicating whether the operation was successful.
     */
    async appendDelivery(companyId, status) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut(`/appendDelivery/${this._id}/${status}`, {});
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.Order = Order;
//# sourceMappingURL=order.define.js.map