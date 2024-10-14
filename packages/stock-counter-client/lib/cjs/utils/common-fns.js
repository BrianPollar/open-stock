"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyBlockDateSelect = exports.transformNoInvId = exports.openBoxFn = exports.deleteManyInvoicesFn = exports.toggleSelectionFn = exports.deleteInvoiceFn = exports.markInvStatusAsFn = exports.determineLikedFn = exports.unLikeFn = exports.likeFn = exports.makeInvoiceRelated = exports.makePaymentRelated = exports.makeDatabaseAutoAndUrId = exports.transformUrId = exports.transformInvoice = exports.transformEstimateId = exports.transformFaqToNameOrImage = void 0;
const stock_universal_1 = require("@open-stock/stock-universal");
const invoice_define_1 = require("../defines/invoice.define");
const receipt_define_1 = require("../defines/receipt.define");
/**
 * Transforms a Faq object into either an image source or a name.
 * @param faq The Faq object to transform.
 * @param type The type of transformation to perform: 'img' for image source, 'name' for name.
 * @returns The transformed string value.
 */
const transformFaqToNameOrImage = (faq, type) => {
    let response;
    const logger = new stock_universal_1.LoggerController();
    logger.debug('FaqPipe: transform:: - %faq, %type', faq, type);
    if (type === 'img') {
        let imgSrc;
        if (faq.userId?._id) {
            imgSrc = faq.userId.profilePic.url || 'assets/imgs/person.png';
        }
        else if (faq.userId === 'admin') {
            imgSrc = 'assets/imgs/admin.png';
        }
        else {
            imgSrc = 'assets/imgs/person.png';
        }
        response = imgSrc;
    }
    else {
        let name;
        if (faq.userId?._id) {
            name = faq.userId?.fname ? faq.userId.fname + ' ' + faq.userId.lname : 'Assailant';
        }
        else if (faq.userId === 'admin') {
            name = 'admin';
        }
        else {
            name = faq.posterName;
        }
        response = name;
    }
    logger.debug('FaqPipe: transform:: - response', response);
    return response;
};
exports.transformFaqToNameOrImage = transformFaqToNameOrImage;
/**
 * Transforms an estimate ID from a number to a string format.
 * @param _id - The estimate ID to transform.
 * @returns The transformed estimate ID.
 */
const transformEstimateId = (id) => {
    const logger = new stock_universal_1.LoggerController();
    logger.debug('EstimateIdPipe:transform:: - id: ', id);
    const len = id.toString().length;
    const start = '#EST-';
    switch (len) {
        case 4:
            return start + id;
        case 3:
            return start + '0' + id;
        case 2:
            return start + '00' + id;
        case 1:
            return start + '000' + id;
        default:
            return start + '0000' + id;
    }
};
exports.transformEstimateId = transformEstimateId;
/**
 * Transforms an invoice ID into a formatted string.
 * @param _id - The invoice ID to transform.
 * @returns The formatted invoice string.
 */
const transformInvoice = (id) => {
    const logger = new stock_universal_1.LoggerController();
    logger.debug('InvoiceIdPipe:transform:: - id: ', id);
    const len = id.toString().length;
    const start = '#INV-';
    switch (len) {
        case 4:
            return start + id;
        case 3:
            return start + '0' + id;
        case 2:
            return start + '00' + id;
        case 1:
            return start + '000' + id;
        default:
            return start + '0000' + id;
    }
};
exports.transformInvoice = transformInvoice;
/**
 * Transforms the given ID based on the specified criteria.
 *
 * @param _id - The ID to be transformed.
 * @param where - The criteria for the transformation.
 * @returns The transformed ID.
 */
const transformUrId = (id, where) => {
    const logger = new stock_universal_1.LoggerController();
    logger.debug('UrIdPipe:PipeTransform:: - id: %id, where: %where', id, where);
    const len = id.length;
    const start = '#' + where + '_';
    switch (len) {
        case 4:
            return start + id;
        case 3:
            return start + '0' + id;
        case 2:
            return start + '00' + id;
        case 1:
            return start + '000' + id;
        default:
            return start + id;
    }
};
exports.transformUrId = transformUrId;
const makeDatabaseAutoAndUrId = (data) => {
    return {
        _id: data._id,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        urId: data.urId
    };
};
exports.makeDatabaseAutoAndUrId = makeDatabaseAutoAndUrId;
/**
 * Creates a payment-related object based on the provided data.
 * @param data - The data object containing order or payment information.
 * @returns The payment-related object.
 */
