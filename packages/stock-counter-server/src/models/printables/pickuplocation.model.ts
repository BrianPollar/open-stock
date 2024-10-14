import { IpickupLocation } from '@open-stock/stock-universal';
import {
  IcompanyIdAsObjectId,
  connectDatabase,
  createExpireDocIndex,
  isDbConnected, mainConnection, mainConnectionLean,
  preUpdateDocExpire,
  withUrIdAndCompanySchemaObj, withUrIdAndCompanySelectObj
} from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
const uniqueValidator = require('mongoose-unique-validator');

/**
 * Represents a pickup location.
 * @typedef {Document & IpickupLocation} TpickupLocation
 */
export type TpickupLocation = Document & IpickupLocation & IcompanyIdAsObjectId;

const pickupLocationSchema: Schema<TpickupLocation> = new Schema({
  ...withUrIdAndCompanySchemaObj,
  name: {
    type: String,
    unique: true,
    required: [true, 'cannot be empty.'],
    index: true,
    minlength: [3, 'cannot be less than 3.'],
    maxlength: [150, 'cannot be more than 150.']
  },
  contact: {
    name: { type: String },
    phone: { type: String },
    email: { type: String }
  }
}, { timestamps: true, collection: 'pickuplocations' });

pickupLocationSchema.pre('updateOne', function(next) {
  return preUpdateDocExpire(this, next);
});

pickupLocationSchema.pre('updateMany', function(next) {
  return preUpdateDocExpire(this, next);
});


// Apply the uniqueValidator plugin to pickupLocationSchema.
pickupLocationSchema.plugin(uniqueValidator);

/** primary selection object
 * for pickupLocation
 */
const pickupLocationselect = {
  ...withUrIdAndCompanySelectObj,
  name: 1,
  contact: 1
};

/**
 * Represents the main pickup location model.
 */
export let pickupLocationMain: Model<TpickupLocation>;

/**
 * Represents a lean pickup location model.
 */
export let pickupLocationLean: Model<TpickupLocation>;

/**
 * Represents a pickup location select.
 */
export const pickupLocationSelect = pickupLocationselect;

/**
 * Creates a new PickupLocation model with the specified database URL, main connection and lean connection.
 * @param dbUrl The database URL to connect to.
 * @param main Whether to create the model for the main connection.
 * @param lean Whether to create the model for the lean connection.
 */
export const createPickupLocationModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  createExpireDocIndex(pickupLocationSchema);
  if (!isDbConnected) {
    await connectDatabase(dbUrl, dbOptions);
  }

  if (main) {
    pickupLocationMain = mainConnection
      .model<TpickupLocation>('PickupLocation', pickupLocationSchema);
  }

  if (lean) {
    pickupLocationLean = mainConnectionLean
      .model<TpickupLocation>('PickupLocation', pickupLocationSchema);
  }
};

