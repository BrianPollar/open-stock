/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/query" />
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
/// <reference types="mongoose" />
/// <reference types="mongoose/types/inferschematype" />
import { IuserWallet, IwalletHistory } from '@open-stock/stock-universal';
export declare const relegateCreaeWallet: (userId: string, wallet: IuserWallet) => Promise<void>;
export declare const creteWallet: (wallet: IuserWallet) => Promise<{
    success: boolean;
}>;
export declare const updateWallet: (wallet: IuserWallet) => Promise<{
    success: boolean;
}>;
export declare const getAllWallets: (offset?: number, limit?: number) => import("mongoose").Query<(import("mongoose").FlattenMaps<import("../models/printables/wallet/user-wallet.model").TuserWallet> & {
    _id: import("mongoose").Types.ObjectId;
})[], import("mongoose").Document<unknown, {}, import("../models/printables/wallet/user-wallet.model").TuserWallet> & import("mongoose").Document<any, any, any> & IuserWallet & {
    _id: import("mongoose").Types.ObjectId;
}, {}, import("../models/printables/wallet/user-wallet.model").TuserWallet, "find">;
export declare const getOneUesrWallet: (userId: string) => import("mongoose").Query<import("mongoose").FlattenMaps<import("../models/printables/wallet/user-wallet.model").TuserWallet> & {
    _id: import("mongoose").Types.ObjectId;
}, import("mongoose").Document<unknown, {}, import("../models/printables/wallet/user-wallet.model").TuserWallet> & import("mongoose").Document<any, any, any> & IuserWallet & {
    _id: import("mongoose").Types.ObjectId;
}, {}, import("../models/printables/wallet/user-wallet.model").TuserWallet, "findOne"> | {
    success: boolean;
    status: number;
    err: string;
};
export declare const delteWalltet: (userId: string) => Promise<{
    success: boolean;
}>;
export declare const deleteAllAssociatedHistory: (userId: string) => Promise<{
    success: boolean;
}>;
export declare const createWalletHistory: (hist: IwalletHistory) => Promise<{
    success: boolean;
}>;
