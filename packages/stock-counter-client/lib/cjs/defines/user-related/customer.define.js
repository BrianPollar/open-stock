"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Customer = void 0;
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../../stock-counter-client");
const userbase_define_1 = require("./userbase.define");
/**
 * Represents a customer entity.
 * @extends UserBase
 */
class Customer extends userbase_define_1.UserBase {
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
     * @param companyId - The ID of the company
     * @param {number} [offset=0] - The offset for pagination.
     * @param {number} [limit=0] - The limit for pagination.
     * @returns {Promise<Customer[]>} - An array of Customer instances created from the retrieved customer data.
     */
    static async getCustomers(companyId, offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makeGet(`/customer/getall/${offset}/${limit}/${companyId}`);
        const customers = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: customers.count,
            customers: customers.data.map(val => new Customer(val))
        };
    }
    /**
     * Retrieves a single customer by ID.
     * @static
     * @param companyId - The ID of the company
     * @param {string} id - The customer ID.
     * @returns {Promise<Customer>} - A single Customer instance created from the retrieved customer data.
     */
    static async getOneCustomer(filter) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makePost('/customer/getone', filter);
        const customer = await (0, rxjs_1.lastValueFrom)(observer$);
        return new Customer(customer);
    }
    /**
     * Creates a new customer.
     * @static
     * @param companyId - The ID of the company
     * @param {Icustomer} customer - The customer data to be created.
     * @returns {Promise<Isuccess>} - A success response indicating whether the customer creation was successful.
     */
    static async createCustomer(companyId, vals, files) {
        let added;
        vals.user.userType = 'customer';
        if (files && files[0]) {
            const observer$ = stock_counter_client_1.StockCounterClient.ehttp.uploadFiles(files, `/customer/createimg/${companyId}`, vals);
            added = await (0, rxjs_1.lastValueFrom)(observer$);
        }
        else {
            const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makePost(`/customer/create/${companyId}`, vals);
            added = await (0, rxjs_1.lastValueFrom)(observer$);
        }
        return added;
    }
    /**
     * Deletes multiple customers.
     * @static
     * @param companyId - The ID of the company
     * @param {IdeleteCredentialsLocalUser[]} credentials - An array of customer credentials.
     * @param {Ifilewithdir[]} filesWithDir - An array of files with directories.
     * @returns {Promise<Isuccess>} - A success response indicating whether the deletion was successful.
     */
    static async deleteCustomers(companyId, credentials, filesWithDir) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makePut(`/customer/deletemany/${companyId}`, { credentials, filesWithDir });
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Updates the current customer instance.
     * @param companyId - The ID of the company
     * @param {Icustomer} vals - The updated customer data.
     * @returns {Promise<Isuccess>} - A success response indicating whether the update was successful.
     */
    async updateCustomer(companyId, vals, files) {
        let updated;
        vals.customer._id = this._id;
        vals.user._id = typeof this.user === 'string' ? this.user : this.user._id;
        if (files && files[0]) {
            const observer$ = stock_counter_client_1.StockCounterClient.ehttp.uploadFiles(files, `/customer/updateimg/${companyId}`, vals);
            updated = await (0, rxjs_1.lastValueFrom)(observer$);
        }
        else {
            const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makePut(`/customer/update/${companyId}`, vals);
            updated = await (0, rxjs_1.lastValueFrom)(observer$);
        }
        if (updated.success) {
            this.otherAddresses = vals.customer.otherAddresses || this.otherAddresses;
        }
        return updated;
    }
    /**
     * Deletes the current customer instance.
     * @param companyId - The ID of the company
     * @param {IdeleteCredentialsLocalUser} credential - The customer credential.
     * @param {Ifilewithdir[]} filesWithDir - An array of files with directories.
     * @returns {Promise<Isuccess>} - A success response indicating whether the deletion was successful.
     */
    async deleteCustomer(companyId, credential, filesWithDir) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makePut(`/customer/deleteone/${companyId}`, { credential, filesWithDir });
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.Customer = Customer;
//# sourceMappingURL=customer.define.js.map