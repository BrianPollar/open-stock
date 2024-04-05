import { User } from '@open-stock/stock-auth-client';
import { IinvoiceRelated, IpaymentRelated, TinvoiceStatus } from '@open-stock/stock-universal';
import { DeliveryNote } from '../defines/deliverynote.define';
import { Estimate } from '../defines/estimate.define';
import { Faq } from '../defines/faq.define';
import { Invoice } from '../defines/invoice.define';
import { Item } from '../defines/item.define';
import { Order } from '../defines/order.define';
import { Payment } from '../defines/payment.define';
import { Receipt } from '../defines/receipt.define';
/**
 * Transforms a Faq object into either an image source or a name.
 * @param faq The Faq object to transform.
 * @param type The type of transformation to perform: 'img' for image source, 'name' for name.
 * @returns The transformed string value.
 */
export declare const transformFaqToNameOrImage: (faq: Faq, type: 'img' | 'name') => string;
/**
 * Transforms an estimate ID from a number to a string format.
 * @param id - The estimate ID to transform.
 * @returns The transformed estimate ID.
 */
export declare const transformEstimateId: (id: number) => string;
/**
 * Transforms an invoice ID into a formatted string.
 * @param id - The invoice ID to transform.
 * @returns The formatted invoice string.
 */
export declare const transformInvoice: (id: number) => string;
/**
 * Transforms the given ID based on the specified criteria.
 *
 * @param id - The ID to be transformed.
 * @param where - The criteria for the transformation.
 * @returns The transformed ID.
 */
export declare const transformUrId: (id: string, where: string) => string;
/**
 * Creates a payment-related object based on the provided data.
 * @param data - The data object containing order or payment information.
 * @returns The payment-related object.
 */
export declare const makePaymentRelated: (data: Order | Payment) => IpaymentRelated;
/**
 * Creates an invoice-related object based on the provided data.
 * @param data - The data object containing information about the invoice-related entity.
 * @returns An `IinvoiceRelated` object.
 */
export declare const makeInvoiceRelated: (data: DeliveryNote | Estimate | Invoice | Receipt | Order | Payment) => IinvoiceRelated;
/**
 * Function to like an item.
 * @param companyId - The ID of the company.
 * @param currentUser - The current user.
 * @param item - The item to be liked.
 * @returns A promise that resolves to an object indicating the success of the operation.
 */
export declare const likeFn: (companyId: string, currentUser: User, item: Item) => Promise<import("@open-stock/stock-universal").Isuccess | {
    success: boolean;
}> | {
    success: boolean;
};
/**
 * Unlike the item for the current user.
 * @param companyId - The ID of the company.
 * @param currentUser - The current user.
 * @param item - The item to unlike.
 * @returns A promise that resolves to an object indicating the success of the unlike operation.
 */
export declare const unLikeFn: (companyId: string, currentUser: User, item: Item) => Promise<import("@open-stock/stock-universal").Isuccess | {
    success: boolean;
}> | {
    success: boolean;
};
/**
 * Determines whether the given item is liked by the current user.
 *
 * @param item - The item to check.
 * @param currentUser - The current user.
 * @returns A boolean value indicating whether the item is liked by the current user.
 */
export declare const determineLikedFn: (item: Item, currentUser: User) => boolean;
/**
 * Marks the invoice status as a given value.
 * @param companyId - The ID of the company.
 * @param invoice - The invoice object.
 * @param val - The value to set the status to.
 * @returns A promise that resolves when the update is complete.
 */
export declare const markInvStatusAsFn: (companyId: string, invoice: Invoice, val: TinvoiceStatus) => Promise<void>;
/**
 * Deletes an invoice from the list of invoices.
 * @param companyId - The ID of the company.
 * @param id - The ID of the invoice to delete.
 * @param invoices - The array of invoices.
 */
export declare const deleteInvoiceFn: (companyId: string, id: string, invoices: Invoice[]) => Promise<void>;
/**
 * Toggles the selection of an item in an array of selections.
 * If the item is already selected, it will be deselected.
 * If the item is not selected, it will be selected.
 * @param id - The ID of the item to toggle.
 * @param selections - The array of selections.
 */
export declare const toggleSelectionFn: (id: string, selections: string[]) => void;
/**
 * Deletes multiple invoices based on the provided selections.
 * @param companyId - The ID of the company.
 * @param invoices - An array of invoices.
 * @param selections - An array of invoice IDs to be deleted.
 * @returns A promise that resolves to an object indicating the success of the deletion.
 */
export declare const deleteManyInvoicesFn: (companyId: string, invoices: Invoice[], selections: string[]) => Promise<import("@open-stock/stock-universal").Isuccess | {
    success: boolean;
}>;
/**
 * Opens or closes a box based on the provided value.
 * @param val - The value to open or close the box with.
 * @param selectBoxOpen - An array representing the open boxes.
 */
export declare const openBoxFn: (val: any, selectBoxOpen: string[]) => void;
/**
 * Transforms a number into a string with a specified suffix.
 * @param val - The number to be transformed.
 * @param suffix - The suffix to be added to the transformed string.
 * @returns The transformed string with the suffix.
 */
export declare const transformNoInvId: (val: number, suffix: string) => string;
/**
 * Applies a block date select filter to the given data array based on the specified condition.
 * @param data The array of data to filter.
 * @param where The condition to apply the filter.
 * @returns The filtered array of data.
 */
export declare const applyBlockDateSelect: (data: (Estimate | Invoice | DeliveryNote | Receipt | Item)[], where: string) => (Receipt | Invoice | DeliveryNote | Estimate | Item)[];
