import {
  connectDatabase,
  createExpireDocIndex,
  isDbConnected, mainConnection, mainConnectionLean
} from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';

/**
 * Represents the Mongoose document type for a user wallet.
 * This type extends the `IwaitingWalletPay` interface, which defines the shape of a user wallet document.
 */
export type TwaitingWalletPay = Document & {
  user: string | Schema.Types.ObjectId;
  walletId: string | Schema.Types.ObjectId;
  amount: number;
};

const waitingWalletPaySchema: Schema<TwaitingWalletPay> = new Schema({
  user: { type: Schema.Types.ObjectId, required: [true, 'cannot be empty.'], index: true },
  walletId: { type: Schema.Types.ObjectId, required: [true, 'can not be epmty'] },
  amount: {
    type: Number,
    required: [true, 'cannot be empty.'],
    index: true,
    min: [0, 'cannot be less than 0.']
  }
}, { timestamps: true, collection: 'userwallets' });

waitingWalletPaySchema.index(
  { expireAt: 1 },
  { expireAfterSeconds: 2628003 }
);

/**
 * Represents the main Mongoose model for the user wallet.
 * This model is used for the main database connection and provides full CRUD functionality.
 */
export let waitingWalletPayMain: Model<TwaitingWalletPay>;

/**
 * Represents a lean Mongoose model for the user wallet.
 * This model is used for the main database connection and
 * provides a lightweight, read-optimized version of the user wallet data.
 */
export let waitingWalletPayLean: Model<TwaitingWalletPay>;

/**
 * Creates a review model with the specified database URL, main connection flag, and lean flag.
 * @param dbUrl The URL of the database.
 * @param main Indicates whether to create the main connection model.
 * @param lean Indicates whether to create the lean connection model.
 */
export const createWaitingWalletPaytModel = async(
  dbUrl: string,
  dbOptions?: ConnectOptions,
  main = true,
  lean = true
) => {
  createExpireDocIndex(waitingWalletPaySchema);
  if (!isDbConnected) {
    await connectDatabase(dbUrl, dbOptions);
  }

  if (main) {
    waitingWalletPayMain = mainConnection
      .model<TwaitingWalletPay>('WaitingWalletPaySchema', waitingWalletPaySchema);
  }

  if (lean) {
    waitingWalletPayLean = mainConnectionLean
      .model<TwaitingWalletPay>('WaitingWalletPaySchema', waitingWalletPaySchema);
  }
};
