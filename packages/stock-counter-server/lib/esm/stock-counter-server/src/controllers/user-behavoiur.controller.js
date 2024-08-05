import { itemMain } from '../models/item.model';
import { userBehaviourLean, userBehaviourMain } from '../models/user-related/user-behaviour.model';
export const todaysRecomendation = async (length, userCookieId, userId) => {
    let behaviourFilter;
    let filter = { ids: [], newOffset: 0, newLimit: 10 };
    if (userId) {
        behaviourFilter = { user: userId };
    }
    else {
        behaviourFilter = { userCookieId };
    }
    const behaviour = await userBehaviourLean.findOne(behaviourFilter).lean();
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
export const onTheFlyRecomendation = async (length, userCookieId, userId) => {
    let behaviourFilter;
    let filter = { ids: [], newOffset: 0, newLimit: 10 };
    if (userId) {
        behaviourFilter = { user: userId };
    }
    else {
        behaviourFilter = { userCookieId };
    }
    const behaviour = await userBehaviourLean.findOne(behaviourFilter).lean();
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
export const fromRecentRecoendation = async (length, userCookieId, userId) => {
    let behaviourFilter;
    let filter = { ids: [], newOffset: 0, newLimit: 10 };
    if (userId) {
        behaviourFilter = { user: userId };
    }
    else {
        behaviourFilter = { userCookieId };
    }
    const behaviour = await userBehaviourLean.findOne(behaviourFilter).lean();
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
export const getDecoyFromBehaviour = async (userCookieId, userId) => {
    let behaviourFilter;
    let filter = { ids: [], newOffset: 0, newLimit: 10 };
    if (userId) {
        behaviourFilter = { user: userId };
    }
    else {
        behaviourFilter = { userCookieId };
    }
    const behaviour = await userBehaviourLean.findOne(behaviourFilter).lean();
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
export const ignoreUserDoesNotBuy = async (length, userCookieId, userId) => {
    let behaviourFilter;
    let filter = { ids: [], newOffset: 0, newLimit: 10 };
    if (userId) {
        behaviourFilter = { user: userId };
    }
    else {
        behaviourFilter = { userCookieId };
    }
    const behaviour = await userBehaviourLean.findOne(behaviourFilter).lean();
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
export const isPoorUser = async (length, userCookieId, userId) => {
    let behaviourFilter;
    let filter = { ids: [], newOffset: 0, newLimit: 10 };
    if (userId) {
        behaviourFilter = { user: userId };
    }
    else {
        behaviourFilter = { userCookieId };
    }
    const behaviour = await userBehaviourLean.findOne(behaviourFilter).lean();
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
export const isGoodUser = async (length, userCookieId, userId) => {
    let behaviourFilter;
    let filter = { ids: [], newOffset: 0, newLimit: 10 };
    if (userId) {
        behaviourFilter = { user: userId };
    }
    else {
        behaviourFilter = { userCookieId };
    }
    const behaviour = await userBehaviourLean.findOne(behaviourFilter).lean();
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
export const isExcellentUser = async (length, userCookieId, userId) => {
    let behaviourFilter;
    let filter = { ids: [], newOffset: 0, newLimit: 10 };
    if (userId) {
        behaviourFilter = { user: userId };
    }
    else {
        behaviourFilter = { userCookieId };
    }
    const behaviour = await userBehaviourLean.findOne(behaviourFilter).lean();
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
export const isUserHasNoOrders = async (length, userCookieId, userId) => {
    let behaviourFilter;
    let filter = { ids: [], newOffset: 0, newLimit: 10 };
    if (userId) {
        behaviourFilter = { user: userId };
    }
    else {
        behaviourFilter = { userCookieId };
    }
    const behaviour = await userBehaviourLean.findOne(behaviourFilter).lean();
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
export const remindFromWishList = async (length, userCookieId, userId) => {
    let behaviourFilter;
    let filter = { ids: [], newOffset: 0, newLimit: 10 };
    if (userId) {
        behaviourFilter = { user: userId };
    }
    else {
        behaviourFilter = { userCookieId };
    }
    const behaviour = await userBehaviourLean.findOne(behaviourFilter).lean();
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
export const remindFromCart = async (length, userCookieId, userId) => {
    let behaviourFilter;
    let filter = { ids: [], newOffset: 0, newLimit: 10 };
    if (userId) {
        behaviourFilter = { user: userId };
    }
    else {
        behaviourFilter = { userCookieId };
    }
    const behaviour = await userBehaviourLean.findOne(behaviourFilter).lean();
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
export const registerSearchParams = async (searchTerm, seachFilter, userCookieId, userId) => {
    let filter;
    if (userId) {
        filter = { user: userId };
    }
    else {
        filter = { userCookieId };
    }
    const found = await userBehaviourMain.findOne(filter);
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
        await createUserBehaour(useBehaviour);
        return { success: true };
    }
    const terms = found.searchTerms || [];
    terms.push({ term: searchTerm, filter: seachFilter });
    found.searchTerms = terms;
    await found.save();
    return { success: true };
};
export const registerCart = async (item, userCookieId, userId) => {
    let filter;
    if (userId) {
        filter = { user: userId };
    }
    else {
        filter = { userCookieId };
    }
    const found = await userBehaviourMain.findOne(filter);
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
        await createUserBehaour(useBehaviour);
        return { success: true };
    }
    const cart = (found.cart || []);
    cart.push(item);
    found.cart = cart;
    await found.save();
    return { success: true };
};
export const registerRecents = async (item, userCookieId, userId) => {
    let filter;
    if (userId) {
        filter = { user: userId };
    }
    else {
        filter = { userCookieId };
    }
    const found = await userBehaviourMain.findOne(filter);
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
        await createUserBehaour(useBehaviour);
        return { success: true };
    }
    const recents = (found.recents || []);
    recents.push(item);
    found.recents = recents;
    await found.save();
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const foundItem = await itemMain.findOne({ _id: item });
    if (foundItem) {
        foundItem.timesViewed += 1;
        await foundItem.save();
    }
    return { success: true };
};
export const registerWishList = async (item, userCookieId, userId) => {
    let filter;
    if (userId) {
        filter = { user: userId };
    }
    else {
        filter = { userCookieId };
    }
    const found = await userBehaviourMain.findOne(filter);
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
        await createUserBehaour(useBehaviour);
        return { success: true };
    }
    const wishList = (found.wishList || []);
    wishList.push(item);
    found.wishList = wishList;
    await found.save();
    return { success: true };
};
export const registerCompareList = async (item, userCookieId, userId) => {
    let filter;
    if (userId) {
        filter = { user: userId };
    }
    else {
        filter = { userCookieId };
    }
    let found = await userBehaviourMain.findOne(filter);
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
        found = await createUserBehaour(useBehaviour);
        return { success: true };
    }
    const compareList = (found.compareList || []);
    compareList.push(item);
    found.compareList = compareList;
    await found.save();
    return { success: true };
};
export const createUserBehaour = async (useBehaviour) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useBehaviour.expireAt = Date.now();
    const behaviour = new userBehaviourMain(useBehaviour);
    const newEbahiour = await behaviour.save();
    return newEbahiour;
};
//# sourceMappingURL=user-behavoiur.controller.js.map