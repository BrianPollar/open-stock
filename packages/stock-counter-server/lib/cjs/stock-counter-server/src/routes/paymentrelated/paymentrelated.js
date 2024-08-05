"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyAllOnDueDate = exports.makePaymentInstall = exports.deleteAllPayOrderLinked = exports.deleteManyPaymentRelated = exports.makePaymentRelatedPdct = exports.relegatePaymentRelatedCreation = exports.updatePaymentRelated = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_notif_server_1 = require("@open-stock/stock-notif-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const order_model_1 = require("../../models/order.model");
const payment_model_1 = require("../../models/payment.model");
const paymentrelated_model_1 = require("../../models/printables/paymentrelated/paymentrelated.model");
const receipt_model_1 = require("../../models/printables/receipt.model");
const invoicerelated_model_1 = require("../../models/printables/related/invoicerelated.model");
const invoicerelated_1 = require("../printables/related/invoicerelated");
/** Logger for PaymentRelated routes */
const paymentRelatedLogger = tracer.colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
        // eslint-disable-next-line no-console
        console.log(data.output);
        const logDir = path_1.default.join(process.cwd() + '/openstockLog/');
        fs.mkdir(logDir, { recursive: true }, (err) => {
            if (err) {
                if (err) {
                    // eslint-disable-next-line no-console
                    console.log('data.output err ', err);
                }
            }
        });
        fs.appendFile(logDir + '/counter-server.log', data.rawoutput + '\n', err => {
            if (err) {
                // eslint-disable-next-line no-console
                console.log('raw.output err ', err);
            }
        });
    }
});
/**
 * Updates the payment related information.
 * @param paymentRelated - The payment related object to update.
 * @param queryId - The query ID.
 * @returns A promise that resolves to an object containing the success status and the updated payment related ID, if successful.
 */
const updatePaymentRelated = async (paymentRelated, queryId) => {
    paymentRelated.companyId = queryId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(paymentRelated.paymentRelated);
    if (!isValid) {
        return { success: false, err: 'unauthourised', status: 401 };
    }
    const related = await paymentrelated_model_1.paymentRelatedMain
        .findByIdAndUpdate(paymentRelated.paymentRelated);
    if (!related) {
        return { success: true, status: 200 };
    }
    // related.items = paymentRelated.items || related.items;
    related['orderDate'] = paymentRelated.orderDate || related['orderDate'];
    related['paymentDate'] = paymentRelated.paymentDate || related['paymentDate'];
    // related.payments = paymentRelated.payments || related.payments;
    related['billingAddress'] = paymentRelated.billingAddress || related['billingAddress'];
    related['shippingAddress'] = paymentRelated.shippingAddress || related['shippingAddress'];
    // related.tax = paymentRelated.tax || related.tax;
    related['currency'] = paymentRelated.currency || related['currency'];
    // related.user = paymentRelated.user || related.user;
    related['isBurgain'] = paymentRelated.isBurgain || related['isBurgain'];
    related['shipping'] = paymentRelated.shipping || related['shipping'];
    related['manuallyAdded'] = paymentRelated.manuallyAdded || related['manuallyAdded'];
    related['paymentMethod'] = paymentRelated.paymentMethod || related['paymentMethod'];
    // related.status = paymentRelated.status || related.status;
    let errResponse;
    const saved = await related.save()
        .catch(err => {
        paymentRelatedLogger.debug('updatePaymentRelated - err: ', err);
        errResponse = {
            status: 403,
            success: false
        };
        if (err && err.errors) {
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
        }
        else {
            errResponse.err = `we are having problems connecting to our databases, 
        try again in a while`;
        }
        return errResponse;
    });
    if (errResponse) {
        return errResponse;
    }
    else {
        return { success: true, status: 200, id: saved._id };
    }
};
exports.updatePaymentRelated = updatePaymentRelated;
/**
 * Creates or updates a payment-related entity.
 *
 * @param paymentRelated - The payment-related data.
 * @param invoiceRelated - The invoice-related data.
 * @param type - The type of entity ('payment' or 'order').
 * @param extraNotifDesc - Additional notification description.
 * @param queryId - The query ID.
 * @returns A promise that resolves to an object containing the success status and the ID of the created or updated entity.
 */
