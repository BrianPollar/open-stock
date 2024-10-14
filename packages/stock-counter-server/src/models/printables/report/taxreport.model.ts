/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
import { ItaxReport } from '@open-stock/stock-universal';
import {
  IcompanyIdAsObjectId,
  connectDatabase,
  createExpireDocIndex,
  isDbConnected, mainConnection, mainConnectionLean,
  preUpdateDocExpire, withUrIdAndCompanySchemaObj,
  withUrIdAndCompanySelectObj
} from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
const uniqueValidator = require('mongoose-unique-validator');

/**
 * Represents a tax report.
 */
export type TtaxReport = Document & ItaxReport & IcompanyIdAsObjectId;

const taxReportSchema: Schema<TtaxReport> = new Schema({
  ...withUrIdAndCompanySchemaObj,
  totalAmount: {
    type: Number,
    min: [0, 'cannot be less than 0.']
  },
  date: { type: Date },
  estimates: [Schema.Types.ObjectId],
  invoiceRelateds: [Schema.Types.ObjectId],
  currency: { type: String, default: 'USD' }
}, { timestamps: true, collection: 'taxreports' });

// Apply the uniqueValidator plugin to taxReportSchema.
taxReportSchema.plugin(uniqueValidator);

taxReportSchema.pre('updateOne', function(next) {
  return preUpdateDocExpire(this, next);
});

taxReportSchema.pre('updateMany', function(next) {
  return preUpdateDocExpire(this, next);
});

/** primary selection object
 * for taxReport
 */
const taxReportselect = {
  ...withUrIdAndCompanySelectObj,
  totalAmount: 1,
  date: 1,
  estimates: 1,
  invoiceRelateds: 1,
  currency: 1
};

/**
 * Represents the main tax report model.
 */
export let taxReportMain: Model<TtaxReport>;

/**
 * Represents a lean tax report model.
 */
export let taxReportLean: Model<TtaxReport>;

/** primary selection object
 * for taxReport
 */
export const taxReportSelect = taxReportselect;


/**
 * Creates a tax report model with the given database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main connection or not. Defaults to true.
 * @param lean Whether to create the lean connection or not. Defaults to true.
 */
export const createTaxReportModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  createExpireDocIndex(taxReportSchema);
  if (!isDbConnected) {
    await connectDatabase(dbUrl, dbOptions);
  }

  if (main) {
    taxReportMain = mainConnection
      .model<TtaxReport>('taxReport', taxReportSchema);
  }

  if (lean) {
    taxReportLean = mainConnectionLean
      .model<TtaxReport>('taxReport', taxReportSchema);
  }
};