const makePaymentRelated = (data) => {
    return {
        urId: data.urId,
        paymentRelated: data.paymentRelated,
        // creationType: data.creationType,
        orderDate: data.orderDate,
        paymentDate: data.paymentDate,
        billingAddress: data.billingAddress,
        shippingAddress: data.shippingAddress,
        // tax: data.tax,
        // currency: data.currency,
        isBurgain: data.isBurgain,
        shipping: data.shipping,
        manuallyAdded: data.manuallyAdded,
        paymentMethod: data.paymentMethod,
        // status: data.status
        ...(0, exports.makeInvoiceRelated)(data)
    };
};
exports.makePaymentRelated = makePaymentRelated;
/**
 * Creates an invoice-related object based on the provided data.
 * @param data - The data object containing information about the invoice-related entity.
 * @returns An `IinvoiceRelated` object.
 */
const makeInvoiceRelated = (data) => {
    const related = {
        trackEdit: data.trackEdit,
        trackView: data.trackView,
        invoiceRelated: data.invoiceRelated,
        creationType: data.creationType,
        estimateId: data.estimateId,
        invoiceId: data.invoiceId,
        billingUser: data.billingUser,
        billingUserId: data.billingUserId,
        billingUserPhoto: data.billingUserPhoto,
        items: data.items,
        fromDate: data.fromDate,
        toDate: data.toDate,
        status: data.status,
        stage: data.stage,
        cost: data.cost,
        paymentMade: data.paymentMade,
        tax: data.tax,
        balanceDue: data.balanceDue,
        subTotal: data.subTotal,
        total: data.total,
        currency: data.currency,
        ...(0, exports.makeDatabaseAutoAndUrId)(data)
    };
    return (data instanceof receipt_define_1.Receipt) ? related : { ...related, payments: data.payments };
};
exports.makeInvoiceRelated = makeInvoiceRelated;
/**
 * Function to like an item.
 .
 * @param currentUser - The current user.
 * @param item - The item to be liked.
 * @returns A promise that resolves to an object indicating the success of the operation.
 */
const likeFn = (currentUser, item) => {
    if (!currentUser) {
        return { success: false };
    }
    return item
        .like(currentUser._id);
};
exports.likeFn = likeFn;
/**
 * Unlike the item for the current user.
 .
 * @param currentUser - The current user.
 * @param item - The item to unlike.
 * @returns A promise that resolves to an object indicating the success of the unlike operation.
 */
const unLikeFn = (currentUser, item) => {
    if (!currentUser) {
        return { success: false };
    }
    return item
        .unLike(currentUser._id);
};
exports.unLikeFn = unLikeFn;
/**
 * Determines whether the given item is liked by the current user.
 *
 * @param item - The item to check.
 * @param currentUser - The current user.
 * @returns A boolean value indicating whether the item is liked by the current user.
 */
const determineLikedFn = (item, currentUser) => {
    if (currentUser && item.likes &&
        item.likes.includes(currentUser._id)) {
        return true;
    }
    else {
        return false;
    }
};
exports.determineLikedFn = determineLikedFn;
/**
 * Marks the invoice status as a given value.
 .
 * @param invoice - The invoice object.
 * @param val - The value to set the status to.
 * @returns A promise that resolves when the update is complete.
 */
const markInvStatusAsFn = async (invoice, val) => {
    const vals = {
        _id: invoice._id,
        status: val
    };
    const invoiceRelated = (0, exports.makeInvoiceRelated)(invoice);
    invoiceRelated.status = val;
    await invoice
        .update({ invoice: vals, invoiceRelated });
};
exports.markInvStatusAsFn = markInvStatusAsFn;
/**
 * Deletes an invoice from the list of invoices.
 .
 * @param _id - The ID of the invoice to delete.
 * @param invoices - The array of invoices.
 */