const relegatePaymentRelatedCreation = async (paymentRelated, invoiceRelated, type, // say payment or order
extraNotifDesc, queryId) => {
    const isValid = (0, stock_universal_server_1.verifyObjectId)(paymentRelated.paymentRelated);
    let found;
    if (isValid) {
        found = await paymentrelated_model_1.paymentRelatedLean
            .findOne({ _id: paymentRelated.paymentRelated }).lean().select({ urId: 1 });
    }
    if (!found || paymentRelated.creationType === 'solo') {
        const count = await paymentrelated_model_1.paymentRelatedMain
            .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
        paymentRelated.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
        let errResponse;
        const newPayRelated = new paymentrelated_model_1.paymentRelatedMain(paymentRelated);
        const saved = await newPayRelated.save().catch(err => {
            errResponse = {
                success: false,
                status: 403
            };
            if (err && err.errors) {
                errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
            }
            else {
                errResponse.err = `we are having problems connecting to our databases, 
        try again in a while`;
            }
            return errResponse;
        });
        if (errResponse) {
            return errResponse;
        }
        // const relatedId = await relegateInvRelatedCreation(invoiceRelated, extraNotifDesc, true);
        let route;
        let title = '';
        let accessor;
        let notifType;
        if (type === 'order') {
            route = 'orders';
            title = 'Order Made';
            accessor = 'orders';
            notifType = 'orders';
        }
        else {
            route = 'payments';
            title = 'Payment Made';
            accessor = 'payments';
            notifType = 'payments';
        }
        const stn = await (0, stock_notif_server_1.getCurrentNotificationSettings)(queryId);
        if (stn && stn[accessor]) {
            const actions = [{
                    operation: 'view',
                    // url: pesapalNotifRedirectUrl + route,
                    url: route,
                    action: '',
                    title
                }];
            const notification = {
                actions,
                userId: invoiceRelated.billingUserId,
                title,
                body: extraNotifDesc,
                icon: '',
                notifType,
                // photo: string;
                expireAt: '200000'
            };
            const capableUsers = await stock_auth_server_1.user.find({})
                .lean().select({ permissions: 1 });
            const ids = [];
            if (type === 'order') {
                for (const cuser of capableUsers) {
                    if (cuser.permissions.orders) {
                        ids.push(cuser._id);
                    }
                }
            }
            else {
                for (const cuser of capableUsers) {
                    if (cuser.permissions.payments) {
                        ids.push(cuser._id);
                    }
                }
            }
            const notifFilters = { id: { $in: ids } };
            await (0, stock_notif_server_1.createNotifications)({
                notification,
                filters: notifFilters
            });
        }
        return { success: true, status: 200, id: saved._id };
        /** return {
          paymentRelated: saved._id as string
          // invoiceRelated: relatedId
        }; */
    }
    else {
        await (0, exports.updatePaymentRelated)(paymentRelated, queryId);
        // await updateInvoiceRelated(invoiceRelated);
        return { success: true, status: 200, id: paymentRelated.paymentRelated._id };
        /** return {
          paymentRelated: paymentRelated.paymentRelated
          // invoiceRelated: invoiceRelated.invoiceRelated
        }; */
    }
};
exports.relegatePaymentRelatedCreation = relegatePaymentRelatedCreation;
/**
 * Creates a payment related product object.
 * @param paymentRelated - The payment related data.
 * @param invoiceRelated - The invoice related data.
 * @param user - The user data.
 * @param meta - The meta data.
 * @returns The payment related product object.
 */
const makePaymentRelatedPdct = (paymentRelated, invoiceRelated, 
// eslint-disable-next-line @typescript-eslint/no-shadow
user, meta) => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _id: meta._id,
    // createdAt: meta.createdAt,
    updatedAt: meta.updatedAt,
    paymentRelated: paymentRelated._id,
    urId: paymentRelated.urId,
    // items: paymentRelated.items,
    orderDate: paymentRelated.orderDate,
    paymentDate: paymentRelated.paymentDate,
    // payments: paymentRelated.payments,
    billingAddress: paymentRelated.billingAddress,
    shippingAddress: paymentRelated.shippingAddress,
    // tax: paymentRelated.tax,
    currency: paymentRelated.currency,
    // user: paymentRelated.user,
    isBurgain: paymentRelated.isBurgain,
    shipping: paymentRelated.shipping,
    manuallyAdded: paymentRelated.manuallyAdded,
    paymentMethod: paymentRelated.paymentMethod,
    // status: paymentRelated.status,
    ...(0, invoicerelated_1.makeInvoiceRelatedPdct)(invoiceRelated, user)
});
exports.makePaymentRelatedPdct = makePaymentRelatedPdct;
/**
 * Deletes multiple payment related documents.
 * @param companyId - The ID of the company
   * @param ids - An array of string IDs representing the documents to be deleted.
 * @param queryId - The ID of the company associated with the documents.
 * @returns A Promise that resolves to an object indicating the success of the operation.
 */
