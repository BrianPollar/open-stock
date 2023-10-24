import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';
import { UserBase } from './userbase.define';
/** Customer  class: This class extends the  UserBase  class and represents a customer entity. It has an optional property  otherAddresses  which is an array of address objects. */
export class Customer extends UserBase {
    /** Constructor: The constructor function takes a parameter  data  of type  Icustomer  (interface not provided) and calls the parent class constructor ( super(data) ) to initialize the inherited properties. It then assigns the  otherAddresses  property from the  data  parameter to the class instance.  */
    constructor(data) {
        super(data);
        this.otherAddresses = data.otherAddresses;
    }
    /** getCustomers  static method: This method makes an HTTP GET request to retrieve a list of customers from a specified URL. It accepts optional parameters  url ,  offset , and  limit  which determine the endpoint URL and pagination options. The method returns an array of  Customer  instances created from the retrieved customer data. */
    static async getCustomers(offset = 0, limit = 0) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/customer/getall/${offset}/${limit}`);
        const customers = await lastValueFrom(observer$);
        return customers.map(val => new Customer(val));
    }
    /** getOneCustomer  static method: This method makes an HTTP GET request to retrieve a single customer by ID. It accepts a parameter  id  which represents the customer ID. The method returns a single  Customer  instance created from the retrieved customer data. */
    static async getOneCustomer(id) {
        const observer$ = StockCounterClient.ehttp.makeGet(`/customer/getone/${id}`);
        const customer = await lastValueFrom(observer$);
        return new Customer(customer);
    }
    /** createCustomer  static method: This method makes an HTTP POST request to create a new customer. It accepts a parameter  customer  of type  Icustomer  which represents the customer data to be created. The method returns a success response indicating whether the customer creation was successful. */
    static async createCustomer(customer) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/customer/create', {
            customer
        });
        return await lastValueFrom(observer$);
    }
    /** deleteCustomers  static method: This method makes an HTTP PUT request to delete multiple customers. It accepts a parameter  ids  which is an array of customer IDs to be deleted. The method returns a success response indicating whether the deletion was successful. */
    static async deleteCustomers(credentials, filesWithDir) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/customer/deletemany', { credentials, filesWithDir });
        return await lastValueFrom(observer$);
    }
    /** updateCustomer  method: This method makes an HTTP PUT request to update the current customer instance. It accepts a parameter  vals  of type  Icustomer  which represents the updated customer data. The method returns a success response indicating whether the update was successful. If the update is successful, the  otherAddresses  property of the current instance is updated with the new values.*/
    async updateCustomer(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/customer/update', vals);
        const updated = await lastValueFrom(observer$);
        if (updated.success) {
            this.otherAddresses = vals.otherAddresses || this.otherAddresses;
        }
        return updated;
    }
    /** deleteCustomer  method: This method makes an HTTP DELETE request to delete the current customer instance. It does not accept any parameters. The method returns a success response indicating whether the deletion was successful. */
    async deleteCustomer(credential, filesWithDir) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/customer/deleteone', { credential, filesWithDir });
        return await lastValueFrom(observer$);
    }
}
//# sourceMappingURL=customer.define.js.map