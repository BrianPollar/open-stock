"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserModel = exports.userAboutSelect = exports.userAuthSelect = exports.userLean = exports.user = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-var-requires */
const stock_notif_server_1 = require("@open-stock/stock-notif-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const bcrypt_1 = tslib_1.__importDefault(require("bcrypt"));
const mongoose_1 = require("mongoose");
const database_1 = require("../utils/database");
// Create authenticated Authy and Twilio API clients
// const authy = require('authy')(config.authyKey);
// const twilioClient = require('twilio')(config.accountSid, config.authToken);
const uniqueValidator = require('mongoose-unique-validator');
/**
 * User schema definition.
 * @typedef {Object} Tuser
 * @property {string} urId - User ID.
 * @property {string} fname - First name.
 * @property {string} lname - Last name.
 * @property {string} [companyName] - Company name.
 * @property {string} [salutation] - Salutation.
 * @property {string} [extraCompanyDetails] - Extra company details.
 * @property {string} [userDispNameFormat='firstLast'] - User display name format.
 * @property {Array} [address] - User address.
 * @property {Array} [billing] - User billing information.
 * @property {Array} [greenIps] - Green IPs.
 * @property {Array} [redIps] - Red IPs.
 * @property {Array} [unverifiedIps] - Unverified IPs.
 * @property {string} [photo] - User photo.
 * @property {string} [age] - User age.
 * @property {string} [gender] - User gender.
 * @property {string} [admin] - User admin.
 * @property {Object} [permissions] - User permissions.
 * @property {string} [email] - User email.
 * @property {number} [phone] - User phone number.
 * @property {string} [expireAt] - User expiration date.
 * @property {boolean} [verified=false] - User verification status.
 * // @property {string} [authyId] - Authy ID.
 * @property {string} [password] - User password.
 * @property {boolean} [fromsocial] - User social media status.
 * @property {string} [socialframework] - User social media framework.
 * @property {string} [socialId] - User social media ID.
 * @property {number} [countryCode=256] - User country code.
 * @property {number} [amountDue=0] - User amount due.
 * @property {boolean} [manuallyAdded=false] - User manually added status.
 * @property {Date} createdAt - User creation date.
 * @property {Date} updatedAt - User update date.
 */
const userSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withUrIdAndCompanySchemaObj,
    fname: { type: String, index: true },
    lname: { type: String, index: true },
    companyName: { type: String, index: true },
    salutation: { type: String },
    extraCompanyDetails: { type: String },
    userDispNameFormat: { type: String, default: 'firstLast' },
    address: [],
    billing: [],
    profilePic: { type: String },
    profileCoverPic: { type: String },
    photos: [{ type: String }],
    age: { type: String },
    gender: { type: String },
    admin: { type: Boolean, default: false },
    permissions: {},
    email: { type: String },
    phone: { type: Number },
    expireAt: { type: String },
    verified: { type: Boolean, default: false },
    // authyId: { type: String },
    password: { type: String },
    fromsocial: { type: Boolean },
    socialframework: { type: String },
    socialId: { type: String },
    countryCode: { type: String, default: '+256' },
    amountDue: { type: Number, default: 0 },
    manuallyAdded: { type: Boolean, default: false },
    userType: { type: String, default: 'eUser' }
}, { timestamps: true, collection: 'users' });
userSchema.index({ expireAt: 1 }, { expireAfterSeconds: 2628003 });
// Apply the uniqueValidator plugin to userSchema.
userSchema.plugin(uniqueValidator);
// dealing with hasing password
userSchema.pre('save', async function (next) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const user = this;
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) {
        return next();
    }
    const { hash, err } = await (0, stock_universal_server_1.preSavePassword)(this.get('password'));
    if (err) {
        return next(err);
    }
    user['password'] = hash;
    /*
    // generate a salt
    bcrypt.genSalt(10, function(err, salt) {
      if (err) {
        return next(err);
      }
  
      // hash the password using our new salt
      bcrypt.hash(user['password'], salt, function(err, hash) {
        if (err) {
          return next(err);
        }
        // override the cleartext password with the hashed one
        user['password'] = hash;
        next();
      });
    }); */
});
userSchema.pre('updateOne', async function (next) {
    if (this.get('password')) {
        const { hash, err } = await (0, stock_universal_server_1.preSavePassword)(this.get('password'));
        if (err) {
            return next(err);
        }
        this.set({ password: hash });
    }
    (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
userSchema.pre('updateMany', async function (next) {
    if (this.get('password')) {
        const { hash, err } = await (0, stock_universal_server_1.preSavePassword)(this.get('password'));
        if (err) {
            return next(err);
        }
        this.set({ password: hash });
    }
    (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
userSchema.methods['comparePassword'] = function (candidatePassword, cb) {
    bcrypt_1.default.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};
// Send a verification token to the user (two step auth for login)
userSchema.methods['sendAuthyToken'] = function (cb) {
    /* if (!this.authyId) {
      setUpUser(
        this.phone,
        this.countryCode
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ).then((res: any) => {
        this.authyId = res.user.id;
        this.save((err1, doc) => {
          if (err1 || !doc) {
            return cb.call(this, err1);
          }
          // this = doc;
          sendToken(this.authyId).then((resp) => cb.call(this, null, resp)).catch(err => cb.call(this, err));
        });
      }).catch(err => cb.call(this, err));
    } else { */
    // Otherwise send token to a known user
    (0, stock_notif_server_1.sendToken)(this.phone, this.countryCode, 'Your Verification Token Is').then((resp) => cb.call(this, null, resp)).catch(err => cb.call(this, err));
    // }
};
// Test a 2FA token
userSchema.methods['verifyAuthyToken'] = function (otp, cb) {
    (0, stock_notif_server_1.verifyAuthyToken)(this.phone, this.countryCode, otp).then((resp) => {
        cb.call(this, null, resp);
    }).catch(err => {
        cb.call(this, err);
    });
};
// Send a text message via twilio to this user
userSchema.methods['sendMessage'] = function (message, cb) {
    // const self = this;
    (0, stock_notif_server_1.sendSms)(this.phone, this.countryCode, message).then(() => {
        cb.call(this, null);
    }).catch(err => {
        cb.call(this, err);
    });
};
userSchema.methods['toAuthJSON'] = function () {
    return {
        urId: this.urId,
        name: this.name,
        age: this.age,
        admin: this.admin,
        email: this.email,
        phone: this.phone,
        permissions: this.permissions,
        gender: this.gender,
        profilethumbnail: this.profilepic,
        profilePic: this.profilePic,
        profileCoverPic: this.profileCoverPic
    };
};
userSchema.methods['toProfileJSONFor'] = function () {
    return {
        urId: this.urId,
        lname: this.lname,
        fname: this.fname,
        companyName: this.companyName,
        age: this.age,
        admin: this.admin,
        // email: this.email,
        phone: this.phone,
        permissions: this.permissions,
        gender: this.gender,
        // phone: this.phone,
        profilepic: this.profilepic,
        createdAt: this.createdAt,
        profilePic: this.profilePic,
        profileCoverPic: this.profileCoverPic
    };
};
userSchema.methods['toJSONFor'] = function () {
    return {
        id: this.id,
        name: this.name,
        profilepic: this.profilepic,
        photos: this.photos,
        profilePic: this.profilePic,
        profileCoverPic: this.profileCoverPic
    };
};
const userAuthselect = {
    ...stock_universal_server_1.withUrIdAndCompanySelectObj,
    fname: 1,
    lname: 1,
    companyName: 1,
    extraCompanyDetails: 1,
    startDate: 1,
    address: 1,
    billing: 1,
    profilePic: 1,
    profileCoverPic: 1,
    age: 1,
    gender: 1,
    admin: 1,
    permissions: 1,
    email: 1,
    phone: 1,
    expireAt: 1,
    verified: 1,
    authyId: 1,
    password: 1,
    fromsocial: 1,
    socialframework: 1,
    socialId: 1,
    countryCode: 1,
    amountDue: 1,
    manuallyAdded: 1,
    updatedAt: 1,
    createdAt: 1,
    userType: 1,
    photos: 1
};
const useraboutSelect = {
    ...stock_universal_server_1.withUrIdAndCompanySelectObj,
    fname: 1,
    lname: 1,
    companyName: 1,
    extraCompanyDetails: 1,
    startDate: 1,
    age: 1,
    gender: 1,
    admin: 1,
    profilepic: 1,
    profilecoverpic: 1,
    description: 1,
    fromsocial: 1,
    socialframework: 1,
    socialId: 1,
    updatedAt: 1,
    createdAt: 1,
    userType: 1,
    photos: 1,
    profilePic: 1,
    profileCoverPic: 1
};
/**
 * Represents the user authentication select function.
 */
exports.userAuthSelect = userAuthselect;
/**
 * Represents the userAboutSelect constant.
 */
exports.userAboutSelect = useraboutSelect;
/**
 * Creates a user model with the specified database URL.
 * @param dbUrl The URL of the database.
 * @param main Indicates whether to create the main user model.
 * @param lean Indicates whether to create the lean user model.
 */
const createUserModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    (0, stock_universal_server_1.createExpireDocIndex)(userSchema);
    if (!database_1.isAuthDbConnected) {
        await (0, database_1.connectAuthDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.user = database_1.mainConnection.model('User', userSchema);
    }
    if (lean) {
        exports.userLean = database_1.mainConnectionLean.model('User', userSchema);
    }
};
exports.createUserModel = createUserModel;
//# sourceMappingURL=user.model.js.map