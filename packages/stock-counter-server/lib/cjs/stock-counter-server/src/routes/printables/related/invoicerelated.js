"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transFormInvoiceRelatedOnStatus = exports.updateCustomerDueAmount = exports.getPaymentsTotal = exports.canMakeReceipt = exports.updateItemsInventory = exports.deleteAllLinked = exports.deleteManyInvoiceRelated = exports.makeInvoiceRelatedPdct = exports.relegateInvRelatedCreation = exports.updateInvoiceRelated = exports.updateInvoiceRelatedPayments = void 0;
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_notif_server_1 = require("@open-stock/stock-notif-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const item_model_1 = require("../../../models/item.model");
const deliverynote_model_1 = require("../../../models/printables/deliverynote.model");
const estimate_model_1 = require("../../../models/printables/estimate.model");
const invoice_model_1 = require("../../../models/printables/invoice.model");
const receipt_model_1 = require("../../../models/printables/receipt.model");
const invoicerelated_model_1 = require("../../../models/printables/related/invoicerelated.model");
// import { pesapalNotifRedirectUrl } from '../../../stock-counter-local';
/**
 * Updates the payments related to an invoice.
 *
 * @param payment - The payment object to be added.
 * @param companyId - The ID of the company.
 * @returns A promise that resolves to an object containing the success status and the ID of the saved payment.
 */
const updateInvoiceRelatedPayments = async (payment) => {
    if (!payment.invoiceRelated) {
        return { success: false, status: 401, err: 'unauthourised' };
    }
    const isValid = (0, stock_universal_server_1.verifyObjectId)(payment.invoiceRelated);
    if (!isValid) {
        return { success: false, status: 401, err: 'unauthourised' };
    }
    const related = await invoicerelated_model_1.invoiceRelatedMain
        .findById(payment.invoiceRelated);
    if (!related) {
        return { success: false, err: 'invoice related not found' };
    }
    const payments = related.payments || [];
    payments.push(payment._id);
    const total = await (0, exports.getPaymentsTotal)(related.payments);
    // if is not yet paid update neccesary fields
    if (related.total && related.status !== 'paid' && total >= related.total) {
        await (0, exports.updateItemsInventory)(related);
        if (related.billingUserId) {
            await (0, exports.updateCustomerDueAmount)(related.billingUserId, related.total, true);
        }
        related.status = 'paid';
        related.balanceDue = 0;
    }
    const updateRes = await invoicerelated_model_1.invoiceRelatedMain.updateOne({
        _id: payment.invoiceRelated
    }, {
        $set: {
            payments,
            status: related.status,
            balanceDue: related.balanceDue
        }
    }).catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return new Promise((resolve, reject) => reject(errResponse));
    }
    return { success: true, _id: related._id };
};
exports.updateInvoiceRelatedPayments = updateInvoiceRelatedPayments;
const updateInvoiceRelated = async (res, invoiceRelated) => {
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
    const updateRes = await invoicerelated_model_1.invoiceRelatedMain.updateOne({
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
            isDeleted: invoiceRelated.isDeleted || related.isDeleted,
            currency: invoiceRelated.currency || related.currency
        }
    })
        .catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return new Promise((resolve, reject) => reject(errResponse));
    }
    const foundRelated = await invoicerelated_model_1.invoiceRelatedMain
        .findById(invoiceRelated.invoiceRelated)
        .lean();
    if (!foundRelated || !foundRelated.billingUserId || !oldTotal) {
        return { success: false, err: 'invoice related not found' };
    }
    if (oldStatus !== foundRelated.status && foundRelated.status === 'paid') {
        await (0, exports.updateCustomerDueAmount)(foundRelated.billingUserId, oldTotal, true);
        await (0, exports.updateItemsInventory)(foundRelated);
    }
    else if (foundRelated.status !== 'paid' && foundRelated.total) {
        await (0, exports.updateCustomerDueAmount)(foundRelated.billingUserId, oldTotal, true);
        await (0, exports.updateCustomerDueAmount)(foundRelated.billingUserId, foundRelated.total, false);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, related._id, 'invoicerelateds', 'makeTrackEdit');
    return { success: true, _id: related._id };
};
exports.updateInvoiceRelated = updateInvoiceRelated;
const relegateInvRelatedCreation = async (res, invoiceRelated, companyId, extraNotifDesc, bypassNotif = false) => {
    stock_universal_server_1.mainLogger.debug('relegateInvRelatedCreation - invoiceRelated', invoiceRelated);
    invoiceRelated.companyId = companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(invoiceRelated.invoiceRelated);
    let found;
    if (isValid) {
        found = await invoicerelated_model_1.invoiceRelatedLean
            .findById(invoiceRelated.invoiceRelated).lean().select({ urId: 1 });
    }
    if (!found || invoiceRelated.creationType === 'solo') {
        const newInvRelated = new invoicerelated_model_1.invoiceRelatedMain(invoiceRelated);
        const savedRes = await newInvRelated.save().catch((err) => err);
        if (savedRes instanceof mongoose_1.Error) {
            const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedRes);
            return new Promise((resolve, reject) => reject(errResponse));
        }
        if (savedRes && savedRes._id) {
            (0, stock_universal_server_1.addParentToLocals)(res, savedRes._id, 'invoicerelateds', 'makeTrackEdit');
        }
        if (!newInvRelated.billingUserId) {
            return { success: false, err: 'billing user not found' };
        }
        if (!newInvRelated.total) {
            return { success: false, err: 'total not found' };
        }
        await (0, exports.updateCustomerDueAmount)(newInvRelated.billingUserId, newInvRelated.total, false);
        stock_universal_server_1.mainLogger.error('AFTER SAVE');
        let route;
        let title = '';
        let notifType;
        const stn = await (0, stock_notif_server_1.getCurrentNotificationSettings)(companyId);
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
            const _ids = [];
            for (const cuser of capableUsers) {
                if (cuser.permissions.invoices) {
                    _ids.push(cuser._id);
                }
            }
            const notifFilters = { id: { $in: _ids } };
            await (0, stock_notif_server_1.createNotifications)({
                notification,
                filters: notifFilters
            });
        }
        return { success: true, _id: savedRes._id };
    }
    else {
        await (0, exports.updateInvoiceRelated)(res, invoiceRelated);
        return { success: true, _id: invoiceRelated.invoiceRelated };
    }
};
exports.relegateInvRelatedCreation = relegateInvRelatedCreation;
const makeInvoiceRelatedPdct = (invoiceRelated, user, createdAt, extras = {}) => {
    // TODO later
    let names = '';
    if (user) {
        names = user.salutation ? user.salutation + ' ' + user.fname + ' ' + user.lname : user.fname + ' ' + user.lname;
        if (user.userDispNameFormat) {
            switch (user.userDispNameFormat) {
                case 'firstLast':
                    names = user.salutation ? user.salutation + ' ' +
                        user.fname + ' ' + user.lname : user.fname + ' ' + user.lname;
                    break;
                case 'lastFirst':
                    names = user.salutation ? user.salutation + ' ' +
                        user.lname + ' ' + user.fname : user.lname + ' ' + user.fname;
                    break;
                case 'companyName':
                    names = user.companyName || '';
                    break;
            }
        }
    }
    let updatedAt = invoiceRelated.updatedAt;
    if (extras && extras.updatedAt) {
        updatedAt = extras.updatedAt;
    }
    return {
        _id: invoiceRelated._id,
        companyId: invoiceRelated.companyId,
        invoiceRelated: invoiceRelated._id,
        creationType: invoiceRelated.creationType,
        invoiceId: invoiceRelated.invoiceId,
        estimateId: invoiceRelated.estimateId,
        billingUser: names,
        extraCompanyDetails: user?.extraCompanyDetails,
        items: invoiceRelated.items.map(pdct => {
            if (typeof pdct.item === 'string' || !pdct.item) {
                return pdct;
            }
            else {
                return {
                    currency: pdct.currency,
                    amount: pdct.amount,
                    quantity: pdct.amount,
                    rate: pdct.rate,
                    itemName: pdct.item.name,
                    item: pdct.item._id
                };
            }
        }),
        billingUserId: user?.urId,
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
        billingUserPhoto: user?.profilePic,
        createdAt: createdAt || invoiceRelated.createdAt,
        payments: invoiceRelated.payments,
        ecommerceSale: invoiceRelated.ecommerceSale,
        ecommerceSalePercentage: invoiceRelated.ecommerceSalePercentage,
        currency: invoiceRelated.currency,
        updatedAt,
        ...extras
    };
};
exports.makeInvoiceRelatedPdct = makeInvoiceRelatedPdct;
const deleteManyInvoiceRelated = async (_ids, companyId) => {
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([..._ids, ...[companyId]]);
    if (!isValid) {
        return { success: false, statu: 401, err: 'unauthourised' };
    }
    const updateInvRelRes = await invoicerelated_model_1.invoiceRelatedMain
        .updateMany({ _id: { $in: _ids }, companyId }, {
        $set: { isDeleted: true }
    })
        .catch((err) => err);
    if (updateInvRelRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateInvRelRes);
        return errResponse;
    }
    const updateRes = await receipt_model_1.receiptMain
        .updateMany({ invoiceRelated: { $in: _ids } }, {
        $set: { isDeleted: true }
    })
        .catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return errResponse;
    }
    return { success: false, status: 403, err: 'could not delete selected documents, try again in a while' };
};
exports.deleteManyInvoiceRelated = deleteManyInvoiceRelated;
/**
 * Deletes all linked documents based on the provided parameters.
 *
 * @param invoiceRelated - The identifier of the related invoice.
 * @param from - The previous stage of the document.
 * @param companyId - The identifier of the query.
 * @returns A promise that resolves to an object indicating the success of the deletion operation.
 */
