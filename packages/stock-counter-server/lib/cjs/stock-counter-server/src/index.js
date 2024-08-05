"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/**
 * This file exports all the necessary modules, models, and routes for the stock-counter-server.
 *
 * @remarks
 * This file exports the following:
 * - Controllers:
 *   - CookiesService
 *   - PaymentController
 * - Models:
 *   - Printables:
 *     - PaymentRelatedModel
 *     - InvoicerelatedModel
 *     - ExpenesreportModel
 *     - InvoicereportModel
 *     - ProfitandlossreportModel
 *     - SalesreportModel
 *     - TaxreportModel
 *     - InvoicesettingsModel
 *     - DeliverynoteModel
 *     - EstimateModel
 *     - InvoiceModel
 *     - JobcardModel
 *     - PickuplocationModel
 *     - ReceiptModel
 *   - User-related:
 *     - CustomerModel
 *     - StaffModel
 *   - DeliverycityModel
 *   - ExpenseModel
 *   - FaqModel
 *   - FaqanswerModel
 *   - OrderModel
 *   - PaymentModel
 *   - ItemModel
 *   - ItemdecoyModel
 *   - ItemlimittedModel
 *   - ItemofferModel
 *   - PromocodeModel
 *   - ReviewModel
 * - Routes:
 *   - Paymentrelated
 *   - Invoicerelated
 *   - Expensereport
 *   - Invoicereport
 *   - Profitandlossreport
 *   - Salesreport
 *   - Taxreport
 *   - Invoicesettings
 *   - Deliverynote
 *   - Estimate
 *   - Invoice
 *   - Pickuplocation
 *   - Receipt
 *   - Customer
 *   - Staff
 *   - Cookies
 *   - Deliverycity
 *   - Expense
 *   - Faq
 *   - Order
 *   - Payment
 *   - Item
 *   - Itemdecoy
 *   - Itemlimitted
 *   - Itemoffer
 *   - Promo
 *   - Review
 * - Stock-counter-server
 */
tslib_1.__exportStar(require("./controllers/cookies.service"), exports);
tslib_1.__exportStar(require("./controllers/payment.controller"), exports);
tslib_1.__exportStar(require("./models/printables/paymentrelated/paymentrelated.model"), exports);
// export * from './models/printables/paymentrelated/paymentsinstalls.model';
tslib_1.__exportStar(require("./models/printables/related/invoicerelated.model"), exports);
tslib_1.__exportStar(require("./models/printables/report/expenesreport.model"), exports);
tslib_1.__exportStar(require("./models/printables/report/invoicereport.model"), exports);
tslib_1.__exportStar(require("./models/printables/report/profitandlossreport.model"), exports);
tslib_1.__exportStar(require("./models/printables/report/salesreport.model"), exports);
tslib_1.__exportStar(require("./models/printables/report/taxreport.model"), exports);
tslib_1.__exportStar(require("./models/printables/deliverynote.model"), exports);
tslib_1.__exportStar(require("./models/printables/estimate.model"), exports);
tslib_1.__exportStar(require("./models/printables/invoice.model"), exports);
tslib_1.__exportStar(require("./models/printables/jobcard.model"), exports);
tslib_1.__exportStar(require("./models/printables/pickuplocation.model"), exports);
tslib_1.__exportStar(require("./models/printables/receipt.model"), exports);
tslib_1.__exportStar(require("./models/printables/report/taxreport.model"), exports);
tslib_1.__exportStar(require("./models/printables/settings/invoicesettings.model"), exports);
tslib_1.__exportStar(require("./models/user-related/customer.model"), exports);
tslib_1.__exportStar(require("./models/user-related/staff.model"), exports);
tslib_1.__exportStar(require("./models/deliverycity.model"), exports);
tslib_1.__exportStar(require("./models/expense.model"), exports);
tslib_1.__exportStar(require("./models/faq.model"), exports);
tslib_1.__exportStar(require("./models/faqanswer.model"), exports);
tslib_1.__exportStar(require("./models/item.model"), exports);
tslib_1.__exportStar(require("./models/itemdecoy.model"), exports);
tslib_1.__exportStar(require("./models/itemoffer.model"), exports);
tslib_1.__exportStar(require("./models/order.model"), exports);
tslib_1.__exportStar(require("./models/payment.model"), exports);
tslib_1.__exportStar(require("./models/promocode.model"), exports);
tslib_1.__exportStar(require("./models/review.model"), exports);
// export * from './routes/paymentrelated/paymentinstalls.routes';
tslib_1.__exportStar(require("./routes/paymentrelated/paymentrelated"), exports);
tslib_1.__exportStar(require("./routes/printables/related/invoicerelated"), exports);
tslib_1.__exportStar(require("./routes/printables/related/invoicerelated.route"), exports);
tslib_1.__exportStar(require("./routes/printables/report/expensereport.routes"), exports);
tslib_1.__exportStar(require("./routes/printables/report/invoicereport.routes"), exports);
tslib_1.__exportStar(require("./routes/printables/report/profitandlossreport.routes"), exports);
tslib_1.__exportStar(require("./routes/printables/report/salesreport.routes"), exports);
tslib_1.__exportStar(require("./routes/printables/report/taxreport.routes"), exports);
tslib_1.__exportStar(require("./routes/printables/deliverynote.routes"), exports);
tslib_1.__exportStar(require("./routes/printables/estimate.routes"), exports);
tslib_1.__exportStar(require("./routes/printables/invoice.routes"), exports);
tslib_1.__exportStar(require("./routes/printables/pickuplocation.routes"), exports);
tslib_1.__exportStar(require("./routes/printables/receipt.routes"), exports);
tslib_1.__exportStar(require("./routes/printables/report/taxreport.routes"), exports);
tslib_1.__exportStar(require("./routes/printables/settings/invoicesettings.routes"), exports);
tslib_1.__exportStar(require("./routes/user-related/customer.routes"), exports);
tslib_1.__exportStar(require("./routes/user-related/staff.routes"), exports);
tslib_1.__exportStar(require("./routes/user-related/wallet.routes"), exports);
tslib_1.__exportStar(require("./routes/cookies.routes"), exports);
tslib_1.__exportStar(require("./routes/deliverycity.routes"), exports);
tslib_1.__exportStar(require("./routes/expense.routes"), exports);
tslib_1.__exportStar(require("./routes/faq.routes"), exports);
tslib_1.__exportStar(require("./routes/item.routes"), exports);
tslib_1.__exportStar(require("./routes/itemdecoy.routes"), exports);
tslib_1.__exportStar(require("./routes/itemoffer.routes"), exports);
tslib_1.__exportStar(require("./routes/order.routes"), exports);
tslib_1.__exportStar(require("./routes/payment.routes"), exports);
tslib_1.__exportStar(require("./routes/promo.routes"), exports);
tslib_1.__exportStar(require("./routes/review.routes"), exports);
tslib_1.__exportStar(require("./stock-counter-server"), exports);
//# sourceMappingURL=index.js.map