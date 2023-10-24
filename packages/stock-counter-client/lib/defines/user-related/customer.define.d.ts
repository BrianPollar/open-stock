import { Iaddress, Icustomer, IdeleteCredentialsLocalUser, Ifilewithdir, Isuccess } from '@open-stock/stock-universal';
import { UserBase } from './userbase.define';
/** Customer  class: This class extends the  UserBase  class and represents a customer entity. It has an optional property  otherAddresses  which is an array of address objects. */
export declare class Customer extends UserBase {
    otherAddresses?: Iaddress[];
    /** Constructor: The constructor function takes a parameter  data  of type  Icustomer  (interface not provided) and calls the parent class constructor ( super(data) ) to initialize the inherited properties. It then assigns the  otherAddresses  property from the  data  parameter to the class instance.  */
    constructor(data: Icustomer);
    /** getCustomers  static method: This method makes an HTTP GET request to retrieve a list of customers from a specified URL. It accepts optional parameters  url ,  offset , and  limit  which determine the endpoint URL and pagination options. The method returns an array of  Customer  instances created from the retrieved customer data. */
    static getCustomers(offset?: number, limit?: number): Promise<Customer[]>;
    /** getOneCustomer  static method: This method makes an HTTP GET request to retrieve a single customer by ID. It accepts a parameter  id  which represents the customer ID. The method returns a single  Customer  instance created from the retrieved customer data. */
    static getOneCustomer(id: string): Promise<Customer>;
    /** createCustomer  static method: This method makes an HTTP POST request to create a new customer. It accepts a parameter  customer  of type  Icustomer  which represents the customer data to be created. The method returns a success response indicating whether the customer creation was successful. */
    static createCustomer(customer: Icustomer): Promise<Isuccess>;
    /** deleteCustomers  static method: This method makes an HTTP PUT request to delete multiple customers. It accepts a parameter  ids  which is an array of customer IDs to be deleted. The method returns a success response indicating whether the deletion was successful. */
    static deleteCustomers(credentials: IdeleteCredentialsLocalUser[], filesWithDir: Ifilewithdir[]): Promise<Isuccess>;
    /** updateCustomer  method: This method makes an HTTP PUT request to update the current customer instance. It accepts a parameter  vals  of type  Icustomer  which represents the updated customer data. The method returns a success response indicating whether the update was successful. If the update is successful, the  otherAddresses  property of the current instance is updated with the new values.*/
    updateCustomer(vals: Icustomer): Promise<Isuccess>;
    /** deleteCustomer  method: This method makes an HTTP DELETE request to delete the current customer instance. It does not accept any parameters. The method returns a success response indicating whether the deletion was successful. */
    deleteCustomer(credential: IdeleteCredentialsLocalUser, filesWithDir: Ifilewithdir[]): Promise<Isuccess>;
}
