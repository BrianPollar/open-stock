import { fileMetaLean, trackEditLean, trackViewLean } from '@open-stock/stock-universal-server';
import { companyLean } from '../models/company.model';
import { userLean } from '../models/user.model';
/**
   * Populate photos field of a user document.
   * @param {boolean} [urlOnly=false] - If true, only populate with the url of the fileMeta documents.
   * @returns {object} - Populate options for mongoose.
   */
export const populatePhotos = (urlOnly = false) => {
    if (urlOnly) {
        return { path: 'photos', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) };
    }
    else {
        return { path: 'photos', model: fileMetaLean };
    }
};
/**
   * Populate profilePic field of a user document.
   * @param {boolean} [urlOnly=false] - If true, only populate with the url of the fileMeta documents.
   * @returns {object} - Populate options for mongoose.
   */
export const populateProfilePic = (urlOnly = false) => {
    if (urlOnly) {
        return { path: 'profilePic', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) };
    }
    else {
        return { path: 'profilePic', model: fileMetaLean };
    }
};
/**
   * Populate profileCoverPic field of a user document.
   * @param {boolean} [urlOnly=false] - If true, only populate with the url of the fileMeta documents.
   * @returns {object} - Populate options for mongoose.
   */
export const populateProfileCoverPic = (urlOnly = false) => {
    if (urlOnly) {
        return { path: 'profileCoverPic', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) };
    }
    else {
        return { path: 'profileCoverPic', model: fileMetaLean };
    }
};
/**
   * Populate trackEdit field of a document.
   * @returns {object} - Populate options for mongoose.
   */
export const populateTrackEdit = () => {
    return { path: 'trackEdit', model: trackEditLean,
        populate: [{
                path: 'createdBy', model: userLean
            },
            {
                path: 'users', model: userLean
            },
            {
                path: 'deletedBy', model: userLean
            }
        ]
    };
};
/**
   * Populate trackView field of a document.
   * @returns {object} - Populate options for mongoose.
   */
export const populateTrackView = () => {
    return { path: 'trackView', model: trackViewLean,
        populate: [{
                path: 'users', model: userLean
            }]
    };
};
/**
   * Populate companyId field of a document.
   * @param {boolean} [returnActive=true] - If true, only return active companies.
   * @returns {object} - Populate options for mongoose.
   */
export const populateCompany = (returnActive = true) => {
    if (returnActive) {
        return { path: 'companyId', model: companyLean,
            populate: [{
                    path: 'owner', model: userLean,
                    populate: [{
                            path: 'profilePic', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
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
        return { path: 'companyId', model: companyLean,
            populate: [{
                    path: 'owner', model: userLean,
                    populate: [{
                            path: 'profilePic', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                        }],
                    transform: (doc) => ({ _id: doc._id, email: doc.email, phone: doc.phone, profilePic: doc.profilePic })
                }
            ]
        };
    }
};
/**
   * Populates the user field on a given document with the associated user, including
   * the user's photos, profile picture, and profile cover picture.
   *
   * @returns A mongoose populate object.
   */
export const populateOwner = () => {
    return { path: 'owner', model: userLean,
        populate: [{
                path: 'photos', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
            }, {
                path: 'profilePic', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
            }, {
                path: 'profileCoverPic', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
            }] };
};
//# sourceMappingURL=query.js.map