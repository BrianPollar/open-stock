import { IinvoiceRelated, IpaymentRelated } from '@open-stock/stock-universal';
import { createExpireDocIndex, preUpdateDocExpire } from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../utils/database';
const uniqueValidator = require('mongoose-unique-validator');

/**
 * Represents an order in the system.
 */
export type Torder = Document & {
  companyId: string;
  paymentRelated: string | IpaymentRelated;
  invoiceRelated: string | IinvoiceRelated;
  deliveryDate: Date;
  isDeleted?: boolean;
};

const orderSchema: Schema<Torder> = new Schema({
  companyId: { type: String, required: [true, 'cannot be empty.'], index: true },
  paymentRelated: { type: String, unique: true },
  invoiceRelated: { type: String, unique: true },
  deliveryDate: { type: Date, required: [true, 'cannot be empty.'], index: true }
}, { timestamps: true, collection: 'orders' });

// Apply the uniqueValidator plugin to orderSchema.
orderSchema.plugin(uniqueValidator);

orderSchema.pre('updateOne', function(next) {
  return preUpdateDocExpire(this, next);
});

orderSchema.pre('updateMany', function(next) {
  return preUpdateDocExpire(this, next);
});


/** primary selection object
 * for order
 */
const orderselect = {
  companyId: 1,
  paymentRelated: 1,
  invoiceRelated: 1,
  deliveryDate: 1
};

/**
 * Represents the main order model.
 */
export let orderMain: Model<Torder>;

/**
 * Represents a lean order model.
 */
export let orderLean: Model<Torder>;

/**
 * Represents the order select function.
 */
export const orderSelect = orderselect;

/**
 * Creates an order model with the given database URL, main flag, and lean flag.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main connection model.
 * @param lean Whether to create the lean connection model.
 */
export const createOrderModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  createExpireDocIndex(orderSchema);
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl, dbOptions);
  }

  if (main) {
    orderMain = mainConnection.model<Torder>('Order', orderSchema);
  }

  if (lean) {
    orderLean = mainConnectionLean.model<Torder>('Order', orderSchema);
  }
};
