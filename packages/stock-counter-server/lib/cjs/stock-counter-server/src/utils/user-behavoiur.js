"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserBehaour = exports.registerCompareList = exports.registerWishList = exports.registerRecents = exports.registerCart = exports.registerSearchParams = exports.remindFromCart = exports.remindFromWishList = exports.isUserHasNoOrders = exports.isExcellentUser = exports.isGoodUser = exports.isPoorUser = exports.ignoreUserDoesNotBuy = exports.getDecoyFromBehaviour = exports.fromRecentRecoendation = exports.onTheFlyRecomendation = exports.todaysRecomendation = void 0;
const item_model_1 = require("../models/item.model");
const user_behaviour_model_1 = require("../models/user-related/user-behaviour.model");
/**
   * Get a filter for items that should be recommended to the user.
   * The filter is based on the user's recent, wishlist, and cart.
   * If the user does not have any of these, a random offset will be used.
   * @param {number} length The number of items to return.
   * @param {string} userCookieId The user's cookie id.
   * @param {string} [userId] The user's id.
   * @returns {Promise<Ifilter>} A promise resolving to a filter object.
   */
const todaysRecomendation = async (length, userCookieId, userId) => {
    let behaviourFilter;
    let filter = { ids: [], newOffset: 0, newLimit: 10 };
    if (userId) {
        behaviourFilter = { user: userId };
    }
    else {
        behaviourFilter = { userCookieId };
    }
    const behaviour = await user_behaviour_model_1.userBehaviourLean.findOne(behaviourFilter).lean();
    if (!behaviour) {
        const randomOffset = 0; // Number(makeRandomString(2, 'numbers'));
        filter = { ids: [], newOffset: randomOffset, newLimit: 10 };
    }
    else {
        const { recents, wishList, cart } = behaviour;
        if (recents && recents.length > 0) {
            filter.ids = { ...filter.ids, ...recents };
        }
        if (wishList && wishList.length > 0) {
            filter.ids = { ...filter.ids, ...wishList };
        }
        if (cart && cart.length > 0) {
            filter.ids = { ...filter.ids, ...cart };
        }
    }
    return filter;
};
exports.todaysRecomendation = todaysRecomendation;
/**
   * Get a filter for items that should be recommended to the user.
   * The filter is based on the user's recent, wishlist, and cart.
   * If the user does not have any of these, a random offset will be used.
   * @param {number} length The number of items to return.
   * @param {string} userCookieId The user's cookie id.
   * @param {string} [userId] The user's id.
   * @returns {Promise<Ifilter>} A promise resolving to a filter object.
   */
const onTheFlyRecomendation = async (length, userCookieId, userId) => {
    let behaviourFilter;
    let filter = { ids: [], newOffset: 0, newLimit: 10 };
    if (userId) {
        behaviourFilter = { user: userId };
    }
    else {
        behaviourFilter = { userCookieId };
    }
    const behaviour = await user_behaviour_model_1.userBehaviourLean.findOne(behaviourFilter).lean();
    if (!behaviour) {
        const randomOffset = 0; // Number(makeRandomString(2, 'numbers'));
        filter = { ids: [], newOffset: randomOffset, newLimit: 10 };
    }
    else {
        const { recents, wishList, cart } = behaviour;
        if (recents && recents.length > 0) {
            filter.ids = { ...filter.ids, ...recents };
        }
        if (wishList && wishList.length > 0) {
            filter.ids = { ...filter.ids, ...wishList };
        }
        if (cart && cart.length > 0) {
            filter.ids = { ...filter.ids, ...cart };
        }
    }
    return filter;
};
exports.onTheFlyRecomendation = onTheFlyRecomendation;
/**
   * Get a filter for items that should be recommended to the user.
   * The filter is based on the user's recent, wishlist, and cart.
   * If the user does not have any of these, a random offset will be used.
   * @param {number} length The number of items to return.
   * @param {string} userCookieId The user's cookie id.
   * @param {string} [userId] The user's id.
   * @returns {Promise<Ifilter>} A promise resolving to a filter object.
   */
