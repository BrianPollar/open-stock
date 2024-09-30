/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
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
   * Populate photos field of a user document.
   * @param {boolean} [urlOnly=false] - If true, only populate with the url of the fileMeta documents.
   * @returns {object} - Populate options for mongoose.
   */
export declare const populatePhotos: (urlOnly?: boolean) => {
    path: string;
    model: import("mongoose").Model<import("@open-stock/stock-universal").IfileMeta, {}, {}, {}, import("mongoose").Document<unknown, {}, import("@open-stock/stock-universal").IfileMeta> & import("@open-stock/stock-universal").IfileMeta & Required<{
        _id: string;
    }>, any>;
    transform: (doc: any) => {
        _id: any;
        url: any;
    };
} | {
    path: string;
    model: import("mongoose").Model<import("@open-stock/stock-universal").IfileMeta, {}, {}, {}, import("mongoose").Document<unknown, {}, import("@open-stock/stock-universal").IfileMeta> & import("@open-stock/stock-universal").IfileMeta & Required<{
        _id: string;
    }>, any>;
    transform?: undefined;
};
/**
   * Populate profilePic field of a user document.
   * @param {boolean} [urlOnly=false] - If true, only populate with the url of the fileMeta documents.
   * @returns {object} - Populate options for mongoose.
   */
export declare const populateProfilePic: (urlOnly?: boolean) => {
    path: string;
    model: import("mongoose").Model<import("@open-stock/stock-universal").IfileMeta, {}, {}, {}, import("mongoose").Document<unknown, {}, import("@open-stock/stock-universal").IfileMeta> & import("@open-stock/stock-universal").IfileMeta & Required<{
        _id: string;
    }>, any>;
    transform: (doc: any) => {
        _id: any;
        url: any;
    };
} | {
    path: string;
    model: import("mongoose").Model<import("@open-stock/stock-universal").IfileMeta, {}, {}, {}, import("mongoose").Document<unknown, {}, import("@open-stock/stock-universal").IfileMeta> & import("@open-stock/stock-universal").IfileMeta & Required<{
        _id: string;
    }>, any>;
    transform?: undefined;
};
/**
   * Populate profileCoverPic field of a user document.
   * @param {boolean} [urlOnly=false] - If true, only populate with the url of the fileMeta documents.
   * @returns {object} - Populate options for mongoose.
   */
export declare const populateProfileCoverPic: (urlOnly?: boolean) => {
    path: string;
    model: import("mongoose").Model<import("@open-stock/stock-universal").IfileMeta, {}, {}, {}, import("mongoose").Document<unknown, {}, import("@open-stock/stock-universal").IfileMeta> & import("@open-stock/stock-universal").IfileMeta & Required<{
        _id: string;
    }>, any>;
    transform: (doc: any) => {
        _id: any;
        url: any;
    };
} | {
    path: string;
    model: import("mongoose").Model<import("@open-stock/stock-universal").IfileMeta, {}, {}, {}, import("mongoose").Document<unknown, {}, import("@open-stock/stock-universal").IfileMeta> & import("@open-stock/stock-universal").IfileMeta & Required<{
        _id: string;
    }>, any>;
    transform?: undefined;
};
/**
   * Populate trackEdit field of a document.
   * @returns {object} - Populate options for mongoose.
   */
export declare const populateTrackEdit: () => {
    path: string;
    model: import("mongoose").Model<import("@open-stock/stock-universal-server").TtrackEdit, {}, {}, {}, import("mongoose").Document<unknown, {}, import("@open-stock/stock-universal-server").TtrackEdit> & import("mongoose").Document<any, any, any> & import("@open-stock/stock-universal").ItrackEdit & {
        _id: import("mongoose").Types.ObjectId;
    }, any>;
    populate: {
        path: string;
        model: import("mongoose").Model<import("../models/user.model").Tuser, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../models/user.model").Tuser> & import("mongoose").Document<any, any, any> & import("@open-stock/stock-universal").Iuser & import("../models/user.model").IschemaMethods & {
            _id: import("mongoose").Types.ObjectId;
        }, any>;
    }[];
};
/**
   * Populate trackView field of a document.
   * @returns {object} - Populate options for mongoose.
   */
