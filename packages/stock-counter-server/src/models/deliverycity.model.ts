import { Ideliverycity } from '@open-stock/stock-universal';
import {
  IcompanyIdAsObjectId,
  connectDatabase,
  createExpireDocIndex,
  isDbConnected, mainConnection, mainConnectionLean,
  preUpdateDocExpire, withCompanySchemaObj, withCompanySelectObj
} from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
const uniqueValidator = require('mongoose-unique-validator');

/**
 * Represents a delivery city.
 * @typedef {Document & Ideliverycity} Tdeliverycity
 */
export type Tdeliverycity = Document & Ideliverycity & IcompanyIdAsObjectId;

const deliverycitySchema: Schema<Tdeliverycity> = new Schema<Tdeliverycity>({
  ...withCompanySchemaObj,
  name: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
  shippingCost: {
    type: Number,
    required: [true, 'cannot be empty.'],
    min: [0, 'cannot be less than 0.']
  },
  currency: { type: String, required: [true, 'cannot be empty.'] },
  deliversInDays: {
    type: Number,
    required: [true, 'cannot be empty.'],
    min: [0, 'cannot be less than 0.'],
    max: [150, 'cannot be greater than 30.']

  }
}, { timestamps: true, collection: 'deliverycities' });

deliverycitySchema.pre('updateOne', function(next) {
  return preUpdateDocExpire(this, next);
});

deliverycitySchema.pre('updateMany', function(next) {
  return preUpdateDocExpire(this, next);
});


// Apply the uniqueValidator plugin to deliverycitySchema.
deliverycitySchema.plugin(uniqueValidator);

/** primary selection object
 * for deliverycity
 */
const deliverycityselect = {
  ...withCompanySelectObj,
  name: 1,
  shippingCost: 1,
  currency: 1,
  deliversInDays: 1
};

/**
 * Represents the main delivery city model.
 */
export let deliverycityMain: Model<Tdeliverycity>;

/**
 * Represents a variable that holds a lean model of the delivery city.
 */
export let deliverycityLean: Model<Tdeliverycity>;

/**
 * Represents the selection of delivery cities.
 */
export const deliverycitySelect = deliverycityselect;

/**
 * Creates a delivery city model with the specified database URL, main connection and lean connection.
 * @param dbUrl The database URL to connect to.
 * @param main Whether to create a main connection or not.
 * @param lean Whether to create a lean connection or not.
 */
export const createDeliverycityModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  createExpireDocIndex(deliverycitySchema);
  if (!isDbConnected) {
    await connectDatabase(dbUrl, dbOptions);
  }

  if (main) {
    deliverycityMain = mainConnection
      .model<Tdeliverycity>('Deliverycity', deliverycitySchema);
  }

  if (lean) {
    deliverycityLean = mainConnectionLean
      .model<Tdeliverycity>('Deliverycity', deliverycitySchema);
  }
};
