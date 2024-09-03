import { IinvoiceRelated, IpaymentRelated, Ireceipt, Isuccess, Iuser, TinvoiceType, TpaymentRelatedType } from '@open-stock/stock-universal';
/**
 * Updates the payment related information.
 * @param paymentRelated - The payment related object to update.
 * @param queryId - The query ID.
 * @returns A promise that resolves to an object containing the success status and the updated payment related ID, if successful.
 */
export declare const updatePaymentRelated: (paymentRelated: Required<IpaymentRelated>, queryId: string) => Promise<Isuccess & {
    id?: string;
}>;
/**
 * Creates or updates a payment-related entity.
 *
 * @param paymentRelated - The payment-related data.
 * @param invoiceRelated - The invoice-related data.
 * @param type - The type of entity ('payment' or 'order').
 * @param extraNotifDesc - Additional notification description.
 * @param queryId - The query ID.
 * @returns A promise that resolves to an object containing the success status and the ID of the created or updated entity.
 */
export declare const relegatePaymentRelatedCreation: (res: any, paymentRelated: Required<IpaymentRelated>, invoiceRelated: Required<IinvoiceRelated>, type: 'payment' | 'order', extraNotifDesc: string, queryId: string) => Promise<Isuccess & {
    id?: string;
}>;
/**
 * Creates a payment related product object.
 * @param paymentRelated - The payment related data.
 * @param invoiceRelated - The invoice related data.
 * @param user - The user data.
 * @param meta - The meta data.
 * @returns The payment related product object.
 */
export declare const makePaymentRelatedPdct: (paymentRelated: Required<IpaymentRelated>, invoiceRelated: Required<IinvoiceRelated>, user: Iuser, meta: any) => {
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
    stage: import("@open-stock/stock-universal").TestimateStage;
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
    updatedAt: any;
    paymentRelated: string;
    urId: string;
    orderDate: Date;
    paymentDate: Date;
    billingAddress: import("@open-stock/stock-universal").Ibilling;
    shippingAddress: import("@open-stock/stock-universal").Iaddress;
    isBurgain: boolean;
    shipping: number;
    manuallyAdded: boolean;
    paymentMethod: import("@open-stock/stock-universal").TpaymentMethod;
};
/**
 * Deletes multiple payment related documents.
 * @param companyId - The ID of the company
   * @param ids - An array of string IDs representing the documents to be deleted.
 * @param queryId - The ID of the company associated with the documents.
 * @returns A Promise that resolves to an object indicating the success of the operation.
 */
export declare const deleteManyPaymentRelated: (ids: string[], queryId: string) => Promise<Isuccess>;
/**
 * Deletes all pay orders linked to a payment or an order.
 * @param paymentRelated - The payment related to the pay orders.
 * @param invoiceRelated - The invoice related to the pay orders.
 * @param creationType - The type of payment related creation.
 * @param where - Specifies whether the pay orders are linked to a payment or an order.
 * @param queryId - The ID of the query.
 */
export declare const deleteAllPayOrderLinked: (paymentRelated: string, invoiceRelated: string, creationType: TpaymentRelatedType, where: 'payment' | 'order', queryId: string) => Promise<void>;
/**
 * Makes a payment installation.
 * @param receipt - The receipt object.
 * @param relatedId - The related ID.
 * @param queryId - The query ID.
 * @returns A promise that resolves to an object indicating the success of the operation.
 */
export declare const makePaymentInstall: (res: any, receipt: Ireceipt, relatedId: string, queryId: string, creationType: TinvoiceType) => Promise<false | Isuccess>;
/**
   * Sends a notification to all users with a due date.
   * @returns A promise that resolves to true if all notifications were sent successfully.
   */
export declare const notifyAllOnDueDate: () => Promise<boolean>;
