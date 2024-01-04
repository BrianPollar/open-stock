import { Document, Model, Schema } from 'mongoose';
import { IjobCard } from '@open-stock/stock-universal';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');

/**
 * Represents a job card document.
 */
export type TjobCard = Document & IjobCard;

const jobCardSchema: Schema<TjobCard> = new Schema({
  urId: { type: String, unique: true },
  companyId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
  client: { },
  machine: { },
  problem: { },
  cost: { type: Number }
}, { timestamps: true });

// Apply the uniqueValidator plugin to jobCardSchema.
jobCardSchema.plugin(uniqueValidator);

/** primary selection object
 * for jobCard
 */
const jobCardselect = {
  urId: 1,
  companyId: 1,
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
 * @param main Whether to create a main connection or not. Defaults to true.
 * @param lean Whether to create a lean connection or not. Defaults to true.
 */
export const createJobCardModel = async(dbUrl: string, main = true, lean = true) => {
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl);
  }

  if (main) {
    jobCardMain = mainConnection.model<TjobCard>('JobCard', jobCardSchema);
  }

  if (lean) {
    jobCardLean = mainConnectionLean.model<TjobCard>('JobCard', jobCardSchema);
  }
};
