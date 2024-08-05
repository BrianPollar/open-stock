"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAutoIntervaller = exports.isCounterServerRunning = exports.runStockCounterServer = exports.notifRedirectUrl = exports.pesapalPaymentInstance = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const cookies_routes_1 = require("./routes/cookies.routes");
const deliverycity_routes_1 = require("./routes/deliverycity.routes");
const expense_routes_1 = require("./routes/expense.routes");
const faq_routes_1 = require("./routes/faq.routes");
const item_routes_1 = require("./routes/item.routes");
const order_routes_1 = require("./routes/order.routes");
const payment_routes_1 = require("./routes/payment.routes");
const deliverynote_routes_1 = require("./routes/printables/deliverynote.routes");
const estimate_routes_1 = require("./routes/printables/estimate.routes");
const invoice_routes_1 = require("./routes/printables/invoice.routes");
const pickuplocation_routes_1 = require("./routes/printables/pickuplocation.routes");
const receipt_routes_1 = require("./routes/printables/receipt.routes");
const expensereport_routes_1 = require("./routes/printables/report/expensereport.routes");
const invoicereport_routes_1 = require("./routes/printables/report/invoicereport.routes");
const profitandlossreport_routes_1 = require("./routes/printables/report/profitandlossreport.routes");
const salesreport_routes_1 = require("./routes/printables/report/salesreport.routes");
const taxreport_routes_1 = require("./routes/printables/report/taxreport.routes");
const invoicesettings_routes_1 = require("./routes/printables/settings/invoicesettings.routes");
const promo_routes_1 = require("./routes/promo.routes");
const review_routes_1 = require("./routes/review.routes");
// import { paymentInstallsRoutes } from './routes/paymentrelated/paymentinstalls.routes';
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const cookies_routes_2 = require("./routes-dummy/cookies.routes");
const deliverycity_routes_2 = require("./routes-dummy/deliverycity.routes");
const expense_routes_2 = require("./routes-dummy/expense.routes");
const faq_routes_2 = require("./routes-dummy/faq.routes");
const item_routes_2 = require("./routes-dummy/item.routes");
const itemdecoy_routes_1 = require("./routes-dummy/itemdecoy.routes");
const itemoffer_routes_1 = require("./routes-dummy/itemoffer.routes");
const order_routes_2 = require("./routes-dummy/order.routes");
const payment_routes_2 = require("./routes-dummy/payment.routes");
const deliverynote_routes_2 = require("./routes-dummy/printables/deliverynote.routes");
const estimate_routes_2 = require("./routes-dummy/printables/estimate.routes");
const invoice_routes_2 = require("./routes-dummy/printables/invoice.routes");
const pickuplocation_routes_2 = require("./routes-dummy/printables/pickuplocation.routes");
const receipt_routes_2 = require("./routes-dummy/printables/receipt.routes");
const invoicerelated_route_1 = require("./routes-dummy/printables/related/invoicerelated.route");
const expensereport_routes_2 = require("./routes-dummy/printables/report/expensereport.routes");
const invoicereport_routes_2 = require("./routes-dummy/printables/report/invoicereport.routes");
const profitandlossreport_routes_2 = require("./routes-dummy/printables/report/profitandlossreport.routes");
const salesreport_routes_2 = require("./routes-dummy/printables/report/salesreport.routes");
const taxreport_routes_2 = require("./routes-dummy/printables/report/taxreport.routes");
const invoicesettings_routes_2 = require("./routes-dummy/printables/settings/invoicesettings.routes");
const promo_routes_2 = require("./routes-dummy/promo.routes");
const review_routes_2 = require("./routes-dummy/review.routes");
const customer_routes_1 = require("./routes-dummy/user-related/customer.routes");
const locluser_routes_1 = require("./routes-dummy/user-related/locluser.routes");
const staff_routes_1 = require("./routes-dummy/user-related/staff.routes");
const itemdecoy_routes_2 = require("./routes/itemdecoy.routes");
const itemoffer_routes_2 = require("./routes/itemoffer.routes");
const paymentrelated_1 = require("./routes/paymentrelated/paymentrelated");
const invoicerelated_route_2 = require("./routes/printables/related/invoicerelated.route");
const customer_routes_2 = require("./routes/user-related/customer.routes");
const locluser_routes_2 = require("./routes/user-related/locluser.routes");
const staff_routes_2 = require("./routes/user-related/staff.routes");
const wallet_routes_1 = require("./routes/user-related/wallet.routes");
const stock_counter_local_1 = require("./stock-counter-local");
/**
 * Runs the Stock Counter server with the provided configuration and payment instance.
 * @param config - The configuration for the Stock Counter server.
 * @param paymentInstance - The payment instance for handling payments.
 * @returns A promise that resolves to an object containing the Stock Counter router.
 * @throws An error if the authentication server is not running.
 */
