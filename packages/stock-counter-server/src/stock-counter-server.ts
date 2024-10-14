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
import { ConnectOptions } from 'mongoose';
import { PesaPalController } from 'pesapal3';
import { itemDecoyRoutes } from './routes/itemdecoy.routes';
import { itemOfferRoutes } from './routes/itemoffer.routes';
import { notifyAllOnDueDate } from './routes/paymentrelated/paymentrelated';
import { invoiceRelateRoutes } from './routes/printables/related/invoicerelated.route';
import { customerRoutes } from './routes/user-related/customer.routes';
import { staffRoutes } from './routes/user-related/staff.routes';
import { walletRoutes } from './routes/user-related/wallet.routes';
import {
  connectStockCounterDatabase,
  createStockCounterServerLocals,
  isStockCounterServerRunning
} from './stock-counter-local';

/**
 * Represents the configuration object for the StockCounterServer.
 */
export interface IstockcounterServerConfig {

  /**
   * The authentication secrets for the server.
   */
  // authSecrets: IlAuth;

  /**
  * The database configuration.
  */
  databaseConfig: {
    url: string;
    dbOptions?: ConnectOptions;
  };

  /**
  * The URL for the notification redirect.
  */
  pesapalNotificationRedirectUrl: string;

  /**
  * The path configuration for the local server.
  */
  localPath: IlocalPath;
  ecommerceRevenuePercentage: number; // leas than 100

}

/**
 * Represents the local path configuration for the server.
 */
export interface IlocalPath {

  /**
  * The absolute path for the server.
  */
  absolutepath: string;

  /**
  * The photo directory for the server.
  */
  photoDirectory: string;

  /**
  * The video directory for the server.
  */
  videoDirectory: string;
}

/**
 * The PesaPal payment instance for the server.
 */
export let pesapalPaymentInstance: PesaPalController;

/**
 * The URL to redirect to when a notification is received.
 */
export let notifRedirectUrl: string;

/**
 * Runs the Stock Counter server with the provided configuration and payment instance.
 * @param config - The configuration for the Stock Counter server.
 * @param paymentInstance - The payment instance for handling payments.
 * @returns A promise that resolves to an object containing the Stock Counter router.
 * @throws An error if the authentication server is not running.
 */
export const runStockCounterServer = async(
  config: IstockcounterServerConfig,
  paymentInstance: PesaPalController
) => {
  if (!isAuthServerRunning()) {
    const error = new Error('Auth server is not running, please start by firing up that server');

    throw error;
  }
  // connect models
  await connectStockCounterDatabase(config.databaseConfig.url, config.databaseConfig.dbOptions);

  pesapalPaymentInstance = paymentInstance;

  // runPassport(stockUniversalConfig.authSecrets.jwtSecret);
  const stockCounterRouter = express.Router();


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
  // TODO make a dummy route for this
  stockCounterRouter.use('/wallet', walletRoutes);

  createStockCounterServerLocals(
    config.pesapalNotificationRedirectUrl,
    config.ecommerceRevenuePercentage
  );
  runAutoIntervaller();

  return { stockCounterRouter };
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