const deleteManyPaymentRelated = async (ids, queryId) => {
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([...ids, ...[queryId]]);
    if (!isValid) {
        return { success: false, status: 402, err: 'unauthourised' };
    }
    const deletedMany = await paymentrelated_model_1.paymentRelatedMain
        .deleteMany({ _id: { $in: ids }, companyId: queryId });
    if (Boolean(deletedMany)) {
        return { success: Boolean(deletedMany), status: 200 };
    }
    else {
        return { success: Boolean(deletedMany), status: 403, err: 'could not delete selected documents, try again in a while' };
    }
};
exports.deleteManyPaymentRelated = deleteManyPaymentRelated;
/**
 * Deletes all pay orders linked to a payment or an order.
 * @param paymentRelated - The payment related to the pay orders.
 * @param invoiceRelated - The invoice related to the pay orders.
 * @param creationType - The type of payment related creation.
 * @param where - Specifies whether the pay orders are linked to a payment or an order.
 * @param queryId - The ID of the query.
 */
const deleteAllPayOrderLinked = async (paymentRelated, invoiceRelated, creationType, where, queryId) => {
    await (0, exports.deleteManyPaymentRelated)([paymentRelated], queryId);
    await (0, invoicerelated_1.deleteManyInvoiceRelated)([invoiceRelated], queryId);
    if (creationType !== 'solo') {
        await payment_model_1.paymentMain.deleteOne({ paymentRelated });
        await order_model_1.orderMain.deleteOne({ paymentRelated });
    }
    else if (where === 'payment') {
        await payment_model_1.paymentMain.deleteOne({ paymentRelated });
    }
    else if (where === 'order') {
        await order_model_1.orderMain.deleteOne({ paymentRelated });
    }
};
exports.deleteAllPayOrderLinked = deleteAllPayOrderLinked;
// .catch(err => {});
/**
 * Makes a payment installation.
 * @param receipt - The receipt object.
 * @param relatedId - The related ID.
 * @param queryId - The query ID.
 * @returns A promise that resolves to an object indicating the success of the operation.
 */
