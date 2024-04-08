"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectStockCounterDatabase = exports.createStockCounterServerLocals = exports.pesapalNotifRedirectUrl = exports.isStockCounterServerRunning = void 0;
const paymentrelated_model_1 = require("./models/printables/paymentrelated/paymentrelated.model");
// import { createPaymentInstallModel } from './models/printables/paymentrelated/paymentsinstalls.model';
const deliverycity_model_1 = require("./models/deliverycity.model");
const expense_model_1 = require("./models/expense.model");
const faq_model_1 = require("./models/faq.model");
const faqanswer_model_1 = require("./models/faqanswer.model");
const item_model_1 = require("./models/item.model");
const itemdecoy_model_1 = require("./models/itemdecoy.model");
const itemlimitted_model_1 = require("./models/itemlimitted.model");
const itemoffer_model_1 = require("./models/itemoffer.model");
const order_model_1 = require("./models/order.model");
const payment_model_1 = require("./models/payment.model");
const deliverynote_model_1 = require("./models/printables/deliverynote.model");
const estimate_model_1 = require("./models/printables/estimate.model");
const invoice_model_1 = require("./models/printables/invoice.model");
const jobcard_model_1 = require("./models/printables/jobcard.model");
const pickuplocation_model_1 = require("./models/printables/pickuplocation.model");
const receipt_model_1 = require("./models/printables/receipt.model");
const invoicerelated_model_1 = require("./models/printables/related/invoicerelated.model");
const expenesreport_model_1 = require("./models/printables/report/expenesreport.model");
const invoicereport_model_1 = require("./models/printables/report/invoicereport.model");
const profitandlossreport_model_1 = require("./models/printables/report/profitandlossreport.model");
const salesreport_model_1 = require("./models/printables/report/salesreport.model");
const taxreport_model_1 = require("./models/printables/report/taxreport.model");
const invoicesettings_model_1 = require("./models/printables/settings/invoicesettings.model");
const promocode_model_1 = require("./models/promocode.model");
const review_model_1 = require("./models/review.model");
const customer_model_1 = require("./models/user-related/customer.model");
const staff_model_1 = require("./models/user-related/staff.model");
/**
 * Indicates whether the stock counter server is currently running.
 */
exports.isStockCounterServerRunning = false;
/**
 * The redirect URL for Pesapal notifications.
 */
exports.pesapalNotifRedirectUrl = '';
/**
 * Creates stock counter server locals.
 * @param notifRedirectUrl - The notification redirect URL.
 */
const createStockCounterServerLocals = (notifRedirectUrl) => {
    exports.isStockCounterServerRunning = true;
    exports.pesapalNotifRedirectUrl = notifRedirectUrl;
};
exports.createStockCounterServerLocals = createStockCounterServerLocals;
/**
 * Connects to the Stock Counter database.
 * po 8
 * @param databaseUrl The database URL for the server.
 * @returns A promise with the database models.
 */
const connectStockCounterDatabase = (databaseUrl, dbOptions) => {
    return Promise.all([
        (0, paymentrelated_model_1.createPaymentRelatedModel)(databaseUrl, dbOptions),
        // createPaymentInstallModel(databaseUrl),
        (0, invoicerelated_model_1.createInvoiceRelatedModel)(databaseUrl, dbOptions),
        (0, expenesreport_model_1.createExpenseReportModel)(databaseUrl, dbOptions),
        (0, invoicereport_model_1.createInvoicesReportModel)(databaseUrl, dbOptions),
        (0, profitandlossreport_model_1.createProfitandlossReportModel)(databaseUrl, dbOptions),
        (0, salesreport_model_1.createSalesReportModel)(databaseUrl, dbOptions),
        (0, taxreport_model_1.createTaxReportModel)(databaseUrl, dbOptions),
        (0, invoicesettings_model_1.createInvoiceSettingModel)(databaseUrl, dbOptions),
        (0, deliverynote_model_1.createDeliveryNoteModel)(databaseUrl, dbOptions),
        (0, estimate_model_1.createEstimateModel)(databaseUrl, dbOptions),
        (0, invoice_model_1.createInvoiceModel)(databaseUrl, dbOptions),
        (0, jobcard_model_1.createJobCardModel)(databaseUrl, dbOptions),
        (0, pickuplocation_model_1.createPickupLocationModel)(databaseUrl, dbOptions),
        (0, receipt_model_1.createReceiptModel)(databaseUrl, dbOptions),
        (0, customer_model_1.createCustomerModel)(databaseUrl, dbOptions),
        (0, staff_model_1.createStaffModel)(databaseUrl, dbOptions),
        (0, deliverycity_model_1.createDeliverycityModel)(databaseUrl, dbOptions),
        (0, expense_model_1.createExpenseModel)(databaseUrl, dbOptions),
        (0, faq_model_1.createFaqModel)(databaseUrl, dbOptions),
        (0, faqanswer_model_1.createFaqanswerModel)(databaseUrl, dbOptions),
        (0, item_model_1.createItemModel)(databaseUrl, dbOptions),
        (0, itemdecoy_model_1.createItemDecoyModel)(databaseUrl, dbOptions),
        (0, itemoffer_model_1.createItemOfferModel)(databaseUrl, dbOptions),
        (0, order_model_1.createOrderModel)(databaseUrl, dbOptions),
        (0, payment_model_1.createPaymentModel)(databaseUrl, dbOptions),
        (0, promocode_model_1.createPromocodeModel)(databaseUrl, dbOptions),
        (0, review_model_1.createReviewModel)(databaseUrl, dbOptions),
        (0, itemlimitted_model_1.createItemLimittedModel)(databaseUrl, dbOptions)
    ]);
};
exports.connectStockCounterDatabase = connectStockCounterDatabase;
//# sourceMappingURL=stock-counter-local.js.map