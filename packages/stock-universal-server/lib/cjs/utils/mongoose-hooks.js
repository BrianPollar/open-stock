"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preSavePassword = exports.preUpdateDocExpire = void 0;
const tslib_1 = require("tslib");
const bcrypt_1 = tslib_1.__importDefault(require("bcrypt"));
/**
   * A pre middleware hook that sets expireDocAfter to null if the doc is not deleted, and sets it to the current date if the doc is deleted.
   * @param {Object} queryThis - The document being updated.
   * @param {Function} next - The next middleware function.
   */
const preUpdateDocExpire = (queryThis, next) => {
    const isDeleted = queryThis.get('isDeleted');
    if (!isDeleted) {
        queryThis.set({
            expireDocAfter: null
        });
    }
    else {
        const now = new Date();
        queryThis.set({
            expireDocAfter: now
        });
    }
    next();
};
exports.preUpdateDocExpire = preUpdateDocExpire;
/**
   * A function that takes a password string and returns a promise that resolves to an object with a boolean success key and an optional hash key.
   * The hash key is set to the hashed password if the password is valid, otherwise the success key is set to false and the err key is set to the error.
   * @param {string} password - The password to hash.
   * @returns {Promise<Isuccess & { hash?: string; err? }>} - A promise that resolves to an object with a boolean success key and an optional hash key.
   */
const preSavePassword = (password) => {
    return new Promise((resolve, reject) => {
        // generate a salt
        bcrypt_1.default.genSalt(10, function (err, salt) {
            if (err) {
                resolve({ success: false, err });
                return;
            }
            // hash the password using our new salt
            bcrypt_1.default.hash(password, salt, function (err, hash) {
                if (err) {
                    resolve({ success: false, err });
                    return;
                }
                // override the cleartext password with the hashed one
                resolve({ success: true, hash });
                return;
            });
        });
    });
};
exports.preSavePassword = preSavePassword;
/*
export const preSaveAddTrack = async(docThis, next?) => {
  const collectionName = docThis.constructor.collection.collectionName;
  const parent = docThis._id.toString();
  const trackEdit: ItrackEdit = {
    parent,
    createdBy: user.userId,
    users: [],
    collectionName
  };

  const trackView: ItrackView = {
    parent,
    createdBy: user.userId,
    users: [],
    collectionName
  };


  const trackDeleted: ItrackDeleted = {
    parent,
    collectionName;
  };

  if (next) {
    next();
  } else {
    return;
  }
};
*/
//# sourceMappingURL=mongoose-hooks.js.map