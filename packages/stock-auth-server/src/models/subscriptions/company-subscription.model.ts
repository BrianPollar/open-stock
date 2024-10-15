import { IcompanySubscription } from '@open-stock/stock-universal';
import {
  IcompanyIdAsObjectId,
  connectDatabase, createExpireDocIndex,
  isDbConnected,
  mainConnectionLean,
  withCompanySchemaObj,
  withCompanySelectObj
} from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';

const uniqueValidator = require('mongoose-unique-validator');

export type TcompanySubscription = Document & Omit<IcompanySubscription, 'companyId'> & IcompanyIdAsObjectId;

/** company subscription schema */
const companySubscriptionSchema: Schema<TcompanySubscription> = new Schema<TcompanySubscription>({
  ...withCompanySchemaObj,
  name: {
    type: String,
    minlength: [3, 'alteat 3 charaters needed'],
    maxlength: [50, 'cannot be more than 50 characters']
  },
  amount: {
    type: Number,
    required: [true, 'cannot be empty.'],
    min: [0, 'cannot be less than 0.']
  },
  duration: {
    type: Number,
    required: [true, 'cannot be empty.'],
    min: [0, 'cannot be less than 0.']
  },
  active: { type: Boolean, default: false },
  // subscriprionId: { type: String },
  startDate: { type: Date, required: [true, 'cannot be empty.'], index: true },
  endDate: {
    type: Date,
    required: [true, 'cannot be empty.'],
    index: true,
    validator: checkEndDate,
    message: props => `${props.value} is invalid, must be greater than start date!`
  },
  pesaPalorderTrackingId: { type: String, inddex: true },
  status: { type: String },
  features: []
}, { timestamps: true, collection: 'companysubscriptions' });

companySubscriptionSchema.index({ endDate: -1 });

// Apply the uniqueValidator plugin to companySubscriptionSchema.
companySubscriptionSchema.plugin(uniqueValidator);

function checkEndDate(value: Date) {
  return new Date(value) > new Date(this.startDate);
}

/** Primary selection object for FAQ */
const companySubscriptionselect = {
  ...withCompanySelectObj,
  name: 1,
  amount: 1,
  duration: 1,
  active: 1,
  subscriprionId: 1,
  startDate: 1,
  endDate: 1,
  pesaPalorderTrackingId: 1,
  status: 1,
  features: 1
};

/**
 * Represents the main company subscription model.
 */
export let companySubscriptionMain: Model<TcompanySubscription>;

/**
 * Represents a lean company subscription model.
 */
export let companySubscriptionLean: Model<TcompanySubscription>;

/**
 * Selects the companySubscriptionselect constant from the companySubscription.model module.
 */
export const companySubscriptionSelect = companySubscriptionselect;

/**
 * Creates a new company subscription model.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create a main connection.
 * @param lean Whether to create a lean connection.
 */
export const createCompanySubscription = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  createExpireDocIndex(companySubscriptionSchema);
  if (!isDbConnected) {
    await connectDatabase(dbUrl, dbOptions);
  }

  if (main) {
    companySubscriptionMain = mainConnectionLean
      .model<TcompanySubscription>('CompanySubscription', companySubscriptionSchema);
  }

  if (lean) {
    companySubscriptionLean = mainConnectionLean
      .model<TcompanySubscription>('CompanySubscription', companySubscriptionSchema);
  }
};
