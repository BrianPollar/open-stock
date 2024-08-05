import { IuserBehaviour } from '@open-stock/stock-universal';
import { itemMain } from '../models/item.model';
import { userBehaviourLean, userBehaviourMain } from '../models/user-related/user-behaviour.model';

interface Ifilter {
  ids: string[];
  newOffset: number;
  newLimit: number;
}
export const todaysRecomendation = async(
  length: number,
  userCookieId: string,
  userId?: string
) => {
  let behaviourFilter;
  let filter: Ifilter = { ids: [], newOffset: 0, newLimit: 10 };

  if (userId) {
    behaviourFilter = { user: userId };
  } else {
    behaviourFilter = { userCookieId };
  }
  const behaviour = await userBehaviourLean.findOne(behaviourFilter).lean();

  if (!behaviour) {
    const randomOffset = 0;// Number(makeRandomString(2, 'numbers'));

    filter = { ids: [], newOffset: randomOffset, newLimit: 10 };
  } else {
    const { recents, wishList, cart } = behaviour;

    if (recents && recents.length > 0) {
      filter.ids = { ...filter.ids, ...recents as string[] };
    }

    if (wishList && wishList.length > 0) {
      filter.ids = { ...filter.ids, ...wishList as string[] };
    }

    if (cart && cart.length > 0) {
      filter.ids = { ...filter.ids, ...cart as string[] };
    }
  }

  return filter;
};

export const onTheFlyRecomendation = async(
  length: number,
  userCookieId: string,
  userId?: string
) => {
  let behaviourFilter;
  let filter: Ifilter = { ids: [], newOffset: 0, newLimit: 10 };

  if (userId) {
    behaviourFilter = { user: userId };
  } else {
    behaviourFilter = { userCookieId };
  }
  const behaviour = await userBehaviourLean.findOne(behaviourFilter).lean();

  if (!behaviour) {
    const randomOffset = 0;// Number(makeRandomString(2, 'numbers'));

    filter = { ids: [], newOffset: randomOffset, newLimit: 10 };
  } else {
    const { recents, wishList, cart } = behaviour;

    if (recents && recents.length > 0) {
      filter.ids = { ...filter.ids, ...recents as string[] };
    }

    if (wishList && wishList.length > 0) {
      filter.ids = { ...filter.ids, ...wishList as string[] };
    }

    if (cart && cart.length > 0) {
      filter.ids = { ...filter.ids, ...cart as string[] };
    }
  }

  return filter;
};

export const fromRecentRecoendation = async(
  length: number,
  userCookieId: string,
  userId?: string
) => {
  let behaviourFilter;
  let filter: Ifilter = { ids: [], newOffset: 0, newLimit: 10 };

  if (userId) {
    behaviourFilter = { user: userId };
  } else {
    behaviourFilter = { userCookieId };
  }
  const behaviour = await userBehaviourLean.findOne(behaviourFilter).lean();

  if (!behaviour) {
    const randomOffset = 0; // Number(makeRandomString(2, 'numbers'));

    filter = { ids: [], newOffset: randomOffset, newLimit: 10 };
  } else {
    const { recents, wishList, cart } = behaviour;

    if (recents && recents.length > 0) {
      filter.ids = { ...filter.ids, ...recents as string[] };
    }

    if (wishList && wishList.length > 0) {
      filter.ids = { ...filter.ids, ...wishList as string[] };
    }

    if (cart && cart.length > 0) {
      filter.ids = { ...filter.ids, ...cart as string[] };
    }
  }

  return filter;
};


export const getDecoyFromBehaviour = async(
  userCookieId: string,
  userId?: string
) => {
  let behaviourFilter;
  let filter: Ifilter = { ids: [], newOffset: 0, newLimit: 10 };

  if (userId) {
    behaviourFilter = { user: userId };
  } else {
    behaviourFilter = { userCookieId };
  }
  const behaviour = await userBehaviourLean.findOne(behaviourFilter).lean();

  if (!behaviour) {
    const randomOffset = 0; // Number(makeRandomString(2, 'numbers'));

    filter = { ids: [], newOffset: randomOffset, newLimit: 10 };
  } else {
    const { recents, wishList, cart } = behaviour;

    if (recents && recents.length > 0) {
      filter.ids = { ...filter.ids, ...recents as string[] };
    }

    if (wishList && wishList.length > 0) {
      filter.ids = { ...filter.ids, ...wishList as string[] };
    }

    if (cart && cart.length > 0) {
      filter.ids = { ...filter.ids, ...cart as string[] };
    }
  }

  return filter;
};

