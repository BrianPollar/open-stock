import { IdeleteCredentialsInvRel, Iinvoice, IinvoiceRelated, IpaymentRelated, LoggerController, TinvoiceStatus } from '@open-stock/stock-universal';
import { Faq } from '../defines/faq.define';
import { User } from '@open-stock/stock-auth-client';
import { Order } from '../defines/order.define';
import { Payment } from '../defines/payment.define';
import { Item } from '../defines/item.define';
import { Invoice } from '../defines/invoice.define';
import { DeliveryNote } from '../defines/deliverynote.define';
import { Estimate } from '../defines/estimate.define';
import { Receipt } from '../defines/receipt.define';

/**
 * Transforms a Faq object into either an image source or a name.
 * @param faq The Faq object to transform.
 * @param type The type of transformation to perform: 'img' for image source, 'name' for name.
 * @returns The transformed string value.
 */
export const transformFaqToNameOrImage = (
  faq: Faq,
  type: 'img' | 'name'
): string => {
  let response: string;
  const logger = new LoggerController();
  logger.debug('FaqPipe: transform:: - %faq, %type', faq, type);
  if (type === 'img') {
    let imgSrc: string;
    if ((faq.userId as User)?._id) {
      imgSrc = (faq.userId as User).profilePic.url || 'assets/imgs/person.png';
    } else if (faq.userId === 'admin') {
      imgSrc = 'assets/imgs/admin.png';
    } else {
      imgSrc = 'assets/imgs/person.png';
    }
    response = imgSrc;
  } else {
    let name: string;
    if ((faq.userId as User)?._id) {
      name = (faq.userId as User)?.fname ? (faq.userId as User).fname + ' ' + (faq.userId as User).lname : 'Assailant';
    } else if (faq.userId === 'admin') {
      name = 'admin';
    } else {
      name = faq.posterName;
    }
    response = name;
  }
  logger.debug('FaqPipe: transform:: - response', response);
  return response;
};

/**
 * Transforms an estimate ID from a number to a string format.
 * @param id - The estimate ID to transform.
 * @returns The transformed estimate ID.
 */
export const transformEstimateId = (
  id: number
): string => {
  const logger = new LoggerController();
  logger.debug('EstimateIdPipe:transform:: - id: ', id);
  if (!id) {
    return;
  }
  const len = id.toString().length;
  const start = '#EST-';
  switch (len) {
    case 4:
      return start + id;
    case 3:
      return start + '0' + id;
    case 2:
      return start + '00' + id;
    case 1:
      return start + '000' + id;
  }
};

/**
 * Transforms an invoice ID into a formatted string.
 * @param id - The invoice ID to transform.
 * @returns The formatted invoice string.
 */
export const transformInvoice = (
  id: number
): string => {
  const logger = new LoggerController();
  logger.debug('InvoiceIdPipe:transform:: - id: ', id);
  if (!id) {
    return;
  }
  const len = id.toString().length;
  const start = '#INV-';
  switch (len) {
    case 4:
      return start + id;
    case 3:
      return start + '0' + id;
    case 2:
      return start + '00' + id;
    case 1:
      return start + '000' + id;
  }
};

/**
 * Transforms the given ID based on the specified criteria.
 *
 * @param id - The ID to be transformed.
 * @param where - The criteria for the transformation.
 * @returns The transformed ID.
 */
export const transformUrId = (
  id: string,
  where: string
): string => {
  const logger = new LoggerController();
  logger.debug('UrIdPipe:PipeTransform:: - id: %id, where: %where', id, where);
  const len = id.length;
  const start = '#' + where + '_';
  switch (len) {
    case 4:
      return start + id;
    case 3:
      return start + '0' + id;
    case 2:
      return start + '00' + id;
    case 1:
      return start + '000' + id;
    default:
      return start + id;
  }
};

/**
 * Creates a payment-related object based on the provided data.
 * @param data - The data object containing order or payment information.
 * @returns The payment-related object.
 */
