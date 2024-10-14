import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';
import { UserBase } from './userbase.define';
export class Customer extends UserBase {
    constructor(data) {
        super(data);
        this.otherAddresses = data.otherAddresses;
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/customer/all/${offset}/${limit}`);
        const customers = await lastValueFrom(observer$);
        return {
            count: customers.count,
            customers: customers.data.map(val => new Customer(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = StockCounterClient
            .ehttp.makePost('/customer/filter', filter);
        const customers = await lastValueFrom(observer$);
        return {
            count: customers.count,
            customers: customers.data.map(val => new Customer(val))
        };
    }
    static async getOne(filter) {
        const observer$ = StockCounterClient
            .ehttp.makePost('/customer/one', filter);
        const customer = await lastValueFrom(observer$);
        return new Customer(customer);
    }
    static async add(vals, files) {
        let added;
        vals.user.userType = 'customer';
        if (files && files[0]) {
            const observer$ = StockCounterClient.ehttp
                .uploadFiles(files, '/customer/add/img', vals);
            added = await lastValueFrom(observer$);
        }
        else {
            const observer$ = StockCounterClient.ehttp
                .makePost('/customer/add', vals);
            added = await lastValueFrom(observer$);
        }
        return added;
    }
    static removeMany(val) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/customer/delete/many', val);
        return lastValueFrom(observer$);
    }
    async update(vals, files) {
        let updated;
        vals.customer._id = this._id;
        vals.user._id = typeof this.user === 'string' ? this.user : this.user._id;
        if (files && files[0]) {
            const observer$ = StockCounterClient.ehttp
                .uploadFiles(files, '/customer/update/img', vals);
            updated = await lastValueFrom(observer$);
        }
        else {
            const observer$ = StockCounterClient.ehttp
                .makePut('/customer/update', vals);
            updated = await lastValueFrom(observer$);
        }
        if (updated.success) {
            this.otherAddresses = vals.customer.otherAddresses || this.otherAddresses;
        }
        return updated;
    }
    remove() {
        const observer$ = StockCounterClient.ehttp
            .makePut('/customer/delete/one', { _id: this._id });
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=customer.define.js.map