export const ignoreUserDoesNotBuy = async(
  length: number,
  userCookieId: string,
  userId?: string
) => {
  let behaviourFilter;
  let filter: Ifilter = { ids: [], newOffset: 0, newLimit: 10 };

  if (userId) {
    behaviourFilter = { user: userId };
  } else {
    behaviourFilter = { userCookieId };
  }
  const behaviour = await userBehaviourLean.findOne(behaviourFilter).lean();

  if (!behaviour) {
    const randomOffset = 0; // Number(makeRandomString(2, 'numbers'));

    filter = { ids: [], newOffset: randomOffset, newLimit: 10 };
  } else {
    const { recents, wishList, cart } = behaviour;

    if (recents && recents.length > 0) {
      filter.ids = { ...filter.ids, ...recents as string[] };
    }

    if (wishList && wishList.length > 0) {
      filter.ids = { ...filter.ids, ...wishList as string[] };
    }

    if (cart && cart.length > 0) {
      filter.ids = { ...filter.ids, ...cart as string[] };
    }
  }

  return filter;
};

export const isPoorUser = async(
  length: number,
  userCookieId: string,
  userId?: string
) => {
  let behaviourFilter;
  let filter: Ifilter = { ids: [], newOffset: 0, newLimit: 10 };

  if (userId) {
    behaviourFilter = { user: userId };
  } else {
    behaviourFilter = { userCookieId };
  }
  const behaviour = await userBehaviourLean.findOne(behaviourFilter).lean();

  if (!behaviour) {
    const randomOffset = 0; // Number(makeRandomString(2, 'numbers'));

    filter = { ids: [], newOffset: randomOffset, newLimit: 10 };
  } else {
    const { recents, wishList, cart } = behaviour;

    if (recents && recents.length > 0) {
      filter.ids = { ...filter.ids, ...recents as string[] };
    }

    if (wishList && wishList.length > 0) {
      filter.ids = { ...filter.ids, ...wishList as string[] };
    }

    if (cart && cart.length > 0) {
      filter.ids = { ...filter.ids, ...cart as string[] };
    }
  }

  return filter;
};

export const isGoodUser = async(
  length: number,
  userCookieId: string,
  userId?: string
) => {
  let behaviourFilter;
  let filter: Ifilter = { ids: [], newOffset: 0, newLimit: 10 };

  if (userId) {
    behaviourFilter = { user: userId };
  } else {
    behaviourFilter = { userCookieId };
  }
  const behaviour = await userBehaviourLean.findOne(behaviourFilter).lean();

  if (!behaviour) {
    const randomOffset = 0;// Number(makeRandomString(2, 'numbers'));

    filter = { ids: [], newOffset: randomOffset, newLimit: 10 };
  } else {
    const { recents, wishList, cart } = behaviour;

    if (recents && recents.length > 0) {
      filter.ids = { ...filter.ids, ...recents as string[] };
    }

    if (wishList && wishList.length > 0) {
      filter.ids = { ...filter.ids, ...wishList as string[] };
    }

    if (cart && cart.length > 0) {
      filter.ids = { ...filter.ids, ...cart as string[] };
    }
  }

  return filter;
};

export const isExcellentUser = async(
  length: number,
  userCookieId: string,
  userId?: string
) => {
  let behaviourFilter;
  let filter: Ifilter = { ids: [], newOffset: 0, newLimit: 10 };

  if (userId) {
    behaviourFilter = { user: userId };
  } else {
    behaviourFilter = { userCookieId };
  }
  const behaviour = await userBehaviourLean.findOne(behaviourFilter).lean();

  if (!behaviour) {
    const randomOffset = 0; // Number(makeRandomString(2, 'numbers'));

    filter = { ids: [], newOffset: randomOffset, newLimit: 10 };
  } else {
    const { recents, wishList, cart } = behaviour;

    if (recents && recents.length > 0) {
      filter.ids = { ...filter.ids, ...recents as string[] };
    }

    if (wishList && wishList.length > 0) {
      filter.ids = { ...filter.ids, ...wishList as string[] };
    }

    if (cart && cart.length > 0) {
      filter.ids = { ...filter.ids, ...cart as string[] };
    }
  }

  return filter;
};

export const isUserHasNoOrders = async(
  length: number,
  userCookieId: string,
  userId?: string
) => {
  let behaviourFilter;
  let filter: Ifilter = { ids: [], newOffset: 0, newLimit: 10 };

  if (userId) {
    behaviourFilter = { user: userId };
  } else {
    behaviourFilter = { userCookieId };
  }
  const behaviour = await userBehaviourLean.findOne(behaviourFilter).lean();

  if (!behaviour) {
    const randomOffset = 0; // Number(makeRandomString(2, 'numbers'));

    filter = { ids: [], newOffset: randomOffset, newLimit: 10 };
  } else {
    const { recents, wishList, cart } = behaviour;

    if (recents && recents.length > 0) {
      filter.ids = { ...filter.ids, ...recents as string[] };
    }

    if (wishList && wishList.length > 0) {
      filter.ids = { ...filter.ids, ...wishList as string[] };
    }

    if (cart && cart.length > 0) {
      filter.ids = { ...filter.ids, ...cart as string[] };
    }
  }

  return filter;
};

