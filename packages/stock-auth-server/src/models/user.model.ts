/* eslint-disable @typescript-eslint/no-var-requires */
import { smsHandler } from '@open-stock/stock-notif-server';
import { Iuser } from '@open-stock/stock-universal';
import { Schema, Document, Model } from 'mongoose';
import { connectAuthDatabase, isAuthDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
import bcrypt from 'bcrypt';
// Create authenticated Authy and Twilio API clients
// const authy = require('authy')(config.authyKey);
// const twilioClient = require('twilio')(config.accountSid, config.authToken);
const uniqueValidator = require('mongoose-unique-validator');

/** */
export type Tuser = Document & Iuser;

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
 * @property {string} [uid] - User ID.
 * @property {string} [did] - Device ID.
 * @property {string} [aid] - Account ID.
 * @property {string} [photo] - User photo.
 * @property {string} [age] - User age.
 * @property {string} [gender] - User gender.
 * @property {string} [admin] - User admin.
 * @property {Object} [permissions] - User permissions.
 * @property {string} [email] - User email.
 * @property {number} [phone] - User phone number.
 * @property {string} [expireAt] - User expiration date.
 * @property {boolean} [verified=false] - User verification status.
 * @property {string} [authyId] - Authy ID.
 * @property {string} [password] - User password.
 * @property {boolean} [fromsocial] - User social media status.
 * @property {string} [socialframework] - User social media framework.
 * @property {string} [socialId] - User social media ID.
 * @property {Object} [blocked] - User blocked status.
 * @property {number} [countryCode=256] - User country code.
 * @property {number} [amountDue=0] - User amount due.
 * @property {boolean} [manuallyAdded=false] - User manually added status.
 * @property {Date} createdAt - User creation date.
 * @property {Date} updatedAt - User update date.
 */
export const userSchema: Schema<Tuser> = new Schema({
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
  blocked: { },
  countryCode: { type: Number, default: +256 },
  amountDue: { type: Number, default: 0 },
  manuallyAdded: { type: Boolean, default: false }
},
{ timestamps: true }
);

userSchema.index({ expireAt: 1 },
  { expireAfterSeconds: 2628003 });

// Apply the uniqueValidator plugin to userSchema.
userSchema.plugin(uniqueValidator);

// dealing with hasing password
userSchema.pre('save', function(next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    return next();
  }

  // generate a salt
  bcrypt.genSalt(10, function(err, salt) {
      if (err) return next(err);

      // hash the password using our new salt
      bcrypt.hash(user.password, salt, function(err, hash) {
          if (err) return next(err);
          // override the cleartext password with the hashed one
          user.password = hash;
          next();
      });
  });
});

userSchema.methods['comparePassword'] = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
      if (err) return cb(err);
      cb(null, isMatch);
  });
};

// Send a verification token to the user (two step auth for login)
userSchema.methods['sendAuthyToken'] = function(cb) {
  
  if (!this.authyId) {
    smsHandler.setUpUser(
      this.phone,
      this.countryCode).then((res: any) => {
      this.authyId = res.user.id;
      this.save((err1, doc) => {
        if (err1 || !doc) {
          return cb.call(this, err1);
        }
        // this = doc;
        smsHandler.sendToken(this.authyId).then((resp) => cb.call(this, null, resp)).catch(err => cb.call(this, err));
      });
    }).catch(err => cb.call(this, err));
  } else {
    // Otherwise send token to a known user
    smsHandler.sendToken(this.authyId).then((resp) => cb.call(this, null, resp)).catch(err => cb.call(this, err));
  }
};

// Test a 2FA token
userSchema.methods['verifyAuthyToken'] = function(otp, cb) {
  // const self = this;
  smsHandler.authy.verify(this.authyId, otp, (err, response) => {
    cb.call(this, err, response);
  });
};

// Send a text message via twilio to this user
userSchema.methods['sendMessage'] = function(message, cb) {
  // const self = this;
  smsHandler.sendSms(
    this.phone,
    this.countryCode,
    message).then(() => {
    cb.call(this, null);
  }).catch(err => {
    cb.call(this, err);
  });
};

userSchema.methods['toAuthJSON'] = function() {
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

userSchema.methods['toProfileJSONFor'] = function() {
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

userSchema.methods['toJSONFor'] = function() {
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

export let user: Model<Tuser>;
export let userLean: Model<Tuser>;
/** */
export const userAuthSelect = userAuthselect;
/** */
export const userAboutSelect = useraboutSelect;

/** */
export const createUserModel = async(dbUrl: string, main = true, lean = true) => {
  if (!isAuthDbConnected) {
    await connectAuthDatabase(dbUrl);
  }

  if (main) {
    user = mainConnection.model<Tuser>('User', userSchema);
  }

  if (lean) {
    userLean = mainConnectionLean.model<Tuser>('User', userSchema);
  }
};
