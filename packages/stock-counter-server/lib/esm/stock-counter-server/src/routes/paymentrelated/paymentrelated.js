import { user } from '@open-stock/stock-auth-server';
import { getCurrentNotificationSettings } from '@open-stock/stock-notif-server';
import { makeUrId, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import * as tracer from 'tracer';
import { orderMain } from '../../models/order.model';
import { paymentMain } from '../../models/payment.model';
import { paymentRelatedLean, paymentRelatedMain } from '../../models/printables/paymentrelated/paymentrelated.model';
import { receiptMain } from '../../models/printables/receipt.model';
import { deleteManyInvoiceRelated, makeInvoiceRelatedPdct, updateInvoiceRelatedPayments } from '../printables/related/invoicerelated';
import * as fs from 'fs';
/** Logger for PaymentRelated routes */
const paymentRelatedLogger = tracer.colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
        // eslint-disable-next-line no-console
        console.log(data.output);
        const logDir = './openstockLog/';
        fs.mkdir(logDir, { recursive: true }, (err) => {
            if (err) {
                if (err) {
                    throw err;
                }
            }
        });
        fs.appendFile('./openStockLog/counter-server.log', data.rawoutput + '\n', err => {
            if (err) {
                throw err;
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
export const updatePaymentRelated = async (paymentRelated, queryId) => {
    paymentRelated.companyId = queryId;
    const isValid = verifyObjectId(paymentRelated.paymentRelated);
    if (!isValid) {
        return { success: false, err: 'unauthourised', status: 401 };
    }
    const related = await paymentRelatedMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
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
            errResponse.err = stringifyMongooseErr(err.errors);
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
        // eslint-disable-next-line @typescript-eslint/naming-convention
        return { success: true, status: 200, id: saved._id };
    }
};
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
export const relegatePaymentRelatedCreation = async (paymentRelated, invoiceRelated, type, // say payment or order
extraNotifDesc, queryId) => {
    const isValid = verifyObjectId(paymentRelated.paymentRelated);
    let found;
    if (isValid) {
        found = await paymentRelatedLean
            // eslint-disable-next-line @typescript-eslint/naming-convention
            .findOne({ _id: paymentRelated.paymentRelated }).lean().select({ urId: 1 });
    }
    if (!found || paymentRelated.creationType === 'solo') {
        const count = await paymentRelatedMain
            // eslint-disable-next-line @typescript-eslint/naming-convention
            .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
        paymentRelated.urId = makeUrId(Number(count[0]?.urId || '0'));
        let errResponse;
        const newPayRelated = new paymentRelatedMain(paymentRelated);
        const saved = await newPayRelated.save().catch(err => {
            errResponse = {
                success: false,
                status: 403
            };
            if (err && err.errors) {
                errResponse.err = stringifyMongooseErr(err.errors);
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
        // let route: string;
        // let title = '';
        let accessor;
        // let notifType: TnotifType;
        if (type === 'order') {
            // route = 'orders';
            // title = 'Order Made';
            accessor = 'orders';
            // notifType = 'orders';
        }
        else {
            // route = 'payments';
            // title = 'Payment Made';
            accessor = 'payments';
            // notifType = 'payments';
        }
        const stn = await getCurrentNotificationSettings();
        if (stn && stn[accessor]) {
            /* const actions: Iactionwithall[] = [{
              operation: 'view',
              url: pesapalNotifRedirectUrl + route,
              action: '',
              title
            }];*/
            /* const notification: Imainnotification = {
              actions,
              userId: invoiceRelated.billingUserId,
              title,
              body: extraNotifDesc,
              icon: '',
              notifType,
              // photo: string;
              expireAt: '200000'
            };*/
            const capableUsers = await user.find({})
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
            // const notifFilters = { id: { $in: ids } };
            /* await createNotifications({
              options: notification,
              filters: notifFilters
            });*/
        }
        // eslint-disable-next-line @typescript-eslint/naming-convention
        return { success: true, status: 200, id: saved._id };
        /** return {
          paymentRelated: saved._id as string
          // invoiceRelated: relatedId
        };*/
    }
    else {
        await updatePaymentRelated(paymentRelated, queryId);
        // await updateInvoiceRelated(invoiceRelated);
        // eslint-disable-next-line @typescript-eslint/naming-convention
        return { success: true, status: 200, id: paymentRelated.paymentRelated._id };
        /** return {
          paymentRelated: paymentRelated.paymentRelated
          // invoiceRelated: invoiceRelated.invoiceRelated
        };*/
    }
};
/**
 * Creates a payment related product object.
 * @param paymentRelated - The payment related data.
 * @param invoiceRelated - The invoice related data.
 * @param user - The user data.
 * @param meta - The meta data.
 * @returns The payment related product object.
 */
export const makePaymentRelatedPdct = (paymentRelated, invoiceRelated, 
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
    ...makeInvoiceRelatedPdct(invoiceRelated, user)
});
/**
 * Deletes multiple payment related documents.
 * @param companyId - The ID of the company
   * @param ids - An array of string IDs representing the documents to be deleted.
 * @param queryId - The ID of the company associated with the documents.
 * @returns A Promise that resolves to an object indicating the success of the operation.
 */
export const deleteManyPaymentRelated = async (ids, queryId) => {
    const isValid = verifyObjectIds([...ids, ...[queryId]]);
    if (!isValid) {
        return { success: false, status: 402, err: 'unauthourised' };
    }
    const deletedMany = await paymentRelatedMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ _id: { $in: ids }, companyId: queryId });
    if (Boolean(deletedMany)) {
        return { success: Boolean(deletedMany), status: 200 };
    }
    else {
        return { success: Boolean(deletedMany), status: 403, err: 'could not delete selected documents, try again in a while' };
    }
};
/**
 * Deletes all pay orders linked to a payment or an order.
 * @param paymentRelated - The payment related to the pay orders.
 * @param invoiceRelated - The invoice related to the pay orders.
 * @param creationType - The type of payment related creation.
 * @param where - Specifies whether the pay orders are linked to a payment or an order.
 * @param queryId - The ID of the query.
 */
export const deleteAllPayOrderLinked = async (paymentRelated, invoiceRelated, creationType, where, queryId) => {
    await deleteManyPaymentRelated([paymentRelated], queryId);
    await deleteManyInvoiceRelated([invoiceRelated], queryId);
    if (creationType !== 'solo') {
        await paymentMain.deleteOne({ paymentRelated });
        await orderMain.deleteOne({ paymentRelated });
    }
    else if (where === 'payment') {
        await paymentMain.deleteOne({ paymentRelated });
    }
    else if (where === 'order') {
        await orderMain.deleteOne({ paymentRelated });
    }
};
// .catch(err => {});
/**
 * Makes a payment installation.
 * @param receipt - The receipt object.
 * @param relatedId - The related ID.
 * @param queryId - The query ID.
 * @returns A promise that resolves to an object indicating the success of the operation.
 */
export const makePaymentInstall = async (receipt, relatedId, queryId) => {
    // const pInstall = invoiceRelated.payments[0] as IpaymentInstall;
    if (receipt) {
        receipt.companyId = queryId;
        let errResponse;
        receipt.invoiceRelated = relatedId;
        const newInstal = new receiptMain(receipt);
        const savedPinstall = await newInstal.save().catch(err => {
            errResponse = {
                success: false,
                status: 403
            };
            if (err && err.errors) {
                errResponse.err = stringifyMongooseErr(err.errors);
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
        await updateInvoiceRelatedPayments(savedPinstall, queryId);
        return { success: true };
    }
    return { success: true };
};
//# sourceMappingURL=paymentrelated.js.map