const makePaymentInstall = async (receipt, relatedId, queryId, creationType) => {
    // const pInstall = invoiceRelated.payments[0] as IpaymentInstall;
    if (receipt) {
        if (creationType !== 'solo') {
            const canMake = await (0, invoicerelated_1.canMakeReceipt)(relatedId);
            if (!canMake) {
                return false;
            }
        }
        receipt.companyId = queryId;
        let errResponse;
        receipt.invoiceRelated = relatedId;
        const newInstal = new receipt_model_1.receiptMain(receipt);
        const savedPinstall = await newInstal.save().catch(err => {
            errResponse = {
                success: false,
                status: 403
            };
            if (err && err.errors) {
                errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
            }
            else {
                errResponse.err = `we are having problems connecting to our databases, 
        try again in a while`;
            }
            return errResponse;
        });
        if (errResponse) {
            return errResponse;
        }
        await (0, invoicerelated_1.updateInvoiceRelatedPayments)(savedPinstall, queryId);
        return { success: true };
    }
    return { success: true };
};
exports.makePaymentInstall = makePaymentInstall;
const notifyAllOnDueDate = async () => {
    const now = new Date();
    const withDueDate = await invoicerelated_model_1.invoiceRelatedLean.find({})
        .gte('toDate', now)
        .lean();
    const all = withDueDate.map(async (inv) => {
        const stn = await (0, stock_notif_server_1.getCurrentNotificationSettings)(inv.companyId);
        if (!stn.success) {
            return false;
        }
        if (stn && stn['users']) {
            const title = 'Invoice Due Date';
            const actions = [{
                    operation: 'view',
                    // url: pesapalNotifRedirectUrl + route,
                    url: '/invoices',
                    action: '',
                    title
                }];
            const notification = {
                actions,
                userId: inv.billingUserId,
                title,
                body: 'This is to remind you that, You are late on a product payment',
                icon: '',
                notifType: 'users',
                // photo: string;
                expireAt: '200000'
            };
            await (0, stock_notif_server_1.createNotifications)({
                notification,
                filters: null
            });
            const billingUser = await stock_auth_server_1.userLean.findOne({ _id: inv.billingUserId }).lean().select({ email: 1 });
            if (!billingUser) {
                return false;
            }
            const mailOptions = {
                from: 'info@eagleinfosolutions.com',
                to: billingUser.email,
                subject: 'Product Due Date',
                text: billingUser.fname + ' ' + billingUser.lname + ' Seems you are late on a payment, with',
                html: `<!DOCTYPE html>
        <html lang="en">
        <head>
<style>
  body {
    background: rgb(238, 238, 238);
  }
.main-div {
  max-width: 400px;
  margin: 0 auto;
  background: #fff;
  font-weight: normal;
}
  h2 {
    text-align:center;
    padding-top: 40px;
  }

  .body-div{
    font-weight: lighter;
    text-align: left;
    width: 80%;
    margin: 0 auto;
    font-size: 0.8em;
  }

  .code-para{
    font-size: 1.2em;
  }

  .last-divi {
    padding-top: 30px;
    text-align: center;
    font-size: 0.7em;
  }

  .compny-divi {
    padding-bottom: 40px;
    text-align: center;
    font-size: 0.7em;
  }

  .img-divi {
    width: 75px;
    height: 75px;
    margin-left: calc(100% - 80px);
  }

  .img-divi-img {
width: 100%;
height: 100%;
    }
</style>
</head>
        <body>
        <div class="main-div">
          <div class="img-divi">
            <img class="img-divi-img" src="https://eagleinfosolutions.com/dist/public/logo2.png" />
          </div>
        <h2>Confirm your email address<h2>
          <div class="body-div">
          Please review the following and to make, Oue systems have .

          <p>Please enter this verification code to get started on Eagle Info Solutions:</p>
          <p class="code-para"><b>Clearify and Eagle Info Solutions that all is okay</b> .</p>
          <p>.</p>
          
          <div>Thanks,
          Eagle Info Solutions
          </div>

          <div class="last-divi">
            <a href="https://eagleinfosolutions.com/support">Help</a> | <a href="https://eagleinfosolutions.com/support">Contacts</a>
          </div>

          <div class="compny-divi"> Eagle Info Solutions Inc, Kampala Uganda</div>
          </div>
          </div>
          </body>
</html>`
            };
            // to user
            await (0, stock_notif_server_1.sendMail)(mailOptions);
            // to company
            const mailOptions2 = {
                from: 'info@eagleinfosolutions.com',
                to: billingUser.email,
                subject: 'Product Due Date',
                text: billingUser.fname + ' ' + billingUser.lname + ' Seems you are late on a payment, with',
                html: `<!DOCTYPE html>
        <html lang="en">
        <head>
<style>
  body {
    background: rgb(238, 238, 238);
  }
.main-div {
  max-width: 400px;
  margin: 0 auto;
  background: #fff;
  font-weight: normal;
}
  h2 {
    text-align:center;
    padding-top: 40px;
  }

  .body-div{
    font-weight: lighter;
    text-align: left;
    width: 80%;
    margin: 0 auto;
    font-size: 0.8em;
  }

  .code-para{
    font-size: 1.2em;
  }

  .last-divi {
    padding-top: 30px;
    text-align: center;
    font-size: 0.7em;
  }

  .compny-divi {
    padding-bottom: 40px;
    text-align: center;
    font-size: 0.7em;
  }

  .img-divi {
    width: 75px;
    height: 75px;
    margin-left: calc(100% - 80px);
  }

  .img-divi-img {
width: 100%;
height: 100%;
    }
</style>
</head>
        <body>
        <div class="main-div">
          <div class="img-divi">
            <img class="img-divi-img" src="https://eagleinfosolutions.com/dist/public/logo2.png" />
          </div>
        <h2>Confirm your email address<h2>
          <div class="body-div">
          Please review the following and to make, Oue systems have .

          <p>Please enter this verification code to get started on Eagle Info Solutions:</p>
          <p class="code-para"><b>Clearify and Eagle Info Solutions that all is okay</b> .</p>
          <p>.</p>
          
          <div>Thanks,
          Eagle Info Solutions
          </div>

          <div class="last-divi">
            <a href="https://eagleinfosolutions.com/support">Help</a> | <a href="https://eagleinfosolutions.com/support">Contacts</a>
          </div>

          <div class="compny-divi"> Eagle Info Solutions Inc, Kampala Uganda</div>
          </div>
          </div>
          </body>
</html>`
            };
            await (0, stock_notif_server_1.sendMail)(mailOptions2);
        }
        return true;
    });
    await Promise.all(all);
    return true;
};
exports.notifyAllOnDueDate = notifyAllOnDueDate;
//# sourceMappingURL=paymentrelated.js.map