const fromRecentRecoendation = async (length, userCookieId, userId) => {
    let behaviourFilter;
    let filter = { ids: [], newOffset: 0, newLimit: 10 };
    if (userId) {
        behaviourFilter = { user: userId };
    }
    else {
        behaviourFilter = { userCookieId };
    }
    const behaviour = await user_behaviour_model_1.userBehaviourLean.findOne(behaviourFilter).lean();
    if (!behaviour) {
        const randomOffset = 0; // Number(makeRandomString(2, 'numbers'));
        filter = { ids: [], newOffset: randomOffset, newLimit: 10 };
    }
    else {
        const { recents, wishList, cart } = behaviour;
        if (recents && recents.length > 0) {
            filter.ids = { ...filter.ids, ...recents };
        }
        if (wishList && wishList.length > 0) {
            filter.ids = { ...filter.ids, ...wishList };
        }
        if (cart && cart.length > 0) {
            filter.ids = { ...filter.ids, ...cart };
        }
    }
    return filter;
};
exports.fromRecentRecoendation = fromRecentRecoendation;
/**
   * Get a filter for items that should be recommended to the user.
   * The filter is based on the user's recent, wishlist, and cart.
   * If the user does not have any of these, a random offset will be used.
   * @param {string} userCookieId The user's cookie id.
   * @param {string} [userId] The user's id.
   * @returns {Promise<Ifilter>} A promise resolving to a filter object.
   */
const getDecoyFromBehaviour = async (userCookieId, userId) => {
    let behaviourFilter;
    let filter = { ids: [], newOffset: 0, newLimit: 10 };
    if (userId) {
        behaviourFilter = { user: userId };
    }
    else {
        behaviourFilter = { userCookieId };
    }
    const behaviour = await user_behaviour_model_1.userBehaviourLean.findOne(behaviourFilter).lean();
    if (!behaviour) {
        const randomOffset = 0; // Number(makeRandomString(2, 'numbers'));
        filter = { ids: [], newOffset: randomOffset, newLimit: 10 };
    }
    else {
        const { recents, wishList, cart } = behaviour;
        if (recents && recents.length > 0) {
            filter.ids = { ...filter.ids, ...recents };
        }
        if (wishList && wishList.length > 0) {
            filter.ids = { ...filter.ids, ...wishList };
        }
        if (cart && cart.length > 0) {
            filter.ids = { ...filter.ids, ...cart };
        }
    }
    return filter;
};
exports.getDecoyFromBehaviour = getDecoyFromBehaviour;
/**
   * Get a filter for items that should be recommended to the user.
   * The filter is based on the user's recent, wishlist, and cart.
   * If the user does not have any of these, a random offset will be used.
   * @param {number} length The number of items to return.
   * @param {string} userCookieId The user's cookie id.
   * @param {string} [userId] The user's id.
   * @returns {Promise<Ifilter>} A promise resolving to a filter object.
   */
const ignoreUserDoesNotBuy = async (length, userCookieId, userId) => {
    let behaviourFilter;
    let filter = { ids: [], newOffset: 0, newLimit: 10 };
    if (userId) {
        behaviourFilter = { user: userId };
    }
    else {
        behaviourFilter = { userCookieId };
    }
    const behaviour = await user_behaviour_model_1.userBehaviourLean.findOne(behaviourFilter).lean();
    if (!behaviour) {
        const randomOffset = 0; // Number(makeRandomString(2, 'numbers'));
        filter = { ids: [], newOffset: randomOffset, newLimit: 10 };
    }
    else {
        const { recents, wishList, cart } = behaviour;
        if (recents && recents.length > 0) {
            filter.ids = { ...filter.ids, ...recents };
        }
        if (wishList && wishList.length > 0) {
            filter.ids = { ...filter.ids, ...wishList };
        }
        if (cart && cart.length > 0) {
            filter.ids = { ...filter.ids, ...cart };
        }
    }
    return filter;
};
exports.ignoreUserDoesNotBuy = ignoreUserDoesNotBuy;
/**
   * Get a filter for items that should be recommended to the user.
   * The filter is based on the user's recent, wishlist, and cart.
   * If the user does not have any of these, a random offset will be used.
   * @param {number} length The number of items to return.
   * @param {string} userCookieId The user's cookie id.
   * @param {string} [userId] The user's id.
   * @returns {Promise<Ifilter>} A promise resolving to a filter object.
   */
