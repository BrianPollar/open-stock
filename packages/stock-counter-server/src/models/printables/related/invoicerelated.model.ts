/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
import { IinvoiceRelated, IinvoiceRelatedPdct } from '@open-stock/stock-universal';
import {
  IcompanyIdAsObjectId,
  connectDatabase,
  createExpireDocIndex,
  isDbConnected, mainConnection, mainConnectionLean,
  preUpdateDocExpire, withCompanySelectObj,
  withUrIdAndCompanySchemaObj
} from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
// const uniqueValidator = require('mongoose-unique-validator');

/** model interface for invoiceRelated by */
export type TinvoiceRelated = Document & IinvoiceRelated & IcompanyIdAsObjectId;

type TitemsSchema = Document & Omit<IinvoiceRelatedPdct, 'item'> & { item: Schema.Types.ObjectId };

const itemsSchema: Schema<TitemsSchema> = new Schema<TitemsSchema>({
  item: { type: Schema.Types.ObjectId },
  itemName: { type: String, minlength: [3, 'cannot be less than 3'], maxlength: [150, 'cannot be more than 150'] },
  itemPhoto: { type: String },
  quantity: { type: Number, min: [1, 'cannot be less than 1'] },
  rate: { type: Number, min: [1, 'cannot be less than 1'] },
  amount: { type: Number, min: [1, 'cannot be less than 1'] },
  currency: { type: String }
});

const invoiceRelatedSchema: Schema<TinvoiceRelated> = new Schema({
  ...withUrIdAndCompanySchemaObj,
  creationType: {
    type: String,
    validator: checkCreationType,
    message: props => `${props.value} is invalid phone!`
  },
  estimateId: { type: Number },
  invoiceId: { type: Number },
  billingUser: { type: String },
  billingUserId: { type: Schema.Types.ObjectId },
  items: [itemsSchema],
  fromDate: { type: Date },
  toDate: {
    type: Date,
    validator: checkToDate,
    message: props => `${props.value} is invalid, it must be less than from date!`
  },
  status: {
    type: String,
    validator: checkStatus,
    message: props => `${props.value} is invalid phone!`
  },
  stage: {
    type: String,
    validator: checkStage,
    message: props => `${props.value} is invalid phone!`
  },
  cost: {
    type: Number,
    min: [0, 'cannot be less than 0!']
  },
  tax: {
    type: Number,
    min: [0, 'cannot be less than 0!']
  },
  balanceDue: {
    type: Number,
    min: [0, 'cannot be less than 0!']
  },
  subTotal: {
    type: Number,
    min: [0, 'cannot be less than 0!']
  },
  total: {
    type: Number,
    min: [0, 'cannot be less than 0!']
  },
  payments: [Schema.Types.ObjectId],
  payType: { type: String, index: true },
  ecommerceSale: { type: Boolean, index: true, default: false },
  ecommerceSalePercentage: {
    type: Number,
    min: [0, 'cannot be less than 0!'],
    max: [100, 'cannot be greater than 100!']
  },
  currency: { type: String, default: 'USD' }
}, { timestamps: true, collection: 'invoicerelateds' });

function checkCreationType(creationType: string) {
  return creationType === 'estimate' || creationType === 'invoice' ||
  creationType === 'deliverynote' || creationType === 'receipt';
}

function checkToDate(toDate: Date) {
  return toDate < this.fromDate;
}

function checkStatus(status: string) {
  return status === 'paid' || status === 'pending' ||
  status === 'overdue' || status === 'draft' ||
  status === 'unpaid' || status === 'cancelled';
}

function checkStage(stage: string) {
  return stage === 'estimate' || stage === 'invoice' || stage === 'deliverynote' || stage === 'receipt';
}

invoiceRelatedSchema.pre('updateOne', function(next) {
  return preUpdateDocExpire(this, next);
});

invoiceRelatedSchema.pre('updateMany', function(next) {
  return preUpdateDocExpire(this, next);
});

// Apply the uniqueValidator plugin to invoiceRelatedSchema.
// invoiceRelatedSchema.plugin(uniqueValidator);

/** primary selection object
 * for invoiceRelated
 */
const invoiceRelatedselect = {
  ...withCompanySelectObj,
  creationType: 1,
  estimateId: 1,
  invoiceId: 1,
  billingUser: 1,
  billingUserId: 1,
  items: 1,
  fromDate: 1,
  toDate: 1,
  status: 1,
  stage: 1,
  cost: 1,
  tax: 1,
  balanceDue: 1,
  subTotal: 1,
  total: 1,
  payments: 1,
  payType: 1,
  ecommerceSale: 1,
  ecommerceSalePercentage: 1,
  currency: 1
};

/**
 * Represents the main invoice related model.
 */
export let invoiceRelatedMain: Model<TinvoiceRelated>;

/**
 * Represents a lean version of the invoice related model.
 */
export let invoiceRelatedLean: Model<TinvoiceRelated>;

/**
 * Selects the invoice related fields for querying.
 */
export const invoiceRelatedSelect = invoiceRelatedselect;

/**
 * Creates the InvoiceRelated model.
 * @param dbUrl - The URL of the database.
 * @param main - Indicates whether to create the main connection model. Default is true.
 * @param lean - Indicates whether to create the lean connection model. Default is true.
 */
export const createInvoiceRelatedModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  createExpireDocIndex(invoiceRelatedSchema);
  if (!isDbConnected) {
    await connectDatabase(dbUrl, dbOptions);
  }

  if (main) {
    invoiceRelatedMain = mainConnection
      .model<TinvoiceRelated>('invoiceRelated', invoiceRelatedSchema);
  }

  if (lean) {
    invoiceRelatedLean = mainConnectionLean
      .model<TinvoiceRelated>('invoiceRelated', invoiceRelatedSchema);
  }
};

