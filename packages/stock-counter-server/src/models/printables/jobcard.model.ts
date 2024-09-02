import { IjobCard } from '@open-stock/stock-universal';
import { createExpireDocIndex, preUpdateDocExpire, withUrIdAndCompanySchemaObj, withUrIdAndCompanySelectObj } from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../utils/database';
const uniqueValidator = require('mongoose-unique-validator');

/**
 * Represents a job card document.
 */
export type TjobCard = Document & IjobCard;

const jobCardSchema: Schema<TjobCard> = new Schema({
  ...withUrIdAndCompanySchemaObj,
  client: { },
  machine: { },
  problem: { },
  cost: { type: Number }
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
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl, dbOptions);
  }

  if (main) {
    jobCardMain = mainConnection.model<TjobCard>('JobCard', jobCardSchema);
  }

  if (lean) {
    jobCardLean = mainConnectionLean.model<TjobCard>('JobCard', jobCardSchema);
  }
};
