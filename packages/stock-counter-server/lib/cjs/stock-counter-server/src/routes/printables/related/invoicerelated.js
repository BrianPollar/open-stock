"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transFormInvoiceRelatedOnStatus = exports.updateCustomerDueAmount = exports.getPaymentsTotal = exports.canMakeReceipt = exports.updateItemsInventory = exports.deleteAllLinked = exports.deleteManyInvoiceRelated = exports.makeInvoiceRelatedPdct = exports.relegateInvRelatedCreation = exports.updateInvoiceRelated = exports.updateInvoiceRelatedPayments = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_notif_server_1 = require("@open-stock/stock-notif-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const item_model_1 = require("../../../models/item.model");
const deliverynote_model_1 = require("../../../models/printables/deliverynote.model");
const estimate_model_1 = require("../../../models/printables/estimate.model");
const invoice_model_1 = require("../../../models/printables/invoice.model");
const receipt_model_1 = require("../../../models/printables/receipt.model");
const invoicerelated_model_1 = require("../../../models/printables/related/invoicerelated.model");
// import { pesapalNotifRedirectUrl } from '../../../stock-counter-local';
/**
 * Logger for the 'InvoiceRelated' routes.
 */
const invoiceRelatedLogger = tracer.colorConsole({
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
 * Updates the payments related to an invoice.
 *
 * @param payment - The payment object to be added.
 * @param queryId - The ID of the company.
 * @returns A promise that resolves to an object containing the success status and the ID of the saved payment.
 */
const updateInvoiceRelatedPayments = async (payment, queryId) => {
    const isValid = (0, stock_universal_server_1.verifyObjectId)(payment.invoiceRelated);
    if (!isValid) {
        return { success: false, status: 401, err: 'unauthourised' };
    }
    const related = await invoicerelated_model_1.invoiceRelatedMain
        .findByIdAndUpdate(payment.invoiceRelated);
    if (!related) {
        return { success: false, err: 'invoice related not found' };
    }
    const payments = related.payments || [];
    payments.push(payment._id);
    related.payments = payments;
    const total = await (0, exports.getPaymentsTotal)(related.payments);
    // if is not yet paid update neccesary fields
    if (related.status !== 'paid' && total >= related.total) {
        await (0, exports.updateItemsInventory)(related);
        await (0, exports.updateCustomerDueAmount)(related.billingUserId, related.total, true);
        related.status = 'paid';
        related.balanceDue = 0;
    }
    let errResponse;
    const saved = await related.save()
        .catch(err => {
        invoiceRelatedLogger.error('updateInvoiceRelatedPayments - err: ', err);
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
    else {
        return { success: true, id: saved._id };
    }
};
exports.updateInvoiceRelatedPayments = updateInvoiceRelatedPayments;
/**
 * Updates an invoice related document.
 * @param invoiceRelated - The updated invoice related document.
 * @returns A promise that resolves with a success status and an optional ID.
 */
/**
 * Updates the invoice related information.
 * @param invoiceRelated - The updated invoice related data.
 * @param queryId - The query ID.
 * @returns A promise that resolves to an object containing the success status and the updated invoice related ID.
 */
const updateInvoiceRelated = async (res, invoiceRelated, queryId) => {
    const isValid = (0, stock_universal_server_1.verifyObjectId)(invoiceRelated.invoiceRelated);
    if (!isValid) {
        return { success: false, status: 401, err: 'unauthourised' };
    }
    // !!
    const related = await invoicerelated_model_1.invoiceRelatedMain
        .findById(invoiceRelated.invoiceRelated)
        .lean();
    if (!related) {
        return { success: false, err: 'invoice related not found' };
    }
    // start with id
    if (typeof Number(related.billingUserId) !== 'number') {
        related.billingUserId = invoiceRelated.billingUserId || related.billingUserId;
    }
    invoiceRelated = (0, exports.transFormInvoiceRelatedOnStatus)(related, invoiceRelated);
    const oldTotal = related.total;
    const oldStatus = related.status;
    let errResponse;
    const saved = await invoicerelated_model_1.invoiceRelatedMain.updateOne({
        _id: invoiceRelated.invoiceRelated
    }, {
        $set: {
            creationType: invoiceRelated.creationType || related.creationType,
            estimateId: invoiceRelated.estimateId || related.estimateId,
            invoiceId: invoiceRelated.invoiceId || related.invoiceId,
            billingUser: invoiceRelated.billingUser || related.billingUser,
            items: invoiceRelated.items || related.items,
            fromDate: invoiceRelated.fromDate || related.fromDate,
            toDate: invoiceRelated.toDate || related.toDate,
            status: invoiceRelated.status || related.status,
            stage: invoiceRelated.stage || related.stage,
            cost: invoiceRelated.cost || related.cost,
            paymentMade: invoiceRelated.paymentMade || related.paymentMade,
            tax: invoiceRelated.tax || related.tax,
            balanceDue: invoiceRelated.balanceDue || related.balanceDue,
            subTotal: invoiceRelated.subTotal || related.subTotal,
            total: invoiceRelated.total || related.total,
            isDeleted: invoiceRelated.isDeleted || related.isDeleted
        }
    })
        .catch(err => {
        invoiceRelatedLogger.error('updateInvoiceRelated - err: ', err);
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
        return err;
    });
    if (errResponse) {
        return errResponse;
    }
    else {
        const foundRelated = await invoicerelated_model_1.invoiceRelatedMain
            .findById(invoiceRelated.invoiceRelated)
            .lean();
        if (oldStatus !== foundRelated.status && foundRelated.status === 'paid') {
            await (0, exports.updateCustomerDueAmount)(foundRelated.billingUserId, oldTotal, true);
            await (0, exports.updateItemsInventory)(foundRelated);
        }
        else if (foundRelated.status !== 'paid') {
            await (0, exports.updateCustomerDueAmount)(foundRelated.billingUserId, oldTotal, true);
            await (0, exports.updateCustomerDueAmount)(foundRelated.billingUserId, foundRelated.total, false);
        }
        (0, stock_universal_server_1.addParentToLocals)(res, related._id, 'invoicerelateds', 'makeTrackEdit');
        return { success: true, id: saved._id };
    }
};
exports.updateInvoiceRelated = updateInvoiceRelated;
/**
 * Relocates an invoice related document.
 * @param invoiceRelated - The invoice related document to relocate.
 * @param extraNotifDesc - A description for the notification.
 * @param localMailHandler - The email handler to use for sending notifications.
 * @param bypassNotif - Whether to bypass sending notifications.
 * @returns A promise that resolves with a success status and an optional ID.
 */
const relegateInvRelatedCreation = async (res, invoiceRelated, queryId, extraNotifDesc, bypassNotif = false) => {
    invoiceRelatedLogger.debug('relegateInvRelatedCreation - invoiceRelated', invoiceRelated);
    invoiceRelated.companyId = queryId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(invoiceRelated.invoiceRelated);
    let found;
    if (isValid) {
        found = await invoicerelated_model_1.invoiceRelatedLean
            .findById(invoiceRelated.invoiceRelated).lean().select({ urId: 1 });
    }
    if (!found || invoiceRelated.creationType === 'solo') {
        const newInvRelated = new invoicerelated_model_1.invoiceRelatedMain(invoiceRelated);
        let errResponse;
        const saved = await newInvRelated.save().catch(err => {
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
            return err;
        });
        if (saved && saved._id) {
            (0, stock_universal_server_1.addParentToLocals)(res, saved._id, 'invoicerelateds', 'makeTrackEdit');
        }
        if (errResponse) {
            return errResponse;
        }
        await (0, exports.updateCustomerDueAmount)(newInvRelated.billingUserId, newInvRelated.total, false);
        invoiceRelatedLogger.error('AFTER SAVE');
        let route;
        let title = '';
        let notifType;
        const stn = await (0, stock_notif_server_1.getCurrentNotificationSettings)(queryId);
        if (!bypassNotif && stn?.invoices) {
            switch (invoiceRelated.stage) {
                case 'estimate':
                    route = 'estimates';
                    title = 'New Estimate';
                    notifType = 'invoices';
                    break;
                case 'invoice':
                    route = 'invoices';
                    title = 'New Invoice';
                    notifType = 'invoices';
                    break;
                case 'deliverynote':
                    route = 'deliverynotes';
                    title = 'New Delivery Note';
                    notifType = 'invoices';
                    break;
                case 'receipt':
                    route = 'receipt';
                    title = 'New Reciept';
                    notifType = 'invoices';
                    break;
            }
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
            for (const cuser of capableUsers) {
                if (cuser.permissions.invoices) {
                    ids.push(cuser._id);
                }
            }
            const notifFilters = { id: { $in: ids } };
            await (0, stock_notif_server_1.createNotifications)({
                notification,
                filters: notifFilters
            });
        }
        return { success: true, id: saved._id };
    }
    else {
        await (0, exports.updateInvoiceRelated)(res, invoiceRelated, queryId);
        return { success: true, id: invoiceRelated.invoiceRelated };
    }
};
exports.relegateInvRelatedCreation = relegateInvRelatedCreation;
// eslint-disable-next-line @typescript-eslint/no-shadow
/**
 * Creates an invoice related product based on the provided data.
 * @param invoiceRelated - The required invoice related data.
 * @param user - The user data.
 * @param createdAt - The optional creation date.
 * @param extras - Additional properties to include in the invoice related product.
 * @returns The created invoice related product.
 */
const makeInvoiceRelatedPdct = (invoiceRelated, user, createdAt, extras = {}) => {
    let names = user.salutation ? user.salutation + ' ' + user.fname + ' ' + user.lname : user.fname + ' ' + user.lname;
    if (user.userDispNameFormat) {
        switch (user.userDispNameFormat) {
            case 'firstLast':
                names = user.salutation ? user.salutation + ' ' + user.fname + ' ' + user.lname : user.fname + ' ' + user.lname;
                break;
            case 'lastFirst':
                names = user.salutation ? user.salutation + ' ' + user.lname + ' ' + user.fname : user.lname + ' ' + user.fname;
                break;
            case 'companyName':
                names = user.companyName;
                break;
        }
    }
    return {
        _id: invoiceRelated._id,
        companyId: invoiceRelated.companyId,
        invoiceRelated: invoiceRelated._id,
        creationType: invoiceRelated.creationType,
        invoiceId: invoiceRelated.invoiceId,
        estimateId: invoiceRelated.estimateId,
        billingUser: names,
        extraCompanyDetails: user.extraCompanyDetails,
        items: invoiceRelated.items.map(pdct => {
            if (typeof pdct.item === 'string' || !pdct.item) {
                return pdct;
            }
            else {
                return {
                    amount: pdct.amount,
                    quantity: pdct.amount,
                    rate: pdct.rate,
                    itemName: pdct.item.name,
                    item: pdct.item._id
                };
            }
        }),
        billingUserId: user.urId,
        stage: invoiceRelated.stage,
        fromDate: invoiceRelated.fromDate,
        toDate: invoiceRelated.toDate,
        status: invoiceRelated.status,
        cost: invoiceRelated.cost,
        // paymentMade: invoiceRelated.paymentMade,
        tax: invoiceRelated.tax,
        balanceDue: invoiceRelated.balanceDue,
        subTotal: invoiceRelated.subTotal,
        total: invoiceRelated.total,
        billingUserPhoto: user.profilePic,
        createdAt: createdAt || invoiceRelated.createdAt,
        payments: invoiceRelated.payments,
        ecommerceSale: invoiceRelated.ecommerceSale,
        ecommerceSalePercentage: invoiceRelated.ecommerceSalePercentage,
        currency: invoiceRelated.currency,
        ...extras
    };
};
exports.makeInvoiceRelatedPdct = makeInvoiceRelatedPdct;
/**
 * Deletes multiple invoice-related documents.
 * @param companyId - The ID of the company
   * @param ids - An array of string IDs representing the documents to be deleted.
 * @param queryId - The ID of the company associated with the documents.
 * @returns A promise that resolves to an object indicating the success status and any error information.
 */
const deleteManyInvoiceRelated = async (ids, queryId) => {
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([...ids, ...[queryId]]);
    if (!isValid) {
        return { success: false, statu: 401, err: 'unauthourised' };
    }
    /* const deleted = await invoiceRelatedMain
      .deleteMany({ _id: { $in: ids }, companyId: queryId })
      .catch(err => {
        invoiceRelatedLogger.debug('deleteManyInvoiceRelated - err: ', err);
  
        return null;
      }); */
    const deleted = await invoicerelated_model_1.invoiceRelatedMain
        .updateMany({ _id: { $in: ids }, companyId: queryId }, {
        $set: { isDeleted: true }
    })
        .catch(err => {
        invoiceRelatedLogger.debug('deleteManyInvoiceRelated - err: ', err);
        return null;
    });
    let deleted2 = true;
    if (deleted) {
        /* deleted2 = await receiptMain
          .deleteMany({ invoiceRelated: { $in: ids } })
          .catch(err => {
            invoiceRelatedLogger.error('deletemany Pinstalls - err: ', err);
    
            return null;
          }); */
        deleted2 = await receipt_model_1.receiptMain
            .updateMany({ invoiceRelated: { $in: ids } }, {
            $set: { isDeleted: true }
        })
            .catch(err => {
            invoiceRelatedLogger.error('deletemany Pinstalls - err: ', err);
            return null;
        });
    }
    if (Boolean(deleted) && Boolean(deleted2)) {
        return { success: true, status: 200 };
    }
    else {
        return { success: false, status: 403, err: 'could not delete selected documents, try again in a while' };
    }
};
exports.deleteManyInvoiceRelated = deleteManyInvoiceRelated;
/**
 * Deletes all linked documents based on the provided parameters.
 *
 * @param invoiceRelated - The identifier of the related invoice.
 * @param creationType - The type of creation (solo, chained, halfChained).
 * @param stage - The current stage of the document.
 * @param from - The previous stage of the document.
 * @param queryId - The identifier of the query.
 * @returns A promise that resolves to an object indicating the success of the deletion operation.
 */
const deleteAllLinked = async (invoiceRelated, creationType, stage, from, queryId) => {
    if (stage !== from) {
        return { success: false, err: 'cant make delete now, ' + stage + 'is linked some where else' };
    }
    let changedStage;
    if (from === 'estimate') {
        /* await estimateMain.deleteOne({ invoiceRelated, companyId: queryId }); */
        await estimate_model_1.estimateMain.updateOne({ invoiceRelated, companyId: queryId }, {
            $set: { isDeleted: true }
        });
    }
    else if (from === 'invoice') {
        changedStage = 'estimate';
        /* await invoiceMain.deleteOne({ invoiceRelated, companyId: queryId }); */
        await invoice_model_1.invoiceMain.updateOne({ invoiceRelated, companyId: queryId }, {
            $set: { isDeleted: true }
        });
    }
    else if (from === 'deliverynote') {
        /* await deliveryNoteMain.deleteOne({ invoiceRelated, companyId: queryId }); */
        await deliverynote_model_1.deliveryNoteMain.updateOne({ invoiceRelated, companyId: queryId }, {
            $set: { isDeleted: true }
        });
        changedStage = 'invoice';
    }
    else if (from === 'receipt') {
        /* await receiptMain.deleteOne({ invoiceRelated, companyId: queryId }); */
        await receipt_model_1.receiptMain.updateOne({ invoiceRelated, companyId: queryId }, {
            $set: { isDeleted: true }
        });
        changedStage = 'deliverynote';
    }
    let response = {
        success: false,
        err: 'cant make delete now, ' + stage + 'is linked some where else'
    };
    if (creationType === 'solo' || (creationType === 'chained' && stage === 'estimate')) {
        response = await (0, exports.deleteManyInvoiceRelated)([invoiceRelated], queryId);
    }
    else {
        await updateRelatedStage(invoiceRelated, changedStage, queryId);
        if (creationType === 'halfChained') {
            if (stage === 'invoice') {
                const exist = await estimate_model_1.estimateLean.findOne({ invoiceRelated });
                if (!exist) {
                    response = await (0, exports.deleteManyInvoiceRelated)([invoiceRelated], queryId);
                }
            }
            if (stage === 'deliverynote') {
                const exist = await invoice_model_1.invoiceLean.findOne({ invoiceRelated });
                if (!exist) {
                    response = await (0, exports.deleteManyInvoiceRelated)([invoiceRelated], queryId);
                }
            }
            else if (stage === 'receipt') {
                const exist = await deliverynote_model_1.deliveryNoteLean.findOne({ invoiceRelated });
                if (!exist) {
                    response = await (0, exports.deleteManyInvoiceRelated)([invoiceRelated], queryId);
                }
            }
        }
    }
    return response;
    /* if (creationType !== 'solo') {
      await Promise.all([
        estimateMain.deleteOne({ invoiceRelated }),
        invoiceMain.deleteOne({ invoiceRelated }),
        deliveryNoteMain.deleteOne({ invoiceRelated }),
        receiptMain.deleteOne({ invoiceRelated })
      ]);
    } */
};
exports.deleteAllLinked = deleteAllLinked;
/**
 * Updates the stage of a related invoice.
 * @param id - The ID of the invoice related document.
 * @param stage - The new stage value to set.
 * @param queryId - The ID of the company to query.
 * @returns A boolean indicating whether the update was successful.
 */
const updateRelatedStage = async (id, stage, queryId) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const related = await invoicerelated_model_1.invoiceRelatedMain
        .findOne({ _id: id, companyId: queryId })
        .lean();
    if (!related) {
        return false;
    }
    related.stage = stage;
    await invoicerelated_model_1.invoiceRelatedMain.updateOne({
        _id: id, companyId: queryId
    }, {
        $set: { stage }
    });
    return true;
};
/**
   * Updates the inventory of items in the invoice related document.
   * If the invoice related document is not found, or if any of the items
   * in the document do not have enough stock, the function returns false.
   * Otherwise it returns true.
   * @param related - The ID of the invoice related document to update,
   *                  or the document itself.
   * @returns A boolean indicating whether the update was successful.
   */
const updateItemsInventory = async (related) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    let relatedObj;
    if (typeof related === 'string') {
        relatedObj = await invoicerelated_model_1.invoiceRelatedMain.findOne({ _id: related }).lean();
        if (!relatedObj) {
            return false;
        }
    }
    else {
        relatedObj = related;
    }
    const allPromises = relatedObj.items.map(async (item) => {
        const product = await item_model_1.itemMain.findOne({ _id: item });
        if (!product) {
            return false;
        }
        if (product.numbersInstock > 0) {
            product.numbersInstock--; // TODO if sales on e-commerce fail undo this
            product.soldCount++; // TODO if sales on e-commerce fail undo this
            await product.save();
        }
        return true;
    });
    await Promise.all(allPromises);
    return true;
};
exports.updateItemsInventory = updateItemsInventory;
const canMakeReceipt = async (relatedId) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const related = await invoicerelated_model_1.invoiceRelatedMain.findOne({ _id: relatedId });
    if (!related) {
        return false;
    }
    const total = await (0, exports.getPaymentsTotal)(related.payments);
    return total >= related.total;
};
exports.canMakeReceipt = canMakeReceipt;
const getPaymentsTotal = async (payments) => {
    const paymentsPromises = payments.map(async (payment) => {
        const paymentDoc = await receipt_model_1.receiptMain.findOne({ _id: payment }).lean().select({ ammountRcievd: 1 });
        if (!paymentDoc) {
            return null;
        }
        return paymentDoc;
    });
    const allPromises = await Promise.all(paymentsPromises);
    return allPromises.reduce((total, payment) => total + payment.ammountRcievd, 0);
};
exports.getPaymentsTotal = getPaymentsTotal;
const updateCustomerDueAmount = async (userId, amount, reduce) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const billingUser = await stock_auth_server_1.user.findOne({ _id: userId });
    if (!billingUser) {
        return false;
    }
    if (billingUser.amountDue > 0) {
        if (reduce) {
            if (billingUser.amountDue < amount) {
                billingUser.amountDue = 0;
            }
            else {
                billingUser.amountDue -= amount;
            }
        }
        else {
            billingUser.amountDue += amount;
        }
    }
    await billingUser.save();
    return false;
};
exports.updateCustomerDueAmount = updateCustomerDueAmount;
const transFormInvoiceRelatedOnStatus = (oldRelated, newRelated) => {
    /* if (newRelated.status === oldRelated.status) {
      return newRelated;
    } */
    if (oldRelated.status === 'paid') {
        // cant change fro paid
        newRelated.status = 'paid';
        newRelated.balanceDue = 0;
    }
    return newRelated;
};
exports.transFormInvoiceRelatedOnStatus = transFormInvoiceRelatedOnStatus;
//# sourceMappingURL=invoicerelated.js.map