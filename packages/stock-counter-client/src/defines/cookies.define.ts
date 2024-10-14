import { IcartInterface, Isuccess } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { Item } from './item.define';

interface Icookie {
  cartEnabled: boolean;
  recentEnabled: boolean;
  wishListEnabled: boolean;
  compareListEnabled: boolean;
}

export class Cookies {
  cartEnabled: boolean;
  recentEnabled: boolean;
  wishListEnabled: boolean;
  compareListEnabled: boolean;

  constructor() { }

  async getSettings(userId?: string) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<Icookie>('/cookies/getsettings/' + userId);
    const settings = await lastValueFrom(observer$);

    this.cartEnabled = settings?.cartEnabled;
    this.recentEnabled = settings?.recentEnabled;
    this.wishListEnabled = settings?.wishListEnabled;
    this.compareListEnabled = settings?.compareListEnabled;
  }

  async updateSettings(settings: Icookie, userId?: string) {
    const observer$ = StockCounterClient.ehttp
      .makePut<Icookie>('/cookies/updatesettings/' + userId, { settings });
    const response = await lastValueFrom(observer$);

    if (response.cartEnabled) {
      this.cartEnabled = settings.cartEnabled;
      this.recentEnabled = settings.recentEnabled;
      this.wishListEnabled = settings.wishListEnabled;
      this.compareListEnabled = settings.compareListEnabled;
    }

    return response;
  }

  async addCartItem(cartItemId: string, totalCostwithNoShipping: number, userId?: string) {
    if (!this.cartEnabled) {
      return { success: true };
    }
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/cookies/addcartitem/' + userId, { cartItemId, totalCostwithNoShipping });
    const response = await lastValueFrom(observer$);

    return response;
  }

  async addRecent(recentItemId: string, userId?: string) {
    if (!this.recentEnabled) {
      return { success: true };
    }
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/cookies/addrecentitem/' + userId, { recentItemId });
    const response = await lastValueFrom(observer$);

    return response;
  }

  async addWishList(wishListItemId: string, userId?: string) {
    if (!this.wishListEnabled) {
      return { success: true };
    }
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/cookies/addwishlistitem/' + userId, { wishListItemId });
    const response = await lastValueFrom(observer$);

    return response;
  }

  async addCompareList(compareLisItemId: string, userId?: string) {
    if (!this.compareListEnabled) {
      return { success: true };
    }
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/cookies/addcomparelistitems/' + userId, { compareLisItemId });
    const response = await lastValueFrom(observer$);

    return response;
  }

  async deleteCartItem(cartItemId: string) {
    if (!this.cartEnabled) {
      return { success: true };
    }
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>(`/cookies/deletecartitem/${cartItemId}`, {});
    const response = await lastValueFrom(observer$);

    return response;
  }

  async deleteWishListItem(wishListItemId: string) {
    if (!this.wishListEnabled) {
      return { success: true };
    }
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>(
        `/cookies/deletewishlistitem/${wishListItemId}`,
        {}
      );
    const response = await lastValueFrom(observer$);

    return response;
  }

  async deleteCompareListItem(compareLisItemId: string) {
    if (!this.compareListEnabled) {
      return { success: true };
    }
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>(
        '/cookies/deletecomparelistitem',
        { compareLisItemId }
      );
    const response = await lastValueFrom(observer$);

    return response;
  }

  /**
   * Clears the cart by making a PUT request to remove all cart items from the cookies.
   * If the "cartEnabled" property is false, it returns a success response.
   * @returns An object containing a "success" property indicating whether the operation was successful or not.
   */
  async clearCart() {
    if (!this.cartEnabled) {
      return { success: true };
    }
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/cookies/clearcart', {});
    const response = await lastValueFrom(observer$);

    return response;
  }

  /**
   * Clears the wish list by making a PUT request to remove all wish list items from the cookies.
   * If the "wishListEnabled" property is false, it returns a success response.
   * @returns An object containing a "success" property indicating whether the operation was successful or not.
   */
  async clearWishList() {
    if (!this.wishListEnabled) {
      return { success: true };
    }
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>(
        '/cookies/clearwishlist',
        {}
      );
    const response = await lastValueFrom(observer$);

    return response;
  }

  /**
   * Clears the compare list by making a PUT request to remove all compare list items from the cookies.
   * If the "compareListEnabled" property is false, it returns a success response.
   * @returns An object containing a "success" property indicating whether the operation was successful or not.
   */
  async clearCompareList() {
    if (!this.compareListEnabled) {
      return { success: true };
    }
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>(
        '/cookies/clearcomparelist',
        {}
      );
    const response = await lastValueFrom(observer$);

    return response;
  }

  /**
   * Appends the current cart items to the cookies.
   * It makes a GET request to retrieve the cart items and returns them as an array of "IcartInterface" objects.
   * If the "cartEnabled" property is false, it returns an empty array.
   * @returns An array of "IcartInterface" objects representing the current cart items.
   */
  async appendToCart() {
    if (!this.cartEnabled) {
      return [];
    }
    const observer$ = StockCounterClient.ehttp
      .makeGet<IcartInterface[]>('/cookies/appendtocart');
    const response = await lastValueFrom(observer$);

    return response;
  }

  /**
   * Appends the current recent items to the cookies.
   * It makes a GET request to retrieve the recent items and returns them as an array of "Item" objects.
   * If the "recentEnabled" property is false, it returns an empty array.
   * @returns An array of "Item" objects representing the current recent items.
   */
  async appendToRecent() {
    if (!this.recentEnabled) {
      return [];
    }
    const observer$ = StockCounterClient.ehttp
      .makeGet<Item[]>('/cookies/appendtorecent');
    const response = await lastValueFrom(observer$);

    return response;
  }

  /**
   * Appends the current wish list items to the cookies.
   * It makes a GET request to retrieve the wish list items and returns them as an array of "Item" objects.
   * If the "wishListEnabled" property is false, it returns an empty array.
   * @returns An array of "Item" objects representing the current wish list items.
   */
  async appendToWishList() {
    if (!this.wishListEnabled) {
      return [];
    }
    const observer$ = StockCounterClient.ehttp
      .makeGet<Item[]>('/cookies/appendtowishlist');
    const response = await lastValueFrom(observer$);

    return response;
  }


  /**
   * Appends the current compare list items to the cookies.
   * It makes a GET request to retrieve the compare list items and returns them as an array of "Item" objects.
   * If the "compareListEnabled" property is false, it returns an empty array.
   * @returns An array of "Item" objects representing the current compare list items.
   */
  async appendToCompareList() {
    if (!this.compareListEnabled) {
      return [];
    }
    const observer$ = StockCounterClient.ehttp
      .makeGet<Item[]>('/cookies/appendtorecent');
    const response = await lastValueFrom(observer$);

    return response;
  }
}
