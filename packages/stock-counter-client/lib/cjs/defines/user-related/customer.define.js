"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Customer = void 0;
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../../stock-counter-client");
const userbase_define_1 = require("./userbase.define");
class Customer extends userbase_define_1.UserBase {
    constructor(data) {
        super(data);
        this.otherAddresses = data.otherAddresses;
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/customer/all/${offset}/${limit}`);
        const customers = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: customers.count,
            customers: customers.data.map(val => new Customer(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = stock_counter_client_1.StockCounterClient
            .ehttp.makePost('/customer/filter', filter);
        const customers = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: customers.count,
            customers: customers.data.map(val => new Customer(val))
        };
    }
    static async getOne(filter) {
        const observer$ = stock_counter_client_1.StockCounterClient
            .ehttp.makePost('/customer/one', filter);
        const customer = await (0, rxjs_1.lastValueFrom)(observer$);
        return new Customer(customer);
    }
    static async add(vals, files) {
        let added;
        vals.user.userType = 'customer';
        if (files && files[0]) {
            const observer$ = stock_counter_client_1.StockCounterClient.ehttp
                .uploadFiles(files, '/customer/add/img', vals);
            added = await (0, rxjs_1.lastValueFrom)(observer$);
        }
        else {
            const observer$ = stock_counter_client_1.StockCounterClient.ehttp
                .makePost('/customer/add', vals);
            added = await (0, rxjs_1.lastValueFrom)(observer$);
        }
        return added;
    }
    static removeMany(val) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/customer/delete/many', val);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    async update(vals, files) {
        let updated;
        vals.customer._id = this._id;
        vals.user._id = typeof this.user === 'string' ? this.user : this.user._id;
        if (files && files[0]) {
            const observer$ = stock_counter_client_1.StockCounterClient.ehttp
                .uploadFiles(files, '/customer/update/img', vals);
            updated = await (0, rxjs_1.lastValueFrom)(observer$);
        }
        else {
            const observer$ = stock_counter_client_1.StockCounterClient.ehttp
                .makePut('/customer/update', vals);
            updated = await (0, rxjs_1.lastValueFrom)(observer$);
        }
        if (updated.success) {
            this.otherAddresses = vals.customer.otherAddresses || this.otherAddresses;
        }
        return updated;
    }
    remove(val) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/customer/delete/one', val);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.Customer = Customer;
//# sourceMappingURL=customer.define.js.map