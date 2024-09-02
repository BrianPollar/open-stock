import express from 'express';
import { cookiesRoutes } from './routes/cookies.routes';
import { deliverycityRoutes } from './routes/deliverycity.routes';
import { expenseRoutes } from './routes/expense.routes';
import { faqRoutes } from './routes/faq.routes';
import { itemRoutes } from './routes/item.routes';
import { orderRoutes } from './routes/order.routes';
import { paymentRoutes } from './routes/payment.routes';
import { deliveryNoteRoutes } from './routes/printables/deliverynote.routes';
import { estimateRoutes } from './routes/printables/estimate.routes';
import { invoiceRoutes } from './routes/printables/invoice.routes';
import { pickupLocationRoutes } from './routes/printables/pickuplocation.routes';
import { receiptRoutes } from './routes/printables/receipt.routes';
import { expenseReportRoutes } from './routes/printables/report/expensereport.routes';
import { invoicesReportRoutes } from './routes/printables/report/invoicereport.routes';
import { profitAndLossReportRoutes } from './routes/printables/report/profitandlossreport.routes';
import { salesReportRoutes } from './routes/printables/report/salesreport.routes';
import { taxReportRoutes } from './routes/printables/report/taxreport.routes';
import { invoiceSettingRoutes } from './routes/printables/settings/invoicesettings.routes';
import { promocodeRoutes } from './routes/promo.routes';
import { reviewRoutes } from './routes/review.routes';
// import { paymentInstallsRoutes } from './routes/paymentrelated/paymentinstalls.routes';
import { isAuthServerRunning } from '@open-stock/stock-auth-server';
import { runPassport, stockUniversalConfig } from '@open-stock/stock-universal-server';
import { cookiesRoutesDummy } from './routes-dummy/cookies.routes';
import { deliverycityRoutesDummy } from './routes-dummy/deliverycity.routes';
import { expenseRoutesDummy } from './routes-dummy/expense.routes';
import { faqRoutesDummy } from './routes-dummy/faq.routes';
import { itemRoutesDummy } from './routes-dummy/item.routes';
import { itemDecoyRoutesDummy } from './routes-dummy/itemdecoy.routes';
import { itemOfferRoutesDummy } from './routes-dummy/itemoffer.routes';
import { orderRoutesDummy } from './routes-dummy/order.routes';
import { paymentRoutesDummy } from './routes-dummy/payment.routes';
import { deliveryNoteRoutesDummy } from './routes-dummy/printables/deliverynote.routes';
import { estimateRoutesDummy } from './routes-dummy/printables/estimate.routes';
import { invoiceRoutesDummy } from './routes-dummy/printables/invoice.routes';
import { pickupLocationRoutesDummy } from './routes-dummy/printables/pickuplocation.routes';
import { receiptRoutesDummy } from './routes-dummy/printables/receipt.routes';
import { invoiceRelateRoutesDummy } from './routes-dummy/printables/related/invoicerelated.route';
import { expenseReportRoutesDummy } from './routes-dummy/printables/report/expensereport.routes';
import { invoicesReportRoutesDummy } from './routes-dummy/printables/report/invoicereport.routes';
import { profitAndLossReportRoutesDummy } from './routes-dummy/printables/report/profitandlossreport.routes';
import { salesReportRoutesDummy } from './routes-dummy/printables/report/salesreport.routes';
import { taxReportRoutesDummy } from './routes-dummy/printables/report/taxreport.routes';
import { invoiceSettingRoutesDummy } from './routes-dummy/printables/settings/invoicesettings.routes';
import { promocodeRoutesDummy } from './routes-dummy/promo.routes';
import { reviewRoutesDummy } from './routes-dummy/review.routes';
import { customerRoutesDummy } from './routes-dummy/user-related/customer.routes';
import { localUserRoutesDummy } from './routes-dummy/user-related/locluser.routes';
import { staffRoutesDummy } from './routes-dummy/user-related/staff.routes';
import { itemDecoyRoutes } from './routes/itemdecoy.routes';
import { itemOfferRoutes } from './routes/itemoffer.routes';
import { notifyAllOnDueDate } from './routes/paymentrelated/paymentrelated';
import { invoiceRelateRoutes } from './routes/printables/related/invoicerelated.route';
import { customerRoutes } from './routes/user-related/customer.routes';
import { localUserRoutes } from './routes/user-related/locluser.routes';
import { staffRoutes } from './routes/user-related/staff.routes';
import { walletRoutes } from './routes/user-related/wallet.routes';
import { connectStockCounterDatabase, createStockCounterServerLocals, isStockCounterServerRunning } from './stock-counter-local';
/**
 * The PesaPal payment instance for the server.
 */
export let pesapalPaymentInstance;
/**
 * The URL to redirect to when a notification is received.
 */
export let notifRedirectUrl;
/**
 * Runs the Stock Counter server with the provided configuration and payment instance.
 * @param config - The configuration for the Stock Counter server.
 * @param paymentInstance - The payment instance for handling payments.
 * @returns A promise that resolves to an object containing the Stock Counter router.
 * @throws An error if the authentication server is not running.
 */
