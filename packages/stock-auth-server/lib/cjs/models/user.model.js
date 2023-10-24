"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserModel = exports.userAboutSelect = exports.userAuthSelect = exports.userLean = exports.user = exports.userSchema = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-var-requires */
const stock_notif_server_1 = require("@open-stock/stock-notif-server");
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../controllers/database.controller");
const bcrypt_1 = tslib_1.__importDefault(require("bcrypt"));
// Create authenticated Authy and Twilio API clients
// const authy = require('authy')(config.authyKey);
// const twilioClient = require('twilio')(config.accountSid, config.authToken);
const uniqueValidator = require('mongoose-unique-validator');
exports.userSchema = new mongoose_1.Schema({
    urId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
    fname: { type: String, required: [true, 'cannot be empty.'], index: true },
    lname: { type: String, required: [true, 'cannot be empty.'], index: true },
    companyName: { type: String, index: true },
    salutation: { type: String },
    extraCompanyDetails: { type: String },
    userDispNameFormat: { type: String, default: 'firstLast' },
    address: [],
    billing: [],
    greenIps: [],
    redIps: [],
    unverifiedIps: [],
    uid: { type: String },
    did: { type: String },
    aid: { type: String },
    photo: { type: String },
    age: { type: String },
    gender: { type: String },
    admin: { type: String },
    permissions: {},
    email: { type: String },
    phone: { type: Number },
    expireAt: { type: String },
    verified: { type: Boolean, default: false },
    authyId: { type: String },
    password: { type: String },
    fromsocial: { type: Boolean },
    socialframework: { type: String },
    socialId: { type: String },
    blocked: {},
    countryCode: { type: Number, default: +256 },
    amountDue: { type: Number, default: 0 },
    manuallyAdded: { type: Boolean, default: false }
}, { timestamps: true });
exports.userSchema.index({ expireAt: 1 }, { expireAfterSeconds: 2628003 });
// Apply the uniqueValidator plugin to userSchema.
exports.userSchema.plugin(uniqueValidator);
// dealing with hasing password
exports.userSchema.pre('save', function (next) {
    var user = this;
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) {
        return next();
    }
    // generate a salt
    bcrypt_1.default.genSalt(10, function (err, salt) {
        if (err)
            return next(err);
        // hash the password using our new salt
        bcrypt_1.default.hash(user.password, salt, function (err, hash) {
            if (err)
                return next(err);
            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});
exports.userSchema.methods['comparePassword'] = function (candidatePassword, cb) {
    bcrypt_1.default.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err)
            return cb(err);
        cb(null, isMatch);
    });
};
// Send a verification token to the user (two step auth for login)
exports.userSchema.methods['sendAuthyToken'] = function (cb) {
    if (!this.authyId) {
        stock_notif_server_1.smsHandler.setUpUser(this.phone, this.countryCode).then((res) => {
            this.authyId = res.user.id;
            this.save((err1, doc) => {
                if (err1 || !doc) {
                    return cb.call(this, err1);
                }
                // this = doc;
                stock_notif_server_1.smsHandler.sendToken(this.authyId).then((resp) => cb.call(this, null, resp)).catch(err => cb.call(this, err));
            });
        }).catch(err => cb.call(this, err));
    }
    else {
        // Otherwise send token to a known user
        stock_notif_server_1.smsHandler.sendToken(this.authyId).then((resp) => cb.call(this, null, resp)).catch(err => cb.call(this, err));
    }
};
// Test a 2FA token
exports.userSchema.methods['verifyAuthyToken'] = function (otp, cb) {
    // const self = this;
    stock_notif_server_1.smsHandler.authy.verify(this.authyId, otp, (err, response) => {
        cb.call(this, err, response);
    });
};
// Send a text message via twilio to this user
exports.userSchema.methods['sendMessage'] = function (message, cb) {
    // const self = this;
    stock_notif_server_1.smsHandler.sendSms(this.phone, this.countryCode, message).then(() => {
        cb.call(this, null);
    }).catch(err => {
        cb.call(this, err);
    });
};
exports.userSchema.methods['toAuthJSON'] = function () {
    return {
        urId: this.urId,
        name: this.name,
        age: this.age,
        admin: this.admin,
        email: this.email,
        phone: this.phone,
        permissions: this.permissions,
        gender: this.gender,
        profilethumbnail: this.profilepic
    };
};
exports.userSchema.methods['toProfileJSONFor'] = function () {
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
        createdAt: this.createdAt
    };
};
exports.userSchema.methods['toJSONFor'] = function () {
    return {
        id: this.id,
        name: this.name,
        profilepic: this.profilepic
    };
};
const userAuthselect = {
    urId: 1,
    fname: 1,
    lname: 1,
    companyName: 1,
    extraCompanyDetails: 1,
    startDate: 1,
    address: 1,
    billing: 1,
    uid: 1,
    did: 1,
    aid: 1,
    photo: 1,
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
    blocked: 1,
    countryCode: 1,
    amountDue: 1,
    manuallyAdded: 1,
    updatedAt: 1,
    createdAt: 1
};
const useraboutSelect = {
    urId: 1,
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
    createdAt: 1
};
/** */
exports.userAuthSelect = userAuthselect;
/** */
exports.userAboutSelect = useraboutSelect;
/** */
const createUserModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isAuthDbConnected) {
        await (0, database_controller_1.connectAuthDatabase)(dbUrl);
    }
    if (main) {
        exports.user = database_controller_1.mainConnection.model('User', exports.userSchema);
    }
    if (lean) {
        exports.userLean = database_controller_1.mainConnectionLean.model('User', exports.userSchema);
    }
};
exports.createUserModel = createUserModel;
//# sourceMappingURL=user.model.js.map