const deleteInvoiceFn = async (_id) => {
    const val = {
        _ids: [_id]
    };
    await invoice_define_1.Invoice
        .removeMany(val);
};
exports.deleteInvoiceFn = deleteInvoiceFn;
/**
 * Toggles the selection of an item in an array of selections.
 * If the item is already selected, it will be deselected.
 * If the item is not selected, it will be selected.
 * @param _id - The ID of the item to toggle.
 * @param selections - The array of selections.
 */
const toggleSelectionFn = (id, selections) => {
    if (selections.includes(id)) {
        const index = selections.findIndex(val => val === id);
        selections.splice(index, 1);
    }
    else {
        selections.push(id);
    }
};
exports.toggleSelectionFn = toggleSelectionFn;
/**
 * Deletes multiple invoices based on the provided selections.
 .
 * @param invoices - An array of invoices.
 * @param selections - An array of invoice IDs to be deleted.
 * @returns A promise that resolves to an object indicating the success of the deletion.
 */
const deleteManyInvoicesFn = (invoices, selections) => {
    const val = {
        _ids: invoices
            .filter(val => selections.includes(val._id))
            .map(value => {
            return value._id;
        })
    };
    return invoice_define_1.Invoice
        .removeMany(val);
};
exports.deleteManyInvoicesFn = deleteManyInvoicesFn;
/**
 * Opens or closes a box based on the provided value.
 * @param val - The value to open or close the box with.
 * @param selectBoxOpen - An array representing the open boxes.
 */
const openBoxFn = (val, selectBoxOpen) => {
    if (selectBoxOpen[0] !== val) {
        selectBoxOpen[0] = val;
    }
    else {
        selectBoxOpen = [];
    }
};
exports.openBoxFn = openBoxFn;
/**
 * Transforms a number into a string with a specified suffix.
 * @param val - The number to be transformed.
 * @param suffix - The suffix to be added to the transformed string.
 * @returns The transformed string with the suffix.
 */
const transformNoInvId = (val, suffix) => {
    const stringified = val.toString();
    let outStr;
    switch (stringified.length) {
        case 1:
            outStr = '000' + stringified;
            break;
        case 2:
            outStr = '00' + stringified;
            break;
        case 3:
            outStr = '0' + stringified;
            break;
        default:
            outStr = stringified;
            break;
    }
    return suffix + outStr;
};
exports.transformNoInvId = transformNoInvId;
/**
 * Applies a block date select filter to the given data array based on the specified condition.
 * @param data The array of data to filter.
 * @param where The condition to apply the filter.
 * @returns The filtered array of data.
 */
const applyBlockDateSelect = (data, where) => {
    let date = new Date();
    switch (where) {
        case 'today':
            date = new Date();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return data
                // eslint-disable-next-line max-len
                .filter(val => new Date(val.createdAt).getFullYear() === date.getFullYear() && new Date(val.createdAt).getMonth() === date.getMonth() && new Date(val.createdAt).getDate() === date.getDate());
        case 'yesterday':
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return data
                // eslint-disable-next-line max-len
                .filter(val => new Date(val.createdAt).getFullYear() === date.getFullYear() && new Date(val.createdAt).getMonth() === date.getMonth() && new Date(val.createdAt).getDate() - 1 === date.getDate() - 1);
        case 'last7days':
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return data
                // eslint-disable-next-line max-len
                .filter(val => new Date(val.createdAt).getFullYear() === date.getFullYear() && new Date(val.createdAt).getMonth() === date.getMonth() && new Date(val.createdAt).getDate() >= date.getDate() - 7);
        case 'thisMonth':
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return data
                // eslint-disable-next-line max-len
                .filter(val => new Date(val.createdAt).getFullYear() === date.getFullYear() && new Date(val.createdAt).getMonth() === date.getMonth());
        case 'lastMonth':
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return data
                // eslint-disable-next-line max-len
                .filter(val => new Date(val.createdAt).getFullYear() === date.getFullYear() && new Date(val.createdAt).getMonth() - 1 === date.getMonth() - 1);
    }
};
exports.applyBlockDateSelect = applyBlockDateSelect;
//# sourceMappingURL=common-fns.js.map