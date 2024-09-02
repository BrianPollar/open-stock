"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.populatePaymentRelated = exports.populateItems = exports.populateUser = exports.populateStamp = exports.populateSignature = exports.populateEstimates = exports.populateExpenses = exports.populateInvoiceRelated = exports.populatePayments = exports.populateBillingUser = void 0;
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const expense_model_1 = require("../models/expense.model");
const item_model_1 = require("../models/item.model");
const estimate_model_1 = require("../models/printables/estimate.model");
const receipt_model_1 = require("../models/printables/receipt.model");
const invoicerelated_model_1 = require("../models/printables/related/invoicerelated.model");
/**
 * Populates the billing user on a given document.
 *
 * @returns A mongoose populate object.
 */
const populateBillingUser = () => {
    return { path: 'billingUserId', model: stock_auth_server_1.userLean };
};
exports.populateBillingUser = populateBillingUser;
/**
 * Populates the payments on a given document.
 *
 * @returns A mongoose populate object.
 */
const populatePayments = () => {
    return { path: 'payments', model: receipt_model_1.receiptLean };
};
exports.populatePayments = populatePayments;
/**
   * Populates the invoice related field on a given document with the
   * associated estimate, items, billing user, and payments.
   *
   * @param {boolean} [returnItemPhotos] Whether to return the photos of the
   * items in the invoice related field.
   * @returns A mongoose populate object.
   */
const populateInvoiceRelated = (returnItemPhotos = false) => {
    if (returnItemPhotos) {
        return {
            path: 'invoiceRelated', model: invoicerelated_model_1.invoiceRelatedLean,
            populate: [{
                    path: 'billingUserId', model: stock_auth_server_1.userLean
                },
                {
                    path: 'payments', model: receipt_model_1.receiptLean
                },
                {
                    path: 'items.item', model: item_model_1.itemLean,
                    populate: [{
                            path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                        }]
                }]
        };
    }
    else {
        return {
            path: 'invoiceRelated', model: invoicerelated_model_1.invoiceRelatedLean,
            populate: [{
                    path: 'billingUserId', model: stock_auth_server_1.userLean
                },
                {
                    path: 'payments', model: receipt_model_1.receiptLean
                }]
        };
    }
};
exports.populateInvoiceRelated = populateInvoiceRelated;
/**
 * Populates the expenses field on a given document with the associated expenses.
 *
 * @returns A mongoose populate object.
 */
const populateExpenses = () => {
    return { path: 'expenses', model: expense_model_1.expenseLean };
};
exports.populateExpenses = populateExpenses;
/**
 * Populates the estimates field on a given document with the associated estimates.
 *
 * @returns A mongoose populate object.
 */
const populateEstimates = () => {
    return { path: 'estimates', model: estimate_model_1.estimateLean };
};
exports.populateEstimates = populateEstimates;
/**
 * Populates the default digital signature on a given document with the associated
 * digital signature.
 *
 * @returns A mongoose populate object.
 */
const populateSignature = () => {
    return { path: 'generalSettings.defaultDigitalSignature', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) };
};
exports.populateSignature = populateSignature;
/**
 * Populates the default digital stamp on a given document with the associated
 * digital stamp.
 *
 * @returns A mongoose populate object.
 */
const populateStamp = () => {
    return { path: 'generalSettings.defaultDigitalStamp', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) };
};
exports.populateStamp = populateStamp;
/**
   * Populates the user field on a given document with the associated user, including
   * the user's photos, profile picture, and profile cover picture.
   *
   * @returns A mongoose populate object.
   */
const populateUser = () => {
    return { path: 'user', model: stock_auth_server_1.userLean,
        populate: [{
                path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
            }, {
                path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
            }, {
                path: 'profileCoverPic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
            }] };
};
exports.populateUser = populateUser;
/**
   * Populates the items field on a given document with the associated items, including
   * the photos associated with each item.
   *
   * @returns A mongoose populate object.
   */
const populateItems = () => {
    return {
        path: 'items', model: item_model_1.itemLean,
        populate: [{
                path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
            }
        ]
    };
};
exports.populateItems = populateItems;
/**
   * Populates the paymentRelated field on a given document with the associated items
   * and the user who made the payment.
   *
   * @returns A mongoose populate object.
   */
const populatePaymentRelated = () => {
    return { path: 'paymentRelated', model: item_model_1.itemLean,
        populate: [{
                path: 'items', model: item_model_1.itemLean
            },
            {
                path: 'user', select: stock_auth_server_1.userAboutSelect, model: stock_auth_server_1.userLean
            }]
    };
};
exports.populatePaymentRelated = populatePaymentRelated;
//# sourceMappingURL=query.js.map