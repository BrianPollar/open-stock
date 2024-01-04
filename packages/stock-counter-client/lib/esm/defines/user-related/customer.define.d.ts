import { Iaddress, Icustomer, IdeleteCredentialsLocalUser, IfileMeta, Isuccess } from '@open-stock/stock-universal';
import { UserBase } from './userbase.define';
/**
 * Represents a customer entity.
 * @extends UserBase
 */
export declare class Customer extends UserBase {
    /** An array of address objects. */
    otherAddresses?: Iaddress[];
    /**
     * Creates an instance of Customer.
     * @param {Icustomer} data - The customer data.
     */
    constructor(data: Icustomer);
    /**
     * Retrieves a list of customers from a specified URL.
     * @static
     * @param companyId - The ID of the company
     * @param {number} [offset=0] - The offset for pagination.
     * @param {number} [limit=0] - The limit for pagination.
     * @returns {Promise<Customer[]>} - An array of Customer instances created from the retrieved customer data.
     */
    static getCustomers(companyId: string, offset?: number, limit?: number): Promise<Customer[]>;
    /**
     * Retrieves a single customer by ID.
     * @static
     * @param companyId - The ID of the company
     * @param {string} id - The customer ID.
     * @returns {Promise<Customer>} - A single Customer instance created from the retrieved customer data.
     */
    static getOneCustomer(companyId: string, id: string): Promise<Customer>;
    /**
     * Creates a new customer.
     * @static
     * @param companyId - The ID of the company
     * @param {Icustomer} customer - The customer data to be created.
     * @returns {Promise<Isuccess>} - A success response indicating whether the customer creation was successful.
     */
    static createCustomer(companyId: string, customer: Icustomer): Promise<Isuccess>;
    /**
     * Deletes multiple customers.
     * @static
     * @param companyId - The ID of the company
     * @param {IdeleteCredentialsLocalUser[]} credentials - An array of customer credentials.
     * @param {Ifilewithdir[]} filesWithDir - An array of files with directories.
     * @returns {Promise<Isuccess>} - A success response indicating whether the deletion was successful.
     */
    static deleteCustomers(companyId: string, credentials: IdeleteCredentialsLocalUser[], filesWithDir: IfileMeta[]): Promise<Isuccess>;
    /**
     * Updates the current customer instance.
     * @param companyId - The ID of the company
     * @param {Icustomer} vals - The updated customer data.
     * @returns {Promise<Isuccess>} - A success response indicating whether the update was successful.
     */
    updateCustomer(companyId: string, vals: Icustomer): Promise<Isuccess>;
    /**
     * Deletes the current customer instance.
     * @param companyId - The ID of the company
     * @param {IdeleteCredentialsLocalUser} credential - The customer credential.
     * @param {Ifilewithdir[]} filesWithDir - An array of files with directories.
     * @returns {Promise<Isuccess>} - A success response indicating whether the deletion was successful.
     */
    deleteCustomer(companyId: string, credential: IdeleteCredentialsLocalUser, filesWithDir: IfileMeta[]): Promise<Isuccess>;
}
