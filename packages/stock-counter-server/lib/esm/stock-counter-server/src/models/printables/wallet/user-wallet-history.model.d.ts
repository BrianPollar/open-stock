/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
/**
 * Defines the schema and
 * models for the user behaviour data, including recent activity, cart, wishlist, compare list, and search terms.
 * The schema is defined with
 *  Mongoose and includes a unique validator plugin.
 * The `createReviewModel` function can be used to create the main and
 *  lean connection models for the user behaviour data.
 */
import { IwalletHistory } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model } from 'mongoose';
/**
 * Represents the type of a user behaviour document in the database.
 * This type extends the `Document` type from Mongoose and the `IuserWalletHistory` interface,
 * which likely defines the shape of a user behaviour document.
 */
export type TuserWalletHistory = Document & IwalletHistory;
/**
 * Represents the main Mongoose
 * model for the user behaviour data, including recent activity, cart, wishlist, compare list, and search terms.
 * This model is used for the main database connection.
 */
export declare let userWalletHistoryMain: Model<TuserWalletHistory>;
/**
 * Represents the lean Mongoose model for the user behaviour data,
 *  including recent activity, cart, wishlist, compare list, and search terms.
 * This model is used for the lean database connection, which
 * provides a more optimized and efficient way of querying the data.
 */
export declare let userWalletHistoryLean: Model<TuserWalletHistory>;
export declare const userWalletHistorySelect: {
    wallet: number;
    amount: number;
    type: number;
    trackEdit: number;
    trackView: number;
    isDeleted: number;
    trackDeleted: number;
};
/**
 * Creates a review model with the specified database URL, main connection flag, and lean flag.
 * @param dbUrl The URL of the database.
 * @param main Indicates whether to create the main connection model.
 * @param lean Indicates whether to create the lean connection model.
 */
export declare const createUserWalletHistoryModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
