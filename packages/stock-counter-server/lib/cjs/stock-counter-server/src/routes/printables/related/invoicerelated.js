"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllLinked = exports.deleteManyInvoiceRelated = exports.makeInvoiceRelatedPdct = exports.relegateInvRelatedCreation = exports.updateInvoiceRelated = exports.updateInvoiceRelatedPayments = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_notif_server_1 = require("@open-stock/stock-notif-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const tracer = tslib_1.__importStar(require("tracer"));
const deliverynote_model_1 = require("../../../models/printables/deliverynote.model");
const estimate_model_1 = require("../../../models/printables/estimate.model");
const invoice_model_1 = require("../../../models/printables/invoice.model");
const receipt_model_1 = require("../../../models/printables/receipt.model");
const invoicerelated_model_1 = require("../../../models/printables/related/invoicerelated.model");
const fs = tslib_1.__importStar(require("fs"));
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
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findByIdAndUpdate(payment.invoiceRelated);
    if (!related) {
        return { success: false, err: 'invoice related not found' };
    }
    const payments = related.payments || [];
    payments.push(payment._id);
    related.payments = payments;
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
        // eslint-disable-next-line @typescript-eslint/naming-convention
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
const updateInvoiceRelated = async (invoiceRelated, queryId) => {
    const isValid = (0, stock_universal_server_1.verifyObjectId)(invoiceRelated.invoiceRelated);
    if (!isValid) {
        return { success: false, status: 401, err: 'unauthourised' };
    }
    const related = await invoicerelated_model_1.invoiceRelatedMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findByIdAndUpdate(invoiceRelated.invoiceRelated);
    if (!related) {
        return { success: false, err: 'invoice related not found' };
    }
    // start with id
    if (typeof Number(related.billingUserId) !== 'number') {
        related.billingUserId = invoiceRelated.billingUserId || related.billingUserId;
    }
    related.creationType = invoiceRelated.creationType || related.creationType;
    related.estimateId = invoiceRelated.estimateId || related.estimateId;
    related.invoiceId = invoiceRelated.invoiceId || related.invoiceId;
    related.billingUser = invoiceRelated.billingUser || related.billingUser;
    related.items = invoiceRelated.items || related.items;
    related.fromDate = invoiceRelated.fromDate || related.fromDate;
    related.toDate = invoiceRelated.toDate || related.toDate;
    related.status = invoiceRelated.status || related.status;
    related.stage = invoiceRelated.stage || related.stage;
    related.cost = invoiceRelated.cost || related.cost;
    related.paymentMade = invoiceRelated.paymentMade || related.paymentMade;
    related.tax = invoiceRelated.tax || related.tax;
    related.balanceDue = invoiceRelated.balanceDue || related.balanceDue;
    related.subTotal = invoiceRelated.subTotal || related.subTotal;
    related.total = invoiceRelated.total || related.total;
    let errResponse;
    const saved = await related.save()
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
        return errResponse;
    });
    if (errResponse) {
        return errResponse;
    }
    else {
        // eslint-disable-next-line @typescript-eslint/naming-convention
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
const relegateInvRelatedCreation = async (invoiceRelated, queryId, extraNotifDesc, bypassNotif = false) => {
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
            return errResponse;
        });
        if (errResponse) {
            return errResponse;
        }
        invoiceRelatedLogger.error('AFTER SAVE');
        /* let route: string;
        let title = '';
        let notifType: TnotifType;*/
        const stn = await (0, stock_notif_server_1.getCurrentNotificationSettings)();
        if (!bypassNotif && stn?.invoices) {
            /* switch (invoiceRelated.stage) {
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
            }*/
            /* const actions: Iactionwithall[] = [{
              operation: 'view',
              url: pesapalNotifRedirectUrl + route,
              action: '',
              title
            }];*
      
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
            const capableUsers = await stock_auth_server_1.user.find({})
                .lean().select({ permissions: 1 });
            const ids = [];
            for (const cuser of capableUsers) {
                if (cuser.permissions.invoices) {
                    ids.push(cuser._id);
                }
            }
            // const notifFilters = { id: { $in: ids } };
            /* await createNotifications({
              options: notification,
              filters: notifFilters
            });*/
        }
        // eslint-disable-next-line @typescript-eslint/naming-convention
        return { success: true, id: saved._id };
    }
    else {
        await (0, exports.updateInvoiceRelated)(invoiceRelated, queryId);
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
    let names = user.salutation + ' ' + user.fname + ' ' + user.lname;
    if (user.userDispNameFormat) {
        switch (user.userDispNameFormat) {
            case 'firstLast':
                names = user.salutation + ' ' + user.fname + ' ' + user.lname;
                break;
            case 'lastFirst':
                names = user.salutation + ' ' + user.lname + ' ' + user.fname;
                break;
            case 'companyName':
                names = user.companyName;
                break;
        }
    }
    return {
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
    const deleted = await invoicerelated_model_1.invoiceRelatedMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ _id: { $in: ids }, companyId: queryId })
        .catch(err => {
        invoiceRelatedLogger.debug('deleteManyInvoiceRelated - err: ', err);
        return null;
    });
    let deleted2 = true;
    if (deleted) {
        deleted2 = await receipt_model_1.receiptMain
            // eslint-disable-next-line @typescript-eslint/naming-convention
            .deleteMany({ invoiceRelated: { $in: ids } })
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
        await estimate_model_1.estimateMain.deleteOne({ invoiceRelated, companyId: queryId });
    }
    else if (from === 'invoice') {
        changedStage = 'estimate';
        await invoice_model_1.invoiceMain.deleteOne({ invoiceRelated, companyId: queryId });
    }
    else if (from === 'deliverynote') {
        await deliverynote_model_1.deliveryNoteMain.deleteOne({ invoiceRelated, companyId: queryId });
        changedStage = 'invoice';
    }
    else if (from === 'receipt') {
        await receipt_model_1.receiptMain.deleteOne({ invoiceRelated, companyId: queryId });
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
    }*/
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
    const related = await invoicerelated_model_1.invoiceRelatedMain.findOneAndUpdate({ _id: id, companyId: queryId });
    if (!related) {
        return false;
    }
    related.stage = stage;
    await related.save();
    return true;
};
//# sourceMappingURL=invoicerelated.js.map