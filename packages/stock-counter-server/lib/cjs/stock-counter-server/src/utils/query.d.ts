/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose" />
/// <reference types="mongoose/types/inferschematype" />
/**
 * Populates the billing user on a given document.
 *
 * @returns A mongoose populate object.
 */
export declare const populateBillingUser: () => {
    path: string;
    model: import("mongoose").Model<import("@open-stock/stock-auth-server").Tuser, {}, {}, {}, import("mongoose").Document<unknown, {}, import("@open-stock/stock-auth-server").Tuser> & import("mongoose").Document<any, any, any> & import("@open-stock/stock-universal").Iuser & import("@open-stock/stock-auth-server").IschemaMethods & {
        _id: import("mongoose").Types.ObjectId;
    }, any>;
};
/**
 * Populates the payments on a given document.
 *
 * @returns A mongoose populate object.
 */
export declare const populatePayments: () => {
    path: string;
    model: import("mongoose").Model<import("../models/printables/receipt.model").Treceipt, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../models/printables/receipt.model").Treceipt> & import("mongoose").Document<any, any, any> & import("@open-stock/stock-universal").IinvoiceRelatedRef & {
        amountRcievd: number;
        paymentMode: string;
        type: import("@open-stock/stock-universal").TreceiptType;
        date: Date;
        amount: number;
    } & import("@open-stock/stock-universal-server").IcompanyIdAsObjectId & {
        _id: import("mongoose").Types.ObjectId;
    }, any>;
};
/**
   * Populates the invoice related field on a given document with the
   * associated estimate, items, billing user, and payments.
   *
   * @param {boolean} [returnItemPhotos] Whether to return the photos of the
   * items in the invoice related field.
   * @returns A mongoose populate object.
   */
export declare const populateInvoiceRelated: (returnItemPhotos?: boolean) => {
    path: string;
    model: import("mongoose").Model<import("../models/printables/related/invoicerelated.model").TinvoiceRelated, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../models/printables/related/invoicerelated.model").TinvoiceRelated> & import("mongoose").Document<any, any, any> & Omit<import("@open-stock/stock-universal").IinvoiceRelated, "billingUserId"> & import("@open-stock/stock-universal-server").IcompanyIdAsObjectId & {
        billingUserId: import("mongoose").Schema.Types.ObjectId;
    } & {
        _id: import("mongoose").Types.ObjectId;
    }, any>;
    populate: ({
        path: string;
        model: import("mongoose").Model<import("@open-stock/stock-auth-server").Tuser, {}, {}, {}, import("mongoose").Document<unknown, {}, import("@open-stock/stock-auth-server").Tuser> & import("mongoose").Document<any, any, any> & import("@open-stock/stock-universal").Iuser & import("@open-stock/stock-auth-server").IschemaMethods & {
            _id: import("mongoose").Types.ObjectId;
        }, any>;
        populate?: undefined;
    } | {
        path: string;
        model: import("mongoose").Model<import("../models/printables/receipt.model").Treceipt, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../models/printables/receipt.model").Treceipt> & import("mongoose").Document<any, any, any> & import("@open-stock/stock-universal").IinvoiceRelatedRef & {
            amountRcievd: number;
            paymentMode: string;
            type: import("@open-stock/stock-universal").TreceiptType;
            date: Date;
            amount: number;
        } & import("@open-stock/stock-universal-server").IcompanyIdAsObjectId & {
            _id: import("mongoose").Types.ObjectId;
        }, any>;
        populate?: undefined;
    } | {
        path: string;
        model: import("mongoose").Model<import("../models/item.model").Titem, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../models/item.model").Titem> & import("mongoose").Document<any, any, any> & import("@open-stock/stock-universal").Iitem & import("@open-stock/stock-universal-server").IcompanyIdAsObjectId & {
            model: string;
        } & {
            _id: import("mongoose").Types.ObjectId;
        }, any>;
        populate: {
            path: string;
            model: import("mongoose").Model<import("@open-stock/stock-universal-server").TfileMeta, {}, {}, {}, import("mongoose").Document<unknown, {}, import("@open-stock/stock-universal-server").TfileMeta> & import("mongoose").Document<any, any, any> & import("@open-stock/stock-universal").IfileMeta & {
                expireDocAfter: Date;
            } & {
                _id: import("mongoose").Types.ObjectId;
            }, any>;
            transform: (doc: any) => {
                _id: any;
                url: any;
            };
        }[];
    })[];
};
/**
 * Populates the expenses field on a given document with the associated expenses.
 *
 * @returns A mongoose populate object.
 */
export declare const populateExpenses: () => {
    path: string;
    model: import("mongoose").Model<import("../models/expense.model").Texpense, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../models/expense.model").Texpense> & import("mongoose").Document<any, any, any> & import("@open-stock/stock-universal").Iexpense & import("@open-stock/stock-universal-server").IcompanyIdAsObjectId & {
        _id: import("mongoose").Types.ObjectId;
    }, any>;
};
/**
 * Populates the estimates field on a given document with the associated estimates.
 *
 * @returns A mongoose populate object.
 */
export declare const populateEstimates: () => {
    path: string;
    model: import("mongoose").Model<import("../models/printables/estimate.model").Testimate, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../models/printables/estimate.model").Testimate> & import("mongoose").Document<any, any, any> & import("@open-stock/stock-universal").IinvoiceRelatedRef & import("@open-stock/stock-universal-server").IcompanyIdAsObjectId & {
        _id: import("mongoose").Types.ObjectId;
    }, any>;
};
/**
 * Populates the default digital signature on a given document with the associated
 * digital signature.
 *
 * @returns A mongoose populate object.
 */
