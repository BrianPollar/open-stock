import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';
import { UserBase } from './userbase.define';
/**
 * Represents a customer entity.
 * @extends UserBase
 */
export class Customer extends UserBase {
    /**
     * Creates an instance of Customer.
     * @param {Icustomer} data - The customer data.
     */
    constructor(data) {
        super(data);
        this.otherAddresses = data.otherAddresses;
    }
    /**
     * Retrieves a list of customers from a specified URL.
     * @static
  
     * @param {number} [offset=0] - The offset for pagination.
     * @param {number} [limit=0] - The limit for pagination.
     * @returns {Promise<Customer[]>} - An array of Customer instances created from the retrieved customer data.
     */
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
    /**
     * Retrieves a single customer by ID.
     * @static
  
     * @param {string} _id - The customer ID.
     * @returns {Promise<Customer>} - A single Customer instance created from the retrieved customer data.
     */
    static async getOne(filter) {
        const observer$ = StockCounterClient
            .ehttp.makePost('/customer/one', filter);
        const customer = await lastValueFrom(observer$);
        return new Customer(customer);
    }
    /**
     * Creates a new customer.
     * @static
  
     * @param {Icustomer} customer - The customer data to be created.
     * @returns {Promise<Isuccess>} - A success response indicating whether the customer creation was successful.
     */
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
    /**
     * Deletes multiple customers.
     * @static
  
     * @param {IdeleteCredentialsLocalUser[]} credentials - An array of customer credentials.
     * @param {Ifilewithdir[]} filesWithDir - An array of files with directories.
     * @returns {Promise<Isuccess>} - A success response indicating whether the deletion was successful.
     */
    static removeMany(val) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/customer/delete/many', val);
        return lastValueFrom(observer$);
    }
    /**
     * Updates the current customer instance.
  
     * @param {Icustomer} vals - The updated customer data.
     * @returns {Promise<Isuccess>} - A success response indicating whether the update was successful.
     */
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
    /**
     * Deletes the current customer instance.
  
     * @param {IdeleteCredentialsLocalUser} credential - The customer credential.
     * @param {Ifilewithdir[]} filesWithDir - An array of files with directories.
     * @returns {Promise<Isuccess>} - A success response indicating whether the deletion was successful.
     */
    remove(val) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/customer/delete/one', val);
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=customer.define.js.map