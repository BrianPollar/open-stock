/* eslint-disable @typescript-eslint/no-var-requires */
import { sendSms, sendToken, setUpUser, verifyAuthyToken } from '@open-stock/stock-notif-server';
import { Icompany } from '@open-stock/stock-universal';
import bcrypt from 'bcrypt';
import { Document, Model, Schema } from 'mongoose';
import { connectAuthDatabase, isAuthDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
// Create authenticated Authy and Twilio API clients
// const authy = require('authy')(config.authyKey);
// const twilioClient = require('twilio')(config.accountSid, config.authToken);
const uniqueValidator = require('mongoose-unique-validator');

/**
 * Represents a company document with additional fields from the Icompany interface.
 */
export type Tcompany = Document & Icompany;

export const companySchema: Schema<Tcompany> = new Schema({
  urId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
  name: { type: String, required: [true, 'cannot be empty.'], index: true },
  displayName: { type: String, required: [true, 'cannot be empty.'], index: true },
  dateOfEst: { type: String, index: true },
  left: { type: Boolean, default: false },
  dateLeft: { type: Date },
  details: { type: String },
  companyDispNameFormat: { type: String },
  businessType: { type: String },
  profilePic: { type: String },
  profileCoverPic: { type: String },
  photos: [],
  websiteAddress: { type: String },
  pesapalCallbackUrl: { type: String },
  pesapalCancellationUrl: { type: String },
  password: { type: String, required: [true, 'cannot be empty.'] },
  blocked: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  expireAt: { type: String },
  blockedReasons: {}
},
{ timestamps: true }
);

companySchema.index({ expireAt: 1 },
  { expireAfterSeconds: 2628003 });

// Apply the uniqueValidator plugin to companySchema.
companySchema.plugin(uniqueValidator);

// dealing with hasing password
companySchema.pre('save', function(next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const company = this;

  // only hash the password if it has been modified (or is new)
  if (!company.isModified('password')) {
    return next();
  }

  // generate a salt
  bcrypt.genSalt(10, function(err, salt) {
    if (err) {
      return next(err);
    }

    // hash the password using our new salt
    bcrypt.hash(company.password, salt, function(err, hash) {
      if (err) {
        return next(err);
      }
      // override the cleartext password with the hashed one
      company.password = hash;
      next();
    });
  });
});

companySchema.methods['comparePassword'] = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

// Send a verification token to the company (two step auth for login)
companySchema.methods['sendAuthyToken'] = function(cb) {
  if (!this.authyId) {
    setUpUser(
      this.phone,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.countryCode).then((res: any) => {
      this.authyId = res.user.id;
      this.save((err1, doc) => {
        if (err1 || !doc) {
          return cb.call(this, err1);
        }
        // this = doc;
        sendToken(this.authyId).then(resp => cb.call(this, null, resp)).catch(err => cb.call(this, err));
      });
    }).catch(err => cb.call(this, err));
  } else {
    // Otherwise send token to a known company
    sendToken(this.authyId).then((resp) => cb.call(this, null, resp)).catch(err => cb.call(this, err));
  }
};

// Test a 2FA token
companySchema.methods['verifyAuthyToken'] = function(otp, cb) {
  verifyAuthyToken(this.authyId, otp).then(resp => {
    cb.call(this, null, resp);
  }).catch(err => {
    cb.call(this, err);
  });
};

// Send a text message via twilio to this company
companySchema.methods['sendMessage'] = function(message, cb) {
  // const self = this;
  sendSms(
    this.phone,
    this.countryCode,
    message
  ).then(() => {
    cb.call(this, null);
  }).catch(err => {
    cb.call(this, err);
  });
};

companySchema.methods['toAuthJSON'] = function() {
  return {
    urId: this.urId,
    name: this.name,
    displayName: this.displayName,
    dateOfEst: this.dateOfEst,
    salutation: this.salutation,
    details: this.details,
    companyDispNameFormat: this.companyDispNameFormat,
    businessType: this.businessType,
    photos: this.photos,
    blockedReasons: this.blockedReasons
  };
};

companySchema.methods['toProfileJSONFor'] = function() {
  return {
    urId: this.urId,
    name: this.name,
    displayName: this.displayName,
    dateOfEst: this.dateOfEst,
    details: this.details,
    companyDispNameFormat: this.companyDispNameFormat,
    businessType: this.businessType,
    profilepic: this.profilepic,
    profileCoverPic: this.profileCoverPic,
    createdAt: this.createdAt,
    websiteAddress: this.websiteAddress,
    pesapalCallbackUrl: this.pesapalCallbackUrl,
    pesapalCancellationUrl: this.pesapalCancellationUrl,
    photos: this.photos,
    blockedReasons: this.blockedReasons
  };
};

const companyAuthselect = {
  urId: 1,
  name: 1,
  displayName: 1,
  dateOfEst: 1,
  salutation: 1,
  details: 1,
  companyDispNameFormat: 1,
  businessType: 1,
  profilepic: 1,
  profileCoverPic: 1,
  createdAt: 1,
  websiteAddress: 1,
  pesapalCallbackUrl: 1,
  pesapalCancellationUrl: 1,
  photos: 1,
  blocked: 1,
  verified: 1,
  expireAt: 1,
  blockedReasons: 1,
  left: 1,
  dateLeft: 1
};

const companyaboutSelect = {
  urId: 1,
  name: 1,
  displayName: 1,
  dateOfEst: 1,
  salutation: 1,
  details: 1,
  companyDispNameFormat: 1,
  businessType: 1,
  profilepic: 1,
  profileCoverPic: 1,
  createdAt: 1,
  websiteAddress: 1,
  pesapalCallbackUrl: 1,
  pesapalCancellationUrl: 1,
  photos: 1,
  blocked: 1,
  verified: 1,
  expireAt: 1,
  blockedReasons: 1,
  left: 1,
  dateLeft: 1
};

/**
 * Represents the main company model.
 */
export let companyMain: Model<Tcompany>;

/**
 * Represents a lean company model.
 */
export let companyLean: Model<Tcompany>;

/**
 * Represents the company authentication select function.
 */
export const companyAuthSelect = companyAuthselect;

/**
 * Selects the company about information.
 */
export const companyAboutSelect = companyaboutSelect;

/**
 * Creates a company model with the specified database URL.
 * @param dbUrl The URL of the database.
 * @param main Optional parameter indicating whether to create the main company model. Default is true.
 * @param lean Optional parameter indicating whether to create the lean company model. Default is true.
 */
export const createCompanyModel = async(dbUrl: string, main = true, lean = true) => {
  if (!isAuthDbConnected) {
    await connectAuthDatabase(dbUrl);
  }

  if (main) {
    companyMain = mainConnection.model<Tcompany>('Company', companySchema);
  }

  if (lean) {
    companyLean = mainConnectionLean.model<Tcompany>('Company', companySchema);
  }
};
