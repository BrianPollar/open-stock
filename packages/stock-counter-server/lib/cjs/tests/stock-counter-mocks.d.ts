import { Icart, Iexpense, IpaymentRelated } from '@open-stock/stock-universal';
import { DeliveryCity } from '../stock-counter-client/src/defines/delivery.define';
import { DeliveryNote } from '../stock-counter-client/src/defines/deliverynote.define';
import { Estimate } from '../stock-counter-client/src/defines/estimate.define';
import { Expense } from '../stock-counter-client/src/defines/expense.define';
import { Faq, FaqAnswer } from '../stock-counter-client/src/defines/faq.define';
import { Invoice, InvoiceRelatedWithReceipt } from '../stock-counter-client/src/defines/invoice.define';
import { Item } from '../stock-counter-client/src/defines/item.define';
import { ItemDecoy } from '../stock-counter-client/src/defines/itemdecoy.define';
import { ItemLimitted } from '../stock-counter-client/src/defines/itemlimitted.define';
import { ItemOffer } from '../stock-counter-client/src/defines/itemoffer.define';
import { Order } from '../stock-counter-client/src/defines/order.define';
import { Payment, PaymentRelated } from '../stock-counter-client/src/defines/payment.define';
import { ExpenseReport } from '../stock-counter-client/src/defines/reports/expensereport.define';
import { InvoiceReport } from '../stock-counter-client/src/defines/reports/invoicereport.define';
import { ProfitAndLossReport } from '../stock-counter-client/src/defines/reports/profitandlossreport.define';
import { SalesReport } from '../stock-counter-client/src/defines/reports/salesreport.define';
import { TaxReport } from '../stock-counter-client/src/defines/reports/taxreport.define';
import { InvoiceSettings } from '../stock-counter-client/src/defines/settings/invoicesetting.define';
import { Customer, Staff } from '../stock-counter-client/src';
import { Profit } from '../stock-counter-client/src/defines/profit.define';
import { InvoiceRelated, Receipt } from '../stock-counter-client/src/defines/receipt.define';
import { Review } from '../stock-counter-client/src/defines/review.define';
/**
The  createMockExpenseReport  function creates a single mock expense report object. It takes an optional  incrementor  parameter to generate unique IDs for each report. It uses the  createMockDatabaseAuto  function to generate common properties like ID and timestamps. It also generates random values for properties like  urId ,  totalAmount ,  date , and  expenses . The  expenses  property is generated using the  createMockExpenses  function, which returns an array of mock expense objects. */
export declare const createMockExpenseReport: (incrementor?: number) => ExpenseReport;
/** The  createMockExpenseReports  function generates an array of mock expense reports. It takes a  length  parameter to specify the number of reports to generate. It uses the  createMockExpenseReport  function to generate each report. */
export declare const createMockExpenseReports: (length: number) => ExpenseReport[];
/** createMockInvoiceReport  function: This function generates a mock invoice report object with random data using the  faker  library. It creates an object with properties such as  urId  (UUID string),  totalAmount  (integer),  date  (Date object), and  invoices  (an array of mock invoices).*/
export declare const createMockInvoiceReport: () => InvoiceReport;
/** createMockInvoiceReports  function: This function generates an array of mock invoice reports by calling  createMockInvoiceReport  multiple times based on the  length  parameter. */
export declare const createMockInvoiceReports: (length: number) => InvoiceReport[];
/** This code exports a function called  createMockProfitAndLossReport  that creates a mock profit and loss report. It generates random data using the  faker  library and creates an object with properties such as  urId ,  totalAmount ,  date ,  expenses , and  invoiceRelateds . The  expenses  and  invoiceRelateds  properties are generated using helper functions  createMockExpenses  and  createMockInvoiceRelateds , respectively. The function returns an instance of the  ProfitAndLossReport  class, passing the generated data as an argument.*/
export declare const createMockProfitAndLossReport: () => ProfitAndLossReport;
/** The code also exports a function called  createMockProfitAndLossReports  that creates an array of mock profit and loss reports. It takes a parameter  length  which specifies the number of reports to generate. It uses the  Array.from  method to create an array with the specified length and maps over it, calling the  createMockProfitAndLossReport  function for each iteration. */
export declare const createMockProfitAndLossReports: (length: number) => ProfitAndLossReport[];
/** The  createMockSalesReport  function generates a single mock sales report object. It uses the  createMockDatabaseAuto  function (which is not shown in the code) to create a base object with common properties for database records. It then adds additional properties specific to sales reports, such as  urId  (a UUID string),  totalAmount  (an integer),  date  (a past date),  estimates  (an array of mock estimates), and  invoiceRelateds  (an array of mock invoice related objects). Finally, it creates a new instance of the  SalesReport  class using the generated data and returns it.*/
export declare const createMockSalesReport: () => SalesReport;
/** The  createMockSalesReports  function generates an array of mock sales report objects. It takes a  length  parameter to specify the number of reports to generate. It uses the  Array.from  method to create an array with the specified length, and then uses the  map  method to call the  createMockSalesReport  function for each element of the array. The result is an array of mock sales report objects.*/
export declare const createMockSalesReports: (length: number) => SalesReport[];
/** createMockTaxReport : This function generates a mock tax report object with random data using the  faker  library. It returns an instance of the  TaxReport  class.*/
export declare const createMockTaxReport: () => TaxReport;
/** createMockTaxReports : This function generates an array of mock tax report objects with a specified length. It uses the  createMockTaxReport  function internally.*/
export declare const createMockTaxReports: (length: number) => TaxReport[];
/** The  createMockSettingsGeneral  function generates mock data for general invoice settings, including the status, amount, default due time, default digital signature, default digital stamp, and default digital name.*/
export declare const createMockSettingsGeneral: () => {
    status: string;
    amount: string;
    defaultDueTime: Date;
    defaultDigitalSignature: string;
    defaultDigitalStamp: string;
    defaultDigitalName: string;
};
/** The  createMockSettingsTax  function generates mock data for tax settings, including whether taxes are enabled, the default tax type, VAT percentage, income percentage, items bulk percentage, and GSTIN number. */
export declare const createMockSettingsTax: () => {
    enabled: boolean;
    defaultType: string;
    vatPercentage: number;
    incomePercentage: number;
    itemsBulkPercentage: number;
    gstinNo: string;
    taxes: any[];
};
/**  The  createMockSettingsBank  function generates mock data for bank settings, including whether bank details are enabled, the holder name, bank name, IFSC code, and account number. */
export declare const createMockSettingsBank: () => {
    enabled: boolean;
    holderName: string;
    bankName: string;
    ifscCode: string;
    accountNumber: string;
};
/** The  createMockInvoiceSettings  function creates a mock invoice settings object by combining the mock general, tax, and bank settings. */
export declare const createMockInvoiceSettings: () => InvoiceSettings;
/** This code exports a function  createMockDeliveryCity  that creates a mock delivery city object. The function generates random values for the name, shipping cost, currency, and delivery time. The generated object is then passed to the  DeliveryCity  class constructor to create a new instance of  DeliveryCity . */
export declare const createMockDeliveryCity: () => DeliveryCity;
/** The code also exports a function  createMockDeliveryCitys  that creates an array of mock delivery city objects. The function takes a length parameter and uses the  createMockDeliveryCity  function to generate the specified number of mock objects.*/
export declare const createMockDeliveryCitys: (length: number) => DeliveryCity[];
/** createMockDeliverynote : This function generates a mock delivery note object. It uses the  createMockInvoiceRelatedSolo  function (which is not provided) to create a base invoice-related object, and adds a  urId  property with a randomly generated UUID. The function then creates a new instance of the  DeliveryNote  class using the generated data and returns it. */
export declare const createMockDeliverynote: () => DeliveryNote;
/** createMockDeliverynotes : This function takes a length parameter and returns an array of mock delivery note objects. It uses the  createMockDeliverynote  function to generate each individual delivery note. */
export declare const createMockDeliverynotes: (length: number) => DeliveryNote[];
/** The  createMockEstimate  function creates a mock estimate object with random data using the  createMockInvoiceRelatedSolo  function and the  faker  library. It sets the  fromDate  and  toDate  properties to random past and future dates, respectively.*/
export declare const createMockEstimate: () => Estimate;
/** The  createMockEstimates  function takes a length parameter and returns an array of mock estimates by calling the  createMockEstimate  function multiple times. */
export declare const createMockEstimates: (length: number) => Estimate[];
/** The  mockExpense  function is used to generate a mock expense object with random data using the faker library. It takes an optional  incrementor  parameter to generate unique values for each mock expense. */
export declare const mockExpense: (incrementor?: number) => Iexpense;
/** The  createMockExpense  function creates a new  Expense  instance by passing the generated mock expense object to its constructor.*/
export declare const createMockExpense: (incrementor?: number) => Expense;
/** The  createMockExpenses  function generates an array of mock expenses by calling  createMockExpense  multiple times with different incrementor values. */
export declare const createMockExpenses: (length: number) => Expense[];
/** The  createMockFaq  function generates a mock FAQ object with random data using the  faker  library. It includes properties such as  urId ,  posterName ,  posterEmail ,  userId ,  qn ,  ans , and  approved . .*/
export declare const createMockFaq: () => Faq;
/** The  createMockFaqs  function generates an array of mock FAQs with a specified length. */
export declare const createMockFaqs: (length: number) => Faq[];
/** The  createMockFaqAnswer  function generates a mock FAQ answer object with random data. It includes properties such as  urId ,  faq ,  userId , and  ans .*/
export declare const createMockFaqAnswer: () => FaqAnswer;
/** The  createMockFaqAnswers  function generates an array of mock FAQ answers with a specified length. */
export declare const createMockFaqAnswers: (length: number) => FaqAnswer[];
/** The  createMockInvoiceRelatedPdct  function generates a mock invoice-related product object with randomly generated values for properties such as item name, item photo, quantity, rate, and amount. */
export declare const createMockInvoiceRelatedPdct: () => {
    item: string;
    itemName: string;
    itemPhoto: string;
    quantity: number;
    rate: number;
    amount: number;
};
/** The  createMockInvoiceRelatedPdcts  function creates an array of mock invoice-related product objects of a specified length by calling the  createMockInvoiceRelatedPdct  function. */
export declare const createMockInvoiceRelatedPdcts: (length: number) => {
    item: string;
    itemName: string;
    itemPhoto: string;
    quantity: number;
    rate: number;
    amount: number;
}[];
/** The  createMockInvoiceRelatedSolo  function generates a mock invoice-related object with randomly generated values for properties such as invoice related ID, creation type, estimate ID, invoice ID, billing user, items (an array of mock invoice-related product objects), billing user ID, billing user photo, stage, status, cost, payment made, tax, balance due, sub total, total, from date, to date, and payments (an array of mock payment install objects). */
export declare const createMockInvoiceRelatedSolo: () => {
    invoiceRelated: string;
    creationType: string;
    estimateId: number;
    invoiceId: number;
    billingUser: string;
    items: {
        item: string;
        itemName: string;
        itemPhoto: string;
        quantity: number;
        rate: number;
        amount: number;
    }[];
    billingUserId: string;
    billingUserPhoto: string;
    stage: string;
    status: string;
    cost: number;
    paymentMade: number;
    tax: number;
    balanceDue: number;
    subTotal: number;
    total: number;
    fromDate: Date;
    toDate: Date;
    payments: Receipt[];
    _id: string;
    createdAt: Date;
    updatedAt: Date;
};
/** The  createMockInvoiceRelated  function creates a new instance of the  InvoiceRelated  class by passing the mock invoice-related object generated by the  createMockInvoiceRelatedSolo  function. */
export declare const createMockInvoiceRelated: () => InvoiceRelated;
/** The  createMockInvoiceRelated  function creates a new instance of the  InvoiceRelated  class by passing the mock invoice-related object generated by the  createMockInvoiceRelatedSolo  function. */
export declare const createMockInvoiceRelatedWithReceipt: () => InvoiceRelatedWithReceipt;
/** The  createMockInvoiceRelateds  function creates an array of  InvoiceRelated  instances by calling the  createMockInvoiceRelated  function. */
export declare const createMockInvoiceRelatedWithReceipts: (length: number) => InvoiceRelatedWithReceipt[];
/** The  createMockInvoiceRelatedsSolo  function creates an array of mock invoice-related objects of a specified length by calling the  createMockInvoiceRelatedSolo  function.*/
export declare const createMockInvoiceRelatedsSolo: (length: number) => {
    invoiceRelated: string;
    creationType: string;
    estimateId: number;
    invoiceId: number;
    billingUser: string;
    items: {
        item: string;
        itemName: string;
        itemPhoto: string;
        quantity: number;
        rate: number;
        amount: number;
    }[];
    billingUserId: string;
    billingUserPhoto: string;
    stage: string;
    status: string;
    cost: number;
    paymentMade: number;
    tax: number;
    balanceDue: number;
    subTotal: number;
    total: number;
    fromDate: Date;
    toDate: Date;
    payments: Receipt[];
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}[];
/** The  createMockInvoiceRelateds  function creates an array of  InvoiceRelated  instances by calling the  createMockInvoiceRelated  function. */
export declare const createMockInvoiceRelateds: (length: number) => InvoiceRelated[];
export declare const createMockPaymentReceipts: (length: number) => Receipt[];
/** The  createMockInvoice  function generates a mock invoice object by extending the  InvoiceRelated  class and adding a  dueDate  property with a randomly generated date value.*/
export declare const createMockInvoice: () => Invoice;
/** The  createMockInvoices  function creates an array of mock invoice objects of a specified length by calling the  createMockInvoice  function. */
export declare const createMockInvoices: (length: number) => Invoice[];
/** createMockSponsored : This function creates a mock sponsored item with a randomly generated discount. */
export declare const createMockSponsored: () => {
    item: Item;
    discount: number;
};
/** createMockSponsoreds : This function creates an array of mock sponsored items with a specified length. */
export declare const createMockSponsoreds: (length: number) => {
    item: Item;
    discount: number;
}[];
/** createMockCart : This function creates a mock cart item with randomly generated quantity, rate, and total cost. */
export declare const createMockCart: () => Icart;
/** createMockCarts : This function creates an array of mock cart items with a specified length.*/
export declare const createMockCarts: (length: number) => Icart[];
/** createMockInvoiceMeta : This function creates a mock invoice meta object with randomly generated date, quantity, and cost.*/
export declare const createMockInvoiceMeta: () => {
    date: Date;
    quantity: number;
    cost: number;
};
/** createMockInvoiceMetas : This function creates an array of mock invoice meta objects with a specified length. */
export declare const createMockInvoiceMetas: (length: number) => {
    date: Date;
    quantity: number;
    cost: number;
}[];
/** createMockCostMeta : This function creates a mock cost meta object with randomly generated selling price, cost price, currency, discount, and offer. */
export declare const createMockCostMeta: (offer: any) => {
    sellingPrice: number;
    costPrice: number;
    currency: string;
    discount: number;
    offer: any;
};
/** createMockItem : This function creates a mock item object with various properties such as ID, name, brand, type, category, state, colors, model, origin, cost meta, description, inventory meta, photos, and others. It also includes methods for searching items, adding, updating, and deleting items, adding and updating sponsored items, liking and unliking items, and deleting images. */
export declare const createMockItem: (incrementor?: number) => Item;
/** createMockItems : This function creates an array of mock item objects with a specified length. */
export declare const createMockItems: (length: number) => Item[];
/** createMockItemDecoy : This function
 * creates a mock item decoy by combining a mock
 * database auto object with a randomly generated UUID
 * and an array of mock items. It returns a new instance
 * of the  ItemDecoy  class. */
