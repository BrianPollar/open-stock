import { faker } from '@faker-js/faker/locale/en_US';
import { makeRandomString } from '@open-stock/stock-universal';
import { createMockDatabaseAuto } from './mocks';
import { createMockAddress, createMockBilling, createMockFileMeta, createMockUser } from './stock-auth-mocks';
/**
The  createMockExpenseReport  function creates a single mock expense report object. It takes an optional  incrementor  parameter to generate unique IDs for each report. It uses the  createMockDatabaseAuto  function to generate common properties like ID and timestamps. It also generates random values for properties like  urId ,  totalAmount ,  date , and  expenses . The  expenses  property is generated using the  createMockExpenses  function, which returns an array of mock expense objects. */
export const createMockExpenseReport = (incrementor = 0) => {
    const report = {
        ...createMockDatabaseAuto(),
        urId: faker.string.uuid() + incrementor,
        totalAmount: faker.number.int({ min: 4, max: 8 }),
        date: faker.date.past(),
        expenses: createMockExpenses(10)
    };
    return report;
};
/** The  createMockExpenseReports  function generates an array of mock expense reports. It takes a  length  parameter to specify the number of reports to generate. It uses the  createMockExpenseReport  function to generate each report. */
export const createMockExpenseReports = (length) => {
    return Array.from({ length }).map(() => createMockExpenseReport());
};
/** createMockInvoiceReport  function: This function generates a mock invoice report object with random data using the  faker  library. It creates an object with properties such as  urId  (UUID string),  totalAmount  (integer),  date  (Date object), and  invoices  (an array of mock invoices). */
export const createMockInvoiceReport = () => {
    const report = {
        ...createMockDatabaseAuto(),
        urId: faker.string.uuid(),
        totalAmount: faker.number.int({ min: 4, max: 8 }),
        date: faker.date.past(),
        invoices: createMockInvoices(10)
    };
    return report;
};
/** createMockInvoiceReports  function: This function generates an array of mock invoice reports by calling  createMockInvoiceReport  multiple times based on the  length  parameter. */
export const createMockInvoiceReports = (length) => {
    return Array.from({ length }).map(() => createMockInvoiceReport());
};
/** This code exports a function called  createMockProfitAndLossReport  that creates a mock profit and loss report. It generates random data using the  faker  library and creates an object with properties such as  urId ,  totalAmount ,  date ,  expenses , and  invoiceRelateds . The  expenses  and  invoiceRelateds  properties are generated using helper functions  createMockExpenses  and  createMockInvoiceRelateds , respectively. The function returns an instance of the  ProfitAndLossReport  class, passing the generated data as an argument. */
export const createMockProfitAndLossReport = () => {
    const report = {
        ...createMockDatabaseAuto(),
        urId: faker.string.uuid(),
        totalAmount: faker.number.int({ min: 4, max: 8 }),
        date: faker.date.past(),
        expenses: createMockExpenses(10),
        invoiceRelateds: createMockInvoiceRelateds(10)
    };
    return report;
};
/** The code also exports a function called  createMockProfitAndLossReports  that creates an array of mock profit and loss reports. It takes a parameter  length  which specifies the number of reports to generate. It uses the  Array.from  method to create an array with the specified length and maps over it, calling the  createMockProfitAndLossReport  function for each iteration. */
export const createMockProfitAndLossReports = (length) => {
    return Array.from({ length }).map(() => createMockProfitAndLossReport());
};
/** The  createMockSalesReport  function generates a single mock sales report object. It uses the  createMockDatabaseAuto  function (which is not shown in the code) to create a base object with common properties for database records. It then adds additional properties specific to sales reports, such as  urId  (a UUID string),  totalAmount  (an integer),  date  (a past date),  estimates  (an array of mock estimates), and  invoiceRelateds  (an array of mock invoice related objects). Finally, it creates a instance of the  SalesReport  class using the generated data and returns it. */
export const createMockSalesReport = () => {
    const report = {
        ...createMockDatabaseAuto(),
        urId: faker.string.uuid(),
        totalAmount: faker.number.int({ min: 4, max: 8 }),
        date: faker.date.past(),
        estimates: createMockEstimates(10),
        invoiceRelateds: createMockInvoiceRelateds(10)
    };
    return report;
};
/** The  createMockSalesReports  function generates an array of mock sales report objects. It takes a  length  parameter to specify the number of reports to generate. It uses the  Array.from  method to create an array with the specified length, and then uses the  map  method to call the  createMockSalesReport  function for each element of the array. The result is an array of mock sales report objects. */
export const createMockSalesReports = (length) => {
    return Array.from({ length }).map(() => createMockSalesReport());
};
/** createMockTaxReport : This function generates a mock tax report object with random data using the  faker  library. It returns an instance of the  TaxReport  class. */
export const createMockTaxReport = () => {
    const report = {
        ...createMockDatabaseAuto(),
        urId: faker.string.uuid(),
        totalAmount: faker.number.int({ min: 4, max: 8 }),
        date: faker.date.past(),
        estimates: createMockEstimates(10),
        invoiceRelateds: createMockInvoiceRelateds(10)
    };
    return report;
};
/** createMockTaxReports : This function generates an array of mock tax report objects with a specified length. It uses the  createMockTaxReport  function internally. */
export const createMockTaxReports = (length) => {
    return Array.from({ length }).map(() => createMockTaxReport());
};
/** The  createMockSettingsGeneral  function generates mock data for general invoice settings, including the status, amount, default due time, default digital signature, default digital stamp, and default digital name. */
export const createMockSettingsGeneral = () => {
    return {
        status: 'paid',
        currency: 'USD',
        amount: faker.number.int(10).toString(),
        defaultDueTime: faker.date.past(),
        defaultDigitalSignature: 'string',
        defaultDigitalStamp: faker.image.avatar()
        // defaultDigitalName: faker.image.avatar()
    };
};
/** The  createMockSettingsTax  function generates mock data for tax settings, including whether taxes are enabled, the default tax type, VAT percentage, income percentage, items bulk percentage, and GSTIN number. */
export const createMockSettingsTax = () => ({
    // enabled: false,
    // defaultType: 'string',
    // vatPercentage: faker.number.int(2),
    // incomePercentage: faker.number.int(2),
    // itemsBulkPercentage: faker.number.int(2),
    // gstinNo: faker.string.alphanumeric(7),
    taxes: []
});
/**  The  createMockSettingsBank  function generates mock data for bank settings, including whether bank details are enabled, the holder name, bank name, IFSC code, and account number. */
export const createMockSettingsBank = () => ({
    enabled: false,
    holderName: faker.internet.userName(),
    bankName: faker.string.alphanumeric(10),
    ifscCode: faker.string.alphanumeric(10),
    accountNumber: faker.string.alphanumeric(9)
});
/** The  createMockInvoiceSettings  function creates a mock invoice settings object by combining the mock general, tax, and bank settings. */
export const createMockInvoiceSettings = () => {
    const settings = {
        ...createMockDatabaseAuto(),
        generalSettings: createMockSettingsGeneral(),
        taxSettings: createMockSettingsTax(),
        bankSettings: createMockSettingsBank()
    };
    return settings;
};
/** This code exports a function  createMockDeliveryCity  that creates a mock delivery city object. The function generates random values for the name, shipping cost, currency, and delivery time. The generated object is then passed to the  DeliveryCity  class constructor to create a instance of  DeliveryCity . */
export const createMockDeliveryCity = () => {
    const city = {
        ...createMockDatabaseAuto(),
        name: faker.internet.userName(),
        shippingCost: faker.number.int(10000),
        currency: 'UGX',
        deliversInDays: faker.number.int(2)
    };
    return city;
};
/** The code also exports a function  createMockDeliveryCitys  that creates an array of mock delivery city objects. The function takes a length parameter and uses the  createMockDeliveryCity  function to generate the specified number of mock objects. */
export const createMockDeliveryCitys = (length) => {
    return Array.from({ length }).map(() => createMockDeliveryCity());
};
/** createMockDeliverynote : This function generates a mock delivery note object. It uses the  createMockInvoiceRelatedSolo  function (which is not provided) to create a base invoice-related object, and adds a  urId  property with a randomly generated UUID. The function then creates a instance of the  DeliveryNote  class using the generated data and returns it. */
export const createMockDeliverynote = () => {
    const note = {
        ...createMockInvoiceRelatedSolo(),
        urId: faker.string.uuid()
    };
    return note;
};
/** createMockDeliverynotes : This function takes a length parameter and returns an array of mock delivery note objects. It uses the  createMockDeliverynote  function to generate each individual delivery note. */
export const createMockDeliverynotes = (length) => {
    return Array.from({ length }).map(() => createMockDeliverynote());
};
/** The  createMockEstimate  function creates a mock estimate object with random data using the  createMockInvoiceRelatedSolo  function and the  faker  library. It sets the  fromDate  and  toDate  properties to random past and future dates, respectively. */
export const createMockEstimate = () => {
    const estimate = {
        ...createMockInvoiceRelatedSolo(),
        fromDate: faker.date.past(),
        toDate: faker.date.future()
    };
    return estimate;
};
/** The  createMockEstimates  function takes a length parameter and returns an array of mock estimates by calling the  createMockEstimate  function multiple times. */
export const createMockEstimates = (length) => {
    return Array.from({ length }).map(() => createMockEstimate());
};
/** The  mockExpense  function is used to generate a mock expense object with random data using the faker library. It takes an optional  incrementor  parameter to generate unique values for each mock expense. */
export const mockExpense = (incrementor = 0) => {
    return {
        ...createMockDatabaseAuto(),
        urId: faker.string.uuid(),
        name: faker.person.fullName(),
        person: faker.internet.userName(),
        cost: faker.number.int({ min: 4, max: 8 }),
        category: 'advertising',
        note: faker.string.alphanumeric(),
        items: incrementor % 2 ? [] : createMockItems(10),
        currency: 'UGX'
    };
};
/** The  createMockExpense  function creates a  Expense  instance by passing the generated mock expense object to its constructor. */
export const createMockExpense = (incrementor = 0) => {
    return mockExpense(incrementor);
};
/** The  createMockExpenses  function generates an array of mock expenses by calling  createMockExpense  multiple times with different incrementor values. */
export const createMockExpenses = (length) => {
    return Array.from({ length }).map((val, index) => createMockExpense(index));
};
/** The  createMockFaq  function generates a mock FAQ object with random data using the  faker  library. It includes properties such as  urId ,  posterName ,  posterEmail ,  userId ,  qn ,  ans , and  approved . . */
export const createMockFaq = () => {
    const faq = {
        ...createMockDatabaseAuto(),
        urId: faker.string.uuid(),
        posterName: faker.internet.userName(),
        posterEmail: faker.internet.email(),
        userId: createMockUser(),
        qn: faker.string.alpha(),
        ans: createMockFaqAnswers(10),
        approved: true
    };
    return faq;
};
/** The  createMockFaqs  function generates an array of mock FAQs with a specified length. */
export const createMockFaqs = (length) => {
    return Array.from({ length }).map(() => createMockFaq());
};
/** The  createMockFaqAnswer  function generates a mock FAQ answer object with random data. It includes properties such as  urId ,  faq ,  userId , and  ans . */
export const createMockFaqAnswer = () => {
    const ans = {
        ...createMockDatabaseAuto(),
        urId: faker.string.uuid(),
        faq: faker.string.uuid(),
        userId: createMockUser(),
        ans: faker.string.alpha()
    };
    return ans;
};
/** The  createMockFaqAnswers  function generates an array of mock FAQ answers with a specified length. */
export const createMockFaqAnswers = (length) => {
    return Array.from({ length }).map(() => createMockFaqAnswer());
};
/** The  createMockInvoiceRelatedPdct  function generates a mock invoice-related product object with randomly generated values for properties such as item name, item photo, quantity, rate, and amount. */
export const createMockInvoiceRelatedPdct = () => {
    return {
        item: faker.string.alphanumeric(10),
        itemName: faker.string.alphanumeric(10),
        itemPhoto: faker.image.url({
            width: 800,
            height: 600
        }),
        quantity: faker.number.int(3),
        rate: faker.number.int(3),
        amount: faker.number.int(3),
        currency: 'UGX'
    };
};
/** The  createMockInvoiceRelatedPdcts  function creates an array of mock invoice-related product objects of a specified length by calling the  createMockInvoiceRelatedPdct  function. */
export const createMockInvoiceRelatedPdcts = (length) => {
    return Array.from({ length }).map(() => createMockInvoiceRelatedPdct());
};
/** The  createMockInvoiceRelatedSolo  function generates a mock invoice-related object with randomly generated values for properties such as invoice related ID, creation type, estimate ID, invoice ID, billing user, items (an array of mock invoice-related product objects), billing user ID, billing user photo, stage, status, cost, payment made, tax, balance due, sub total, total, from date, to date, and payments (an array of mock payment install objects). */
export const createMockInvoiceRelatedSolo = () => {
    const relateds = {
        ...createMockDatabaseAuto(),
        invoiceRelated: faker.string.uuid(),
        creationType: 'solo',
        estimateId: faker.number.int(3),
        invoiceId: faker.number.int(3),
        billingUser: faker.internet.userName(),
        items: createMockInvoiceRelatedPdcts(10),
        billingUserId: faker.string.alphanumeric(10),
        billingUserPhoto: faker.image.avatar(),
        stage: 'estimate',
        status: 'paid',
        cost: faker.number.int({ min: 4, max: 8 }),
        paymentMade: faker.number.int({ min: 4, max: 8 }),
        tax: faker.number.int(3),
        balanceDue: faker.number.int({ min: 4, max: 8 }),
        subTotal: faker.number.int({ min: 4, max: 8 }),
        total: faker.number.int({ min: 4, max: 8 }),
        fromDate: faker.date.past(),
        toDate: faker.date.future(),
        payments: createMockReceipts(10),
        currency: 'UGX'
    };
    return relateds;
};
/** The  createMockInvoiceRelated  function creates a instance of the  InvoiceRelated  class by passing the mock invoice-related object generated by the  createMockInvoiceRelatedSolo  function. */
export const createMockInvoiceRelated = () => {
    return createMockInvoiceRelatedSolo();
};
/** The  createMockInvoiceRelated  function creates a instance of the  InvoiceRelated  class by passing the mock invoice-related object generated by the  createMockInvoiceRelatedSolo  function. */
export const createMockInvoiceRelatedWithReceipt = () => {
    return createMockInvoiceRelatedSolo();
};
/** The  createMockInvoiceRelateds  function creates an array of  InvoiceRelated  instances by calling the  createMockInvoiceRelated  function. */
export const createMockInvoiceRelatedWithReceipts = (length) => {
    return Array.from({ length }).map(() => createMockInvoiceRelatedWithReceipt());
};
/** The  createMockInvoiceRelatedsSolo  function creates an array of mock invoice-related objects of a specified length by calling the  createMockInvoiceRelatedSolo  function. */
export const createMockInvoiceRelatedsSolo = (length) => {
    return Array.from({ length }).map(() => createMockInvoiceRelatedSolo());
};
/** The  createMockInvoiceRelateds  function creates an array of  InvoiceRelated  instances by calling the  createMockInvoiceRelated  function. */
export const createMockInvoiceRelateds = (length) => {
    return Array.from({ length }).map(() => createMockInvoiceRelated());
};
export const createMockPaymentReceipts = (length) => {
    return Array.from({ length }).map(() => createMockReceipt());
};
/** The  createMockInvoice  function generates a mock invoice object by extending the  InvoiceRelated  class and adding a  dueDate  property with a randomly generated date value. */
export const createMockInvoice = () => {
    const invoice = {
        ...createMockInvoiceRelatedSolo(),
        clientName: faker.internet.userName(),
        dueDate: faker.date.future(),
        paymentMade: faker.number.int({ min: 4, max: 8 })
    };
    return invoice;
};
/** The  createMockInvoices  function creates an array of mock invoice objects of a specified length by calling the  createMockInvoice  function. */
export const createMockInvoices = (length) => {
    return Array.from({ length }).map(() => createMockInvoice());
};
/** createMockSponsored : This function creates a mock sponsored item with a randomly generated discount. */
export const createMockSponsored = () => ({
    item: createMockItem(),
    discount: Number(makeRandomString(10, 'numbers'))
});
/** createMockSponsoreds : This function creates an array of mock sponsored items with a specified length. */
export const createMockSponsoreds = (length) => {
    return Array.from({ length }).map(() => createMockSponsored());
};
/** createMockCart : This function creates a mock cart item with randomly generated quantity, rate, and total cost. */
export const createMockCart = () => {
    return {
        item: createMockItem(),
        quantity: faker.number.int(3),
        rate: faker.number.int(3),
        totalCostwithNoShipping: faker.number.int(3)
    };
};
/** createMockCarts : This function creates an array of mock cart items with a specified length. */
export const createMockCarts = (length) => {
    return Array.from({ length }).map(() => createMockCart());
};
/** createMockInvoiceMeta : This function creates a mock invoice meta object with randomly generated date, quantity, and cost. */
export const createMockInvoiceMeta = () => {
    return {
        date: faker.date.past(),
        quantity: faker.number.int(3),
        cost: faker.number.int(3)
    };
};
/** createMockInvoiceMetas : This function creates an array of mock invoice meta objects with a specified length. */
export const createMockInvoiceMetas = (length) => {
    return Array.from({ length }).map(() => createMockInvoiceMeta());
};
/** createMockCostMeta : This function creates a mock cost meta object with randomly generated selling price, cost price, currency, discount, and offer. */
export const createMockCostMeta = (offer) => {
    return {
        sellingPrice: faker.number.int(7),
        costPrice: faker.number.int(9),
        currency: 'UGX',
        discount: faker.number.int(2),
        offer
    };
};
/** createMockItem : This function creates a mock item object with various properties such as ID, name, brand, type, category, state, colors, model, origin, cost meta, description, inventory meta, photos, and others. It also includes methods for searching items, adding, updating, and deleting items, adding and updating sponsored items, liking and unliking items, and deleting images. */
export const createMockItem = (incrementor = 0) => {
    const item = {
        ...createMockDatabaseAuto(),
        urId: faker.string.uuid(),
        numbersInstock: faker.number.int(3),
        name: faker.internet.userName(),
        brand: faker.string.uuid(),
        type: faker.string.uuid(),
        category: faker.string.uuid(),
        state: 'new',
        photos: Array.from({ length: 4 }).map(() => createMockFileMeta()),
        colors: ['red'],
        model: faker.string.sample(),
        origin: faker.string.sample(),
        anyKnownProblems: faker.string.uuid(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.past(),
        costMeta: createMockCostMeta(incrementor % 2 === 0),
        description: faker.string.sample(),
        numberBought: faker.number.int(3),
        sponsored: [],
        buyerGuarantee: faker.string.sample(),
        reviewedBy: [],
        reviewCount: faker.number.int(3),
        reviewWeight: faker.number.int(3),
        reviewRatingsTotal: faker.number.int(3),
        likes: [],
        likesCount: faker.number.int(3),
        timesViewed: faker.number.int(3),
        orderedQty: faker.number.int(3),
        inventoryMeta: createMockInvoiceMetas(5)
    };
    return item;
};
/** createMockItems : This function creates an array of mock item objects with a specified length. */
export const createMockItems = (length) => {
    return Array.from({ length }).map(() => createMockItem());
};
/** createMockItemDecoy : This function
 * creates a mock item decoy by combining a mock
 * database auto object with a randomly generated UUID
 * and an array of mock items. It returns a instance
 * of the  ItemDecoy  class. */
export const createMockItemDecoy = () => {
    const decoy = {
        ...createMockDatabaseAuto(),
        companyId: faker.string.uuid(),
        urId: faker.string.uuid(),
        items: createMockItems(3)
    };
    return decoy;
};
/** createMockItemDecoys : This function
 * creates an array of mock item decoys by
 * calling the  createMockItemDecoy  function a
 * specified number of times. It returns
 * an array of  ItemDecoy  instances. */
export const createMockItemDecoys = (length) => {
    return Array.from({ length }).map(() => createMockItemDecoy());
};
export const createMockItemOffer = () => {
    const offer = {
        ...createMockDatabaseAuto(),
        urId: faker.string.uuid(),
        items: createMockItems(2),
        expireAt: faker.date.future(),
        type: 'string',
        header: faker.string.alphanumeric(20),
        subHeader: faker.string.alphanumeric(30),
        ammount: faker.number.int()
    };
    return offer;
};
export const createMockItemOffers = (length) => {
    return Array.from({ length }).map(() => createMockItemOffer());
};
export const createMockOrder = () => {
    const order = {
        ...createMockDatabaseAuto,
        ...createMockPaymentRelatedSolo,
        price: faker.number.int(),
        deliveryDate: faker.date.past()
    };
    return order;
};
export const createMockOrders = (length) => {
    return Array.from({ length }).map(() => createMockOrder());
};
export const createMockPaymentRelatedSolo = () => {
    const related = {
        ...createMockInvoiceRelatedSolo(),
        paymentRelated: faker.string.uuid(),
        urId: faker.string.uuid(),
        orderDate: faker.date.past(),
        paymentDate: faker.date.past(),
        billingAddress: createMockBilling(),
        shippingAddress: createMockAddress(),
        currency: 'UGX',
        user: createMockUser(),
        isBurgain: false,
        shipping: faker.number.int(),
        manuallyAdded: false,
        paymentMethod: 'pesapal'
    };
    return related;
};
export const createMockPaymentRelatedSolos = (length) => {
    return Array.from({ length }).map(() => createMockPaymentRelatedSolo());
};
export const createMockPaymentRelated = () => {
    return createMockPaymentRelatedSolo();
};
export const createMockPaymentRelateds = (length) => {
    return Array.from({ length }).map(() => createMockPaymentRelated);
};
export const createMockPayment = () => {
    const payment = {
        ...createMockPaymentRelatedSolo(),
        order: faker.string.uuid()
    };
    return payment;
};
export const createMockPayments = (length) => {
    return Array.from({ length }).map(() => createMockPayment());
};
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
export const createMockProfit = () => {
    const profit = {
        ...createMockDatabaseAuto(),
        margin: faker.number.int(3),
        origCost: faker.number.int(3),
        soldAtPrice: faker.number.int(3)
    };
    return profit;
};
export const createMockProfits = (length) => {
    return Array.from({ length }).map(() => createMockProfit());
};
export const createMockReceipt = () => {
    const receipt = {
        ...createMockDatabaseAuto(),
        urId: faker.string.uuid(),
        ammountRcievd: faker.number.int(3),
        paymentMode: faker.string.alphanumeric(4),
        type: 'ecomerce'
    };
    return receipt;
};
export const createMockReceipts = (length) => {
    return Array.from({ length }).map(() => createMockReceipt());
};
export const createMockReview = () => {
    const review = {
        ...createMockDatabaseAuto(),
        urId: faker.string.uuid(),
        name: faker.internet.userName(),
        email: faker.internet.email(),
        comment: faker.string.alpha(),
        rating: 10,
        images: Array.from({ length: 3 }).map(() => faker.internet.avatar()),
        userId: createMockUser(),
        itemId: faker.string.uuid()
    };
    return review;
};
export const createMockReviews = (length) => {
    return Array.from({ length }).map(() => createMockReview());
};
/** createMockCustomer : This function creates a mock customer object by combining a mock user base object (created by calling  createMockUserBase() ) with an array of mock addresses (created by calling  createMockAddress()  twice). The resulting customer object is then instantiated as a instance of the  Customer  class. */
export const createMockCustomer = () => {
    const customer = {
        ...createMockUserBase(),
        otherAddresses: [createMockAddress(), createMockAddress()]
    };
    return customer;
};
/** createMockCustomers : This function takes a number  length  as input and returns an array of mock customer objects. The length of the array is determined by the input parameter. Each mock customer object is created by calling  createMockCustomer() . */
export const createMockCustomers = (length) => {
    return Array.from({ length }).map(() => createMockCustomer());
};
/** The  createMockSalary  function generates a mock salary object with randomly generated amount and type properties. */
export const createMockSalary = () => ({
    amount: faker.number.int(),
    type: faker.string.alphanumeric(4)
});
/** The  createMockStaff  function creates a mock staff object by combining a mock user base object (not provided) with an employment type and a salary object generated by the  createMockSalary  function. The resulting object is then instantiated as an instance of the  Staff  class. */
export const createMockStaff = () => {
    const staff = {
        ...createMockUserBase(),
        employmentType: faker.string.alphanumeric(4),
        salary: createMockSalary()
    };
    return staff;
};
/** The  createMockStaffs  function generates an array of mock staff objects by calling the  createMockStaff  function a specified number of times. */
export const createMockStaffs = (length) => {
    return Array.from({ length }).map(() => createMockStaff());
};
/** The  createMockUserBase  function takes an optional parameter  incrementor  and returns an object with properties  user ,  startDate ,  endDate , and  occupation . The  user  property is assigned a random UUID string generated by the  faker.string.uuid()  function. The  startDate  and  endDate  properties are assigned random past and future dates generated by the  faker.date.past()  and  faker.date.future()  functions, respectively. The  occupation  property is assigned a random alphanumeric string generated by the  faker.string.alphanumeric()  function. */
export const createMockUserBase = (incrementor = 0) => ({
    ...createMockDatabaseAuto(),
    user: faker.string.uuid() + incrementor, // incrementor % 2 ? faker.string.uuid() : createMockUser(),
    startDate: faker.date.past(),
    endDate: faker.date.future(),
    occupation: faker.string.alphanumeric(5)
});
export const createMockCompanySubscription = () => ({
    subscriprionId: faker.string.uuid(),
    startDate: faker.date.past(),
    endDate: faker.date.future(),
    features: ['feature1', 'feature2', 'feature3']
});
export const createMockCompanySubscriptions = (length) => {
    return Array.from({ length }).map(() => createMockCompanySubscription());
};
export const createMockSubscriptionPackage = () => ({
    name: faker.string.alphanumeric(),
    ammount: faker.number.int(),
    duration: faker.number.int(),
    active: true,
    features: ['feature1', 'feature2', 'feature3']
});
export const createMockSubscriptionPackages = (length) => {
    return Array.from({ length }).map(() => createMockSubscriptionPackage());
};
//# sourceMappingURL=stock-counter-mocks.js.map