const runStockCounterServer = async (config, paymentInstance) => {
    if (!(0, stock_auth_server_1.isAuthServerRunning)()) {
        const error = new Error('Auth server is not running, please start by firing up that server');
        throw error;
    }
    // connect models
    await (0, stock_counter_local_1.connectStockCounterDatabase)(config.databaseConfig.url, config.databaseConfig.dbOptions);
    exports.pesapalPaymentInstance = paymentInstance;
    (0, stock_universal_server_1.runPassport)(config.authSecrets.jwtSecret);
    const stockCounterRouter = express_1.default.Router();
    if (!config.useDummyRoutes) {
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
        stockCounterRouter.use('/invoicerelated', invoicerelated_route_2.invoiceRelateRoutes);
        // decoys
        stockCounterRouter.use('/itemdecoy', itemdecoy_routes_2.itemDecoyRoutes);
        // offers
        stockCounterRouter.use('/itemoffer', itemoffer_routes_2.itemOfferRoutes);
        // user-related
        stockCounterRouter.use('/customer', customer_routes_2.customerRoutes);
        stockCounterRouter.use('/staff', staff_routes_2.staffRoutes);
        stockCounterRouter.use('/localuser', locluser_routes_2.localUserRoutes);
        // TODO make a dummy route for this
        stockCounterRouter.use('/wallet', wallet_routes_1.walletRoutes);
    }
    else {
        stockCounterRouter.use('/review', review_routes_2.reviewRoutesDummy);
        stockCounterRouter.use('/item', item_routes_2.itemRoutesDummy);
        stockCounterRouter.use('/payment', payment_routes_2.paymentRoutesDummy);
        stockCounterRouter.use('/order', order_routes_2.orderRoutesDummy);
        stockCounterRouter.use('/faq', faq_routes_2.faqRoutesDummy);
        stockCounterRouter.use('/deliverycity', deliverycity_routes_2.deliverycityRoutesDummy);
        stockCounterRouter.use('/cookies', cookies_routes_2.cookiesRoutesDummy);
        stockCounterRouter.use('/promo', promo_routes_2.promocodeRoutesDummy);
        stockCounterRouter.use('/deliverynote', deliverynote_routes_2.deliveryNoteRoutesDummy);
        stockCounterRouter.use('/estimate', estimate_routes_2.estimateRoutesDummy);
        stockCounterRouter.use('/invoice', invoice_routes_2.invoiceRoutesDummy);
        stockCounterRouter.use('/pickuplocation', pickuplocation_routes_2.pickupLocationRoutesDummy);
        stockCounterRouter.use('/receipt', receipt_routes_2.receiptRoutesDummy);
        stockCounterRouter.use('/expense', expense_routes_2.expenseRoutesDummy);
        // reports
        stockCounterRouter.use('/expensereport', expensereport_routes_2.expenseReportRoutesDummy);
        stockCounterRouter.use('/profitandlossreport', profitandlossreport_routes_2.profitAndLossReportRoutesDummy);
        stockCounterRouter.use('/salesreport', salesreport_routes_2.salesReportRoutesDummy);
        stockCounterRouter.use('/taxreport', taxreport_routes_2.taxReportRoutesDummy);
        stockCounterRouter.use('/invoicesreport', invoicereport_routes_2.invoicesReportRoutesDummy);
        // settings
        stockCounterRouter.use('/invoicesettings', invoicesettings_routes_2.invoiceSettingRoutesDummy);
        // pay installs
        // stockCounterRouter.use('/paymentinstalls', express.Router());
        stockCounterRouter.use('/invoicerelated', invoicerelated_route_1.invoiceRelateRoutesDummy);
        // decoys
        stockCounterRouter.use('/itemdecoy', itemdecoy_routes_1.itemDecoyRoutesDummy);
        // offers
        stockCounterRouter.use('/itemoffer', itemoffer_routes_1.itemOfferRoutesDummy);
        // user-related
        stockCounterRouter.use('/customer', customer_routes_1.customerRoutesDummy);
        stockCounterRouter.use('/staff', staff_routes_1.staffRoutesDummy);
        stockCounterRouter.use('/localuser', locluser_routes_1.localUserRoutesDummy);
    }
    (0, stock_counter_local_1.createStockCounterServerLocals)(config.pesapalNotificationRedirectUrl, config.ecommerceRevenuePercentage);
    (0, exports.runAutoIntervaller)();
    return Promise.resolve({ stockCounterRouter });
};
exports.runStockCounterServer = runStockCounterServer;
/**
 * Checks if the stock counter server is running.
 * @returns {boolean} True if the stock counter server is running, false otherwise.
 */
const isCounterServerRunning = () => stock_counter_local_1.isStockCounterServerRunning;
exports.isCounterServerRunning = isCounterServerRunning;
const runAutoIntervaller = () => {
    setTimeout(() => {
        setInterval(() => {
            (0, paymentrelated_1.notifyAllOnDueDate)();
        }, 24 * 60 * 60 * 1000); // 24 hour interval
    }, 5 * 60 * 1000); // 5 minute delay
};
exports.runAutoIntervaller = runAutoIntervaller;
//# sourceMappingURL=stock-counter-server.js.map