/* eslint-disable @typescript-eslint/no-var-requires */
import { Icompany } from '@open-stock/stock-universal';
import {
  connectDatabase,
  createExpireDocIndex,
  globalSchemaObj,
  globalSelectObj,
  isDbConnected,
  mainConnection,
  mainConnectionLean,
  preUpdateDocExpire
} from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
// Create authenticated Authy and Twilio API clients
// const authy = require('authy')(config.authyKey);
// const twilioClient = require('twilio')(config.accountSid, config.authToken);
const uniqueValidator = require('mongoose-unique-validator');

/**
 * Represents a company document with additional fields from the Icompany interface.
 */
export type Tcompany = Document & Icompany;

export const companySchema: Schema<Tcompany> = new Schema<Tcompany>({
  ...globalSchemaObj,
  trackDeleted: { type: Schema.ObjectId },
  urId: { type: String, required: [true, 'cannot be empty.'], index: true },
  name: { type: String,
    required: [true, 'cannot be empty.'],
    index: true,
    minlength: [3, 'more than 3 characters required.'],
    maxlength: [90, 'less than 90 characters required.']
  },
  displayName: {
    type: String, required: [true, 'cannot be empty.'],
    index: true,
    minlength: [3, 'more than 3 characters required.'],
    maxlength: [90, 'less than 90 characters required.']
  },
  dateOfEst: {
    type: Date,
    index: true
  },
  left: { type: Boolean, default: false },
  dateLeft: { type: Date,
    validate: {
      validator: validateDateLeft,
      message: props => `${props.value} is less than date of establishment!`
    }
  },
  details: { type: String },
  address: { type: String },
  companyDispNameFormat: { type: String },
  businessType: { type: String },
  websiteAddress: { type: String,
    validate: {
      validator(v: string) {
        return /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/.test(v);
      },
      message: props => `${props.value} is not a valid web address!`
    }
  },
  blocked: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  expireAt: { type: String },
  blockedReasons: {},
  owner: { type: Schema.Types.ObjectId } // user
}, { timestamps: true, collection: 'companies' });

companySchema.index({ createdAt: -1 });

companySchema.index(
  { expireAt: 1 },
  { expireAfterSeconds: 2628003 }
);

companySchema.pre('updateOne', function(next) {
  return preUpdateDocExpire(this, next);
});

companySchema.pre('updateMany', function(next) {
  return preUpdateDocExpire(this, next);
});

function validateDateLeft(this, v) {
  return (new Date(v) > new Date(this.createdAt)) && (new Date(v) > new Date(this.dateOfEst));
}

// Apply the uniqueValidator plugin to companySchema.
companySchema.plugin(uniqueValidator);

const companyAuthselect = {
  ...globalSelectObj,
  name: 1,
  displayName: 1,
  dateOfEst: 1,
  salutation: 1,
  details: 1,
  companyDispNameFormat: 1,
  businessType: 1,
  createdAt: 1,
  websiteAddress: 1,
  blocked: 1,
  verified: 1,
  expireAt: 1,
  blockedReasons: 1,
  left: 1,
  dateLeft: 1
};

const companyaboutSelect = {
  ...globalSelectObj,
  name: 1,
  displayName: 1,
  dateOfEst: 1,
  salutation: 1,
  details: 1,
  companyDispNameFormat: 1,
  businessType: 1,
  createdAt: 1,
  websiteAddress: 1,
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
export const createCompanyModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  createExpireDocIndex(companySchema);
  if (!isDbConnected) {
    await connectDatabase(dbUrl, dbOptions);
  }

  if (main) {
    companyMain = mainConnection
      .model<Tcompany>('Company', companySchema);
  }

  if (lean) {
    companyLean = mainConnectionLean
      .model<Tcompany>('Company', companySchema);
  }
};
