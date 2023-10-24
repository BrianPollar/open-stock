import express from 'express';
import { reviewRoutes } from './routes/review.routes';
import { itemRoutes } from './routes/item.routes';
import { paymentRoutes } from './routes/payment.routes';
import { orderRoutes } from './routes/order.routes';
import { faqRoutes } from './routes/faq.routes';
import { deliverycityRoutes } from './routes/deliverycity.routes';
import { cookiesRoutes } from './routes/cookies.routes';
import { promocodeRoutes } from './routes/promo.routes';
import { deliveryNoteRoutes } from './routes/printables/deliverynote.routes';
import { estimateRoutes } from './routes/printables/estimate.routes';
import { invoiceRoutes } from './routes/printables/invoice.routes';
import { pickupLocationRoutes } from './routes/printables/pickuplocation.routes';
import { receiptRoutes } from './routes/printables/receipt.routes';
import { expenseRoutes } from './routes/expense.routes';
import { expenseReportRoutes } from './routes/printables/report/expensereport.routes';
import { profitAndLossReportRoutes } from './routes/printables/report/profitandlossreport.routes';
import { salesReportRoutes } from './routes/printables/report/salesreport.routes';
import { taxReportRoutes } from './routes/printables/report/taxreport.routes';
import { invoicesReportRoutes } from './routes/printables/report/invoicereport.routes';
import { invoiceSettingRoutes } from './routes/printables/settings/invoicesettings.routes';
// import { paymentInstallsRoutes } from './routes/paymentrelated/paymentinstalls.routes';
import { invoiceRelateRoutes } from './routes/printables/related/invoicerelated.route';
import { itemDecoyRoutes } from './routes/itemdecoy.routes';
import { itemOfferRoutes } from './routes/itemoffer.routes';
import { IlAuth } from '@open-stock/stock-auth-server';
import { runPassport } from '@open-stock/stock-universal-server';
import { PesaPalController } from 'pesapal3';
import { customerRoutes } from './routes/user-related/customer.routes';
import { staffRoutes } from './routes/user-related/staff.routes';
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
import { EmailHandler } from '@open-stock/stock-notif-server';
import { itemLimittedRoutes } from './routes/itemlimitted.routes';
import { createItemLimittedModel } from './models/itemlimitted.model';
import { localUserRoutes } from './routes/user-related/locluser.routes';

/**
 * Represents the configuration object for the StockCounterServer.
 */
export interface IstockcounterServerConfig {
  /**
   * The authentication secrets for the server.
   */
  authSecrets: IlAuth;
  /**
  * The database configuration URL.
  */
  databaseConfigUrl: string;
  /**
  * The URL for the notification redirect.
  */
  notifRedirectUrl: string;
  /**
  * The path configuration for the local server.
  */
  localPath: IlocalPath;
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
 * Represents the Stock Counter Server.
 */
class StockCounterServer {
  /**
   * Constructor for the StockCounterServer class.
   *
   * @param notifRedirectUrl The URL for the notification redirect.
   * @param pesapalPaymentInstance The PesaPal payment instance for the server.
   * @param locaLMailHandler The mail handler for the server.
   */
  constructor(
    public notifRedirectUrl: string,
    public pesapalPaymentInstance: PesaPalController,
    public locaLMailHandler: EmailHandler
  ) { }
}

/**
 * Connects to the Stock Counter database.
 *
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

/** */
export const runStockCounterServer = async(
  config: IstockcounterServerConfig,
  paymentInstance: PesaPalController,
  emailHandler: EmailHandler, app) => {
  app.locals.stockCounterRouter = true;
  Object.keys(config.localPath).forEach(key => {
    app.locals[key] = config.localPath[key];
  });

  // connect models
  await connectStockCounterDatabase(config.databaseConfigUrl);

  pesapalPaymentInstance = paymentInstance;

  const stockCounterServer = new StockCounterServer(config.notifRedirectUrl, paymentInstance, emailHandler);

  app.locals.stockCounterServer = stockCounterServer;
  runPassport(config.authSecrets.jwtSecret);
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

  // limitted items
  stockCounterRouter.use('/itemlimitted', itemLimittedRoutes);

  // user-related
  stockCounterRouter.use('/customer', customerRoutes);
  stockCounterRouter.use('/staff', staffRoutes);
  stockCounterRouter.use('/localuser', localUserRoutes);

  return stockCounterRouter;
};