export declare const populateTrackView: () => {
    path: string;
    model: import("mongoose").Model<import("@open-stock/stock-universal-server").TtrackView, {}, {}, {}, import("mongoose").Document<unknown, {}, import("@open-stock/stock-universal-server").TtrackView> & import("mongoose").Document<any, any, any> & import("@open-stock/stock-universal").ItrackView & {
        _id: import("mongoose").Types.ObjectId;
    }, any>;
    populate: {
        path: string;
        model: import("mongoose").Model<import("../models/user.model").Tuser, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../models/user.model").Tuser> & import("mongoose").Document<any, any, any> & import("@open-stock/stock-universal").Iuser & import("../models/user.model").IschemaMethods & {
            _id: import("mongoose").Types.ObjectId;
        }, any>;
    }[];
};
/**
   * Populate companyId field of a document.
   * @param {boolean} [returnActive=true] - If true, only return active companies.
   * @returns {object} - Populate options for mongoose.
   */
export declare const populateCompany: (returnActive?: boolean) => {
    path: string;
    model: import("mongoose").Model<import("../models/company.model").Tcompany, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../models/company.model").Tcompany> & import("mongoose").Document<any, any, any> & import("@open-stock/stock-universal").Icompany & {
        _id: import("mongoose").Types.ObjectId;
    }, any>;
    populate: {
        path: string;
        model: import("mongoose").Model<import("../models/user.model").Tuser, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../models/user.model").Tuser> & import("mongoose").Document<any, any, any> & import("@open-stock/stock-universal").Iuser & import("../models/user.model").IschemaMethods & {
            _id: import("mongoose").Types.ObjectId;
        }, any>;
        populate: {
            path: string;
            model: import("mongoose").Model<import("@open-stock/stock-universal").IfileMeta, {}, {}, {}, import("mongoose").Document<unknown, {}, import("@open-stock/stock-universal").IfileMeta> & import("@open-stock/stock-universal").IfileMeta & Required<{
                _id: string;
            }>, any>;
            transform: (doc: any) => {
                _id: any;
                url: any;
            };
        }[];
        transform: (doc: any) => {
            _id: any;
            email: any;
            phone: any;
            profilePic: any;
        };
    }[];
    transform: (doc: any) => {
        _id: any;
        displayName: any;
        owner: any;
    };
} | {
    path: string;
    model: import("mongoose").Model<import("../models/company.model").Tcompany, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../models/company.model").Tcompany> & import("mongoose").Document<any, any, any> & import("@open-stock/stock-universal").Icompany & {
        _id: import("mongoose").Types.ObjectId;
    }, any>;
    populate: {
        path: string;
        model: import("mongoose").Model<import("../models/user.model").Tuser, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../models/user.model").Tuser> & import("mongoose").Document<any, any, any> & import("@open-stock/stock-universal").Iuser & import("../models/user.model").IschemaMethods & {
            _id: import("mongoose").Types.ObjectId;
        }, any>;
        populate: {
            path: string;
            model: import("mongoose").Model<import("@open-stock/stock-universal").IfileMeta, {}, {}, {}, import("mongoose").Document<unknown, {}, import("@open-stock/stock-universal").IfileMeta> & import("@open-stock/stock-universal").IfileMeta & Required<{
                _id: string;
            }>, any>;
            transform: (doc: any) => {
                _id: any;
                url: any;
            };
        }[];
        transform: (doc: any) => {
            _id: any;
            email: any;
            phone: any;
            profilePic: any;
        };
    }[];
    transform?: undefined;
};
/**
   * Populates the user field on a given document with the associated user, including
   * the user's photos, profile picture, and profile cover picture.
   *
   * @returns A mongoose populate object.
   */
export declare const populateOwner: () => {
    path: string;
    model: import("mongoose").Model<import("../models/user.model").Tuser, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../models/user.model").Tuser> & import("mongoose").Document<any, any, any> & import("@open-stock/stock-universal").Iuser & import("../models/user.model").IschemaMethods & {
        _id: import("mongoose").Types.ObjectId;
    }, any>;
    populate: {
        path: string;
        model: import("mongoose").Model<import("@open-stock/stock-universal").IfileMeta, {}, {}, {}, import("mongoose").Document<unknown, {}, import("@open-stock/stock-universal").IfileMeta> & import("@open-stock/stock-universal").IfileMeta & Required<{
            _id: string;
        }>, any>;
        transform: (doc: any) => {
            _id: any;
            url: any;
        };
    }[];
};