const isPoorUser = async (length, userCookieId, userId) => {
    let behaviourFilter;
    let filter = { ids: [], newOffset: 0, newLimit: 10 };
    if (userId) {
        behaviourFilter = { user: userId };
    }
    else {
        behaviourFilter = { userCookieId };
    }
    const behaviour = await user_behaviour_model_1.userBehaviourLean.findOne(behaviourFilter).lean();
    if (!behaviour) {
        const randomOffset = 0; // Number(makeRandomString(2, 'numbers'));
        filter = { ids: [], newOffset: randomOffset, newLimit: 10 };
    }
    else {
        const { recents, wishList, cart } = behaviour;
        if (recents && recents.length > 0) {
            filter.ids = { ...filter.ids, ...recents };
        }
        if (wishList && wishList.length > 0) {
            filter.ids = { ...filter.ids, ...wishList };
        }
        if (cart && cart.length > 0) {
            filter.ids = { ...filter.ids, ...cart };
        }
    }
    return filter;
};
exports.isPoorUser = isPoorUser;
/**
   * Get a filter for items that should be recommended to the user.
   * The filter is based on the user's recent, wishlist, and cart.
   * If the user does not have any of these, a random offset will be used.
   * @param {number} length The number of items to return.
   * @param {string} userCookieId The user's cookie id.
   * @param {string} [userId] The user's id.
   * @returns {Promise<Ifilter>} A promise resolving to a filter object.
   */
const isGoodUser = async (length, userCookieId, userId) => {
    let behaviourFilter;
    let filter = { ids: [], newOffset: 0, newLimit: 10 };
    if (userId) {
        behaviourFilter = { user: userId };
    }
    else {
        behaviourFilter = { userCookieId };
    }
    const behaviour = await user_behaviour_model_1.userBehaviourLean.findOne(behaviourFilter).lean();
    if (!behaviour) {
        const randomOffset = 0; // Number(makeRandomString(2, 'numbers'));
        filter = { ids: [], newOffset: randomOffset, newLimit: 10 };
    }
    else {
        const { recents, wishList, cart } = behaviour;
        if (recents && recents.length > 0) {
            filter.ids = { ...filter.ids, ...recents };
        }
        if (wishList && wishList.length > 0) {
            filter.ids = { ...filter.ids, ...wishList };
        }
        if (cart && cart.length > 0) {
            filter.ids = { ...filter.ids, ...cart };
        }
    }
    return filter;
};
exports.isGoodUser = isGoodUser;
/**
   * Get a filter for items that should be recommended to the user.
   * The filter is based on the user's recent, wishlist, and cart.
   * If the user does not have any of these, a random offset will be used.
   * @param {number} length The number of items to return.
   * @param {string} userCookieId The user's cookie id.
   * @param {string} [userId] The user's id.
   * @returns {Promise<Ifilter>} A promise resolving to a filter object.
   */
const isExcellentUser = async (length, userCookieId, userId) => {
    let behaviourFilter;
    let filter = { ids: [], newOffset: 0, newLimit: 10 };
    if (userId) {
        behaviourFilter = { user: userId };
    }
    else {
        behaviourFilter = { userCookieId };
    }
    const behaviour = await user_behaviour_model_1.userBehaviourLean.findOne(behaviourFilter).lean();
    if (!behaviour) {
        const randomOffset = 0; // Number(makeRandomString(2, 'numbers'));
        filter = { ids: [], newOffset: randomOffset, newLimit: 10 };
    }
    else {
        const { recents, wishList, cart } = behaviour;
        if (recents && recents.length > 0) {
            filter.ids = { ...filter.ids, ...recents };
        }
        if (wishList && wishList.length > 0) {
            filter.ids = { ...filter.ids, ...wishList };
        }
        if (cart && cart.length > 0) {
            filter.ids = { ...filter.ids, ...cart };
        }
    }
    return filter;
};
exports.isExcellentUser = isExcellentUser;
/**
   * Get a filter for items that should be recommended to the user.
   * The filter is based on the user's recent, wishlist, and cart.
   * If the user does not have any of these, a random offset will be used.
   * @param {number} length The number of items to return.
   * @param {string} userCookieId The user's cookie id.
   * @param {string} [userId] The user's id.
   * @returns {Promise<Ifilter>} A promise resolving to a filter object.
   */
const isUserHasNoOrders = async (length, userCookieId, userId) => {
    let behaviourFilter;
    let filter = { ids: [], newOffset: 0, newLimit: 10 };
    if (userId) {
        behaviourFilter = { user: userId };
    }
    else {
        behaviourFilter = { userCookieId };
    }
    const behaviour = await user_behaviour_model_1.userBehaviourLean.findOne(behaviourFilter).lean();
    if (!behaviour) {
        const randomOffset = 0; // Number(makeRandomString(2, 'numbers'));
        filter = { ids: [], newOffset: randomOffset, newLimit: 10 };
    }
    else {
        const { recents, wishList, cart } = behaviour;
        if (recents && recents.length > 0) {
            filter.ids = { ...filter.ids, ...recents };
        }
        if (wishList && wishList.length > 0) {
            filter.ids = { ...filter.ids, ...wishList };
        }
        if (cart && cart.length > 0) {
            filter.ids = { ...filter.ids, ...cart };
        }
    }
    return filter;
};
exports.isUserHasNoOrders = isUserHasNoOrders;
/**
   * Creates a filter object based on the user's wishlist and recent activity.
   * @param {number} length - The length of the filter array.
   * @param {string} userCookieId - The user's cookie ID.
   * @param {string} [userId] - The user's ID.
   * @returns {Promise<Ifilter>} A promise resolving to a filter object.
   */
