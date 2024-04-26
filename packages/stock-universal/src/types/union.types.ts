// import { Accessory, Computer, Desktop, Laptop } from '../coreeagleinfo/item/item.define';

/**
 * Represents the type for price currency.
 * It can be either 'USD' or 'UGX'.
 */
export type TpriceCurrenncy =
  'USD' |
  'UGX';

/**
 * Represents the type of an item.
 * It can be one of the following:
 * - 'laptop'
 * - 'desktop'
 * - 'accessory'
 * - any other string value
 */
export type TitemType =
  'laptop' |
  'desktop' |
  'accessory' |
  string;

/**
 * Represents the state of an item.
 * Possible values are 'new' and 'refurbished'.
 */
export type TitemState =
  'new' |
  'refurbished';

/**
 * Represents the possible processor names.
 */
export type TprocessorName =
  'Intel Core 2 Duo' |
  'Intel Celeron' |
  'Intel core i3' |
  'Intel Core i5' |
  'Intel core i7' |
  'Intel core i9' |
  'Intel Xeon' |
  'Apple M1' |
  'Apple M1 Pro' |
  'Apple M1 Max' |
  'Apple M2' |
  'AMD Ryzen' |
  'AMD Ryzen 3' |
  'AMD Ryzen 5' |
  'AMD Ryzen 7' |
  'AMD Ryzen 9';

/**
 * Represents the number of CPU cores and threads.
 */
export type TcpuCoreThread =
  1 | 2 | 4 | 6 | 12 | 8 | 16 | 32 | 64;

/**
 * Represents the size of a tram.
 * The size can be one of the following values: 2, 4, 8, 12, 16, 20, 24, 32, or 64.
 */
export type TramSize =
  2 | 4 | 8 | 12 | 16 | 20 | 24 | 32 | 64;

/**
 * Represents the size of graphics RAM.
 * The value can be one of the following:
 * - 0.512
 * - 1
 * - 2
 * - 4
 * - 8
 * - 12
 * - 16
 * - 20
 * - 24
 * - 32
 * - 64
 */
export type TgraphicsRamSize =
  0.512 | 1 | 2 | 4 | 8 | 12 | 16 | 20 | 24 | 32 | 64;

/**
 * Represents the possible graphics card names.
 */
export type TgraphicsName =
  'Radeon Pro 550' |
  'Radeon Pro 550x' |
  'Radeon Pro 560x' |
  'Apple M1' |
  'Apple M2' |
  'Nvidia' |
  'Intel' |
  'ATI' |
  'AMD';

/**
 * Represents the type of a Tram.
 * Possible values are 'DDR3', 'DDR4', 'DDR5', and 'DDR6'.
 */
export type TramType =
  'DDR3' |
  'DDR4' |
  'DDR5' |
  'DDR6';

/**
 * Represents the possible screen sizes.
 * @typedef {number} TscreenSize
 * @description The screen size can be one of the following values:
 * - 11
 * - 11.6
 * - 12
 * - 12.5
 * - 13
 * - 13.3
 * - 14
 * - 15
 * - 15.6
 * - 16
 * - 17
 * - 21.5
 * - 24
 * - 27
 * - 32
 */

export type TscreenSize =
  11 |
  11.6 |
  12 |
  12.5 |
  13 |
  13.3 |
  14 |
  15 |
  15.6 |
  16 |
  17 |
  21.5 |
  24 |
  27 |
  32;


/**
 * Represents a brand of a product.
 */
export type Tbrand =
  'Acer' |
  'Apple' |
  'Dell' |
  'HP' |
  'Lenovo';

/*
export type TcombinedProductClass =
  Computer |
  Laptop |
  Desktop |
  Accessory;*/

/**
 * Represents the possible options for generating a random string.
 */
export type Tmkrandomstringhow =
  'numbers' |
  'letters' |
  'combined';

/**
 * Represents the status of a chat message.
 * Possible values are:
 * - 'sent': The message has been sent.
 * - 'pending': The message is pending and has not been sent yet.
 * - 'failed': The message failed to send.
 * - 'received': The message has been received by the recipient.
 * - 'viewed': The message has been viewed by the recipient.
 */
export type TchatMsgStatus =
  'sent' |
  'pending' |
  'failed' |
  'recieved' |
  'viewed';

/**
 * Represents the possible values for the `TchatMsgWho` type.
 * - `'me'`: Indicates that the message is from the user.
 * - `'partner'`: Indicates that the message is from the partner.
 */
export type TchatMsgWho =
  'me' |
  'partner';

/**
 * Represents the type of Twarnalert.
 * Possible values are 'http' and 'default'.
 */
export type Twarnalerttype =
  'http' |
  'default';

/**
 * Represents the possible order statuses.
 */
export type TorderStatus =
  'pending' |
  'paidNotDelivered' |
  'delivered' |
  'paidAndDelivered';

/**
 * Represents the available payment methods.
 */
export type TpaymentMethod =
  'airtelmoney' |
  'braintree' |
  'pesapal' |
  'seerbit' |
  'seerbitNg' |
  'momo' |
  'cash' |
  'cheque' |
  'credit';

/**
 * Represents the type of storage drive.
 * It can be either 'SSD' or 'HDD'.
 */
