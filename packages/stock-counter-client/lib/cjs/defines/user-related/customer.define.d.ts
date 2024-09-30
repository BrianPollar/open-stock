import { Iaddress, Icustomer, IdeleteMany, IdeleteOne, IeditCustomer, Ifile, IfilterProps, IsubscriptionFeatureState, Isuccess } from '@open-stock/stock-universal';
import { UserBase } from './userbase.define';
interface IgetOneFilter {
    _id?: string;
    userId?: string;
    companyId?: string;
}
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
  
     * @param {number} [offset=0] - The offset for pagination.
     * @param {number} [limit=0] - The limit for pagination.
     * @returns {Promise<Customer[]>} - An array of Customer instances created from the retrieved customer data.
     */
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        customers: Customer[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        customers: Customer[];
    }>;
    /**
     * Retrieves a single customer by ID.
     * @static
  
     * @param {string} _id - The customer ID.
     * @returns {Promise<Customer>} - A single Customer instance created from the retrieved customer data.
     */
    static getOne(filter: IgetOneFilter): Promise<Customer>;
    /**
     * Creates a new customer.
     * @static
  
     * @param {Icustomer} customer - The customer data to be created.
     * @returns {Promise<Isuccess>} - A success response indicating whether the customer creation was successful.
     */
    static add(vals: IeditCustomer, files?: Ifile[]): Promise<IsubscriptionFeatureState>;
    /**
     * Deletes multiple customers.
     * @static
  
     * @param {IdeleteCredentialsLocalUser[]} credentials - An array of customer credentials.
     * @param {Ifilewithdir[]} filesWithDir - An array of files with directories.
     * @returns {Promise<Isuccess>} - A success response indicating whether the deletion was successful.
     */
    static removeMany(val: IdeleteMany): Promise<Isuccess>;
    /**
     * Updates the current customer instance.
  
     * @param {Icustomer} vals - The updated customer data.
     * @returns {Promise<Isuccess>} - A success response indicating whether the update was successful.
     */
    update(vals: IeditCustomer, files?: Ifile[]): Promise<Isuccess>;
    /**
     * Deletes the current customer instance.
  
     * @param {IdeleteCredentialsLocalUser} credential - The customer credential.
     * @param {Ifilewithdir[]} filesWithDir - An array of files with directories.
     * @returns {Promise<Isuccess>} - A success response indicating whether the deletion was successful.
     */
    remove(val: IdeleteOne): Promise<Isuccess>;
}
export {};
