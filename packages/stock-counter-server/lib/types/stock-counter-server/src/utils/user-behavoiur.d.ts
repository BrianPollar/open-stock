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
import { IuserBehaviour } from '@open-stock/stock-universal';
interface Ifilter {
    _ids: string[];
    newOffset: number;
    newLimit: number;
}
/**
   * Get a filter for items that should be recommended to the user.
   * The filter is based on the user's recent, wishlist, and cart.
   * If the user does not have any of these, a random offset will be used.
   * @param {number} length The number of items to return.
   * @param {string} userCookieId The user's cookie id.
   * @param {string} [userId] The user's id.
   * @returns {Promise<Ifilter>} A promise resolving to a filter object.
   */
export declare const todaysRecomendation: (length: number, userCookieId: string, userId?: string) => Promise<Ifilter>;
/**
   * Get a filter for items that should be recommended to the user.
   * The filter is based on the user's recent, wishlist, and cart.
   * If the user does not have any of these, a random offset will be used.
   * @param {number} length The number of items to return.
   * @param {string} userCookieId The user's cookie id.
   * @param {string} [userId] The user's id.
   * @returns {Promise<Ifilter>} A promise resolving to a filter object.
   */
export declare const onTheFlyRecomendation: (length: number, userCookieId: string, userId?: string) => Promise<Ifilter>;
/**
   * Get a filter for items that should be recommended to the user.
   * The filter is based on the user's recent, wishlist, and cart.
   * If the user does not have any of these, a random offset will be used.
   * @param {number} length The number of items to return.
   * @param {string} userCookieId The user's cookie id.
   * @param {string} [userId] The user's id.
   * @returns {Promise<Ifilter>} A promise resolving to a filter object.
   */
export declare const fromRecentRecoendation: (length: number, userCookieId: string, userId?: string) => Promise<Ifilter>;
/**
   * Get a filter for items that should be recommended to the user.
   * The filter is based on the user's recent, wishlist, and cart.
   * If the user does not have any of these, a random offset will be used.
   * @param {string} userCookieId The user's cookie id.
   * @param {string} [userId] The user's id.
   * @returns {Promise<Ifilter>} A promise resolving to a filter object.
   */
export declare const getDecoyFromBehaviour: (userCookieId: string, userId?: string) => Promise<Ifilter>;
/**
   * Get a filter for items that should be recommended to the user.
   * The filter is based on the user's recent, wishlist, and cart.
   * If the user does not have any of these, a random offset will be used.
   * @param {number} length The number of items to return.
   * @param {string} userCookieId The user's cookie id.
   * @param {string} [userId] The user's id.
   * @returns {Promise<Ifilter>} A promise resolving to a filter object.
   */
export declare const ignoreUserDoesNotBuy: (length: number, userCookieId: string, userId?: string) => Promise<Ifilter>;
/**
   * Get a filter for items that should be recommended to the user.
   * The filter is based on the user's recent, wishlist, and cart.
   * If the user does not have any of these, a random offset will be used.
   * @param {number} length The number of items to return.
   * @param {string} userCookieId The user's cookie id.
   * @param {string} [userId] The user's id.
   * @returns {Promise<Ifilter>} A promise resolving to a filter object.
   */
export declare const isPoorUser: (length: number, userCookieId: string, userId?: string) => Promise<Ifilter>;
/**
   * Get a filter for items that should be recommended to the user.
   * The filter is based on the user's recent, wishlist, and cart.
   * If the user does not have any of these, a random offset will be used.
   * @param {number} length The number of items to return.
   * @param {string} userCookieId The user's cookie id.
   * @param {string} [userId] The user's id.
   * @returns {Promise<Ifilter>} A promise resolving to a filter object.
   */
export declare const isGoodUser: (length: number, userCookieId: string, userId?: string) => Promise<Ifilter>;
/**
   * Get a filter for items that should be recommended to the user.
   * The filter is based on the user's recent, wishlist, and cart.
   * If the user does not have any of these, a random offset will be used.
   * @param {number} length The number of items to return.
   * @param {string} userCookieId The user's cookie id.
   * @param {string} [userId] The user's id.
   * @returns {Promise<Ifilter>} A promise resolving to a filter object.
   */
