/// <reference types="mongoose" />
/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
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
import { IuserWallet, IwalletHistory } from '@open-stock/stock-universal';
/**
   * Creates a new wallet for the given user if none exists, otherwise updates the
   * existing one.
   *
   * @param userId the id of the user for whom to create the wallet
   * @param wallet the wallet data to insert or update
   * @returns a success object indicating whether the operation was successful and
   *   the status code
   */
export declare const relegateCreaeWallet: (userId: string, wallet: IuserWallet) => Promise<void>;
/**
   * Creates a new wallet for a user.
   *
   * @param wallet the wallet data to insert
   * @returns a success object indicating whether the operation was successful and
   *   the status code
   */
export declare const creteWallet: (wallet: IuserWallet) => Promise<{
    success: boolean;
}>;
/**
   * Updates the wallet of a user.
   *
   * @param wallet the wallet data to update
   * @returns a success object indicating whether the operation was successful and
   *   the status code
   */
export declare const updateWallet: (wallet: IuserWallet) => Promise<{
    success: boolean;
}>;
/**
   * Retrieves all wallets, sorted by id in descending order.
   *
   * @param offset the number of documents to skip
   * @param limit the number of documents to return
   * @returns a promise resolving to an array of wallet documents
   */
export declare const getAllWallets: (offset?: number, limit?: number) => import("mongoose").Query<(import("mongoose").FlattenMaps<import("../models/printables/wallet/user-wallet.model").TuserWallet> & {
    _id: import("mongoose").Types.ObjectId;
})[], import("mongoose").Document<unknown, {}, import("../models/printables/wallet/user-wallet.model").TuserWallet> & import("mongoose").Document<any, any, any> & IuserWallet & {
    _id: import("mongoose").Types.ObjectId;
}, {}, import("../models/printables/wallet/user-wallet.model").TuserWallet, "find">;
/**
   * Retrieves a single user wallet by user id.
   *
   * @param userId the user id to retrieve the wallet for
   * @returns a promise resolving to the wallet document or an error object
   *   with a success of false and either a 401 status code with an
   *   unauthorized error, or a 404 status code with a not found error
   */
export declare const getOneUesrWallet: (userId: string) => import("mongoose").Query<import("mongoose").FlattenMaps<import("../models/printables/wallet/user-wallet.model").TuserWallet> & {
    _id: import("mongoose").Types.ObjectId;
}, import("mongoose").Document<unknown, {}, import("../models/printables/wallet/user-wallet.model").TuserWallet> & import("mongoose").Document<any, any, any> & IuserWallet & {
    _id: import("mongoose").Types.ObjectId;
}, {}, import("../models/printables/wallet/user-wallet.model").TuserWallet, "findOne"> | {
    success: boolean;
    status: number;
    err: string;
};
/**
   * Deletes a user wallet and all associated history.
   *
   * @param userId the user id to delete the wallet for
   * @returns a promise resolving to an object with a success of true
   */
export declare const delteWalltet: (userId: string) => Promise<{
    success: boolean;
}>;
/**
   * Deletes all user wallet history associated with a given user id.
   *
   * @param userId the user id to delete history for
   * @returns a promise resolving to an object with a success of true
   */
export declare const deleteAllAssociatedHistory: (userId: string) => Promise<{
    success: boolean;
}>;
/**
   * Creates a new user wallet history document.
   *
   * @param hist the user wallet history to create
   * @returns a promise resolving to an object with a success of true
   */
export declare const createWalletHistory: (hist: IwalletHistory) => Promise<{
    success: boolean;
}>;
