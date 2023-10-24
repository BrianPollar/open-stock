import { Document, Model, Schema } from 'mongoose';
import { IinvoiceRelated, IpaymentRelated } from '@open-stock/stock-universal';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');

/** model type for order by */
/** */
export type Torder = Document & {
  paymentRelated: string | IpaymentRelated;
  invoiceRelated: string | IinvoiceRelated;
  deliveryDate: Date;
  };

const orderSchema: Schema<Torder> = new Schema({
  paymentRelated: { type: String, unique: true },
  invoiceRelated: { type: String, unique: true },
  deliveryDate: { type: Date, required: [true, 'cannot be empty.'], index: true }
}, { timestamps: true });

// Apply the uniqueValidator plugin to orderSchema.
orderSchema.plugin(uniqueValidator);

/** primary selection object
 * for order
 */
const orderselect = {
  paymentRelated: 1,
  invoiceRelated: 1,
  deliveryDate: 1
};

/** main connection for orders Operations*/
export let orderMain: Model<Torder>;
/** lean connection for orders Operations*/
export let orderLean: Model<Torder>;
/** primary selection object
 * for order
 */
/** */
export const orderSelect = orderselect;

/** */
/**
 * Creates an order model with the given database URL, main flag, and lean flag.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the main connection model.
 * @param lean Whether to create the lean connection model.
 */
export const createOrderModel = async(dbUrl: string, main = true, lean = true) => {
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl);
  }

  if (main) {
    orderMain = mainConnection.model<Torder>('Order', orderSchema);
  }

  if (lean) {
    orderLean = mainConnectionLean.model<Torder>('Order', orderSchema);
  }
};
