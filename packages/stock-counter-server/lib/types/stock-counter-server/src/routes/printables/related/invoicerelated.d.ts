import { IinvoiceRelated, Ireceipt, Isuccess, Iuser, TestimateStage } from '@open-stock/stock-universal';
/**
 * Updates the payments related to an invoice.
 *
 * @param payment - The payment object to be added.
 * @param companyId - The ID of the company.
 * @returns A promise that resolves to an object containing the success status and the ID of the saved payment.
 */
export declare const updateInvoiceRelatedPayments: (payment: Ireceipt) => Promise<Isuccess & {
    _id?: string;
}>;
export declare const updateInvoiceRelated: (res: any, invoiceRelated: Required<IinvoiceRelated>) => Promise<Isuccess & {
    _id?: string;
}>;
export declare const relegateInvRelatedCreation: (res: any, invoiceRelated: Required<IinvoiceRelated>, companyId: string, extraNotifDesc: string, bypassNotif?: boolean) => Promise<Isuccess & {
    _id?: string;
}>;
export declare const makeInvoiceRelatedPdct: (invoiceRelated: Required<IinvoiceRelated>, user: Iuser, createdAt?: Date, extras?: object) => IinvoiceRelated;
export declare const deleteManyInvoiceRelated: (_ids: string[], companyId: string) => Promise<{
    success: boolean;
    status: number;
    err: string;
} | {
    success: boolean;
    statu: number;
    err: string;
}>;
/**
 * Deletes all linked documents based on the provided parameters.
 *
 * @param invoiceRelated - The identifier of the related invoice.
 * @param from - The previous stage of the document.
 * @param companyId - The identifier of the query.
 * @returns A promise that resolves to an object indicating the success of the deletion operation.
 */
export declare const deleteAllLinked: (invoiceRelated: string, from: TestimateStage, companyId: string) => Promise<Isuccess>;
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