const deleteAllLinked = async (invoiceRelated, from, companyId) => {
    const invoiceRel = await invoicerelated_model_1.invoiceRelatedLean.findOne({ _id: invoiceRelated })
        .lean()
        .select({ stage: 1, creationType: 1 });
    if (!invoiceRel) {
        return { success: false, err: 'not found' };
    }
    if (invoiceRel.stage !== from) {
        return { success: false, err: 'cant make delete now, ' + invoiceRel.stage + 'is linked some where else' };
    }
    let changedStage = 'estimate';
    if (from === 'estimate') {
        /* await estimateMain.deleteOne({ invoiceRelated, companyId }); */
        await estimate_model_1.estimateMain.updateOne({ invoiceRelated, companyId }, {
            $set: { isDeleted: true }
        });
    }
    else if (from === 'invoice') {
        changedStage = 'estimate';
        /* await invoiceMain.deleteOne({ invoiceRelated, companyId }); */
        await invoice_model_1.invoiceMain.updateOne({ invoiceRelated, companyId }, {
            $set: { isDeleted: true }
        });
    }
    else if (from === 'deliverynote') {
        /* await deliveryNoteMain.deleteOne({ invoiceRelated, }); */
        await deliverynote_model_1.deliveryNoteMain.updateOne({ invoiceRelated, companyId }, {
            $set: { isDeleted: true }
        });
        changedStage = 'invoice';
    }
    else if (from === 'receipt') {
        /* await receiptMain.deleteOne({ invoiceRelated, }); */
        await receipt_model_1.receiptMain.updateOne({ invoiceRelated, companyId }, {
            $set: { isDeleted: true }
        });
        changedStage = 'deliverynote';
    }
    let response = {
        success: false,
        err: 'cant make delete now, ' + invoiceRel.stage + 'is linked some where else'
    };
    if (invoiceRel.creationType === 'solo' ||
        (invoiceRel.creationType === 'chained' && invoiceRel.stage === 'estimate')) {
        response = await (0, exports.deleteManyInvoiceRelated)([invoiceRelated], companyId);
    }
    else {
        await updateRelatedStage(invoiceRelated, changedStage, companyId);
        if (invoiceRel.creationType === 'halfChained') {
            if (invoiceRel.stage === 'invoice') {
                const exist = await estimate_model_1.estimateLean.findOne({ invoiceRelated });
                if (!exist) {
                    response = await (0, exports.deleteManyInvoiceRelated)([invoiceRelated], companyId);
                }
            }
            if (invoiceRel.stage === 'deliverynote') {
                const exist = await invoice_model_1.invoiceLean.findOne({ invoiceRelated });
                if (!exist) {
                    response = await (0, exports.deleteManyInvoiceRelated)([invoiceRelated], companyId);
                }
            }
            else if (invoiceRel.stage === 'receipt') {
                const exist = await deliverynote_model_1.deliveryNoteLean.findOne({ invoiceRelated });
                if (!exist) {
                    response = await (0, exports.deleteManyInvoiceRelated)([invoiceRelated], companyId);
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
 * @param _id - The ID of the invoice related document.
 * @param stage - The new stage value to set.
 * @param companyId - The ID of the company to query.
 * @returns A boolean indicating whether the update was successful.
 */
const updateRelatedStage = async (_id, stage, companyId) => {
    const related = await invoicerelated_model_1.invoiceRelatedMain
        .findOne({ _id })
        .lean();
    if (!related) {
        return false;
    }
    related.stage = stage;
    await invoicerelated_model_1.invoiceRelatedMain.updateOne({
        _id, companyId
    }, {
        $set: { stage }
    }).catch((err) => err);
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
    const allPromises = (relatedObj.items || []).map(async (item) => {
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
/**
   * Checks if the invoice related with the given ID has received enough payments to
   * be marked as paid.
   * @param relatedId - The ID of the invoice related document to check.
   * @returns A boolean indicating whether the invoice related has enough payments.
   */
const canMakeReceipt = async (relatedId) => {
    const related = await invoicerelated_model_1.invoiceRelatedMain.findOne({ _id: relatedId });
    if (!related?.total) {
        return false;
    }
    const total = await (0, exports.getPaymentsTotal)(related.payments);
    return total >= related.total;
};
exports.canMakeReceipt = canMakeReceipt;
/**
   * Calculates the total amount of all payments in a given array of payment IDs.
   *
   * @param payments - An array of payment IDs.
   * @returns A promise that resolves to the total amount of all payments.
   */
const getPaymentsTotal = async (payments) => {
    const paymentsPromises = payments.map(async (payment) => {
        const paymentDoc = await receipt_model_1.receiptMain.findOne({ _id: payment }).lean().select({ ammountRcievd: 1 });
        if (!paymentDoc) {
            return null;
        }
        return paymentDoc;
    });
    const allPromises = await Promise.all(paymentsPromises);
    return allPromises
        .filter(val => val !== null)
        .reduce((total, payment) => total + payment.ammountRcievd, 0);
};
exports.getPaymentsTotal = getPaymentsTotal;
/**
   * Updates the amountDue of a user by the given amount
   * @param userId - The ID of the user to update
   * @param amount - The amount to update the user's amountDue by
   * @param reduce - If true then the amountDue is reduced by the given amount, else it is increased
   * @returns A promise that resolves to a boolean indicating the success of the operation
   */
const updateCustomerDueAmount = async (userId, amount, reduce) => {
    const billingUser = await stock_auth_server_1.user.findOne({ _id: userId });
    if (!billingUser || !billingUser.amountDue) {
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
/**
   * Transforms an invoice related object on status change.
   *
   * @param oldRelated - The old invoice related object.
   * @param newRelated - The new invoice related object.
   * @returns The transformed new invoice related object.
   */
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