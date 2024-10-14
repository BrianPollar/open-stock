import { createPaymentRelatedModel } from './models/printables/paymentrelated/paymentrelated.model';
import { createDeliverycityModel } from './models/deliverycity.model';
import { createExpenseModel } from './models/expense.model';
import { createFaqModel } from './models/faq.model';
import { createFaqanswerModel } from './models/faqanswer.model';
import { createItemModel } from './models/item.model';
import { createItemDecoyModel } from './models/itemdecoy.model';
import { createItemOfferModel } from './models/itemoffer.model';
import { createOrderModel } from './models/order.model';
import { createPaymentModel } from './models/payment.model';
import { createDeliveryNoteModel } from './models/printables/deliverynote.model';
import { createEstimateModel } from './models/printables/estimate.model';
import { createInvoiceModel } from './models/printables/invoice.model';
import { createJobCardModel } from './models/printables/jobcard.model';
import { createPickupLocationModel } from './models/printables/pickuplocation.model';
import { createReceiptModel } from './models/printables/receipt.model';
import { createInvoiceRelatedModel } from './models/printables/related/invoicerelated.model';
import { createExpenseReportModel } from './models/printables/report/expenesreport.model';
import { createInvoicesReportModel } from './models/printables/report/invoicereport.model';
import { createProfitandlossReportModel } from './models/printables/report/profitandlossreport.model';
import { createSalesReportModel } from './models/printables/report/salesreport.model';
import { createTaxReportModel } from './models/printables/report/taxreport.model';
import { createInvoiceSettingModel } from './models/printables/settings/invoicesettings.model';
import { createUserWalletHistoryModel } from './models/printables/wallet/user-wallet-history.model';
import { createUserWalletModel } from './models/printables/wallet/user-wallet.model';
import { createWaitingWalletPaytModel } from './models/printables/wallet/waiting-wallet-pay.model';
import { createPromocodeModel } from './models/promocode.model';
import { createReviewModel } from './models/review.model';
import { createCustomerModel } from './models/user-related/customer.model';
import { createStaffModel } from './models/user-related/staff.model';
import { createUserBehaviourModel } from './models/user-related/user-behaviour.model';
/**
 * Indicates whether the stock counter server is currently running.
 */
export let isStockCounterServerRunning = false;
/**
 * The redirect URL for Pesapal notifications.
 */
export let pesapalNotifRedirectUrl = '';
export let ecommerceRevenuePercentage = 0;
/**
 * Creates stock counter server locals.
 * @param notifRedirectUrl - The notification redirect URL.
 */
export const createStockCounterServerLocals = (notifRedirectUrl, ecommerceRevenuePerntge) => {
    isStockCounterServerRunning = true;
    pesapalNotifRedirectUrl = notifRedirectUrl;
    ecommerceRevenuePercentage = ecommerceRevenuePerntge;
};
/**
 * Connects to the Stock Counter database.
 * po 8
 * @param databaseUrl The database URL for the server.
 * @returns A promise with the database models.
 */
export const connectStockCounterDatabase = (databaseUrl, dbOptions) => {
    return Promise.all([
        createPaymentRelatedModel(databaseUrl, dbOptions),
        // createPaymentInstallModel(databaseUrl),
        createInvoiceRelatedModel(databaseUrl, dbOptions),
        createExpenseReportModel(databaseUrl, dbOptions),
        createInvoicesReportModel(databaseUrl, dbOptions),
        createProfitandlossReportModel(databaseUrl, dbOptions),
        createSalesReportModel(databaseUrl, dbOptions),
        createTaxReportModel(databaseUrl, dbOptions),
        createInvoiceSettingModel(databaseUrl, dbOptions),
        createDeliveryNoteModel(databaseUrl, dbOptions),
        createEstimateModel(databaseUrl, dbOptions),
        createInvoiceModel(databaseUrl, dbOptions),
        createJobCardModel(databaseUrl, dbOptions),
        createPickupLocationModel(databaseUrl, dbOptions),
        createReceiptModel(databaseUrl, dbOptions),
        createCustomerModel(databaseUrl, dbOptions),
        createStaffModel(databaseUrl, dbOptions),
        createDeliverycityModel(databaseUrl, dbOptions),
        createExpenseModel(databaseUrl, dbOptions),
        createFaqModel(databaseUrl, dbOptions),
        createFaqanswerModel(databaseUrl, dbOptions),
        createItemModel(databaseUrl, dbOptions),
        createItemDecoyModel(databaseUrl, dbOptions),
        createItemOfferModel(databaseUrl, dbOptions),
        createOrderModel(databaseUrl, dbOptions),
        createPaymentModel(databaseUrl, dbOptions),
        createPromocodeModel(databaseUrl, dbOptions),
        createReviewModel(databaseUrl, dbOptions),
        createUserBehaviourModel(databaseUrl, dbOptions),
        createUserWalletModel(databaseUrl, dbOptions),
        createUserWalletHistoryModel(databaseUrl, dbOptions),
        createWaitingWalletPaytModel(databaseUrl, dbOptions)
    ]);
};
//# sourceMappingURL=stock-counter-local.js.map