export const runStockCounterServer = async (config, paymentInstance) => {
    if (!isAuthServerRunning()) {
        const error = new Error('Auth server is not running, please start by firing up that server');
        throw error;
    }
    // connect models
    await connectStockCounterDatabase(config.databaseConfig.url, config.databaseConfig.dbOptions);
    pesapalPaymentInstance = paymentInstance;
    runPassport(stockUniversalConfig.authSecrets.jwtSecret);
    const stockCounterRouter = express.Router();
    if (!config.useDummyRoutes) {
        stockCounterRouter.use('/review', reviewRoutes);
        stockCounterRouter.use('/item', itemRoutes);
        stockCounterRouter.use('/payment', paymentRoutes);
        stockCounterRouter.use('/order', orderRoutes);
        stockCounterRouter.use('/faq', faqRoutes);
        stockCounterRouter.use('/deliverycity', deliverycityRoutes);
        stockCounterRouter.use('/cookies', cookiesRoutes);
        stockCounterRouter.use('/promo', promocodeRoutes);
        stockCounterRouter.use('/deliverynote', deliveryNoteRoutes);
        stockCounterRouter.use('/estimate', estimateRoutes);
        stockCounterRouter.use('/invoice', invoiceRoutes);
        stockCounterRouter.use('/pickuplocation', pickupLocationRoutes);
        stockCounterRouter.use('/receipt', receiptRoutes);
        stockCounterRouter.use('/expense', expenseRoutes);
        // reports
        stockCounterRouter.use('/expensereport', expenseReportRoutes);
        stockCounterRouter.use('/profitandlossreport', profitAndLossReportRoutes);
        stockCounterRouter.use('/salesreport', salesReportRoutes);
        stockCounterRouter.use('/taxreport', taxReportRoutes);
        stockCounterRouter.use('/invoicesreport', invoicesReportRoutes);
        // settings
        stockCounterRouter.use('/invoicesettings', invoiceSettingRoutes);
        // pay installs
        // stockCounterRouter.use('/paymentinstalls', paymentInstallsRoutes);
        stockCounterRouter.use('/invoicerelated', invoiceRelateRoutes);
        // decoys
        stockCounterRouter.use('/itemdecoy', itemDecoyRoutes);
        // offers
        stockCounterRouter.use('/itemoffer', itemOfferRoutes);
        // user-related
        stockCounterRouter.use('/customer', customerRoutes);
        stockCounterRouter.use('/staff', staffRoutes);
        stockCounterRouter.use('/localuser', localUserRoutes);
        // TODO make a dummy route for this
        stockCounterRouter.use('/wallet', walletRoutes);
    }
    else {
        stockCounterRouter.use('/review', reviewRoutesDummy);
        stockCounterRouter.use('/item', itemRoutesDummy);
        stockCounterRouter.use('/payment', paymentRoutesDummy);
        stockCounterRouter.use('/order', orderRoutesDummy);
        stockCounterRouter.use('/faq', faqRoutesDummy);
        stockCounterRouter.use('/deliverycity', deliverycityRoutesDummy);
        stockCounterRouter.use('/cookies', cookiesRoutesDummy);
        stockCounterRouter.use('/promo', promocodeRoutesDummy);
        stockCounterRouter.use('/deliverynote', deliveryNoteRoutesDummy);
        stockCounterRouter.use('/estimate', estimateRoutesDummy);
        stockCounterRouter.use('/invoice', invoiceRoutesDummy);
        stockCounterRouter.use('/pickuplocation', pickupLocationRoutesDummy);
        stockCounterRouter.use('/receipt', receiptRoutesDummy);
        stockCounterRouter.use('/expense', expenseRoutesDummy);
        // reports
        stockCounterRouter.use('/expensereport', expenseReportRoutesDummy);
        stockCounterRouter.use('/profitandlossreport', profitAndLossReportRoutesDummy);
        stockCounterRouter.use('/salesreport', salesReportRoutesDummy);
        stockCounterRouter.use('/taxreport', taxReportRoutesDummy);
        stockCounterRouter.use('/invoicesreport', invoicesReportRoutesDummy);
        // settings
        stockCounterRouter.use('/invoicesettings', invoiceSettingRoutesDummy);
        // pay installs
        // stockCounterRouter.use('/paymentinstalls', express.Router());
        stockCounterRouter.use('/invoicerelated', invoiceRelateRoutesDummy);
        // decoys
        stockCounterRouter.use('/itemdecoy', itemDecoyRoutesDummy);
        // offers
        stockCounterRouter.use('/itemoffer', itemOfferRoutesDummy);
        // user-related
        stockCounterRouter.use('/customer', customerRoutesDummy);
        stockCounterRouter.use('/staff', staffRoutesDummy);
        stockCounterRouter.use('/localuser', localUserRoutesDummy);
    }
    createStockCounterServerLocals(config.pesapalNotificationRedirectUrl, config.ecommerceRevenuePercentage);
    runAutoIntervaller();
    return Promise.resolve({ stockCounterRouter });
};
/**
 * Checks if the stock counter server is running.
 * @returns {boolean} True if the stock counter server is running, false otherwise.
 */
export const isCounterServerRunning = () => isStockCounterServerRunning;
export const runAutoIntervaller = () => {
    setTimeout(() => {
        setInterval(() => {
            notifyAllOnDueDate();
        }, 24 * 60 * 60 * 1000); // 24 hour interval
    }, 5 * 60 * 1000); // 5 minute delay
};
//# sourceMappingURL=stock-counter-server.js.map