export declare const isExcellentUser: (length: number, userCookieId: string, userId?: string) => Promise<Ifilter>;
/**
   * Get a filter for items that should be recommended to the user.
   * The filter is based on the user's recent, wishlist, and cart.
   * If the user does not have any of these, a random offset will be used.
   * @param {number} length The number of items to return.
   * @param {string} userCookieId The user's cookie id.
   * @param {string} [userId] The user's id.
   * @returns {Promise<Ifilter>} A promise resolving to a filter object.
   */
export declare const isUserHasNoOrders: (length: number, userCookieId: string, userId?: string) => Promise<Ifilter>;
/**
   * Creates a filter object based on the user's wishlist and recent activity.
   * @param {number} length - The length of the filter array.
   * @param {string} userCookieId - The user's cookie ID.
   * @param {string} [userId] - The user's ID.
   * @returns {Promise<Ifilter>} A promise resolving to a filter object.
   */
export declare const remindFromWishList: (length: number, userCookieId: string, userId?: string) => Promise<Ifilter>;
/**
   * Retrieves a filter object based on the user's cart and returns it.
   * If the user has no items in their cart, it will return an empty filter with a random offset.
   * @param {number} length - The number of items to retrieve.
   * @param {string} userCookieId - The user's cookie ID.
   * @param {string} [userId] - The user's ID.
   * @returns {Promise<Ifilter>} A promise resolving to a filter object.
   */
export declare const remindFromCart: (length: number, userCookieId: string, userId?: string) => Promise<Ifilter>;
/**
   * Registers a search term and its filter in the user's behaviour
   * @param searchTerm the search term that the user used
   * @param seachFilter the filter that the user used
   * @param userCookieId the user's cookie id
   * @param userId the user's id, if available
   * @returns {Promise<{success: boolean}>} A promise resolving to a success object
   */
export declare const registerSearchParams: (searchTerm: string, seachFilter: string, userCookieId: string, userId?: string) => Promise<{
    success: boolean;
}>;
/**
   * Registers a new item in the cart for the user.
   * If the user does not have a cart entry yet, it creates a new cart entry with the item.
   * If the user already has a cart entry, it pushes the item to the existing cart.
   * @param item - The id of the item to add to the cart.
   * @param userCookieId - The cookie id of the user.
   * @param userId - The id of the user.
   * @returns An object with a property `success` set to `true` if the operation was successful.
   */
export declare const registerCart: (item: string, userCookieId: string, userId?: string) => Promise<{
    success: boolean;
}>;
/**
   * Registers a recent item for the given user.
   * If the user already has a recent entry, it pushes the item to the existing recent list.
   * @param item - The id of the item to add to the recent list.
   * @param userCookieId - The cookie id of the user.
   * @param userId - The id of the user.
   * @returns An object with a property `success` set to `true` if the operation was successful.
   */
export declare const registerRecents: (item: string, userCookieId: string, userId?: string) => Promise<{
    success: boolean;
}>;
/**
   * Registers an item in the wishlist of the user.
   *
   * If the user does not exist in the database, a new document will be created with the given item in the wishlist.
   * If the user already exists, the given item will be added to the wishlist.
   *
   * @param item The id of the item to add to the wishlist.
   * @param userCookieId The cookie id of the user.
   * @param userId The id of the user.
   * @returns A promise resolving to an object with a `success`
   * property, which is `true` if the operation was successful.
   */
export declare const registerWishList: (item: string, userCookieId: string, userId?: string) => Promise<{
    success: boolean;
}>;
/**
   * Registers a new item in the compare list for the user.
   * If the user does not have a compare list entry yet, it creates a new compare list entry with the item.
   * If the user already has a compare list entry, it pushes the item to the existing compare list.
   * @param item - The id of the item to add to the compare list.
   * @param userCookieId - The cookie id of the user.
   * @param userId - The id of the user.
   * @returns An object with a property `success` set to `true` if the operation was successful.
   */
export declare const registerCompareList: (item: string, userCookieId: string, userId?: string) => Promise<{
    success: boolean;
}>;
/**
   * Creates a new user behaviour document in the database.
   * @param useBehaviour - The user behaviour data to save.
   * @returns The newly created user behaviour document.
   */
export declare const createUserBehaour: (useBehaviour: Partial<IuserBehaviour>) => Promise<import("mongoose").Document<unknown, {}, import("../models/user-related/user-behaviour.model").TuserBehaviour> & import("mongoose").Document<any, any, any> & IuserBehaviour & import("@open-stock/stock-universal-server").IcompanyIdAsObjectId & {
    _id: import("mongoose").Types.ObjectId;
}>;
export {};
