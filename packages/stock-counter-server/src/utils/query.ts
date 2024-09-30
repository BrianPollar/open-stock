import { userAboutSelect, userLean } from '@open-stock/stock-auth-server';
import { fileMetaLean } from '@open-stock/stock-universal-server';
import { expenseLean } from '../models/expense.model';
import { itemLean } from '../models/item.model';
import { estimateLean } from '../models/printables/estimate.model';
import { receiptLean } from '../models/printables/receipt.model';
import { invoiceRelatedLean } from '../models/printables/related/invoicerelated.model';

/**
 * Populates the billing user on a given document.
 *
 * @returns A mongoose populate object.
 */
export const populateBillingUser = () => {
  return { path: 'billingUserId', model: userLean };
};

/**
 * Populates the payments on a given document.
 *
 * @returns A mongoose populate object.
 */
export const populatePayments = () => {
  return { path: 'payments', model: receiptLean };
};

/**
   * Populates the invoice related field on a given document with the
   * associated estimate, items, billing user, and payments.
   *
   * @param {boolean} [returnItemPhotos] Whether to return the photos of the
   * items in the invoice related field.
   * @returns A mongoose populate object.
   */
export const populateInvoiceRelated = (returnItemPhotos = false) => {
  if (returnItemPhotos) {
    return {
      path: 'invoiceRelated', model: invoiceRelatedLean,
      populate: [{
        path: 'billingUserId', model: userLean
      },
      {
        path: 'payments', model: receiptLean
      },
      {
        path: 'items.item', model: itemLean,
        populate: [{
          path: 'photos', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
        }]
      }]
    };
  } else {
    return {
      path: 'invoiceRelated', model: invoiceRelatedLean,
      populate: [{
        path: 'billingUserId', model: userLean
      },
      {
        path: 'payments', model: receiptLean
      }]
    };
  }
};

/**
 * Populates the expenses field on a given document with the associated expenses.
 *
 * @returns A mongoose populate object.
 */
export const populateExpenses = () => {
  return { path: 'expenses', model: expenseLean };
};

/**
 * Populates the estimates field on a given document with the associated estimates.
 *
 * @returns A mongoose populate object.
 */
export const populateEstimates = () => {
  return { path: 'estimates', model: estimateLean };
};

/**
 * Populates the default digital signature on a given document with the associated
 * digital signature.
 *
 * @returns A mongoose populate object.
 */
export const populateSignature = () => {
  return {
    path: 'generalSettings.defaultDigitalSignature',
    model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
  };
};

/**
 * Populates the default digital stamp on a given document with the associated
 * digital stamp.
 *
 * @returns A mongoose populate object.
 */
export const populateStamp = () => {
  return {
    path: 'generalSettings.defaultDigitalStamp',
    model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
  };
};


/**
   * Populates the user field on a given document with the associated user, including
   * the user's photos, profile picture, and profile cover picture.
   *
   * @returns A mongoose populate object.
   */
export const populateUser = () => {
  return { path: 'user', model: userLean,
    populate: [{
      path: 'photos', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
    }, {
      path: 'profilePic', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
    }, {
      path: 'profileCoverPic', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
    }] };
};

/**
   * Populates the items field on a given document with the associated items, including
   * the photos associated with each item.
   *
   * @returns A mongoose populate object.
   */
export const populateItems = () => {
  return {
    path: 'items', model: itemLean,
    populate: [{
      path: 'photos', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
    }
    ]
  };
};

/**
   * Populates the paymentRelated field on a given document with the associated items
   * and the user who made the payment.
   *
   * @returns A mongoose populate object.
   */
export const populatePaymentRelated = () => {
  return { path: 'paymentRelated', model: itemLean,
    populate: [{
      path: 'items', model: itemLean
    },
    {
      path: 'user', select: userAboutSelect, model: userLean
    }]
  };
};

