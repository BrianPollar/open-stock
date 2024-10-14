/// <reference types="mongoose/types/document" />
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
/// <reference types="mongoose" />
/// <reference types="mongoose/types/inferschematype" />
import { TuserWalletHistory } from '../../models/printables/wallet/user-wallet-history.model';
export declare const makeWalletHistoryQuery: (walletHistory: TuserWalletHistory) => Promise<Error | (import("mongoose").Document<unknown, {}, TuserWalletHistory> & import("mongoose").Document<any, any, any> & import("@open-stock/stock-universal").IwalletHistory & {
    _id: import("mongoose").Types.ObjectId;
})>;
/**
 * Router for wallet related routes.
 */
export declare const walletHistoryRoutes: import("express-serve-static-core").Router;
