"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectStockCounterDatabase = exports.createStockCounterServerLocals = exports.pesapalNotifRedirectUrl = exports.isStockCounterServerRunning = void 0;
const paymentrelated_model_1 = require("./models/printables/paymentrelated/paymentrelated.model");
// import { createPaymentInstallModel } from './models/printables/paymentrelated/paymentsinstalls.model';
const invoicerelated_model_1 = require("./models/printables/related/invoicerelated.model");
const expenesreport_model_1 = require("./models/printables/report/expenesreport.model");
const invoicereport_model_1 = require("./models/printables/report/invoicereport.model");
const profitandlossreport_model_1 = require("./models/printables/report/profitandlossreport.model");
const salesreport_model_1 = require("./models/printables/report/salesreport.model");
const taxreport_model_1 = require("./models/printables/report/taxreport.model");
const invoicesettings_model_1 = require("./models/printables/settings/invoicesettings.model");
const deliverynote_model_1 = require("./models/printables/deliverynote.model");
const estimate_model_1 = require("./models/printables/estimate.model");
const invoice_model_1 = require("./models/printables/invoice.model");
const jobcard_model_1 = require("./models/printables/jobcard.model");
const pickuplocation_model_1 = require("./models/printables/pickuplocation.model");
const receipt_model_1 = require("./models/printables/receipt.model");
const customer_model_1 = require("./models/user-related/customer.model");
const staff_model_1 = require("./models/user-related/staff.model");
const deliverycity_model_1 = require("./models/deliverycity.model");
const expense_model_1 = require("./models/expense.model");
const faq_model_1 = require("./models/faq.model");
const faqanswer_model_1 = require("./models/faqanswer.model");
const item_model_1 = require("./models/item.model");
const itemdecoy_model_1 = require("./models/itemdecoy.model");
const itemoffer_model_1 = require("./models/itemoffer.model");
const order_model_1 = require("./models/order.model");
const payment_model_1 = require("./models/payment.model");
const promocode_model_1 = require("./models/promocode.model");
const review_model_1 = require("./models/review.model");
const itemlimitted_model_1 = require("./models/itemlimitted.model");
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
const connectStockCounterDatabase = (databaseUrl) => {
    return Promise.all([
        (0, paymentrelated_model_1.createPaymentRelatedModel)(databaseUrl),
        // createPaymentInstallModel(databaseUrl),
        (0, invoicerelated_model_1.createInvoiceRelatedModel)(databaseUrl),
        (0, expenesreport_model_1.createExpenseReportModel)(databaseUrl),
        (0, invoicereport_model_1.createInvoicesReportModel)(databaseUrl),
        (0, profitandlossreport_model_1.createProfitandlossReportModel)(databaseUrl),
        (0, salesreport_model_1.createSalesReportModel)(databaseUrl),
        (0, taxreport_model_1.createTaxReportModel)(databaseUrl),
        (0, invoicesettings_model_1.createInvoiceSettingModel)(databaseUrl),
        (0, deliverynote_model_1.createDeliveryNoteModel)(databaseUrl),
        (0, estimate_model_1.createEstimateModel)(databaseUrl),
        (0, invoice_model_1.createInvoiceModel)(databaseUrl),
        (0, jobcard_model_1.createJobCardModel)(databaseUrl),
        (0, pickuplocation_model_1.createPickupLocationModel)(databaseUrl),
        (0, receipt_model_1.createReceiptModel)(databaseUrl),
        (0, customer_model_1.createCustomerModel)(databaseUrl),
        (0, staff_model_1.createStaffModel)(databaseUrl),
        (0, deliverycity_model_1.createDeliverycityModel)(databaseUrl),
        (0, expense_model_1.createExpenseModel)(databaseUrl),
        (0, faq_model_1.createFaqModel)(databaseUrl),
        (0, faqanswer_model_1.createFaqanswerModel)(databaseUrl),
        (0, item_model_1.createItemModel)(databaseUrl),
        (0, itemdecoy_model_1.createItemDecoyModel)(databaseUrl),
        (0, itemoffer_model_1.createItemOfferModel)(databaseUrl),
        (0, order_model_1.createOrderModel)(databaseUrl),
        (0, payment_model_1.createPaymentModel)(databaseUrl),
        (0, promocode_model_1.createPromocodeModel)(databaseUrl),
        (0, review_model_1.createReviewModel)(databaseUrl),
        (0, itemlimitted_model_1.createItemLimittedModel)(databaseUrl)
    ]);
};
exports.connectStockCounterDatabase = connectStockCounterDatabase;
//# sourceMappingURL=stock-counter-local.js.map