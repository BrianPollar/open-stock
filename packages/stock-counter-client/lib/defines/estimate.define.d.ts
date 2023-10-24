import { IdeleteCredentialsInvRel, Iestimate, IinvoiceRelated, Isuccess } from '@open-stock/stock-universal';
import { InvoiceRelatedWithReceipt } from './invoice.define';
/** The  Estimate  class extends the  InvoiceRelated  class and adds two additional properties:  fromDate  and  toDate . It also has a constructor that initializes the class properties based on the provided data. */
export declare class Estimate extends InvoiceRelatedWithReceipt {
    fromDate: Date;
    toDate: Date;
    constructor(data: Required<Iestimate>);
    /** The  getEstimates  static method retrieves estimates from the server by making a GET request to the specified URL with optional offset and limit parameters. It returns an array of  Estimate  objects. */
    static getEstimates(url?: string, offset?: number, limit?: number): Promise<Estimate[]>;
    /** The  getOneEstimate  static method retrieves a single estimate by its ID from the server by making a GET request. It returns a single  Estimate  object.*/
    static getOneEstimate(estimateId: number): Promise<Estimate>;
    /** The  addEstimate  static method adds a new estimate to the server by making a POST request with the estimate and invoice related data. It returns a success message. */
    static addEstimate(estimate: Iestimate, invoiceRelated: IinvoiceRelated): Promise<Isuccess>;
    /** The  deleteEstimates  static method deletes multiple estimates from the server by making a PUT request with an array of delete credentials. It returns a success message. */
    static deleteEstimates(credentials: IdeleteCredentialsInvRel[]): Promise<Isuccess>;
    /** The  updateEstimatePdt  method updates the items of an existing estimate on the server by making a PUT request with the updated items and the estimate's ID. It returns a success message. */
    updateEstimatePdt(vals: IinvoiceRelated): Promise<Isuccess>;
}
