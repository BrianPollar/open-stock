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
export declare const updateInvoiceRelated: (res: any, invoiceRelated: Required<IinvoiceRelated>, queryId: string) => Promise<Isuccess & {
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
export declare const relegateInvRelatedCreation: (res: any, invoiceRelated: Required<IinvoiceRelated>, queryId: string, extraNotifDesc: string, bypassNotif?: boolean) => Promise<Isuccess & {
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
    _id: string;
    companyId: string;
    invoiceRelated: string;
    creationType: TinvoiceType;
    invoiceId: number;
    estimateId: number;
    billingUser: string;
    extraCompanyDetails: string;
    items: (import("@open-stock/stock-universal").IinvoiceRelatedPdct | {
        amount: number;
        quantity: number;
        rate: number;
        itemName: string;
        item: string;
    })[];
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
    ecommerceSale: boolean;
    ecommerceSalePercentage: number;
    currency: string;
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
/**
   * Updates the inventory of items in the invoice related document.
   * If the invoice related document is not found, or if any of the items
   * in the document do not have enough stock, the function returns false.
   * Otherwise it returns true.
   * @param related - The ID of the invoice related document to update,
   *                  or the document itself.
   * @returns A boolean indicating whether the update was successful.
   */
export declare const updateItemsInventory: (related: string | IinvoiceRelated) => Promise<boolean>;
/**
   * Checks if the invoice related with the given ID has received enough payments to
   * be marked as paid.
   * @param relatedId - The ID of the invoice related document to check.
   * @returns A boolean indicating whether the invoice related has enough payments.
   */
export declare const canMakeReceipt: (relatedId: string) => Promise<boolean>;
/**
   * Calculates the total amount of all payments in a given array of payment IDs.
   *
   * @param payments - An array of payment IDs.
   * @returns A promise that resolves to the total amount of all payments.
   */
export declare const getPaymentsTotal: (payments: string[]) => Promise<number>;
/**
   * Updates the amountDue of a user by the given amount
   * @param userId - The ID of the user to update
   * @param amount - The amount to update the user's amountDue by
   * @param reduce - If true then the amountDue is reduced by the given amount, else it is increased
   * @returns A promise that resolves to a boolean indicating the success of the operation
   */
export declare const updateCustomerDueAmount: (userId: string, amount: number, reduce: boolean) => Promise<boolean>;
/**
   * Transforms an invoice related object on status change.
   *
   * @param oldRelated - The old invoice related object.
   * @param newRelated - The new invoice related object.
   * @returns The transformed new invoice related object.
   */
export declare const transFormInvoiceRelatedOnStatus: (oldRelated: IinvoiceRelated, newRelated: IinvoiceRelated) => Required<IinvoiceRelated>;