export const makePaymentRelated = (data: Order | Payment): IpaymentRelated => {
  return {
    paymentRelated: data.paymentRelated,
    // creationType: data.creationType,
    orderDate: data.orderDate,
    paymentDate: data.paymentDate,
    billingAddress: data.billingAddress,
    shippingAddress: data.shippingAddress,
    // tax: data.tax,
    currency: data.currency,
    isBurgain: data.isBurgain,
    shipping: data.shipping,
    manuallyAdded: data.manuallyAdded,
    paymentMethod: data.paymentMethod,
    // status: data.status
    ...makeInvoiceRelated(data)
  };
};

/**
 * Creates an invoice-related object based on the provided data.
 * @param data - The data object containing information about the invoice-related entity.
 * @returns An `IinvoiceRelated` object.
 */
export const makeInvoiceRelated = (data: DeliveryNote | Estimate | Invoice | Receipt | Order | Payment): IinvoiceRelated => {
  return {
    invoiceRelated: data.invoiceRelated,
    creationType: data.creationType,
    estimateId: data.estimateId,
    invoiceId: data.invoiceId,
    billingUser: data.billingUser,
    billingUserId: data.billingUserId,
    billingUserPhoto: data.billingUserPhoto,
    items: data.items,
    fromDate: data.fromDate,
    toDate: data.toDate,
    status: data.status,
    stage: data.stage,
    cost: data.cost,
    paymentMade: data.paymentMade,
    tax: data.tax,
    balanceDue: data.balanceDue,
    subTotal: data.subTotal,
    total: data.total,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payments: (data as any).payments // TODO
  };
};

/**
 * Function to like an item.
 * @param companyId - The ID of the company.
 * @param currentUser - The current user.
 * @param item - The item to be liked.
 * @returns A promise that resolves to an object indicating the success of the operation.
 */
export const likeFn = (
  companyId: string,
  currentUser: User,
  item: Item
) => {
  const logger = new LoggerController();
  if (!currentUser) {
    return { success: false };
  }
  return item
    .likeItem(companyId, currentUser._id)
    .catch(err => {
      logger.debug(':like:: - err ', err);
      return { success: false };
    });
};

/**
 * Unlike the item for the current user.
 * @param companyId - The ID of the company.
 * @param currentUser - The current user.
 * @param item - The item to unlike.
 * @returns A promise that resolves to an object indicating the success of the unlike operation.
 */
export const unLikeFn = (
  companyId: string,
  currentUser: User,
  item: Item
) => {
  const logger = new LoggerController();
  if (!currentUser) {
    return { success: false };
  }
  return item
    .likeItem(companyId, currentUser._id)
    .catch(err => {
      logger.debug(':unLike:: - err ', err);
      return { success: false };
    });
};

/**
 * Determines whether the given item is liked by the current user.
 *
 * @param item - The item to check.
 * @param currentUser - The current user.
 * @returns A boolean value indicating whether the item is liked by the current user.
 */
export const determineLikedFn = (
  item: Item, currentUser: User): boolean => {
  if (currentUser &&
    item.likes.includes(currentUser._id)) {
    return true;
  } else {
    return false;
  }
};

/**
 * Marks the invoice status as a given value.
 * @param companyId - The ID of the company.
 * @param invoice - The invoice object.
 * @param val - The value to set the status to.
 * @returns A promise that resolves when the update is complete.
 */
export const markInvStatusAsFn = async(
  companyId: string,
  invoice: Invoice,
  val: TinvoiceStatus
) => {
  const vals = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _id: invoice._id,
    status: val
  } as Iinvoice;

  const invRelated = makeInvoiceRelated(invoice);
  invRelated.status = val;

  await invoice
    .update(companyId, vals, invRelated);
};

/**
 * Deletes an invoice from the list of invoices.
 * @param companyId - The ID of the company.
 * @param id - The ID of the invoice to delete.
 * @param invoices - The array of invoices.
 */
export const deleteInvoiceFn = async(
  companyId: string,
  id: string, invoices: Invoice[]) => {
  const invoice = invoices
    .find(val => val._id === id);
  const credentials: IdeleteCredentialsInvRel = {
    id,
    creationType: invoice.creationType,
    stage: invoice.stage,
    invoiceRelated: invoice.invoiceRelated
  };
  await Invoice
    .deleteInvoices(companyId, [credentials]);
};