export const remindFromWishList = async(
  length: number,
  userCookieId: string,
  userId?: string
) => {
  let behaviourFilter;
  let filter: Ifilter = { ids: [], newOffset: 0, newLimit: 10 };

  if (userId) {
    behaviourFilter = { user: userId };
  } else {
    behaviourFilter = { userCookieId };
  }
  const behaviour = await userBehaviourLean.findOne(behaviourFilter).lean();

  if (!behaviour) {
    const randomOffset = 0; // Number(makeRandomString(2, 'numbers'));

    filter = { ids: [], newOffset: randomOffset, newLimit: 10 };
  } else {
    const { recents, wishList, cart } = behaviour;

    if (recents && recents.length > 0) {
      filter.ids = { ...filter.ids, ...recents as string[] };
    }

    if (wishList && wishList.length > 0) {
      filter.ids = { ...filter.ids, ...wishList as string[] };
    }

    if (cart && cart.length > 0) {
      filter.ids = { ...filter.ids, ...cart as string[] };
    }
  }

  return filter;
};

export const remindFromCart = async(
  length: number,
  userCookieId: string,
  userId?: string
) => {
  let behaviourFilter;
  let filter: Ifilter = { ids: [], newOffset: 0, newLimit: 10 };

  if (userId) {
    behaviourFilter = { user: userId };
  } else {
    behaviourFilter = { userCookieId };
  }
  const behaviour = await userBehaviourLean.findOne(behaviourFilter).lean();

  if (!behaviour) {
    const randomOffset = 0; // Number(makeRandomString(2, 'numbers'));

    filter = { ids: [], newOffset: randomOffset, newLimit: 10 };
  } else {
    const { recents, wishList, cart } = behaviour;

    if (recents && recents.length > 0) {
      filter.ids = { ...filter.ids, ...recents as string[] };
    }

    if (wishList && wishList.length > 0) {
      filter.ids = { ...filter.ids, ...wishList as string[] };
    }

    if (cart && cart.length > 0) {
      filter.ids = { ...filter.ids, ...cart as string[] };
    }
  }

  return filter;
};

export const registerSearchParams = async(
  searchTerm: string,
  seachFilter: string,
  userCookieId: string,
  userId?: string
) => {
  let filter;

  if (userId) {
    filter = { user: userId };
  } else {
    filter = { userCookieId };
  }
  const found = await userBehaviourMain.findOne(filter);

  if (!found) {
    const useBehaviour: IuserBehaviour = {
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

export const registerCart = async(item: string, userCookieId: string, userId?: string) => {
  let filter;

  if (userId) {
    filter = { user: userId };
  } else {
    filter = { userCookieId };
  }
  const found = await userBehaviourMain.findOne(filter);

  if (!found) {
    const useBehaviour: IuserBehaviour = {
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
  const cart = (found.cart || []) as string[];

  cart.push(item);
  found.cart = cart;
  await found.save();

  return { success: true };
};

export const registerRecents = async(item: string, userCookieId: string, userId?: string) => {
  let filter;

  if (userId) {
    filter = { user: userId };
  } else {
    filter = { userCookieId };
  }
  const found = await userBehaviourMain.findOne(filter);

  if (!found) {
    const useBehaviour: IuserBehaviour = {
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
  const recents = (found.recents || []) as string[];

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

export const registerWishList = async(item: string, userCookieId: string, userId?: string) => {
  let filter;

  if (userId) {
    filter = { user: userId };
  } else {
    filter = { userCookieId };
  }
  const found = await userBehaviourMain.findOne(filter);

  if (!found) {
    const useBehaviour: IuserBehaviour = {
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
  const wishList = (found.wishList || []) as string[];

  wishList.push(item);
  found.wishList = wishList;
  await found.save();

  return { success: true };
};


export const registerCompareList = async(item: string, userCookieId: string, userId?: string) => {
  let filter;

  if (userId) {
    filter = { user: userId };
  } else {
    filter = { userCookieId };
  }
  let found = await userBehaviourMain.findOne(filter);

  if (!found) {
    const useBehaviour: IuserBehaviour = {
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
  const compareList = (found.compareList || []) as string[];

  compareList.push(item);
  found.compareList = compareList;
  await found.save();

  return { success: true };
};

export const createUserBehaour = async(useBehaviour: IuserBehaviour) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useBehaviour.expireAt = Date.now() as any;
  const behaviour = new userBehaviourMain(useBehaviour);
  const newEbahiour = await behaviour.save();

  return newEbahiour;
};
