import { createPaymentRelatedModel } from './models/printables/paymentrelated/paymentrelated.model';
// import { createPaymentInstallModel } from './models/printables/paymentrelated/paymentsinstalls.model';
import { createInvoiceRelatedModel } from './models/printables/related/invoicerelated.model';
import { createExpenseReportModel } from './models/printables/report/expenesreport.model';
import { createInvoicesReportModel } from './models/printables/report/invoicereport.model';
import { createProfitandlossReportModel } from './models/printables/report/profitandlossreport.model';
import { createSalesReportModel } from './models/printables/report/salesreport.model';
import { createTaxReportModel } from './models/printables/report/taxreport.model';
import { createInvoiceSettingModel } from './models/printables/settings/invoicesettings.model';
import { createDeliveryNoteModel } from './models/printables/deliverynote.model';
import { createEstimateModel } from './models/printables/estimate.model';
import { createInvoiceModel } from './models/printables/invoice.model';
import { createJobCardModel } from './models/printables/jobcard.model';
import { createPickupLocationModel } from './models/printables/pickuplocation.model';
import { createReceiptModel } from './models/printables/receipt.model';
import { createCustomerModel } from './models/user-related/customer.model';
import { createStaffModel } from './models/user-related/staff.model';
import { createDeliverycityModel } from './models/deliverycity.model';
import { createExpenseModel } from './models/expense.model';
import { createFaqModel } from './models/faq.model';
import { createFaqanswerModel } from './models/faqanswer.model';
import { createItemModel } from './models/item.model';
import { createItemDecoyModel } from './models/itemdecoy.model';
import { createItemOfferModel } from './models/itemoffer.model';
import { createOrderModel } from './models/order.model';
import { createPaymentModel } from './models/payment.model';
import { createPromocodeModel } from './models/promocode.model';
import { createReviewModel } from './models/review.model';
import { createItemLimittedModel } from './models/itemlimitted.model';

/**
 * Indicates whether the stock counter server is currently running.
 */
export let isStockCounterServerRunning = false;

/**
 * The redirect URL for Pesapal notifications.
 */
export let pesapalNotifRedirectUrl = '';

/**
 * Creates stock counter server locals.
 * @param notifRedirectUrl - The notification redirect URL.
 */
export const createStockCounterServerLocals = (notifRedirectUrl: string) => {
  isStockCounterServerRunning = true;
  pesapalNotifRedirectUrl = notifRedirectUrl;
};

/**
 * Connects to the Stock Counter database.
 * po 8
 * @param databaseUrl The database URL for the server.
 * @returns A promise with the database models.
 */
export const connectStockCounterDatabase = (databaseUrl: string) => {
  return Promise.all([
    createPaymentRelatedModel(databaseUrl),
    // createPaymentInstallModel(databaseUrl),
    createInvoiceRelatedModel(databaseUrl),
    createExpenseReportModel(databaseUrl),
    createInvoicesReportModel(databaseUrl),
    createProfitandlossReportModel(databaseUrl),
    createSalesReportModel(databaseUrl),
    createTaxReportModel(databaseUrl),
    createInvoiceSettingModel(databaseUrl),
    createDeliveryNoteModel(databaseUrl),
    createEstimateModel(databaseUrl),
    createInvoiceModel(databaseUrl),
    createJobCardModel(databaseUrl),
    createPickupLocationModel(databaseUrl),
    createReceiptModel(databaseUrl),
    createCustomerModel(databaseUrl),
    createStaffModel(databaseUrl),
    createDeliverycityModel(databaseUrl),
    createExpenseModel(databaseUrl),
    createFaqModel(databaseUrl),
    createFaqanswerModel(databaseUrl),
    createItemModel(databaseUrl),
    createItemDecoyModel(databaseUrl),
    createItemOfferModel(databaseUrl),
    createOrderModel(databaseUrl),
    createPaymentModel(databaseUrl),
    createPromocodeModel(databaseUrl),
    createReviewModel(databaseUrl),
    createItemLimittedModel(databaseUrl)
  ]);
};
