import {
  Iaddress,
  Icustomer,
  IdataArrayResponse,
  IdeleteCredentialsLocalUser,
  Ifile,
  IfileMeta,
  IsubscriptionFeatureState,
  Isuccess,
  Iuser
} from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';
import { UserBase } from './userbase.define';

interface IgetOneFilter {
  id?: string;
  userId?: string;
  companyId?: string;
}

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
  static async getCustomers(companyId: string, offset = 0, limit = 20) {
    const observer$ = StockCounterClient.ehttp.makeGet(`/customer/getall/${offset}/${limit}/${companyId}`);
    const customers = await lastValueFrom(observer$) as IdataArrayResponse;

    return {
      count: customers.count,
      customers: customers.data.map(val => new Customer(val as Icustomer))
    };
  }

  /**
   * Retrieves a single customer by ID.
   * @static
   * @param companyId - The ID of the company
   * @param {string} id - The customer ID.
   * @returns {Promise<Customer>} - A single Customer instance created from the retrieved customer data.
   */
  static async getOneCustomer(companyId: string, filter: IgetOneFilter): Promise<Customer> {
    const observer$ = StockCounterClient.ehttp.makePost(`/customer/getone/${companyId}`, filter);
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
  static async createCustomer(companyId: string, vals: {customer: Icustomer; user: Partial<Iuser>}, files?: Ifile[]): Promise<Isuccess> {
    let added: IsubscriptionFeatureState;

    vals.user.userType = 'customer';
    if (files && files[0]) {
      const observer$ = StockCounterClient.ehttp.uploadFiles(files, `/customer/createimg/${companyId}`, vals);

      added = await lastValueFrom(observer$) as IsubscriptionFeatureState;
    } else {
      const observer$ = StockCounterClient.ehttp.makePost(`/customer/create/${companyId}`, vals);

      added = await lastValueFrom(observer$) as IsubscriptionFeatureState;
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
  async updateCustomer(companyId: string, vals: {customer: Icustomer; user: Partial<Iuser>}, files?: Ifile[]): Promise<Isuccess> {
    let updated: Isuccess;

    vals.customer._id = this._id;
    vals.user._id = typeof this.user === 'string' ? this.user : this.user._id;
    if (files && files[0]) {
      const observer$ = StockCounterClient.ehttp.uploadFiles(files, `/customer/updateimg/${companyId}`, vals);

      updated = await lastValueFrom(observer$) as Isuccess;
    } else {
      const observer$ = StockCounterClient.ehttp.makePut(`/customer/update/${companyId}`, vals);

      updated = await lastValueFrom(observer$) as Isuccess;
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
  async deleteCustomer(companyId: string, credential: IdeleteCredentialsLocalUser, filesWithDir: IfileMeta[]): Promise<Isuccess> {
    const observer$ = StockCounterClient.ehttp.makePut(`/customer/deleteone/${companyId}`, { credential, filesWithDir });

    return await lastValueFrom(observer$) as Isuccess;
  }
}
