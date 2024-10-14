import { IjobCard } from '@open-stock/stock-universal';
import {
  IcompanyIdAsObjectId,
  connectDatabase,
  createExpireDocIndex,
  isDbConnected, mainConnection, mainConnectionLean,
  preUpdateDocExpire, withUrIdAndCompanySchemaObj, withUrIdAndCompanySelectObj
} from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
const uniqueValidator = require('mongoose-unique-validator');

/**
 * Represents a job card document.
 */
export type TjobCard = Document & IjobCard & IcompanyIdAsObjectId;

const jobCardSchema: Schema<TjobCard> = new Schema({
  ...withUrIdAndCompanySchemaObj,
  client: {
    userId: { type: Schema.Types.ObjectId },
    name: { type: String },
    phone: { type: String },
    email: { type: String }
  },
  machine: {
    name: { type: String },
    model: { type: String },
    serialNo: { type: String }
  },
  problem: {
    reportedIssue: { type: String },
    details: { type: String },
    issueOnFirstLook: { type: String }
  },
  cost: { type: Number, min: [0, 'cannot be less than 0.'] }
}, { timestamps: true, collection: 'jobcards' });

jobCardSchema.pre('updateOne', function(next) {
  return preUpdateDocExpire(this, next);
});

jobCardSchema.pre('updateMany', function(next) {
  return preUpdateDocExpire(this, next);
});


// Apply the uniqueValidator plugin to jobCardSchema.
jobCardSchema.plugin(uniqueValidator);

/** primary selection object
 * for jobCard
 */
const jobCardselect = {
  ...withUrIdAndCompanySelectObj,
  client: 1,
  machine: 1,
  problem: 1,
  cost: 1
};

/**
 * Represents the main job card model.
 */
export let jobCardMain: Model<TjobCard>;

/**
 * Represents a job card lean model.
 */
export let jobCardLean: Model<TjobCard>;

/**
 * Represents a job card select.
 */
export const jobCardSelect = jobCardselect;

/**
 * Creates a job card model with the given database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create a main connection or not. Defaults to true.
 * @param lean Whether to create a lean connection or not. Defaults to true.
 */
export const createJobCardModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  createExpireDocIndex(jobCardSchema);
  if (!isDbConnected) {
    await connectDatabase(dbUrl, dbOptions);
  }

  if (main) {
    jobCardMain = mainConnection
      .model<TjobCard>('JobCard', jobCardSchema);
  }

  if (lean) {
    jobCardLean = mainConnectionLean
      .model<TjobCard>('JobCard', jobCardSchema);
  }
};