export type TstorageDriveType =
  'SSD' |
  'HDD';

/**
 * Represents the available storage sizes for HDD.
 */
export type TstorageSizeHdd =
  '250GB' | '320GB'| '500GB' | '750GB' | '1TB' | '2TB';

/**
 * Represents the available storage sizes for SSD.
 */
export type TstorageSizeSsd =
  '128GB' | '256GB' | '512GB' | '1TB' | '2TB';

/**
 * Represents the standard keyboard types.
 * Possible values are 'US', 'GB', 'Arabic', 'French', and 'Swedish'.
 */
export type TkeyboradStandard =
  'US' | 'GB' | 'Arabic' | 'French' | 'Swedish';

/**
 * Represents the possible colors for an item.
 */
export type TitemColor = 'Space Grey' |
  'Silver' |
  'Gold' |
  'Black' |
  'White' |
  'Other';

/**
 * Represents the possible modes for Texpo.
 */
export type TexpoMode =
  'itemion' |
  'demo';

/**
 * Represents the possible stages of a testimate.
 * - 'estimate': The stage where an estimate is being prepared.
 * - 'invoice': The stage where an invoice is being generated.
 * - 'deliverynote': The stage where a delivery note is being created.
 * - 'receipt': The stage where a receipt is being issued.
 */
export type TestimateStage =
  'estimate' |
  'invoice' |
  'deliverynote' |
  'receipt';

/**
 * Represents the expense categories available.
 */
export type TexpenseCategory =
  'advertising' |
  'marketing' |
  'software' |
  'travel' |
  'utilities' |
  'clothing'|
  'drinks'|
  'food'|
  'transport' |
  'medical' |
  'insurance' |
  'repairs'|
  'rent' |
  'electricity' |
  'internet' |
  'taxes' |
  'petrol' |
  'entertaiment' |
  'salaries' |
  'debt' |
  'others'|
  'petty';

/**
 * Represents the type of a receipt.
 * It can be either 'ecomerce' or 'traditional'.
 */
export type TreceiptType =
  'ecomerce' |
  'traditional';

/**
 * Represents the possible status values for an invoice.
 */
export type TinvoiceStatus =
  'paid' |
  'pending' |
  'overdue' |
  'draft' |
  'unpaid' |
  'cancelled' |
  'paidAndDelivered' |
  'deliveredAndNotPaid' |
  'paidNotDelivered';

/**
 * Represents the type of an invoice.
 * - 'solo': Indicates a solo invoice.
 * - 'halfChained': Indicates a half-chained invoice.
 * - 'chained': Indicates a chained invoice.
 */
export type TinvoiceType =
  'solo' |
  'halfChained' |
  'chained';

/**
 * Represents the type of payment related options.
 */
export type TpaymentRelatedType =
  'solo' |
  'halfChained' |
  'chained';

/**
 * Represents the type of tax.
 * Possible values are 'vat' and 'income'.
 */
export type TtaxType =
  'vat' |
  'income';

/**
 * Represents the type of payment installments.
 */
export type TpaymentInstallType =
  'invoiceRelated' |
  'paymentRelated';

/**
 * Represents the type of notification.
 * Possible values are:
 * - 'orders'
 * - 'payments'
 * - 'users'
 * - 'jobcards'
 * - 'invoices'
 */
export type TnotifType =
  'orders' |
  'payments' |
  'users' |
  'jobcards' |
  'invoices';

/**
 * Represents the format options for displaying a user's display name.
 */
export type TuserDispNameFormat =
  'firstLast' |
  'lastFirst' |
  'companyName';

export type TuserType =
  'company' |
  'staff' |
  'customer' |
  'eUser';
/**
 * Represents the type of payment.
 * - `nonSubscription`: Indicates a non-subscription payment.
 * - `subscription`: Indicates a subscription payment.
 */
export type TpayType =
  'nonSubscription' |
  'subscription';

/**
 * Represents a union type for role authorization.
 * @typedef {('orders' | 'payments' | 'users' | 'items' | 'faqs' | 'videos' | 'printables' | 'buyer')} TroleAuth
 */
export type TroleAuth =
  'orders' |
  'payments' |
  'users' |
  'items' |
  'faqs' |
  'buyer' |
  'customers' |
  'staffs' |
  'estimates' |
  'invoices' |
  'decoys' |
  'offers' |
  'jobCards' |
  'deliveryNotes' |
  'receipts' |
  'expenses' |
  'reports' |
  'companyProfile';

/**
 * Represents the possible values for the TroleAuthProp type.
 * - 'create': Indicates the permission to create.
 * - 'read': Indicates the permission to read.
 * - 'update': Indicates the permission to update.
 * - 'delete': Indicates the permission to delete.
 */
export type TroleAuthProp =
  'create' |
  'read' |
  'update' |
  'delete';

export type TsubscriptionFeature =
  'customer' |
  'staff' |
  'estimate' |
  'invoice' |
  'item' |
  'decoy' |
  'offer' |
  'order' |
  'job-card' |
  'delivery-note' |
  'receipt' |
  'expense' |
  'report' |
  'companyAdminAccess';

export type TcompanySubPayStatus = 'paid' | 'failed' | 'canceled' | 'pending';

export type TsubscriptionDurVal = 1 | 2 | 3 | 6 | 12;
