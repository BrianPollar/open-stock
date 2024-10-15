"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyAllOnDueDate = exports.makePaymentInstall = exports.deleteAllPayOrderLinked = exports.deleteManyPaymentRelated = exports.makePaymentRelatedPdct = exports.relegatePaymentRelatedCreation = exports.updatePaymentRelated = void 0;
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_notif_server_1 = require("@open-stock/stock-notif-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const order_model_1 = require("../../models/order.model");
const payment_model_1 = require("../../models/payment.model");
const paymentrelated_model_1 = require("../../models/printables/paymentrelated/paymentrelated.model");
const receipt_model_1 = require("../../models/printables/receipt.model");
const invoicerelated_model_1 = require("../../models/printables/related/invoicerelated.model");
const invoicerelated_1 = require("../printables/related/invoicerelated");
/**
 * Updates the payment related information.
 * @param paymentRelated - The payment related object to update.
 * @param companyId - The query ID.
 * @returns A promise that resolves to an object containing
 * the success status and the updated payment related ID, if successful.
 */
const updatePaymentRelated = async (paymentRelated, companyId) => {
    paymentRelated.companyId = companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(paymentRelated.paymentRelated);
    if (!isValid) {
        return { success: false, err: 'unauthourised', status: 401 };
    }
    const related = await paymentrelated_model_1.paymentRelatedMain
        .findById(paymentRelated.paymentRelated);
    if (!related) {
        return { success: true, status: 200 };
    }
    const updateRes = await paymentrelated_model_1.paymentRelatedMain.updateOne({
        _id: paymentRelated.paymentRelated
    }, {
        $set: {
            // related.items = paymentRelated.items || related.items;
            orderDate: paymentRelated.orderDate || related['orderDate'],
            paymentDate: paymentRelated.paymentDate || related['paymentDate'],
            // related.payments = paymentRelated.payments || related.payments;
            billingAddress: paymentRelated.billingAddress || related['billingAddress'],
            shippingAddress: paymentRelated.shippingAddress || related['shippingAddress'],
            // related.tax = paymentRelated.tax || related.tax;
            currency: paymentRelated.currency || related['currency'],
            // related.user = paymentRelated.user || related.user;
            isBurgain: paymentRelated.isBurgain || related['isBurgain'],
            shipping: paymentRelated.shipping || related['shipping'],
            manuallyAdded: paymentRelated.manuallyAdded || related['manuallyAdded'],
            paymentMethod: paymentRelated.paymentMethod || related['paymentMethod'],
            orderDeliveryCode: paymentRelated.orderDeliveryCode || related['orderDeliveryCode']
            // related.status = paymentRelated.status || related.status;
        }
    })
        .catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return errResponse;
    }
    return { success: true, status: 200, _id: related._id };
};
exports.updatePaymentRelated = updatePaymentRelated;
/**
 * Creates or updates a payment-related entity.
 *
 * @param paymentRelated - The payment-related data.
 * @param invoiceRelated - The invoice-related data.
 * @param type - The type of entity ('payment' or 'order').
 * @param extraNotifDesc - Additional notification description.
 * @param companyId - The query ID.
 * @returns A promise that resolves to an
 *  object containing the success status and the ID of the created or updated entity.
 */
