"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockItemOffer = exports.createMockItemDecoys = exports.createMockItemDecoy = exports.createMockItems = exports.createMockItem = exports.createMockCostMeta = exports.createMockInvoiceMetas = exports.createMockInvoiceMeta = exports.createMockCarts = exports.createMockCart = exports.createMockSponsoreds = exports.createMockSponsored = exports.createMockInvoices = exports.createMockInvoice = exports.createMockPaymentReceipts = exports.createMockInvoiceRelateds = exports.createMockInvoiceRelatedsSolo = exports.createMockInvoiceRelatedWithReceipts = exports.createMockInvoiceRelatedWithReceipt = exports.createMockInvoiceRelated = exports.createMockInvoiceRelatedSolo = exports.createMockInvoiceRelatedPdcts = exports.createMockInvoiceRelatedPdct = exports.createMockFaqAnswers = exports.createMockFaqAnswer = exports.createMockFaqs = exports.createMockFaq = exports.createMockExpenses = exports.createMockExpense = exports.mockExpense = exports.createMockEstimates = exports.createMockEstimate = exports.createMockDeliverynotes = exports.createMockDeliverynote = exports.createMockDeliveryCitys = exports.createMockDeliveryCity = exports.createMockInvoiceSettings = exports.createMockSettingsBank = exports.createMockSettingsTax = exports.createMockSettingsGeneral = exports.createMockTaxReports = exports.createMockTaxReport = exports.createMockSalesReports = exports.createMockSalesReport = exports.createMockProfitAndLossReports = exports.createMockProfitAndLossReport = exports.createMockInvoiceReports = exports.createMockInvoiceReport = exports.createMockExpenseReports = exports.createMockExpenseReport = void 0;
exports.createMockSubscriptionPackages = exports.createMockSubscriptionPackage = exports.createMockCompanySubscriptions = exports.createMockCompanySubscription = exports.createMockUserBase = exports.createMockStaffs = exports.createMockStaff = exports.createMockSalary = exports.createMockCustomers = exports.createMockCustomer = exports.createMockReviews = exports.createMockReview = exports.createMockReceipts = exports.createMockReceipt = exports.createMockProfits = exports.createMockProfit = exports.createMockPayments = exports.createMockPayment = exports.createMockPaymentRelateds = exports.createMockPaymentRelated = exports.createMockPaymentRelatedSolos = exports.createMockPaymentRelatedSolo = exports.createMockOrders = exports.createMockOrder = exports.createMockItemOffers = void 0;
const en_US_1 = require("@faker-js/faker/locale/en_US");
const stock_universal_1 = require("@open-stock/stock-universal");
const mocks_1 = require("./mocks");
const stock_auth_mocks_1 = require("./stock-auth-mocks");
/**
The  createMockExpenseReport  function creates a single mock expense report object. It takes an optional  incrementor  parameter to generate unique IDs for each report. It uses the  createMockDatabaseAuto  function to generate common properties like ID and timestamps. It also generates random values for properties like  urId ,  totalAmount ,  date , and  expenses . The  expenses  property is generated using the  createMockExpenses  function, which returns an array of mock expense objects. */
const createMockExpenseReport = (incrementor = 0) => {
    const report = {
        ...(0, mocks_1.createMockDatabaseAuto)(),
        urId: en_US_1.faker.string.uuid() + incrementor,
        totalAmount: en_US_1.faker.number.int({ min: 4, max: 8 }),
        date: en_US_1.faker.date.past(),
        expenses: (0, exports.createMockExpenses)(10)
    };
    return report;
};
exports.createMockExpenseReport = createMockExpenseReport;
/** The  createMockExpenseReports  function generates an array of mock expense reports. It takes a  length  parameter to specify the number of reports to generate. It uses the  createMockExpenseReport  function to generate each report. */
const createMockExpenseReports = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockExpenseReport)());
};
exports.createMockExpenseReports = createMockExpenseReports;
/** createMockInvoiceReport  function: This function generates a mock invoice report object with random data using the  faker  library. It creates an object with properties such as  urId  (UUID string),  totalAmount  (integer),  date  (Date object), and  invoices  (an array of mock invoices). */
const createMockInvoiceReport = () => {
    const report = {
        ...(0, mocks_1.createMockDatabaseAuto)(),
        urId: en_US_1.faker.string.uuid(),
        totalAmount: en_US_1.faker.number.int({ min: 4, max: 8 }),
        date: en_US_1.faker.date.past(),
        invoices: (0, exports.createMockInvoices)(10)
    };
    return report;
};
exports.createMockInvoiceReport = createMockInvoiceReport;
/** createMockInvoiceReports  function: This function generates an array of mock invoice reports by calling  createMockInvoiceReport  multiple times based on the  length  parameter. */
const createMockInvoiceReports = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockInvoiceReport)());
};
exports.createMockInvoiceReports = createMockInvoiceReports;
/** This code exports a function called  createMockProfitAndLossReport  that creates a mock profit and loss report. It generates random data using the  faker  library and creates an object with properties such as  urId ,  totalAmount ,  date ,  expenses , and  invoiceRelateds . The  expenses  and  invoiceRelateds  properties are generated using helper functions  createMockExpenses  and  createMockInvoiceRelateds , respectively. The function returns an instance of the  ProfitAndLossReport  class, passing the generated data as an argument. */
const createMockProfitAndLossReport = () => {
    const report = {
        ...(0, mocks_1.createMockDatabaseAuto)(),
        urId: en_US_1.faker.string.uuid(),
        totalAmount: en_US_1.faker.number.int({ min: 4, max: 8 }),
        date: en_US_1.faker.date.past(),
        expenses: (0, exports.createMockExpenses)(10),
        invoiceRelateds: (0, exports.createMockInvoiceRelateds)(10)
    };
    return report;
};
exports.createMockProfitAndLossReport = createMockProfitAndLossReport;
/** The code also exports a function called  createMockProfitAndLossReports  that creates an array of mock profit and loss reports. It takes a parameter  length  which specifies the number of reports to generate. It uses the  Array.from  method to create an array with the specified length and maps over it, calling the  createMockProfitAndLossReport  function for each iteration. */
const createMockProfitAndLossReports = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockProfitAndLossReport)());
};
exports.createMockProfitAndLossReports = createMockProfitAndLossReports;
/** The  createMockSalesReport  function generates a single mock sales report object. It uses the  createMockDatabaseAuto  function (which is not shown in the code) to create a base object with common properties for database records. It then adds additional properties specific to sales reports, such as  urId  (a UUID string),  totalAmount  (an integer),  date  (a past date),  estimates  (an array of mock estimates), and  invoiceRelateds  (an array of mock invoice related objects). Finally, it creates a instance of the  SalesReport  class using the generated data and returns it. */
const createMockSalesReport = () => {
    const report = {
        ...(0, mocks_1.createMockDatabaseAuto)(),
        urId: en_US_1.faker.string.uuid(),
        totalAmount: en_US_1.faker.number.int({ min: 4, max: 8 }),
        date: en_US_1.faker.date.past(),
        estimates: (0, exports.createMockEstimates)(10),
        invoiceRelateds: (0, exports.createMockInvoiceRelateds)(10)
    };
    return report;
};
exports.createMockSalesReport = createMockSalesReport;
/** The  createMockSalesReports  function generates an array of mock sales report objects. It takes a  length  parameter to specify the number of reports to generate. It uses the  Array.from  method to create an array with the specified length, and then uses the  map  method to call the  createMockSalesReport  function for each element of the array. The result is an array of mock sales report objects. */
const createMockSalesReports = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockSalesReport)());
};
exports.createMockSalesReports = createMockSalesReports;
/** createMockTaxReport : This function generates a mock tax report object with random data using the  faker  library. It returns an instance of the  TaxReport  class. */
const createMockTaxReport = () => {
    const report = {
        ...(0, mocks_1.createMockDatabaseAuto)(),
        urId: en_US_1.faker.string.uuid(),
        totalAmount: en_US_1.faker.number.int({ min: 4, max: 8 }),
        date: en_US_1.faker.date.past(),
        estimates: (0, exports.createMockEstimates)(10),
        invoiceRelateds: (0, exports.createMockInvoiceRelateds)(10)
    };
    return report;
};
exports.createMockTaxReport = createMockTaxReport;
/** createMockTaxReports : This function generates an array of mock tax report objects with a specified length. It uses the  createMockTaxReport  function internally. */
const createMockTaxReports = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockTaxReport)());
};
exports.createMockTaxReports = createMockTaxReports;
/** The  createMockSettingsGeneral  function generates mock data for general invoice settings, including the status, amount, default due time, default digital signature, default digital stamp, and default digital name. */
const createMockSettingsGeneral = () => {
    return {
        status: 'paid',
        currency: 'USD',
        amount: en_US_1.faker.number.int(10).toString(),
        defaultDueTime: en_US_1.faker.date.past(),
        defaultDigitalSignature: 'string',
        defaultDigitalStamp: en_US_1.faker.image.avatar()
        // defaultDigitalName: faker.image.avatar()
    };
};
exports.createMockSettingsGeneral = createMockSettingsGeneral;
/** The  createMockSettingsTax  function generates mock data for tax settings, including whether taxes are enabled, the default tax type, VAT percentage, income percentage, items bulk percentage, and GSTIN number. */
const createMockSettingsTax = () => ({
    // enabled: false,
    // defaultType: 'string',
    // vatPercentage: faker.number.int(2),
    // incomePercentage: faker.number.int(2),
    // itemsBulkPercentage: faker.number.int(2),
    // gstinNo: faker.string.alphanumeric(7),
    taxes: []
});
exports.createMockSettingsTax = createMockSettingsTax;
/**  The  createMockSettingsBank  function generates mock data for bank settings, including whether bank details are enabled, the holder name, bank name, IFSC code, and account number. */
const createMockSettingsBank = () => ({
    enabled: false,
    holderName: en_US_1.faker.internet.userName(),
    bankName: en_US_1.faker.string.alphanumeric(10),
    ifscCode: en_US_1.faker.string.alphanumeric(10),
    accountNumber: en_US_1.faker.string.alphanumeric(9)
});
exports.createMockSettingsBank = createMockSettingsBank;
/** The  createMockInvoiceSettings  function creates a mock invoice settings object by combining the mock general, tax, and bank settings. */
const createMockInvoiceSettings = () => {
    const settings = {
        ...(0, mocks_1.createMockDatabaseAuto)(),
        generalSettings: (0, exports.createMockSettingsGeneral)(),
        taxSettings: (0, exports.createMockSettingsTax)(),
        bankSettings: (0, exports.createMockSettingsBank)()
    };
    return settings;
};
exports.createMockInvoiceSettings = createMockInvoiceSettings;
/** This code exports a function  createMockDeliveryCity  that creates a mock delivery city object. The function generates random values for the name, shipping cost, currency, and delivery time. The generated object is then passed to the  DeliveryCity  class constructor to create a instance of  DeliveryCity . */
const createMockDeliveryCity = () => {
    const city = {
        ...(0, mocks_1.createMockDatabaseAuto)(),
        name: en_US_1.faker.internet.userName(),
        shippingCost: en_US_1.faker.number.int(10000),
        currency: 'UGX',
        deliversInDays: en_US_1.faker.number.int(2)
    };
    return city;
};
exports.createMockDeliveryCity = createMockDeliveryCity;
/** The code also exports a function  createMockDeliveryCitys  that creates an array of mock delivery city objects. The function takes a length parameter and uses the  createMockDeliveryCity  function to generate the specified number of mock objects. */
const createMockDeliveryCitys = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockDeliveryCity)());
};
exports.createMockDeliveryCitys = createMockDeliveryCitys;
/** createMockDeliverynote : This function generates a mock delivery note object. It uses the  createMockInvoiceRelatedSolo  function (which is not provided) to create a base invoice-related object, and adds a  urId  property with a randomly generated UUID. The function then creates a instance of the  DeliveryNote  class using the generated data and returns it. */
const createMockDeliverynote = () => {
    const note = {
        ...(0, exports.createMockInvoiceRelatedSolo)(),
        urId: en_US_1.faker.string.uuid()
    };
    return note;
};
exports.createMockDeliverynote = createMockDeliverynote;
/** createMockDeliverynotes : This function takes a length parameter and returns an array of mock delivery note objects. It uses the  createMockDeliverynote  function to generate each individual delivery note. */
const createMockDeliverynotes = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockDeliverynote)());
};
exports.createMockDeliverynotes = createMockDeliverynotes;
/** The  createMockEstimate  function creates a mock estimate object with random data using the  createMockInvoiceRelatedSolo  function and the  faker  library. It sets the  fromDate  and  toDate  properties to random past and future dates, respectively. */
const createMockEstimate = () => {
    const estimate = {
        ...(0, exports.createMockInvoiceRelatedSolo)(),
        fromDate: en_US_1.faker.date.past(),
        toDate: en_US_1.faker.date.future()
    };
    return estimate;
};
exports.createMockEstimate = createMockEstimate;
/** The  createMockEstimates  function takes a length parameter and returns an array of mock estimates by calling the  createMockEstimate  function multiple times. */
const createMockEstimates = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockEstimate)());
};
exports.createMockEstimates = createMockEstimates;
/** The  mockExpense  function is used to generate a mock expense object with random data using the faker library. It takes an optional  incrementor  parameter to generate unique values for each mock expense. */
const mockExpense = (incrementor = 0) => {
    return {
        ...(0, mocks_1.createMockDatabaseAuto)(),
        urId: en_US_1.faker.string.uuid(),
        name: en_US_1.faker.person.fullName(),
        person: en_US_1.faker.internet.userName(),
        cost: en_US_1.faker.number.int({ min: 4, max: 8 }),
        category: 'advertising',
        note: en_US_1.faker.string.alphanumeric(),
        items: incrementor % 2 ? [] : (0, exports.createMockItems)(10),
        currency: 'UGX'
    };
};
exports.mockExpense = mockExpense;
/** The  createMockExpense  function creates a  Expense  instance by passing the generated mock expense object to its constructor. */
const createMockExpense = (incrementor = 0) => {
    return (0, exports.mockExpense)(incrementor);
};
exports.createMockExpense = createMockExpense;
/** The  createMockExpenses  function generates an array of mock expenses by calling  createMockExpense  multiple times with different incrementor values. */
const createMockExpenses = (length) => {
    return Array.from({ length }).map((val, index) => (0, exports.createMockExpense)(index));
};
exports.createMockExpenses = createMockExpenses;
/** The  createMockFaq  function generates a mock FAQ object with random data using the  faker  library. It includes properties such as  urId ,  posterName ,  posterEmail ,  userId ,  qn ,  ans , and  approved . . */
const createMockFaq = () => {
    const faq = {
        ...(0, mocks_1.createMockDatabaseAuto)(),
        urId: en_US_1.faker.string.uuid(),
        posterName: en_US_1.faker.internet.userName(),
        posterEmail: en_US_1.faker.internet.email(),
        userId: (0, stock_auth_mocks_1.createMockUser)(),
        qn: en_US_1.faker.string.alpha(),
        ans: (0, exports.createMockFaqAnswers)(10),
        approved: true
    };
    return faq;
};
exports.createMockFaq = createMockFaq;
/** The  createMockFaqs  function generates an array of mock FAQs with a specified length. */
const createMockFaqs = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockFaq)());
};
exports.createMockFaqs = createMockFaqs;
/** The  createMockFaqAnswer  function generates a mock FAQ answer object with random data. It includes properties such as  urId ,  faq ,  userId , and  ans . */
const createMockFaqAnswer = () => {
    const ans = {
        ...(0, mocks_1.createMockDatabaseAuto)(),
        urId: en_US_1.faker.string.uuid(),
        faq: en_US_1.faker.string.uuid(),
        userId: (0, stock_auth_mocks_1.createMockUser)(),
        ans: en_US_1.faker.string.alpha()
    };
    return ans;
};
exports.createMockFaqAnswer = createMockFaqAnswer;
/** The  createMockFaqAnswers  function generates an array of mock FAQ answers with a specified length. */
const createMockFaqAnswers = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockFaqAnswer)());
};
exports.createMockFaqAnswers = createMockFaqAnswers;
/** The  createMockInvoiceRelatedPdct  function generates a mock invoice-related product object with randomly generated values for properties such as item name, item photo, quantity, rate, and amount. */
const createMockInvoiceRelatedPdct = () => {
    return {
        item: en_US_1.faker.string.alphanumeric(10),
        itemName: en_US_1.faker.string.alphanumeric(10),
        itemPhoto: en_US_1.faker.image.url({
            width: 800,
            height: 600
        }),
        quantity: en_US_1.faker.number.int(3),
        rate: en_US_1.faker.number.int(3),
        amount: en_US_1.faker.number.int(3),
        currency: 'UGX'
    };
};
exports.createMockInvoiceRelatedPdct = createMockInvoiceRelatedPdct;
/** The  createMockInvoiceRelatedPdcts  function creates an array of mock invoice-related product objects of a specified length by calling the  createMockInvoiceRelatedPdct  function. */
const createMockInvoiceRelatedPdcts = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockInvoiceRelatedPdct)());
};
exports.createMockInvoiceRelatedPdcts = createMockInvoiceRelatedPdcts;
/** The  createMockInvoiceRelatedSolo  function generates a mock invoice-related object with randomly generated values for properties such as invoice related ID, creation type, estimate ID, invoice ID, billing user, items (an array of mock invoice-related product objects), billing user ID, billing user photo, stage, status, cost, payment made, tax, balance due, sub total, total, from date, to date, and payments (an array of mock payment install objects). */
const createMockInvoiceRelatedSolo = () => {
    const relateds = {
        ...(0, mocks_1.createMockDatabaseAuto)(),
        invoiceRelated: en_US_1.faker.string.uuid(),
        creationType: 'solo',
        estimateId: en_US_1.faker.number.int(3),
        invoiceId: en_US_1.faker.number.int(3),
        billingUser: en_US_1.faker.internet.userName(),
        items: (0, exports.createMockInvoiceRelatedPdcts)(10),
        billingUserId: en_US_1.faker.string.alphanumeric(10),
        billingUserPhoto: en_US_1.faker.image.avatar(),
        stage: 'estimate',
        status: 'paid',
        cost: en_US_1.faker.number.int({ min: 4, max: 8 }),
        paymentMade: en_US_1.faker.number.int({ min: 4, max: 8 }),
        tax: en_US_1.faker.number.int(3),
        balanceDue: en_US_1.faker.number.int({ min: 4, max: 8 }),
        subTotal: en_US_1.faker.number.int({ min: 4, max: 8 }),
        total: en_US_1.faker.number.int({ min: 4, max: 8 }),
        fromDate: en_US_1.faker.date.past(),
        toDate: en_US_1.faker.date.future(),
        payments: (0, exports.createMockReceipts)(10),
        currency: 'UGX'
    };
    return relateds;
};
exports.createMockInvoiceRelatedSolo = createMockInvoiceRelatedSolo;
/** The  createMockInvoiceRelated  function creates a instance of the  InvoiceRelated  class by passing the mock invoice-related object generated by the  createMockInvoiceRelatedSolo  function. */
const createMockInvoiceRelated = () => {
    return (0, exports.createMockInvoiceRelatedSolo)();
};
exports.createMockInvoiceRelated = createMockInvoiceRelated;
/** The  createMockInvoiceRelated  function creates a instance of the  InvoiceRelated  class by passing the mock invoice-related object generated by the  createMockInvoiceRelatedSolo  function. */
const createMockInvoiceRelatedWithReceipt = () => {
    return (0, exports.createMockInvoiceRelatedSolo)();
};
exports.createMockInvoiceRelatedWithReceipt = createMockInvoiceRelatedWithReceipt;
/** The  createMockInvoiceRelateds  function creates an array of  InvoiceRelated  instances by calling the  createMockInvoiceRelated  function. */
const createMockInvoiceRelatedWithReceipts = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockInvoiceRelatedWithReceipt)());
};
exports.createMockInvoiceRelatedWithReceipts = createMockInvoiceRelatedWithReceipts;
/** The  createMockInvoiceRelatedsSolo  function creates an array of mock invoice-related objects of a specified length by calling the  createMockInvoiceRelatedSolo  function. */
const createMockInvoiceRelatedsSolo = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockInvoiceRelatedSolo)());
};
exports.createMockInvoiceRelatedsSolo = createMockInvoiceRelatedsSolo;
/** The  createMockInvoiceRelateds  function creates an array of  InvoiceRelated  instances by calling the  createMockInvoiceRelated  function. */
const createMockInvoiceRelateds = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockInvoiceRelated)());
};
exports.createMockInvoiceRelateds = createMockInvoiceRelateds;
const createMockPaymentReceipts = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockReceipt)());
};
exports.createMockPaymentReceipts = createMockPaymentReceipts;
/** The  createMockInvoice  function generates a mock invoice object by extending the  InvoiceRelated  class and adding a  dueDate  property with a randomly generated date value. */
const createMockInvoice = () => {
    const invoice = {
        ...(0, exports.createMockInvoiceRelatedSolo)(),
        clientName: en_US_1.faker.internet.userName(),
        dueDate: en_US_1.faker.date.future(),
        paymentMade: en_US_1.faker.number.int({ min: 4, max: 8 })
    };
    return invoice;
};
exports.createMockInvoice = createMockInvoice;
/** The  createMockInvoices  function creates an array of mock invoice objects of a specified length by calling the  createMockInvoice  function. */
const createMockInvoices = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockInvoice)());
};
exports.createMockInvoices = createMockInvoices;
/** createMockSponsored : This function creates a mock sponsored item with a randomly generated discount. */
const createMockSponsored = () => ({
    item: (0, exports.createMockItem)(),
    discount: Number((0, stock_universal_1.makeRandomString)(10, 'numbers'))
});
exports.createMockSponsored = createMockSponsored;
/** createMockSponsoreds : This function creates an array of mock sponsored items with a specified length. */
const createMockSponsoreds = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockSponsored)());
};
exports.createMockSponsoreds = createMockSponsoreds;
/** createMockCart : This function creates a mock cart item with randomly generated quantity, rate, and total cost. */
const createMockCart = () => {
    return {
        item: (0, exports.createMockItem)(),
        quantity: en_US_1.faker.number.int(3),
        rate: en_US_1.faker.number.int(3),
        totalCostwithNoShipping: en_US_1.faker.number.int(3)
    };
};
exports.createMockCart = createMockCart;
/** createMockCarts : This function creates an array of mock cart items with a specified length. */
const createMockCarts = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockCart)());
};
exports.createMockCarts = createMockCarts;
/** createMockInvoiceMeta : This function creates a mock invoice meta object with randomly generated date, quantity, and cost. */
const createMockInvoiceMeta = () => {
    return {
        date: en_US_1.faker.date.past(),
        quantity: en_US_1.faker.number.int(3),
        cost: en_US_1.faker.number.int(3)
    };
};
exports.createMockInvoiceMeta = createMockInvoiceMeta;
/** createMockInvoiceMetas : This function creates an array of mock invoice meta objects with a specified length. */
const createMockInvoiceMetas = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockInvoiceMeta)());
};
exports.createMockInvoiceMetas = createMockInvoiceMetas;
/** createMockCostMeta : This function creates a mock cost meta object with randomly generated selling price, cost price, currency, discount, and offer. */
const createMockCostMeta = (offer) => {
    return {
        sellingPrice: en_US_1.faker.number.int(7),
        costPrice: en_US_1.faker.number.int(9),
        currency: 'UGX',
        discount: en_US_1.faker.number.int(2),
        offer
    };
};
exports.createMockCostMeta = createMockCostMeta;
/** createMockItem : This function creates a mock item object with various properties such as ID, name, brand, type, category, state, colors, model, origin, cost meta, description, inventory meta, photos, and others. It also includes methods for searching items, adding, updating, and deleting items, adding and updating sponsored items, liking and unliking items, and deleting images. */
const createMockItem = (incrementor = 0) => {
    const item = {
        ...(0, mocks_1.createMockDatabaseAuto)(),
        urId: en_US_1.faker.string.uuid(),
        numbersInstock: en_US_1.faker.number.int(3),
        name: en_US_1.faker.internet.userName(),
        brand: en_US_1.faker.string.uuid(),
        type: en_US_1.faker.string.uuid(),
        category: en_US_1.faker.string.uuid(),
        state: 'new',
        photos: Array.from({ length: 4 }).map(() => (0, stock_auth_mocks_1.createMockFileMeta)()),
        colors: ['red'],
        model: en_US_1.faker.string.sample(),
        origin: en_US_1.faker.string.sample(),
        anyKnownProblems: en_US_1.faker.string.uuid(),
        createdAt: en_US_1.faker.date.past(),
        updatedAt: en_US_1.faker.date.past(),
        costMeta: (0, exports.createMockCostMeta)(incrementor % 2 === 0),
        description: en_US_1.faker.string.sample(),
        numberBought: en_US_1.faker.number.int(3),
        sponsored: [],
        buyerGuarantee: en_US_1.faker.string.sample(),
        reviewedBy: [],
        reviewCount: en_US_1.faker.number.int(3),
        reviewWeight: en_US_1.faker.number.int(3),
        reviewRatingsTotal: en_US_1.faker.number.int(3),
        likes: [],
        likesCount: en_US_1.faker.number.int(3),
        timesViewed: en_US_1.faker.number.int(3),
        orderedQty: en_US_1.faker.number.int(3),
        inventoryMeta: (0, exports.createMockInvoiceMetas)(5)
    };
    return item;
};
exports.createMockItem = createMockItem;
/** createMockItems : This function creates an array of mock item objects with a specified length. */
const createMockItems = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockItem)());
};
exports.createMockItems = createMockItems;
/** createMockItemDecoy : This function
 * creates a mock item decoy by combining a mock
 * database auto object with a randomly generated UUID
 * and an array of mock items. It returns a instance
 * of the  ItemDecoy  class. */
