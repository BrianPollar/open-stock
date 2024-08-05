"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserBehaour = exports.registerCompareList = exports.registerWishList = exports.registerRecents = exports.registerCart = exports.registerSearchParams = exports.remindFromCart = exports.remindFromWishList = exports.isUserHasNoOrders = exports.isExcellentUser = exports.isGoodUser = exports.isPoorUser = exports.ignoreUserDoesNotBuy = exports.getDecoyFromBehaviour = exports.fromRecentRecoendation = exports.onTheFlyRecomendation = exports.todaysRecomendation = void 0;
const item_model_1 = require("../models/item.model");
const user_behaviour_model_1 = require("../models/user-related/user-behaviour.model");
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
const createUserBehaour = async (useBehaviour) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useBehaviour.expireAt = Date.now();
    const behaviour = new user_behaviour_model_1.userBehaviourMain(useBehaviour);
    const newEbahiour = await behaviour.save();
    return newEbahiour;
};
exports.createUserBehaour = createUserBehaour;
//# sourceMappingURL=user-behavoiur.controller.js.map