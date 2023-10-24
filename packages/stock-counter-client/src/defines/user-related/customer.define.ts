import { Iaddress, Icustomer, IdeleteCredentialsLocalUser, Ifilewithdir, Isuccess } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';
import { UserBase } from './userbase.define';

/**
 * Represents a customer entity.
 * @extends UserBase
 */
export class Customer extends UserBase {
  /** An array of address objects. */
  otherAddresses?: Iaddress[];

  /**
   * Creates an instance of Customer.
   * @param {Icustomer} data - The customer data.
   */
  constructor(data: Icustomer) {
    super(data.user as any);
    this.otherAddresses = data.otherAddresses;
  }

  /**
   * Retrieves a list of customers from a specified URL.
   * @static
   * @param {number} [offset=0] - The offset for pagination.
   * @param {number} [limit=0] - The limit for pagination.
   * @returns {Promise<Customer[]>} - An array of Customer instances created from the retrieved customer data.
   */
  static async getCustomers(offset = 0, limit = 0): Promise<Customer[]> {
    const observer$ = StockCounterClient.ehttp.makeGet(`/customer/getall/${offset}/${limit}`);
    const customers = await lastValueFrom(observer$) as Icustomer[];
    return customers.map(val => new Customer(val));
  }

  /**
   * Retrieves a single customer by ID.
   * @static
   * @param {string} id - The customer ID.
   * @returns {Promise<Customer>} - A single Customer instance created from the retrieved customer data.
   */
  static async getOneCustomer(id: string): Promise<Customer> {
    const observer$ = StockCounterClient.ehttp.makeGet(`/customer/getone/${id}`);
    const customer = await lastValueFrom(observer$) as Icustomer;
    return new Customer(customer);
  }

  /**
   * Creates a new customer.
   * @static
   * @param {Icustomer} customer - The customer data to be created.
   * @returns {Promise<Isuccess>} - A success response indicating whether the customer creation was successful.
   */
  static async createCustomer(customer: Icustomer): Promise<Isuccess> {
    const observer$ = StockCounterClient.ehttp.makePost('/customer/create', { customer });
    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Deletes multiple customers.
   * @static
   * @param {IdeleteCredentialsLocalUser[]} credentials - An array of customer credentials.
   * @param {Ifilewithdir[]} filesWithDir - An array of files with directories.
   * @returns {Promise<Isuccess>} - A success response indicating whether the deletion was successful.
   */
  static async deleteCustomers(credentials: IdeleteCredentialsLocalUser[], filesWithDir: Ifilewithdir[]): Promise<Isuccess> {
    const observer$ = StockCounterClient.ehttp.makePut('/customer/deletemany', { credentials, filesWithDir });
    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Updates the current customer instance.
   * @param {Icustomer} vals - The updated customer data.
   * @returns {Promise<Isuccess>} - A success response indicating whether the update was successful.
   */
  async updateCustomer(vals: Icustomer): Promise<Isuccess> {
    const observer$ = StockCounterClient.ehttp.makePut('/customer/update', vals);
    const updated = await lastValueFrom(observer$) as Isuccess;
    if (updated.success) {
      this.otherAddresses = vals.otherAddresses || this.otherAddresses;
    }
    return updated;
  }

  /**
   * Deletes the current customer instance.
   * @param {IdeleteCredentialsLocalUser} credential - The customer credential.
   * @param {Ifilewithdir[]} filesWithDir - An array of files with directories.
   * @returns {Promise<Isuccess>} - A success response indicating whether the deletion was successful.
   */
  async deleteCustomer(credential: IdeleteCredentialsLocalUser, filesWithDir: Ifilewithdir[]): Promise<Isuccess> {
    const observer$ = StockCounterClient.ehttp.makePut('/customer/deleteone', { credential, filesWithDir });
    return await lastValueFrom(observer$) as Isuccess;
  }
}