const remindFromWishList = async (length, userCookieId, userId) => {
    let behaviourFilter;
    let filter = { ids: [], newOffset: 0, newLimit: 10 };
    if (userId) {
        behaviourFilter = { user: userId };
    }
    else {
        behaviourFilter = { userCookieId };
    }
    const behaviour = await user_behaviour_model_1.userBehaviourLean.findOne(behaviourFilter).lean();
    if (!behaviour) {
        const randomOffset = 0; // Number(makeRandomString(2, 'numbers'));
        filter = { ids: [], newOffset: randomOffset, newLimit: 10 };
    }
    else {
        const { recents, wishList, cart } = behaviour;
        if (recents && recents.length > 0) {
            filter.ids = { ...filter.ids, ...recents };
        }
        if (wishList && wishList.length > 0) {
            filter.ids = { ...filter.ids, ...wishList };
        }
        if (cart && cart.length > 0) {
            filter.ids = { ...filter.ids, ...cart };
        }
    }
    return filter;
};
exports.remindFromWishList = remindFromWishList;
/**
   * Retrieves a filter object based on the user's cart and returns it. If the user has no items in their cart, it will return an empty filter with a random offset.
   * @param {number} length - The number of items to retrieve.
   * @param {string} userCookieId - The user's cookie ID.
   * @param {string} [userId] - The user's ID.
   * @returns {Promise<Ifilter>} A promise resolving to a filter object.
   */
const remindFromCart = async (length, userCookieId, userId) => {
    let behaviourFilter;
    let filter = { ids: [], newOffset: 0, newLimit: 10 };
    if (userId) {
        behaviourFilter = { user: userId };
    }
    else {
        behaviourFilter = { userCookieId };
    }
    const behaviour = await user_behaviour_model_1.userBehaviourLean.findOne(behaviourFilter).lean();
    if (!behaviour) {
        const randomOffset = 0; // Number(makeRandomString(2, 'numbers'));
        filter = { ids: [], newOffset: randomOffset, newLimit: 10 };
    }
    else {
        const { recents, wishList, cart } = behaviour;
        if (recents && recents.length > 0) {
            filter.ids = { ...filter.ids, ...recents };
        }
        if (wishList && wishList.length > 0) {
            filter.ids = { ...filter.ids, ...wishList };
        }
        if (cart && cart.length > 0) {
            filter.ids = { ...filter.ids, ...cart };
        }
    }
    return filter;
};
exports.remindFromCart = remindFromCart;
/**
   * Registers a search term and its filter in the user's behaviour
   * @param searchTerm the search term that the user used
   * @param seachFilter the filter that the user used
   * @param userCookieId the user's cookie id
   * @param userId the user's id, if available
   * @returns {Promise<{success: boolean}>} A promise resolving to a success object
   */
const registerSearchParams = async (searchTerm, seachFilter, userCookieId, userId) => {
    let filter;
    if (userId) {
        filter = { user: userId };
    }
    else {
        filter = { userCookieId };
    }
    const found = await user_behaviour_model_1.userBehaviourMain.findOne(filter);
    if (!found) {
        const useBehaviour = {
            user: userId,
            userCookieId,
            recents: [],
            cart: [],
            wishList: [],
            compareList: [],
            searchTerms: [{ term: searchTerm, filter: seachFilter }]
        };
        await (0, exports.createUserBehaour)(useBehaviour);
        return { success: true };
    }
    const terms = found.searchTerms || [];
    terms.push({ term: searchTerm, filter: seachFilter });
    found.searchTerms = terms;
    await found.save();
    return { success: true };
};
exports.registerSearchParams = registerSearchParams;
/**
   * Registers a new item in the cart for the user.
   * If the user does not have a cart entry yet, it creates a new cart entry with the item.
   * If the user already has a cart entry, it pushes the item to the existing cart.
   * @param item - The id of the item to add to the cart.
   * @param userCookieId - The cookie id of the user.
   * @param userId - The id of the user.
   * @returns An object with a property `success` set to `true` if the operation was successful.
   */