const relegatePaymentRelatedCreation = async (res, paymentRelated, invoiceRelated, type, // say payment or order
extraNotifDesc, companyId) => {
    const isValid = (0, stock_universal_server_1.verifyObjectId)(paymentRelated.paymentRelated);
    let found;
    if (isValid) {
        found = await paymentrelated_model_1.paymentRelatedLean
            .findOne({ _id: paymentRelated.paymentRelated }).lean().select({ urId: 1 });
    }
    if (!found || paymentRelated.creationType === 'solo') {
        paymentRelated.urId = await (0, stock_universal_server_1.generateUrId)(paymentrelated_model_1.paymentRelatedMain);
        const newPayRelated = new paymentrelated_model_1.paymentRelatedMain(paymentRelated);
        const savedRes = await newPayRelated.save().catch((err) => err);
        if (savedRes instanceof mongoose_1.Error) {
            const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedRes);
            return errResponse;
        }
        if (savedRes && savedRes._id) {
            (0, stock_universal_server_1.addParentToLocals)(res, savedRes._id, 'paymentrelateds', 'makeTrackEdit');
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
        const stn = await (0, stock_notif_server_1.getCurrentNotificationSettings)(companyId);
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
            const _ids = [];
            if (type === 'order') {
                for (const cuser of capableUsers) {
                    if (cuser.permissions.orders) {
                        _ids.push(cuser._id);
                    }
                }
            }
            else {
                for (const cuser of capableUsers) {
                    if (cuser.permissions.payments) {
                        _ids.push(cuser._id);
                    }
                }
            }
            const notifFilters = { id: { $in: _ids } };
            await (0, stock_notif_server_1.createNotifications)({
                notification,
                filters: notifFilters
            });
        }
        return { success: true, status: 200, _id: savedRes._id };
        /** return {
          paymentRelated: saved._id as string
          // invoiceRelated: relatedId
        }; */
    }
    else {
        await (0, exports.updatePaymentRelated)(paymentRelated, companyId);
        // await updateInvoiceRelated(invoiceRelated);
        return { success: true, status: 200, _id: paymentRelated.paymentRelated._id };
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
    // _id: meta._id,
    // createdAt: meta.createdAt,
    // updatedAt: meta.updatedAt,
    paymentRelated: paymentRelated._id,
    urId: paymentRelated.urId,
    // items: paymentRelated.items,
    orderDate: paymentRelated.orderDate,
    paymentDate: paymentRelated.paymentDate,
    // payments: paymentRelated.payments,
    billingAddress: paymentRelated.billingAddress,
    shippingAddress: paymentRelated.shippingAddress,
    // tax: paymentRelated.tax,
    // currency: paymentRelated.currency,
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

   * @param _ids - An array of string IDs representing the documents to be deleted.
 * @param companyId - The ID of the company associated with the documents.
 * @returns A Promise that resolves to an object indicating the success of the operation.
 */
const deleteManyPaymentRelated = async (_ids, companyId) => {
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([..._ids, ...[companyId]]);
    if (!isValid) {
        return { success: false, status: 402, err: 'unauthourised' };
    }
    /* const deletedMany = await paymentRelatedMain
      .deleteMany({ _id: { $in: _ids }, companyId }); */
    const deletedMany = await paymentrelated_model_1.paymentRelatedMain
        .updateMany({ _id: { $in: _ids }, companyId }, {
        $set: { isDeleted: true }
    });
    if (Boolean(deletedMany)) {
        return { success: Boolean(deletedMany), status: 200 };
    }
    else {
        return {
            success: Boolean(deletedMany),
            status: 403, err: 'could not delete selected documents, try again in a while'
        };
    }
};
exports.deleteManyPaymentRelated = deleteManyPaymentRelated;
/**
 * Deletes all pay orders linked to a payment or an order.
 * @param paymentRelated - The payment related to the pay orders.
 * @param invoiceRelated - The invoice related to the pay orders.
 * @param where - Specifies whether the pay orders are linked to a payment or an order.
 * @param companyId - The ID of the query.
 */
const deleteAllPayOrderLinked = async (paymentRelated, invoiceRelated, where, companyId) => {
    const invoiceRel = await invoicerelated_model_1.invoiceRelatedLean.findOne({ _id: invoiceRelated })
        .lean()
        .select({ creationType: 1 });
    if (!invoiceRel) {
        return { success: false }; // TODO proper err msg
    }
    await (0, exports.deleteManyPaymentRelated)([paymentRelated], companyId);
    await (0, invoicerelated_1.deleteManyInvoiceRelated)([invoiceRelated], companyId);
    if (invoiceRel.creationType !== 'solo') {
        /* await paymentMain.deleteOne({ paymentRelated });
        await orderMain.deleteOne({ paymentRelated }); */
        await payment_model_1.paymentMain.updateOne({ paymentRelated }, {
            $set: { isDeleted: true }
        });
        await order_model_1.orderMain.updateOne({ paymentRelated }, {
            $set: { isDeleted: true }
        });
    }
    else if (where === 'payment') {
        /* await paymentMain.deleteOne({ paymentRelated }); */
        await payment_model_1.paymentMain.updateOne({ paymentRelated }, {
            $set: { isDeleted: true }
        });
    }
    else if (where === 'order') {
        /* await orderMain.deleteOne({ paymentRelated }); */
        await order_model_1.orderMain.updateOne({ paymentRelated }, {
            $set: { isDeleted: true }
        });
    }
};
exports.deleteAllPayOrderLinked = deleteAllPayOrderLinked;
const makePaymentInstall = async (res, receipt, relatedId, companyId, creationType) => {
    // const pInstall = invoiceRelated.payments[0] as IpaymentInstall;
    if (receipt) {
        if (creationType !== 'solo') {
            const canMake = await (0, invoicerelated_1.canMakeReceipt)(relatedId);
            if (!canMake) {
                return false;
            }
        }
        receipt.companyId = companyId;
        receipt.invoiceRelated = relatedId;
        const newInstal = new receipt_model_1.receiptMain(receipt);
        const savedPinstall = await newInstal.save().catch((err) => err);
        if (savedPinstall instanceof mongoose_1.Error) {
            const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedPinstall);
            return errResponse;
        }
        if (savedPinstall && savedPinstall._id) {
            (0, stock_universal_server_1.addParentToLocals)(res, savedPinstall._id, 'receipts', 'makeTrackEdit');
        }
        await (0, invoicerelated_1.updateInvoiceRelatedPayments)(savedPinstall);
        return { success: true };
    }
    return { success: true };
};
exports.makePaymentInstall = makePaymentInstall;
/**
   * Sends a notification to all users with a due date.
   * @returns A promise that resolves to true if all notifications were sent successfully.
   */
const notifyAllOnDueDate = async () => {
    const now = new Date();
    const withDueDate = await invoicerelated_model_1.invoiceRelatedLean.find({})
        .gte('toDate', now)
        .lean();
    const all = withDueDate.map(async (inv) => {
        if (!inv.companyId) {
            return false;
        }
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
            if (inv.billingUserId) {
                const notification = {
                    actions,
                    userId: inv.billingUserId.toString(),
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
            }
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
            <a href="https://eagleinfosolutions.com/support">
            Help
            </a> | <a href="https://eagleinfosolutions.com/support">Contacts</a>
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
            <a href="https://eagleinfosolutions.com/support">
            Help
            </a> | <a href="https://eagleinfosolutions.com/support">Contacts</a>
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