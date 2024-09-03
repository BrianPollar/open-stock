import { DatabaseAuto, IdeleteCredentialsInvRel, Iinvoice, IinvoiceRelated, IinvoiceRelatedPdct, Ireceipt, Isuccess, TestimateStage, TinvoiceStatus, TinvoiceType, TreceiptType } from '@open-stock/stock-universal';
/** The  InvoiceRelated  class is a subclass of the  DatabaseAuto  class and represents an invoice-related object. It has properties such as invoice related ID, creation type, estimate ID, invoice ID, billing user, items (an array of invoice-related product objects), billing user ID, billing user photo, stage, status, cost, payment made, tax, balance due, sub total, total, from date, to date, and payments (an array of payment install objects). The class also has methods for retrieving invoice-related objects from the server, adding and deleting invoice payments, and updating invoice payments. */
/**
 * Represents an invoice related to a receipt.
 */
export declare class InvoiceRelated extends DatabaseAuto {
    /** The ID of the invoice related to the receipt. */
    invoiceRelated: string;
    /** The type of invoice creation. */
    creationType: TinvoiceType;
    /** The ID of the estimate. */
    estimateId: number;
    /** The ID of the invoice. */
    invoiceId: number;
    /** The user who is being billed. */
    billingUser: string;
    /** Additional details about the company. */
    extraCompanyDetails: string;
    /** The items included in the invoice. */
    items: IinvoiceRelatedPdct[];
    /** The ID of the user being billed. */
    billingUserId: string;
    /** The photo of the user being billed. */
    billingUserPhoto: string;
    /** The stage of the estimate. */
    stage: TestimateStage;
    /** The status of the invoice. */
    status: TinvoiceStatus;
    /** The cost of the invoice. */
    cost: number;
    /** The amount of payment made on the invoice. */
    paymentMade: number;
    /** The tax amount for the invoice. */
    tax: number;
    /** The balance due on the invoice. */
    balanceDue: number;
    /** The subtotal of the invoice. */
    subTotal: number;
    /** The total amount of the invoice. */
    total: number;
    /** The start date of the invoice. */
    fromDate: Date;
    /** The end date of the invoice. */
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
     * @param companyId - The ID of the company
     * @returns An array of invoice payments.
     */
    static getInvoicePayments(companyId: string): Promise<{
        count: number;
        invoicepays: Receipt[];
    }>;
    /**
     * Gets a single invoice payment.
     * @param companyId - The ID of the company
     * @param urId The ID of the invoice payment.
     * @returns The invoice payment.
     */
    static getOneInvoicePayment(companyId: string, urId: string): Promise<Receipt>;
    /**
     * Adds an invoice payment.
     * @param companyId - The ID of the company
     * @param payment The invoice payment to add.
     * @returns The success status of the operation.
     */
    static addInvoicePayment(companyId: string, payment: Ireceipt): Promise<Isuccess>;
    /**
     * Deletes multiple invoice payments.
     * @param companyId - The ID of the company
     * @param ids The IDs of the invoice payments to delete.
     * @returns The success status of the operation.
     */
    static deleteInvoicePayments(companyId: string, ids: string[]): Promise<Isuccess>;
    /**
     * Updates an invoice payment.
     * @param companyId - The ID of the company
     * @param updatedInvoice The updated invoice.
     * @param invoiceRelated The related invoice.
     * @returns The success status of the operation.
     */
    static updateInvoicePayment(companyId: string, updatedInvoice: Iinvoice, invoiceRelated: IinvoiceRelated): Promise<Isuccess>;
    /**
     * Updates an invoice related to a receipt.
     * @param companyId - The ID of the company
     * @param invoiceRelated The invoice related to the receipt to update.
     * @returns The success status of the operation.
     */
    static updateInvoiceRelated(companyId: string, invoiceRelated: IinvoiceRelated): Promise<Isuccess>;
}
export declare class Receipt extends InvoiceRelated {
    urId: string;
    /** The user's company ID. */
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
     * @param companyId - The ID of the company.
     * @param url - The URL for the API endpoint. Default value is 'getall'.
     * @param offset - The offset for pagination. Default value is 0.
     * @param limit - The limit for pagination. Default value is 0.
     * @returns An array of receipts.
     */
    static getReceipts(companyId: string, url?: string, offset?: number, limit?: number): Promise<{
        count: number;
        receipts: Receipt[];
    }>;
    /**
     * Retrieves a single receipt based on the company ID and user ID.
     * @param companyId - The ID of the company.
     * @param urId - The ID of the user.
     * @returns A Promise that resolves to a new instance of the Receipt class.
     */
    static getOneReceipt(companyId: string, urId: string): Promise<Receipt>;
    /**
     * Adds a receipt to the system.
     * @param companyId - The ID of the company.
     * @param receipt - The receipt object to be added.
     * @param invoiceRelated - The related invoice information.
     * @returns A promise that resolves to the success response.
     */
    static addReceipt(companyId: string, receipt: Ireceipt, invoiceRelated: IinvoiceRelated): Promise<Isuccess>;
    /**
     * Deletes multiple receipts for a given company.
     * @param companyId - The ID of the company.
     * @param credentials - An array of delete credentials for each receipt.
     * @returns A promise that resolves to the success response.
     */
    static deleteReceipts(companyId: string, credentials: IdeleteCredentialsInvRel[]): Promise<Isuccess>;
    /**
     * Updates a receipt.
     * @param companyId - The ID of the company.
     * @param updatedReceipt - The updated receipt object.
     * @param invoiceRelated - The invoice related object.
     * @returns A promise that resolves to the success response.
     */
    updateReciept(companyId: string, updatedReceipt: Ireceipt, invoiceRelated: IinvoiceRelated): Promise<Isuccess>;
}
