import { Iaddress, Icustomer, IdeleteCredentialsLocalUser, IfileMeta, Isuccess } from '@open-stock/stock-universal';
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
  static async getCustomers(companyId: string, offset = 0, limit = 20): Promise<Customer[]> {
    const observer$ = StockCounterClient.ehttp.makeGet(`/customer/getall/${offset}/${limit}/${companyId}`);
    const customers = await lastValueFrom(observer$) as Icustomer[];
    return customers.map(val => new Customer(val));
  }

  /**
   * Retrieves a single customer by ID.
   * @static
   * @param companyId - The ID of the company
   * @param {string} id - The customer ID.
   * @returns {Promise<Customer>} - A single Customer instance created from the retrieved customer data.
   */
  static async getOneCustomer(companyId: string, id: string): Promise<Customer> {
    const observer$ = StockCounterClient.ehttp.makeGet(`/customer/getone/${id}`);
    const customer = await lastValueFrom(observer$) as Icustomer;
    return new Customer(customer);
  }

  /**
   * Creates a new customer.
   * @static
   * @param companyId - The ID of the company
   * @param {Icustomer} customer - The customer data to be created.
   * @returns {Promise<Isuccess>} - A success response indicating whether the customer creation was successful.
   */
  static async createCustomer(companyId: string, customer: Icustomer): Promise<Isuccess> {
    const observer$ = StockCounterClient.ehttp.makePost(`/customer/create/${companyId}`, { customer });
    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Deletes multiple customers.
   * @static
   * @param companyId - The ID of the company
   * @param {IdeleteCredentialsLocalUser[]} credentials - An array of customer credentials.
   * @param {Ifilewithdir[]} filesWithDir - An array of files with directories.
   * @returns {Promise<Isuccess>} - A success response indicating whether the deletion was successful.
   */
  static async deleteCustomers(companyId: string, credentials: IdeleteCredentialsLocalUser[], filesWithDir: IfileMeta[]): Promise<Isuccess> {
    const observer$ = StockCounterClient.ehttp.makePut(`/customer/deletemany/${companyId}`, { credentials, filesWithDir });
    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Updates the current customer instance.
   * @param companyId - The ID of the company
   * @param {Icustomer} vals - The updated customer data.
   * @returns {Promise<Isuccess>} - A success response indicating whether the update was successful.
   */
  async updateCustomer(companyId: string, vals: Icustomer): Promise<Isuccess> {
    const observer$ = StockCounterClient.ehttp.makePut(`/customer/update/${companyId}`, vals);
    const updated = await lastValueFrom(observer$) as Isuccess;
    if (updated.success) {
      this.otherAddresses = vals.otherAddresses || this.otherAddresses;
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
  async deleteCustomer(companyId: string, credential: IdeleteCredentialsLocalUser, filesWithDir: IfileMeta[]): Promise<Isuccess> {
    const observer$ = StockCounterClient.ehttp.makePut(`/customer/deleteone/${companyId}`, { credential, filesWithDir });
    return await lastValueFrom(observer$) as Isuccess;
  }
}