const registerCart = async (item, userCookieId, userId) => {
    let filter;
    if (userId) {
        filter = { user: userId };
    }
    else {
        filter = { userCookieId };
    }
    const found = await user_behaviour_model_1.userBehaviourMain.findOne(filter);
    if (!found) {
        const useBehaviour = {
            user: userId,
            userCookieId,
            recents: [],
            cart: [item],
            wishList: [],
            compareList: [],
            searchTerms: []
        };
        await (0, exports.createUserBehaour)(useBehaviour);
        return { success: true };
    }
    const cart = (found.cart || []);
    cart.push(item);
    found.cart = cart;
    await found.save();
    return { success: true };
};
exports.registerCart = registerCart;
/**
   * Registers a recent item for the given user.
   * If the user already has a recent entry, it pushes the item to the existing recent list.
   * @param item - The id of the item to add to the recent list.
   * @param userCookieId - The cookie id of the user.
   * @param userId - The id of the user.
   * @returns An object with a property `success` set to `true` if the operation was successful.
   */
const registerRecents = async (item, userCookieId, userId) => {
    let filter;
    if (userId) {
        filter = { user: userId };
    }
    else {
        filter = { userCookieId };
    }
    const found = await user_behaviour_model_1.userBehaviourMain.findOne(filter);
    if (!found) {
        const useBehaviour = {
            user: userId,
            userCookieId,
            recents: [item],
            cart: [],
            wishList: [],
            compareList: [],
            searchTerms: []
        };
        await (0, exports.createUserBehaour)(useBehaviour);
        return { success: true };
    }
    const recents = (found.recents || []);
    recents.push(item);
    found.recents = recents;
    await found.save();
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const foundItem = await item_model_1.itemMain.findOne({ _id: item });
    if (foundItem) {
        foundItem.timesViewed += 1;
        await foundItem.save();
    }
    return { success: true };
};
exports.registerRecents = registerRecents;
/**
   * Registers an item in the wishlist of the user.
   *
   * If the user does not exist in the database, a new document will be created with the given item in the wishlist.
   * If the user already exists, the given item will be added to the wishlist.
   *
   * @param item The id of the item to add to the wishlist.
   * @param userCookieId The cookie id of the user.
   * @param userId The id of the user.
   * @returns A promise resolving to an object with a `success` property, which is `true` if the operation was successful.
   */
const registerWishList = async (item, userCookieId, userId) => {
    let filter;
    if (userId) {
        filter = { user: userId };
    }
    else {
        filter = { userCookieId };
    }
    const found = await user_behaviour_model_1.userBehaviourMain.findOne(filter);
    if (!found) {
        const useBehaviour = {
            user: userId,
            userCookieId,
            recents: [],
            cart: [],
            wishList: [item],
            compareList: [],
            searchTerms: []
        };
        await (0, exports.createUserBehaour)(useBehaviour);
        return { success: true };
    }
    const wishList = (found.wishList || []);
    wishList.push(item);
    found.wishList = wishList;
    await found.save();
    return { success: true };
};
exports.registerWishList = registerWishList;
/**
   * Registers a new item in the compare list for the user.
   * If the user does not have a compare list entry yet, it creates a new compare list entry with the item.
   * If the user already has a compare list entry, it pushes the item to the existing compare list.
   * @param item - The id of the item to add to the compare list.
   * @param userCookieId - The cookie id of the user.
   * @param userId - The id of the user.
   * @returns An object with a property `success` set to `true` if the operation was successful.
   */
const registerCompareList = async (item, userCookieId, userId) => {
    let filter;
    if (userId) {
        filter = { user: userId };
    }
    else {
        filter = { userCookieId };
    }
    let found = await user_behaviour_model_1.userBehaviourMain.findOne(filter);
    if (!found) {
        const useBehaviour = {
            user: userId,
            userCookieId,
            recents: [],
            cart: [],
            wishList: [],
            compareList: [item],
            searchTerms: []
        };
        found = await (0, exports.createUserBehaour)(useBehaviour);
        return { success: true };
    }
    const compareList = (found.compareList || []);
    compareList.push(item);
    found.compareList = compareList;
    await found.save();
    return { success: true };
};
exports.registerCompareList = registerCompareList;
/**
   * Creates a new user behaviour document in the database.
   * @param useBehaviour - The user behaviour data to save.
   * @returns The newly created user behaviour document.
   */
const createUserBehaour = async (useBehaviour) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useBehaviour.expireAt = Date.now();
    const behaviour = new user_behaviour_model_1.userBehaviourMain(useBehaviour);
    const newEbahiour = await behaviour.save();
    return newEbahiour;
};
exports.createUserBehaour = createUserBehaour;
//# sourceMappingURL=user-behavoiur.js.map