const createMockItemDecoy = () => {
    const decoy = {
        ...(0, mocks_1.createMockDatabaseAuto)(),
        companyId: en_US_1.faker.string.uuid(),
        urId: en_US_1.faker.string.uuid(),
        items: (0, exports.createMockItems)(3)
    };
    return decoy;
};
exports.createMockItemDecoy = createMockItemDecoy;
/** createMockItemDecoys : This function
 * creates an array of mock item decoys by
 * calling the  createMockItemDecoy  function a
 * specified number of times. It returns
 * an array of  ItemDecoy  instances. */
const createMockItemDecoys = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockItemDecoy)());
};
exports.createMockItemDecoys = createMockItemDecoys;
const createMockItemOffer = () => {
    const offer = {
        ...(0, mocks_1.createMockDatabaseAuto)(),
        urId: en_US_1.faker.string.uuid(),
        items: (0, exports.createMockItems)(2),
        expireAt: en_US_1.faker.date.future(),
        type: 'string',
        header: en_US_1.faker.string.alphanumeric(20),
        subHeader: en_US_1.faker.string.alphanumeric(30),
        ammount: en_US_1.faker.number.int()
    };
    return offer;
};
exports.createMockItemOffer = createMockItemOffer;
const createMockItemOffers = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockItemOffer)());
};
exports.createMockItemOffers = createMockItemOffers;
const createMockOrder = () => {
    const order = {
        ...mocks_1.createMockDatabaseAuto,
        ...exports.createMockPaymentRelatedSolo,
        price: en_US_1.faker.number.int(),
        deliveryDate: en_US_1.faker.date.past()
    };
    return order;
};
exports.createMockOrder = createMockOrder;
const createMockOrders = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockOrder)());
};
exports.createMockOrders = createMockOrders;
const createMockPaymentRelatedSolo = () => {
    const related = {
        ...(0, exports.createMockInvoiceRelatedSolo)(),
        paymentRelated: en_US_1.faker.string.uuid(),
        urId: en_US_1.faker.string.uuid(),
        orderDate: en_US_1.faker.date.past(),
        paymentDate: en_US_1.faker.date.past(),
        billingAddress: (0, stock_auth_mocks_1.createMockBilling)(),
        shippingAddress: (0, stock_auth_mocks_1.createMockAddress)(),
        currency: 'UGX',
        user: (0, stock_auth_mocks_1.createMockUser)(),
        isBurgain: false,
        shipping: en_US_1.faker.number.int(),
        manuallyAdded: false,
        paymentMethod: 'pesapal'
    };
    return related;
};
exports.createMockPaymentRelatedSolo = createMockPaymentRelatedSolo;
const createMockPaymentRelatedSolos = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockPaymentRelatedSolo)());
};
exports.createMockPaymentRelatedSolos = createMockPaymentRelatedSolos;
const createMockPaymentRelated = () => {
    return (0, exports.createMockPaymentRelatedSolo)();
};
exports.createMockPaymentRelated = createMockPaymentRelated;
const createMockPaymentRelateds = (length) => {
    return Array.from({ length }).map(() => exports.createMockPaymentRelated);
};
exports.createMockPaymentRelateds = createMockPaymentRelateds;
const createMockPayment = () => {
    const payment = {
        ...(0, exports.createMockPaymentRelatedSolo)(),
        order: en_US_1.faker.string.uuid()
    };
    return payment;
};
exports.createMockPayment = createMockPayment;
const createMockPayments = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockPayment)());
};
exports.createMockPayments = createMockPayments;
/* export const createMockPaymentInstall = () => {
  const installs = {
    urId: faker.string.alphanumeric(),
    amount: faker.number.int(),
    date: faker.date.past(),
    type: 'invoiceRelated' as TpaymentInstallType,
    relatedId: faker.string.alphanumeric()
  };

  return PaymentInstall(installs);
}; */
/* export const createMockPaymentInstalls = (length: 10) => {
  return Array.from({ length }).map(() => createMockPaymentInstall());
}; */
const createMockProfit = () => {
    const profit = {
        ...(0, mocks_1.createMockDatabaseAuto)(),
        margin: en_US_1.faker.number.int(3),
        origCost: en_US_1.faker.number.int(3),
        soldAtPrice: en_US_1.faker.number.int(3)
    };
    return profit;
};
exports.createMockProfit = createMockProfit;
const createMockProfits = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockProfit)());
};
exports.createMockProfits = createMockProfits;
const createMockReceipt = () => {
    const receipt = {
        ...(0, mocks_1.createMockDatabaseAuto)(),
        urId: en_US_1.faker.string.uuid(),
        ammountRcievd: en_US_1.faker.number.int(3),
        paymentMode: en_US_1.faker.string.alphanumeric(4),
        type: 'ecomerce'
    };
    return receipt;
};
exports.createMockReceipt = createMockReceipt;
const createMockReceipts = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockReceipt)());
};
exports.createMockReceipts = createMockReceipts;
const createMockReview = () => {
    const review = {
        ...(0, mocks_1.createMockDatabaseAuto)(),
        urId: en_US_1.faker.string.uuid(),
        name: en_US_1.faker.internet.userName(),
        email: en_US_1.faker.internet.email(),
        comment: en_US_1.faker.string.alpha(),
        rating: 10,
        images: Array.from({ length: 3 }).map(() => en_US_1.faker.internet.avatar()),
        userId: (0, stock_auth_mocks_1.createMockUser)(),
        itemId: en_US_1.faker.string.uuid()
    };
    return review;
};
exports.createMockReview = createMockReview;
const createMockReviews = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockReview)());
};
exports.createMockReviews = createMockReviews;
/** createMockCustomer : This function creates a mock customer object by combining a mock user base object (created by calling  createMockUserBase() ) with an array of mock addresses (created by calling  createMockAddress()  twice). The resulting customer object is then instantiated as a instance of the  Customer  class. */
const createMockCustomer = () => {
    const customer = {
        ...(0, exports.createMockUserBase)(),
        otherAddresses: [(0, stock_auth_mocks_1.createMockAddress)(), (0, stock_auth_mocks_1.createMockAddress)()]
    };
    return customer;
};
exports.createMockCustomer = createMockCustomer;
/** createMockCustomers : This function takes a number  length  as input and returns an array of mock customer objects. The length of the array is determined by the input parameter. Each mock customer object is created by calling  createMockCustomer() . */
const createMockCustomers = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockCustomer)());
};
exports.createMockCustomers = createMockCustomers;
/** The  createMockSalary  function generates a mock salary object with randomly generated amount and type properties. */
const createMockSalary = () => ({
    amount: en_US_1.faker.number.int(),
    type: en_US_1.faker.string.alphanumeric(4)
});
exports.createMockSalary = createMockSalary;
/** The  createMockStaff  function creates a mock staff object by combining a mock user base object (not provided) with an employment type and a salary object generated by the  createMockSalary  function. The resulting object is then instantiated as an instance of the  Staff  class. */
const createMockStaff = () => {
    const staff = {
        ...(0, exports.createMockUserBase)(),
        employmentType: en_US_1.faker.string.alphanumeric(4),
        salary: (0, exports.createMockSalary)()
    };
    return staff;
};
exports.createMockStaff = createMockStaff;
/** The  createMockStaffs  function generates an array of mock staff objects by calling the  createMockStaff  function a specified number of times. */
const createMockStaffs = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockStaff)());
};
exports.createMockStaffs = createMockStaffs;
/** The  createMockUserBase  function takes an optional parameter  incrementor  and returns an object with properties  user ,  startDate ,  endDate , and  occupation . The  user  property is assigned a random UUID string generated by the  faker.string.uuid()  function. The  startDate  and  endDate  properties are assigned random past and future dates generated by the  faker.date.past()  and  faker.date.future()  functions, respectively. The  occupation  property is assigned a random alphanumeric string generated by the  faker.string.alphanumeric()  function. */
const createMockUserBase = (incrementor = 0) => ({
    ...(0, mocks_1.createMockDatabaseAuto)(),
    user: en_US_1.faker.string.uuid() + incrementor, // incrementor % 2 ? faker.string.uuid() : createMockUser(),
    startDate: en_US_1.faker.date.past(),
    endDate: en_US_1.faker.date.future(),
    occupation: en_US_1.faker.string.alphanumeric(5)
});
exports.createMockUserBase = createMockUserBase;
const createMockCompanySubscription = () => ({
    subscriprionId: en_US_1.faker.string.uuid(),
    startDate: en_US_1.faker.date.past(),
    endDate: en_US_1.faker.date.future(),
    features: ['feature1', 'feature2', 'feature3']
});
exports.createMockCompanySubscription = createMockCompanySubscription;
const createMockCompanySubscriptions = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockCompanySubscription)());
};
exports.createMockCompanySubscriptions = createMockCompanySubscriptions;
const createMockSubscriptionPackage = () => ({
    name: en_US_1.faker.string.alphanumeric(),
    ammount: en_US_1.faker.number.int(),
    duration: en_US_1.faker.number.int(),
    active: true,
    features: ['feature1', 'feature2', 'feature3']
});
exports.createMockSubscriptionPackage = createMockSubscriptionPackage;
const createMockSubscriptionPackages = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockSubscriptionPackage)());
};
exports.createMockSubscriptionPackages = createMockSubscriptionPackages;
//# sourceMappingURL=stock-counter-mocks.js.map