/** */
export type TpriceCurrenncy = 'USD' | 'UGX';
/** */
export type TitemType = 'laptop' | 'desktop' | 'accessory';
/** */
export type TitemState = 'new' | 'refurbished';
/** */
export type TprocessorName = 'Intel Core 2 Duo' | 'Intel Celeron' | 'Intel core i3' | 'Intel Core i5' | 'Intel core i7' | 'Intel core i9' | 'Intel Xeon' | 'Apple M1' | 'Apple M1 Pro' | 'Apple M1 Max' | 'Apple M2' | 'AMD Ryzen' | 'AMD Ryzen 3' | 'AMD Ryzen 5' | 'AMD Ryzen 7' | 'AMD Ryzen 9';
/** */
export type TcpuCoreThread = 1 | 2 | 4 | 6 | 12 | 8 | 16 | 32 | 64;
/** */
export type TramSize = 2 | 4 | 8 | 12 | 16 | 20 | 24 | 32 | 64;
/** */
export type TgraphicsRamSize = 0.512 | 1 | 2 | 4 | 8 | 12 | 16 | 20 | 24 | 32 | 64;
/** */
export type TgraphicsName = 'Radeon Pro 550' | 'Radeon Pro 550x' | 'Radeon Pro 560x' | 'Apple M1' | 'Apple M2' | 'Nvidia' | 'Intel' | 'ATI' | 'AMD';
/** */
export type TramType = 'DDR3' | 'DDR4' | 'DDR5' | 'DDR6';
/** */
export type TscreenSize = 11 | 11.6 | 12 | 12.5 | 13 | 13.3 | 14 | 15 | 15.6 | 16 | 17 | 21.5 | 24 | 27 | 32;
/** */
export type Tbrand = 'Acer' | 'Apple' | 'Dell' | 'HP' | 'Lenovo';
/** */
export type Tmkrandomstringhow = 'numbers' | 'letters' | 'combined';
/** */
export type TchatMsgStatus = 'sent' | 'pending' | 'failed' | 'recieved' | 'viewed';
/** */
export type TchatMsgWho = 'me' | 'partner';
/** */
export type Twarnalerttype = 'http' | 'default';
/** */
export type TorderStatus = 'pending' | 'paidNotDelivered' | 'delivered' | 'paidAndDelivered';
/** */
export type TpaymentMethod = 'airtelmoney' | 'braintree' | 'pesapal' | 'seerbit' | 'seerbitNg' | 'momo' | 'cash' | 'cheque' | 'credit';
/** */
export type TstorageDriveType = 'SSD' | 'HDD';
/** */
export type TstorageSizeHdd = '250GB' | '320GB' | '500GB' | '750GB' | '1TB' | '2TB';
/** */
export type TstorageSizeSsd = '128GB' | '256GB' | '512GB' | '1TB' | '2TB';
/** */
export type TkeyboradStandard = 'US' | 'GB' | 'Arabic' | 'French' | 'Swedish';
/** */
export type TitemColor = 'Space Grey' | 'Silver' | 'Gold' | 'Black' | 'White' | 'Other';
/** */
export type TexpoMode = 'itemion' | 'demo';
/** */
export type TestimateStage = 'estimate' | 'invoice' | 'deliverynote' | 'receipt';
/** */
export type TexpenseCategory = 'advertising' | 'marketing' | 'software' | 'travel' | 'utilities' | 'clothing' | 'drinks' | 'food' | 'transport' | 'medical' | 'insurance' | 'repairs' | 'rent' | 'electricity' | 'internet' | 'taxes' | 'petrol' | 'entertaiment' | 'salaries' | 'debt' | 'others' | 'petty';
/** */
export type TreceiptType = 'ecomerce' | 'traditional';
/** */
export type TinvoiceStatus = 'paid' | 'pending' | 'overdue' | 'draft' | 'unpaid' | 'cancelled' | 'paidAndDelivered' | 'deliveredAndNotPaid' | 'paidNotDelivered';
/** */
export type TinvoiceType = 'solo' | 'halfChained' | 'chained';
/** */
export type TpaymentRelatedType = 'solo' | 'halfChained' | 'chained';
/** */
export type TtaxType = 'vat' | 'income';
/** */
export type TpaymentInstallType = 'invoiceRelated' | 'paymentRelated';
/** */
export type TnotifType = 'orders' | 'payments' | 'users' | 'jobcards' | 'invoices';
/** */
export type TuserDispNameFormat = 'firstLast' | 'lastFirst' | 'companyName';
