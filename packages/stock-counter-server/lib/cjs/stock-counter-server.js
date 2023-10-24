"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runStockCounterServer = exports.connectStockCounterDatabase = exports.pesapalPaymentInstance = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const review_routes_1 = require("./routes/review.routes");
const item_routes_1 = require("./routes/item.routes");
const payment_routes_1 = require("./routes/payment.routes");
const order_routes_1 = require("./routes/order.routes");
const faq_routes_1 = require("./routes/faq.routes");
const deliverycity_routes_1 = require("./routes/deliverycity.routes");
const cookies_routes_1 = require("./routes/cookies.routes");
const promo_routes_1 = require("./routes/promo.routes");
const deliverynote_routes_1 = require("./routes/printables/deliverynote.routes");
const estimate_routes_1 = require("./routes/printables/estimate.routes");
const invoice_routes_1 = require("./routes/printables/invoice.routes");
const pickuplocation_routes_1 = require("./routes/printables/pickuplocation.routes");
const receipt_routes_1 = require("./routes/printables/receipt.routes");
const expense_routes_1 = require("./routes/expense.routes");
const expensereport_routes_1 = require("./routes/printables/report/expensereport.routes");
const profitandlossreport_routes_1 = require("./routes/printables/report/profitandlossreport.routes");
const salesreport_routes_1 = require("./routes/printables/report/salesreport.routes");
const taxreport_routes_1 = require("./routes/printables/report/taxreport.routes");
const invoicereport_routes_1 = require("./routes/printables/report/invoicereport.routes");
const invoicesettings_routes_1 = require("./routes/printables/settings/invoicesettings.routes");
// import { paymentInstallsRoutes } from './routes/paymentrelated/paymentinstalls.routes';
const invoicerelated_route_1 = require("./routes/printables/related/invoicerelated.route");
const itemdecoy_routes_1 = require("./routes/itemdecoy.routes");
const itemoffer_routes_1 = require("./routes/itemoffer.routes");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const customer_routes_1 = require("./routes/user-related/customer.routes");
const staff_routes_1 = require("./routes/user-related/staff.routes");
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
const itemlimitted_routes_1 = require("./routes/itemlimitted.routes");
const itemlimitted_model_1 = require("./models/itemlimitted.model");
const locluser_routes_1 = require("./routes/user-related/locluser.routes");
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
    constructor(notifRedirectUrl, pesapalPaymentInstance, locaLMailHandler) {
        this.notifRedirectUrl = notifRedirectUrl;
        this.pesapalPaymentInstance = pesapalPaymentInstance;
        this.locaLMailHandler = locaLMailHandler;
    }
}
/**
 * Connects to the Stock Counter database.
 *
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
/** */
const runStockCounterServer = async (config, paymentInstance, emailHandler, app) => {
    app.locals.stockCounterRouter = true;
    Object.keys(config.localPath).forEach(key => {
        app.locals[key] = config.localPath[key];
    });
    // connect models
    await (0, exports.connectStockCounterDatabase)(config.databaseConfigUrl);
    exports.pesapalPaymentInstance = paymentInstance;
    const stockCounterServer = new StockCounterServer(config.notifRedirectUrl, paymentInstance, emailHandler);
    app.locals.stockCounterServer = stockCounterServer;
    (0, stock_universal_server_1.runPassport)(config.authSecrets.jwtSecret);
    const stockCounterRouter = express_1.default.Router();
    stockCounterRouter.use('/review', review_routes_1.reviewRoutes);
    stockCounterRouter.use('/item', item_routes_1.itemRoutes);
    stockCounterRouter.use('/payment', payment_routes_1.paymentRoutes);
    stockCounterRouter.use('/order', order_routes_1.orderRoutes);
    stockCounterRouter.use('/faq', faq_routes_1.faqRoutes);
    stockCounterRouter.use('/deliverycity', deliverycity_routes_1.deliverycityRoutes);
    stockCounterRouter.use('/cookies', cookies_routes_1.cookiesRoutes);
    stockCounterRouter.use('/promo', promo_routes_1.promocodeRoutes);
    stockCounterRouter.use('/deliverynote', deliverynote_routes_1.deliveryNoteRoutes);
    stockCounterRouter.use('/estimate', estimate_routes_1.estimateRoutes);
    stockCounterRouter.use('/invoice', invoice_routes_1.invoiceRoutes);
    stockCounterRouter.use('/pickuplocation', pickuplocation_routes_1.pickupLocationRoutes);
    stockCounterRouter.use('/receipt', receipt_routes_1.receiptRoutes);
    stockCounterRouter.use('/expense', expense_routes_1.expenseRoutes);
    // reports
    stockCounterRouter.use('/expensereport', expensereport_routes_1.expenseReportRoutes);
    stockCounterRouter.use('/profitandlossreport', profitandlossreport_routes_1.profitAndLossReportRoutes);
    stockCounterRouter.use('/salesreport', salesreport_routes_1.salesReportRoutes);
    stockCounterRouter.use('/taxreport', taxreport_routes_1.taxReportRoutes);
    stockCounterRouter.use('/invoicesreport', invoicereport_routes_1.invoicesReportRoutes);
    // settings
    stockCounterRouter.use('/invoicesettings', invoicesettings_routes_1.invoiceSettingRoutes);
    // pay installs
    // stockCounterRouter.use('/paymentinstalls', paymentInstallsRoutes);
    stockCounterRouter.use('/invoicerelated', invoicerelated_route_1.invoiceRelateRoutes);
    // decoys
    stockCounterRouter.use('/itemdecoy', itemdecoy_routes_1.itemDecoyRoutes);
    // offers
    stockCounterRouter.use('/itemoffer', itemoffer_routes_1.itemOfferRoutes);
    // limitted items
    stockCounterRouter.use('/itemlimitted', itemlimitted_routes_1.itemLimittedRoutes);
    // user-related
    stockCounterRouter.use('/customer', customer_routes_1.customerRoutes);
    stockCounterRouter.use('/staff', staff_routes_1.staffRoutes);
    stockCounterRouter.use('/localuser', locluser_routes_1.localUserRoutes);
    return stockCounterRouter;
};
exports.runStockCounterServer = runStockCounterServer;
//# sourceMappingURL=stock-counter-server.js.map