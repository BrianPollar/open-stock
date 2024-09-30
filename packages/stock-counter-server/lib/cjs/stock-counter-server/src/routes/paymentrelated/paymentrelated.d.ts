import { IinvoiceRelated, IpaymentRelated, Ireceipt, Isuccess, Iuser, TinvoiceType } from '@open-stock/stock-universal';
/**
 * Updates the payment related information.
 * @param paymentRelated - The payment related object to update.
 * @param companyId - The query ID.
 * @returns A promise that resolves to an object containing
 * the success status and the updated payment related ID, if successful.
 */
export declare const updatePaymentRelated: (paymentRelated: Required<IpaymentRelated>, companyId: string) => Promise<Isuccess & {
    _id?: string;
}>;
/**
 * Creates or updates a payment-related entity.
 *
 * @param paymentRelated - The payment-related data.
 * @param invoiceRelated - The invoice-related data.
 * @param type - The type of entity ('payment' or 'order').
 * @param extraNotifDesc - Additional notification description.
 * @param companyId - The query ID.
 * @returns A promise that resolves to an
 *  object containing the success status and the ID of the created or updated entity.
 */
export declare const relegatePaymentRelatedCreation: (res: any, paymentRelated: Required<IpaymentRelated>, invoiceRelated: Required<IinvoiceRelated>, type: 'payment' | 'order', extraNotifDesc: string, companyId: string) => Promise<Isuccess & {
    _id?: string;
}>;
/**
 * Creates a payment related product object.
 * @param paymentRelated - The payment related data.
 * @param invoiceRelated - The invoice related data.
 * @param user - The user data.
 * @param meta - The meta data.
 * @returns The payment related product object.
 */
export declare const makePaymentRelatedPdct: (paymentRelated: Required<IpaymentRelated>, invoiceRelated: Required<IinvoiceRelated>, user: Iuser, meta: any) => IpaymentRelated;
/**
 * Deletes multiple payment related documents.

   * @param _ids - An array of string IDs representing the documents to be deleted.
 * @param companyId - The ID of the company associated with the documents.
 * @returns A Promise that resolves to an object indicating the success of the operation.
 */
export declare const deleteManyPaymentRelated: (_ids: string[], companyId: string) => Promise<Isuccess>;
/**
 * Deletes all pay orders linked to a payment or an order.
 * @param paymentRelated - The payment related to the pay orders.
 * @param invoiceRelated - The invoice related to the pay orders.
 * @param where - Specifies whether the pay orders are linked to a payment or an order.
 * @param companyId - The ID of the query.
 */
export declare const deleteAllPayOrderLinked: (paymentRelated: string, invoiceRelated: string, where: 'payment' | 'order', companyId: string) => Promise<{
    success: boolean;
}>;
export declare const makePaymentInstall: (res: any, receipt: Ireceipt, relatedId: string, companyId: string, creationType: TinvoiceType) => Promise<false | Isuccess>;
/**
   * Sends a notification to all users with a due date.
   * @returns A promise that resolves to true if all notifications were sent successfully.
   */
export declare const notifyAllOnDueDate: () => Promise<boolean>;
