import { Icustomer } from '@open-stock/stock-universal';
import {
  createExpireDocIndex, preUpdateDocExpire, withUrIdAndCompanySchemaObj, withUrIdAndCompanySelectObj
} from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema, Types } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../utils/database';
const uniqueValidator = require('mongoose-unique-validator');

/**
 * Represents a customer document in the database.
 */
export type Tcustomer = Document & Icustomer;

/** Defines the schema for the customer model. */
const customerSchema: Schema<Tcustomer> = new Schema({
  ...withUrIdAndCompanySchemaObj,
  user: { type: Types.ObjectId, unique: true, required: [true, 'cannot be empty.'], index: true },
  startDate: { type: Date },
  endDate: { type: Date },
  occupation: { type: String },
  otherAddresses: []
}, { timestamps: true, collection: 'customers' });

customerSchema.pre('updateOne', function(next) {
  return preUpdateDocExpire(this, next);
});

customerSchema.pre('updateMany', function(next) {
  return preUpdateDocExpire(this, next);
});


// Apply the uniqueValidator plugin to customerSchema.
customerSchema.plugin(uniqueValidator);

/** Defines the main selection object for customer. */
const customerselect = {
  ...withUrIdAndCompanySelectObj,
  user: 1,
  salutation: 1,
  endDate: 1,
  occupation: 1,
  otherAddresses: 1
};

/**
 * The main customer model.
 */
export let customerMain: Model<Tcustomer>;

/**
 * Represents a lean customer model.
 */
export let customerLean: Model<Tcustomer>;

/**
 * Represents a customer select statement.
 */
export const customerSelect = customerselect;

/**
 * Creates a new customer model and connects to the database.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main connection.
 * @param lean Whether to create the lean connection.
 */
export const createCustomerModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  createExpireDocIndex(customerSchema);
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl, dbOptions);
  }

  if (main) {
    customerMain = mainConnection
      .model<Tcustomer>('Customer', customerSchema);
  }

  if (lean) {
    customerLean = mainConnectionLean
      .model<Tcustomer>('Customer', customerSchema);
  }
};
