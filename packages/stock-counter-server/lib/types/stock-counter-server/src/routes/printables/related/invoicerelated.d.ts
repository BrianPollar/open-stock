import { IinvoiceRelated, Ireceipt, Isuccess, Iuser, TestimateStage, TinvoiceType } from '@open-stock/stock-universal';
/**
 * Updates the payments related to an invoice.
 *
 * @param payment - The payment object to be added.
 * @param queryId - The ID of the company.
 * @returns A promise that resolves to an object containing the success status and the ID of the saved payment.
 */
export declare const updateInvoiceRelatedPayments: (payment: Ireceipt, queryId: string) => Promise<Isuccess & {
    id?: string;
}>;
/**
 * Updates an invoice related document.
 * @param invoiceRelated - The updated invoice related document.
 * @returns A promise that resolves with a success status and an optional ID.
 */
/**
 * Updates the invoice related information.
 * @param invoiceRelated - The updated invoice related data.
 * @param queryId - The query ID.
 * @returns A promise that resolves to an object containing the success status and the updated invoice related ID.
 */
export declare const updateInvoiceRelated: (invoiceRelated: Required<IinvoiceRelated>, queryId: string) => Promise<Isuccess & {
    id?: string;
}>;
/**
 * Relocates an invoice related document.
 * @param invoiceRelated - The invoice related document to relocate.
 * @param extraNotifDesc - A description for the notification.
 * @param localMailHandler - The email handler to use for sending notifications.
 * @param bypassNotif - Whether to bypass sending notifications.
 * @returns A promise that resolves with a success status and an optional ID.
 */
export declare const relegateInvRelatedCreation: (invoiceRelated: Required<IinvoiceRelated>, queryId: string, extraNotifDesc: string, bypassNotif?: boolean) => Promise<Isuccess & {
    id?: string;
}>;
/**
 * Creates an invoice related product based on the provided data.
 * @param invoiceRelated - The required invoice related data.
 * @param user - The user data.
 * @param createdAt - The optional creation date.
 * @param extras - Additional properties to include in the invoice related product.
 * @returns The created invoice related product.
 */
export declare const makeInvoiceRelatedPdct: (invoiceRelated: Required<IinvoiceRelated>, user: Iuser, createdAt?: Date, extras?: {}) => {
    companyId: string;
    invoiceRelated: string;
    creationType: TinvoiceType;
    invoiceId: number;
    estimateId: number;
    billingUser: string;
    extraCompanyDetails: string;
    items: import("@open-stock/stock-universal").IinvoiceRelatedPdct[];
    billingUserId: string;
    stage: TestimateStage;
    fromDate: Date;
    toDate: Date;
    status: import("@open-stock/stock-universal").TinvoiceStatus;
    cost: number;
    tax: number;
    balanceDue: number;
    subTotal: number;
    total: number;
    billingUserPhoto: string | import("@open-stock/stock-universal").IfileMeta;
    createdAt: Date;
    payments: string[] | Ireceipt[];
};
/**
 * Deletes multiple invoice-related documents.
 * @param companyId - The ID of the company
   * @param ids - An array of string IDs representing the documents to be deleted.
 * @param queryId - The ID of the company associated with the documents.
 * @returns A promise that resolves to an object indicating the success status and any error information.
 */
export declare const deleteManyInvoiceRelated: (ids: string[], queryId: string) => Promise<{
    success: boolean;
    statu: number;
    err: string;
    status?: undefined;
} | {
    success: boolean;
    status: number;
    statu?: undefined;
    err?: undefined;
} | {
    success: boolean;
    status: number;
    err: string;
    statu?: undefined;
}>;
/**
 * Deletes all linked documents based on the provided parameters.
 *
 * @param invoiceRelated - The identifier of the related invoice.
 * @param creationType - The type of creation (solo, chained, halfChained).
 * @param stage - The current stage of the document.
 * @param from - The previous stage of the document.
 * @param queryId - The identifier of the query.
 * @returns A promise that resolves to an object indicating the success of the deletion operation.
 */
export declare const deleteAllLinked: (invoiceRelated: string, creationType: TinvoiceType, stage: TestimateStage, from: TestimateStage, queryId: string) => Promise<Isuccess>;