export declare const createMockItemDecoy: () => ItemDecoy;
/** createMockItemDecoys : This function
 * creates an array of mock item decoys by
 * calling the  createMockItemDecoy  function a
 * specified number of times. It returns
 * an array of  ItemDecoy  instances. */
export declare const createMockItemDecoys: (length: number) => ItemDecoy[];
/** createMockItemLimitted : This function
 * creates a mock item limitted by combining a mock
 * database auto object with a randomly generated UUID
 * and an array of mock name. It returns a new instance
 * of the  ItemLimitted  class. */
export declare const createMockItemLimitted: () => ItemLimitted;
/** createMockItemLimitteds : This function
 * creates an array of mock item limitteds by
 * calling the  createMockItemLimitted  function a
 * specified number of times. It returns
 * an array of  ItemLimitted  instances. */
export declare const createMockItemLimitteds: (length: number) => ItemLimitted[];
export declare const createMockItemOffer: () => ItemOffer;
export declare const createMockItemOffers: (length: number) => ItemOffer[];
export declare const createMockOrder: () => Order;
export declare const createMockOrders: (length: number) => Order[];
export declare const createMockPaymentRelatedSolo: () => IpaymentRelated;
export declare const createMockPaymentRelatedSolos: (length: number) => IpaymentRelated[];
export declare const createMockPaymentRelated: () => PaymentRelated;
export declare const createMockPaymentRelateds: (length: number) => (() => PaymentRelated)[];
export declare const createMockPayment: () => Payment;
export declare const createMockPayments: (length: number) => Payment[];
export declare const createMockProfit: () => Profit;
export declare const createMockProfits: (length: number) => Profit[];
export declare const createMockReceipt: () => Receipt;
export declare const createMockReceipts: (length: number) => Receipt[];
export declare const createMockReview: () => Review;
export declare const createMockReviews: (length: number) => Review[];
/** createMockCustomer : This function creates a mock customer object by combining a mock user base object (created by calling  createMockUserBase() ) with an array of mock addresses (created by calling  createMockAddress()  twice). The resulting customer object is then instantiated as a new instance of the  Customer  class. */
export declare const createMockCustomer: () => Customer;
/** createMockCustomers : This function takes a number  length  as input and returns an array of mock customer objects. The length of the array is determined by the input parameter. Each mock customer object is created by calling  createMockCustomer() .*/
export declare const createMockCustomers: (length: number) => Customer[];
/** The  createMockSalary  function generates a mock salary object with randomly generated amount and type properties.*/
export declare const createMockSalary: () => {
    amount: number;
    type: string;
};
/** The  createMockStaff  function creates a mock staff object by combining a mock user base object (not provided) with an employment type and a salary object generated by the  createMockSalary  function. The resulting object is then instantiated as an instance of the  Staff  class.*/
export declare const createMockStaff: () => Staff;
/** The  createMockStaffs  function generates an array of mock staff objects by calling the  createMockStaff  function a specified number of times.*/
export declare const createMockStaffs: (length: number) => Staff[];
/** The  createMockUserBase  function takes an optional parameter  incrementor  and returns an object with properties  user ,  startDate ,  endDate , and  occupation . The  user  property is assigned a random UUID string generated by the  faker.string.uuid()  function. The  startDate  and  endDate  properties are assigned random past and future dates generated by the  faker.date.past()  and  faker.date.future()  functions, respectively. The  occupation  property is assigned a random alphanumeric string generated by the  faker.string.alphanumeric()  function.*/
export declare const createMockUserBase: (incrementor?: number) => {
    user: string;
    startDate: Date;
    endDate: Date;
    occupation: string;
    _id: string;
    createdAt: Date;
    updatedAt: Date;
};
export declare const createMockCompanySubscription: () => {
    subscriprionId: string;
    startDate: Date;
    endDate: Date;
    features: string[];
};
export declare const createMockCompanySubscriptions: (length: number) => {
    subscriprionId: string;
    startDate: Date;
    endDate: Date;
    features: string[];
}[];
export declare const createMockSubscriptionPackage: () => {
    name: string;
    ammount: number;
    duration: number;
    active: boolean;
    features: string[];
};
export declare const createMockSubscriptionPackages: (length: number) => {
    name: string;
    ammount: number;
    duration: number;
    active: boolean;
    features: string[];
}[];