/**
 * Toggles the selection of an item in an array of selections.
 * If the item is already selected, it will be deselected.
 * If the item is not selected, it will be selected.
 * @param id - The ID of the item to toggle.
 * @param selections - The array of selections.
 */
export const toggleSelectionFn = (id: string, selections: string[]) => {
  if (selections.includes(id)) {
    const index = selections.findIndex(val => val === id);
    selections.splice(index, 1);
  } else {
    selections.push(id);
  }
};

/**
 * Deletes multiple invoices based on the provided selections.
 * @param companyId - The ID of the company.
 * @param invoices - An array of invoices.
 * @param selections - An array of invoice IDs to be deleted.
 * @returns A promise that resolves to an object indicating the success of the deletion.
 */
export const deleteManyInvoicesFn = (
  companyId: string,
  invoices: Invoice[],
  selections: string[]
) => {
  const logger = new LoggerController();
  const credentials: IdeleteCredentialsInvRel[] = invoices
    .filter(val => selections.includes(val._id))
    .map(value => ({
      id: value._id,
      creationType: value.creationType,
      invoiceRelated: value.invoiceRelated,
      stage: value.stage
    }));
  return Invoice
    .deleteInvoices(companyId, credentials)
    .catch(err => {
      logger.error('InvoicesListComponent:deleteMany:: - err ', err);
      return { success: false };
    });
};

/**
 * Opens or closes a box based on the provided value.
 * @param val - The value to open or close the box with.
 * @param selectBoxOpen - An array representing the open boxes.
 */
export const openBoxFn = (val, selectBoxOpen: string[]): void => {
  if (selectBoxOpen[0] !== val) {
    selectBoxOpen[0] = val;
  } else {
    selectBoxOpen = [];
  }
};

/**
 * Transforms a number into a string with a specified suffix.
 * @param val - The number to be transformed.
 * @param suffix - The suffix to be added to the transformed string.
 * @returns The transformed string with the suffix.
 */
export const transformNoInvId = (val: number, suffix: string) => {
  const stringified = val.toString();
  let outStr: string;
  switch (stringified.length) {
    case 1:
      outStr = '000' + stringified;
      break;
    case 2:
      outStr = '00' + stringified;
      break;
    case 2:
      outStr = '0' + stringified;
      break;
    default:
      outStr = stringified;
      break;
  }
  return suffix + outStr;
};

/**
 * Applies a block date select filter to the given data array based on the specified condition.
 * @param data The array of data to filter.
 * @param where The condition to apply the filter.
 * @returns The filtered array of data.
 */
export const applyBlockDateSelect = (
  data: (Estimate | Invoice | DeliveryNote | Receipt | Item)[], where: string) => {
  let date = new Date();
  switch (where) {
    case 'today':
      date = new Date();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return data
        // eslint-disable-next-line max-len
        .filter(val => val.createdAt.getFullYear() === date.getFullYear() && val.createdAt.getMonth() === date.getMonth() && val.createdAt.getDate() === date.getDate());
    case 'yesterday':
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return data
        // eslint-disable-next-line max-len
        .filter(val => val.createdAt.getFullYear() === date.getFullYear() && val.createdAt.getMonth() === date.getMonth() && val.createdAt.getDate() - 1 === date.getDate() - 1);
    case 'last7days':
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return data
      // eslint-disable-next-line max-len
        .filter(val => val.createdAt.getFullYear() === date.getFullYear() && val.createdAt.getMonth() === date.getMonth() && val.createdAt.getDate() >= date.getDate() - 7);
    case 'thisMonth':
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return data
        // eslint-disable-next-line max-len
        .filter(val => val.createdAt.getFullYear() === date.getFullYear() && val.createdAt.getMonth() === date.getMonth());
    case 'lastMonth':
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return data
        // eslint-disable-next-line max-len
        .filter(val => val.createdAt.getFullYear() === date.getFullYear() && val.createdAt.getMonth() - 1 === date.getMonth() - 1);
  }
};
