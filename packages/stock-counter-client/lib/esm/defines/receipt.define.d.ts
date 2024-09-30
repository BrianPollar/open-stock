import { DatabaseAuto, IdeleteMany, IeditReceipt, IfilterProps, IinvoiceRelated, IinvoiceRelatedPdct, Ireceipt, Isuccess, IupdateInvoicePayment, TestimateStage, TinvoiceStatus, TinvoiceType, TreceiptType } from '@open-stock/stock-universal';
export declare class InvoiceRelated extends DatabaseAuto {
    invoiceRelated: string;
    creationType: TinvoiceType;
    estimateId: number;
    invoiceId: number;
    billingUser: string;
    extraCompanyDetails: string;
    items: IinvoiceRelatedPdct[];
    billingUserId: string;
    billingUserPhoto: string;
    stage: TestimateStage;
    status: TinvoiceStatus;
    cost: number;
    paymentMade: number;
    tax: number;
    balanceDue: number;
    subTotal: number;
    total: number;
    fromDate: Date;
    toDate: Date;
    ecommerceSale: boolean;
    ecommerceSalePercentage: number;
    readonly currency: string;
    /**
     * Creates a new instance of the InvoiceRelated class.
     * @param data The data to initialize the instance with.
     */
    constructor(data: Required<IinvoiceRelated>);
    /**
     * Gets all invoice payments.
  
     * @returns An array of invoice payments.
     */
    static getInvoicePayments(): Promise<{
        count: number;
        invoicepays: Receipt[];
    }>;
    /**
     * Gets a single invoice payment.
  
     * @param urId The ID of the invoice payment.
     * @returns The invoice payment.
     */
    static getOneInvoicePayment(urId: string): Promise<Receipt>;
    /**
     * Adds an invoice payment.
  
     * @param payment The invoice payment to add.
     * @returns The success status of the operation.
     */
    static addInvoicePayment(payment: Ireceipt): Promise<Isuccess>;
    /**
     * Deletes multiple invoice payments.
  
     * @param _ids The IDs of the invoice payments to delete.
     * @returns The success status of the operation.
     */
    static deleteInvoicePayments(_ids: string[]): Promise<Isuccess>;
    /**
     * Updates an invoice payment.
  
     * @param updatedInvoice The updated invoice.
     * @param invoiceRelated The related invoice.
     * @returns The success status of the operation.
     */
    static updateInvoicePayment(vals: IupdateInvoicePayment): Promise<Isuccess>;
    /**
     * Updates an invoice related to a receipt.
  
     * @param invoiceRelated The invoice related to the receipt to update.
     * @returns The success status of the operation.
     */
    static updateInvoiceRelated(invoiceRelated: IinvoiceRelated): Promise<Isuccess>;
}
export declare class Receipt extends InvoiceRelated {
    urId: string;
    companyId: string;
    ammountRcievd: number;
    paymentMode: string;
    type: TreceiptType;
    paymentInstall: string;
    date: Date;
    amount: number;
    /**
     * Constructs a new Receipt object.
     * @param data - The required data for the Receipt.
     */
    constructor(data: Required<Ireceipt>);
    /**
     * Retrieves receipts for a specific company.
     .
     * @param url - The URL for the API endpoint. Default value is 'getall'.
     * @param offset - The offset for pagination. Default value is 0.
     * @param limit - The limit for pagination. Default value is 0.
     * @returns An array of receipts.
     */
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        receipts: Receipt[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        receipts: Receipt[];
    }>;
    /**
     * Retrieves a single receipt based on the company ID and user ID.
     .
     * @param urId - The ID of the user.
     * @returns A Promise that resolves to a new instance of the Receipt class.
     */
    static getOne(urId: string): Promise<Receipt>;
    /**
     * Adds a receipt to the system.
     .
     * @param receipt - The receipt object to be added.
     * @param invoiceRelated - The related invoice information.
     * @returns A promise that resolves to the success response.
     */
    static add(vals: IeditReceipt): Promise<Isuccess>;
    /**
     * Deletes multiple receipts for a given company.
     .
     * @param credentials - An array of delete credentials for each receipt.
     * @returns A promise that resolves to the success response.
     */
    static removeMany(val: IdeleteMany): Promise<Isuccess>;
    /**
     * Updates a receipt.
     .
     * @param updatedReceipt - The updated receipt object.
     * @param invoiceRelated - The invoice related object.
     * @returns A promise that resolves to the success response.
     */
    update(vals: IeditReceipt): Promise<Isuccess>;
}
