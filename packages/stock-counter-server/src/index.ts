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
export * from './controllers/cookies.service';
export * from './controllers/payment.controller';

export * from './models/printables/paymentrelated/paymentrelated.model';
// export * from './models/printables/paymentrelated/paymentsinstalls.model';
export * from './models/printables/related/invoicerelated.model';
export * from './models/printables/report/expenesreport.model';
export * from './models/printables/report/invoicereport.model';
export * from './models/printables/report/profitandlossreport.model';
export * from './models/printables/report/salesreport.model';
export * from './models/printables/report/taxreport.model';

export * from './models/printables/deliverynote.model';
export * from './models/printables/estimate.model';
export * from './models/printables/invoice.model';
export * from './models/printables/jobcard.model';
export * from './models/printables/pickuplocation.model';
export * from './models/printables/receipt.model';
export * from './models/printables/report/taxreport.model';
export * from './models/printables/settings/invoicesettings.model';

export * from './models/user-related/customer.model';
export * from './models/user-related/staff.model';

export * from './models/deliverycity.model';
export * from './models/expense.model';
export * from './models/faq.model';
export * from './models/faqanswer.model';
export * from './models/item.model';
export * from './models/itemdecoy.model';
export * from './models/itemoffer.model';
export * from './models/order.model';
export * from './models/payment.model';
export * from './models/promocode.model';
export * from './models/review.model';

// export * from './routes/paymentrelated/paymentinstalls.routes';
export * from './routes/paymentrelated/paymentrelated';
export * from './routes/printables/related/invoicerelated';
export * from './routes/printables/related/invoicerelated.route';
export * from './routes/printables/report/expensereport.routes';
export * from './routes/printables/report/invoicereport.routes';
export * from './routes/printables/report/profitandlossreport.routes';
export * from './routes/printables/report/salesreport.routes';
export * from './routes/printables/report/taxreport.routes';

export * from './routes/printables/deliverynote.routes';
export * from './routes/printables/estimate.routes';
export * from './routes/printables/invoice.routes';
export * from './routes/printables/pickuplocation.routes';
export * from './routes/printables/receipt.routes';
export * from './routes/printables/report/taxreport.routes';
export * from './routes/printables/settings/invoicesettings.routes';

export * from './routes/user-related/customer.routes';
export * from './routes/user-related/staff.routes';
export * from './routes/user-related/wallet.routes';

export * from './routes/cookies.routes';
export * from './routes/deliverycity.routes';
export * from './routes/expense.routes';
export * from './routes/faq.routes';
export * from './routes/item.routes';
export * from './routes/itemdecoy.routes';
export * from './routes/itemoffer.routes';
export * from './routes/order.routes';
export * from './routes/payment.routes';
export * from './routes/promo.routes';
export * from './routes/review.routes';
export * from './stock-counter-server';

