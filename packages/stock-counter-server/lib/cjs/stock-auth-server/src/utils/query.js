"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.populateOwner = exports.populateCompany = exports.populateTrackView = exports.populateTrackEdit = exports.populateProfileCoverPic = exports.populateProfilePic = exports.populatePhotos = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const company_model_1 = require("../models/company.model");
const user_model_1 = require("../models/user.model");
/**
   * Populate photos field of a user document.
   * @param {boolean} [urlOnly=false] - If true, only populate with the url of the fileMeta documents.
   * @returns {object} - Populate options for mongoose.
   */
const populatePhotos = (urlOnly = false) => {
    if (urlOnly) {
        return { path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) };
    }
    else {
        return { path: 'photos', model: stock_universal_server_1.fileMetaLean };
    }
};
exports.populatePhotos = populatePhotos;
/**
   * Populate profilePic field of a user document.
   * @param {boolean} [urlOnly=false] - If true, only populate with the url of the fileMeta documents.
   * @returns {object} - Populate options for mongoose.
   */
const populateProfilePic = (urlOnly = false) => {
    if (urlOnly) {
        return { path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) };
    }
    else {
        return { path: 'profilePic', model: stock_universal_server_1.fileMetaLean };
    }
};
exports.populateProfilePic = populateProfilePic;
/**
   * Populate profileCoverPic field of a user document.
   * @param {boolean} [urlOnly=false] - If true, only populate with the url of the fileMeta documents.
   * @returns {object} - Populate options for mongoose.
   */
const populateProfileCoverPic = (urlOnly = false) => {
    if (urlOnly) {
        return { path: 'profileCoverPic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) };
    }
    else {
        return { path: 'profileCoverPic', model: stock_universal_server_1.fileMetaLean };
    }
};
exports.populateProfileCoverPic = populateProfileCoverPic;
/**
   * Populate trackEdit field of a document.
   * @returns {object} - Populate options for mongoose.
   */
const populateTrackEdit = () => {
    return { path: 'trackEdit', model: stock_universal_server_1.trackEditLean,
        populate: [{
                path: 'createdBy', model: user_model_1.userLean
            },
            {
                path: 'users', model: user_model_1.userLean
            },
            {
                path: 'deletedBy', model: user_model_1.userLean
            }
        ]
    };
};
exports.populateTrackEdit = populateTrackEdit;
/**
   * Populate trackView field of a document.
   * @returns {object} - Populate options for mongoose.
   */
const populateTrackView = () => {
    return { path: 'trackView', model: stock_universal_server_1.trackViewLean,
        populate: [{
                path: 'users', model: user_model_1.userLean
            }]
    };
};
exports.populateTrackView = populateTrackView;
/**
   * Populate companyId field of a document.
   * @param {boolean} [returnActive=true] - If true, only return active companies.
   * @returns {object} - Populate options for mongoose.
   */
const populateCompany = (returnActive = true) => {
    if (returnActive) {
        return { path: 'companyId', model: company_model_1.companyLean,
            populate: [{
                    path: 'owner', model: user_model_1.userLean,
                    populate: [{
                            path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                        }],
                    transform: (doc) => ({ _id: doc._id, email: doc.email, phone: doc.phone, profilePic: doc.profilePic })
                }],
            transform: (doc) => {
                if (doc.blocked) {
                    return null;
                }
                else {
                    return { _id: doc._id, displayName: doc.displayName, owner: doc.owner };
                }
            }
        };
    }
    else {
        return { path: 'companyId', model: company_model_1.companyLean,
            populate: [{
                    path: 'owner', model: user_model_1.userLean,
                    populate: [{
                            path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                        }],
                    transform: (doc) => ({ _id: doc._id, email: doc.email, phone: doc.phone, profilePic: doc.profilePic })
                }
            ]
        };
    }
};
exports.populateCompany = populateCompany;
/**
   * Populates the user field on a given document with the associated user, including
   * the user's photos, profile picture, and profile cover picture.
   *
   * @returns A mongoose populate object.
   */
const populateOwner = () => {
    return { path: 'owner', model: user_model_1.userLean,
        populate: [{
                path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
            }, {
                path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
            }, {
                path: 'profileCoverPic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
            }] };
};
exports.populateOwner = populateOwner;
//# sourceMappingURL=query.js.map