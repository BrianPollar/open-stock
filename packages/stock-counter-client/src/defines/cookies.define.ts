import { IcartInterface, Isuccess } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { Item } from './item.define';

/**
 * This is a class called "Cookies" that handles the management of cookies for a website.
 * It has properties for "cartEnabled" and "recentEnabled" which determine whether the cart and recent items functionalities are enabled or not.
 * The class has a constructor that initializes these properties.
 */
export class Cookies {
  /** Determines whether the cart functionality is enabled or not. */
  cartEnabled: boolean;

  /** Determines whether the recent items functionality is enabled or not. */
  recentEnabled: boolean;

  wishListEnabled: boolean;

  compareListEnabled: boolean;

  constructor() { }

  /**
   * Makes a GET request to retrieve the current settings for the cookies from the server.
   * It updates the "cartEnabled" and "recentEnabled" properties based on the response.
   */
  async getSettings(userId?: string) {
    const observer$ = StockCounterClient.ehttp.makeGet('/cookies/getsettings/' + userId);
    const response = await lastValueFrom(observer$);
    const settings = response as any;

    this.cartEnabled = settings?.cartEnabled;
    this.recentEnabled = settings?.recentEnabled;
    this.wishListEnabled = settings?.wishListEnabled;
    this.compareListEnabled = settings?.compareListEnabled;
  }

  /**
   * Makes a PUT request to update the settings for the cookies on the server.
   * It takes a "settings" parameter which contains the new settings.
   * If the update is successful, it updates the "cartEnabled" and "recentEnabled" properties accordingly.
   * @param settings - The new settings for the cookies.
   * @returns An object containing a "success" property indicating whether the update was successful or not.
   */
  async updateSettings(settings: { cartEnabled: boolean; recentEnabled: boolean; wishListEnabled: boolean; compareListEnabled: boolean}, userId?: string) {
    const observer$ = StockCounterClient.ehttp
      .makePut('/cookies/updatesettings/' + userId, { settings });
    const response = await lastValueFrom(observer$);
    const updated = response as any;

    if (updated.success) {
      this.cartEnabled = settings.cartEnabled;
      this.recentEnabled = settings.recentEnabled;
      this.wishListEnabled = settings.wishListEnabled;
      this.compareListEnabled = settings.compareListEnabled;
    }

    return updated as Isuccess;
  }

  /**
   * Adds a cart item to the cookies.
   * It takes the "cartItemId" and "totalCostwithNoShipping" as parameters and makes a PUT request to add the item to the cart.
   * If the "cartEnabled" property is false, it returns a success response.
   * @param cartItemId - The ID of the cart item to add.
   * @param totalCostwithNoShipping - The total cost of the cart item without shipping.
   * @returns An object containing a "success" property indicating whether the operation was successful or not.
   */
  async addCartItem(cartItemId: string, totalCostwithNoShipping: number, userId?: string) {
    if (!this.cartEnabled) {
      return { success: true };
    }
    const observer$ = StockCounterClient.ehttp
      .makePut('/cookies/addcartitem/' + userId, { cartItemId, totalCostwithNoShipping });
    const response = await lastValueFrom(observer$) as Isuccess;

    return response;
  }

  /**
   * Adds a recent item to the cookies.
   * It takes the "recentItemId" as a parameter and makes a PUT request to add the item to the recent items list.
   * If the "recentEnabled" property is false, it returns a success response.
   * @param recentItemId - The ID of the recent item to add.
   * @returns An object containing a "success" property indicating whether the operation was successful or not.
   */
  async addRecent(recentItemId: string, userId?: string) {
    if (!this.recentEnabled) {
      return { success: true };
    }
    const observer$ = StockCounterClient.ehttp
      .makePut('/cookies/addrecentitem/' + userId, { recentItemId });
    const response = await lastValueFrom(observer$) as Isuccess;

    return response;
  }

  async addWishList(wishListItemId: string, userId?: string) {
    if (!this.wishListEnabled) {
      return { success: true };
    }
    const observer$ = StockCounterClient.ehttp
      .makePut('/cookies/addwishlistitem/' + userId, { wishListItemId });
    const response = await lastValueFrom(observer$) as Isuccess;

    return response;
  }

  async addCompareList(compareLisItemId: string, userId?: string) {
    if (!this.compareListEnabled) {
      return { success: true };
    }
    const observer$ = StockCounterClient.ehttp
      .makePut('/cookies/addcomparelistitems/' + userId, { compareLisItemId });
    const response = await lastValueFrom(observer$) as Isuccess;

    return response;
  }

  /**
   * Deletes a cart item from the cookies.
   * It takes the "recentItemId" as a parameter and makes a PUT request to delete the item from the cart.
   * If the "cartEnabled" property is false, it returns a success response.
   * @param cartItemId - The ID of the cart item to delete.
   * @returns An object containing a "success" property indicating whether the operation was successful or not.
   */
  async deleteCartItem(cartItemId: string) {
    if (!this.cartEnabled) {
      return { success: true };
    }
    const observer$ = StockCounterClient.ehttp
      .makePut(`/cookies/deletecartitem/${cartItemId}`, {});
    const response = await lastValueFrom(observer$) as Isuccess;

    return response;
  }

  /**
   * Deletes an item from the wish list by making a PUT request to the '/cookies/deletewishlistitem' endpoint.
   * If the 'wishListEnabled' property is false, it returns a success response.
   * @param wishListItemId - The ID of the wish list item to delete.
   * @returns An object containing a 'success' property indicating whether the operation was successful or not.
   */
  async deleteWishListItem(wishListItemId: string) {
    if (!this.wishListEnabled) {
      return { success: true };
    }
    const observer$ = StockCounterClient.ehttp.makePut(
      `/cookies/deletewishlistitem/${wishListItemId}`,
      {}
    );
    const response = await lastValueFrom(observer$) as Isuccess;

    return response;
  }

  /**
   * Deletes an item from the compare list by making a PUT request to the '/cookies/deletecomparelistitem' endpoint.
   * If the 'compareListEnabled' property is false, it returns a success response.
   * @param compareLisItemId - The ID of the compare list item to delete.
   * @returns An object containing a 'success' property indicating whether the operation was successful or not.
   */
  async deleteCompareListItem(compareLisItemId: string) {
    if (!this.compareListEnabled) {
      return { success: true };
    }
    const observer$ = StockCounterClient.ehttp.makePut(
      '/cookies/deletecomparelistitem',
      { compareLisItemId }
    );
    const response = await lastValueFrom(observer$) as Isuccess;

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
      .makePut('/cookies/clearcart', {});
    const response = await lastValueFrom(observer$) as Isuccess;

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
    const observer$ = StockCounterClient.ehttp.makePut(
      '/cookies/clearwishlist',
      {}
    );
    const response = await lastValueFrom(observer$) as Isuccess;

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
    const observer$ = StockCounterClient.ehttp.makePut(
      '/cookies/clearcomparelist',
      {}
    );
    const response = await lastValueFrom(observer$) as Isuccess;

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
      .makeGet('/cookies/appendtocart');
    const response = await lastValueFrom(observer$) as IcartInterface[];

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
      .makeGet('/cookies/appendtorecent');
    const response = await lastValueFrom(observer$) as Item[];

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
    const observer$ = StockCounterClient.ehttp.makeGet('/cookies/appendtowishlist');
    const response = await lastValueFrom(observer$) as Item[];

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
    const observer$ = StockCounterClient.ehttp.makeGet('/cookies/appendtorecent');
    const response = await lastValueFrom(observer$) as Item[];

    return response;
  }
}