export declare const populateSignature: () => {
    path: string;
    model: import("mongoose").Model<import("@open-stock/stock-universal-server").TfileMeta, {}, {}, {}, import("mongoose").Document<unknown, {}, import("@open-stock/stock-universal-server").TfileMeta> & import("mongoose").Document<any, any, any> & import("@open-stock/stock-universal").IfileMeta & {
        expireDocAfter: Date;
    } & {
        _id: import("mongoose").Types.ObjectId;
    }, any>;
    transform: (doc: any) => {
        _id: any;
        url: any;
    };
};
/**
 * Populates the default digital stamp on a given document with the associated
 * digital stamp.
 *
 * @returns A mongoose populate object.
 */
export declare const populateStamp: () => {
    path: string;
    model: import("mongoose").Model<import("@open-stock/stock-universal-server").TfileMeta, {}, {}, {}, import("mongoose").Document<unknown, {}, import("@open-stock/stock-universal-server").TfileMeta> & import("mongoose").Document<any, any, any> & import("@open-stock/stock-universal").IfileMeta & {
        expireDocAfter: Date;
    } & {
        _id: import("mongoose").Types.ObjectId;
    }, any>;
    transform: (doc: any) => {
        _id: any;
        url: any;
    };
};
/**
   * Populates the user field on a given document with the associated user, including
   * the user's photos, profile picture, and profile cover picture.
   *
   * @returns A mongoose populate object.
   */
export declare const populateUser: () => {
    path: string;
    model: import("mongoose").Model<import("@open-stock/stock-auth-server").Tuser, {}, {}, {}, import("mongoose").Document<unknown, {}, import("@open-stock/stock-auth-server").Tuser> & import("mongoose").Document<any, any, any> & import("@open-stock/stock-universal").Iuser & import("@open-stock/stock-auth-server").IschemaMethods & {
        _id: import("mongoose").Types.ObjectId;
    }, any>;
    populate: {
        path: string;
        model: import("mongoose").Model<import("@open-stock/stock-universal-server").TfileMeta, {}, {}, {}, import("mongoose").Document<unknown, {}, import("@open-stock/stock-universal-server").TfileMeta> & import("mongoose").Document<any, any, any> & import("@open-stock/stock-universal").IfileMeta & {
            expireDocAfter: Date;
        } & {
            _id: import("mongoose").Types.ObjectId;
        }, any>;
        transform: (doc: any) => {
            _id: any;
            url: any;
        };
    }[];
};
/**
   * Populates the items field on a given document with the associated items, including
   * the photos associated with each item.
   *
   * @returns A mongoose populate object.
   */
export declare const populateItems: () => {
    path: string;
    model: import("mongoose").Model<import("../models/item.model").Titem, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../models/item.model").Titem> & import("mongoose").Document<any, any, any> & import("@open-stock/stock-universal").Iitem & import("@open-stock/stock-universal-server").IcompanyIdAsObjectId & {
        model: string;
    } & {
        _id: import("mongoose").Types.ObjectId;
    }, any>;
    populate: {
        path: string;
        model: import("mongoose").Model<import("@open-stock/stock-universal-server").TfileMeta, {}, {}, {}, import("mongoose").Document<unknown, {}, import("@open-stock/stock-universal-server").TfileMeta> & import("mongoose").Document<any, any, any> & import("@open-stock/stock-universal").IfileMeta & {
            expireDocAfter: Date;
        } & {
            _id: import("mongoose").Types.ObjectId;
        }, any>;
        transform: (doc: any) => {
            _id: any;
            url: any;
        };
    }[];
};
/**
   * Populates the paymentRelated field on a given document with the associated items
   * and the user who made the payment.
   *
   * @returns A mongoose populate object.
   */
export declare const populatePaymentRelated: () => {
    path: string;
    model: import("mongoose").Model<import("../models/item.model").Titem, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../models/item.model").Titem> & import("mongoose").Document<any, any, any> & import("@open-stock/stock-universal").Iitem & import("@open-stock/stock-universal-server").IcompanyIdAsObjectId & {
        model: string;
    } & {
        _id: import("mongoose").Types.ObjectId;
    }, any>;
    populate: ({
        path: string;
        model: import("mongoose").Model<import("../models/item.model").Titem, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../models/item.model").Titem> & import("mongoose").Document<any, any, any> & import("@open-stock/stock-universal").Iitem & import("@open-stock/stock-universal-server").IcompanyIdAsObjectId & {
            model: string;
        } & {
            _id: import("mongoose").Types.ObjectId;
        }, any>;
        select?: undefined;
    } | {
        path: string;
        select: {
            fname: number;
            lname: number;
            companyName: number;
            extraCompanyDetails: number;
            startDate: number;
            age: number;
            gender: number;
            admin: number;
            profilepic: number;
            profilecoverpic: number;
            description: number;
            socialAuthFrameworks: number;
            updatedAt: number;
            createdAt: number;
            userType: number;
            photos: number;
            profilePic: number;
            profileCoverPic: number;
            urId: number;
            companyId: number;
            trackEdit: number;
            trackView: number;
            isDeleted: number;
            trackDeleted: number;
        };
        model: import("mongoose").Model<import("@open-stock/stock-auth-server").Tuser, {}, {}, {}, import("mongoose").Document<unknown, {}, import("@open-stock/stock-auth-server").Tuser> & import("mongoose").Document<any, any, any> & import("@open-stock/stock-universal").Iuser & import("@open-stock/stock-auth-server").IschemaMethods & {
            _id: import("mongoose").Types.ObjectId;
        }, any>;
    })[];
};
