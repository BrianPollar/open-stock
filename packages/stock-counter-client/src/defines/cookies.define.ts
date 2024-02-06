import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { IcartInterface, Isuccess } from '@open-stock/stock-universal';
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

  constructor() { }

  /**
   * Makes a GET request to retrieve the current settings for the cookies from the server.
   * It updates the "cartEnabled" and "recentEnabled" properties based on the response.
   */
  async getSettings() {
    const observer$ = StockCounterClient.ehttp.makeGet('/cookies/getsettings');
    const response = await lastValueFrom(observer$);
    const settings = (response as {body}).body;
    this.cartEnabled = settings?.cartEnabled;
    this.recentEnabled = settings?.recentEnabled;
  }

  /**
   * Makes a PUT request to update the settings for the cookies on the server.
   * It takes a "settings" parameter which contains the new settings.
   * If the update is successful, it updates the "cartEnabled" and "recentEnabled" properties accordingly.
   * @param settings - The new settings for the cookies.
   * @returns An object containing a "success" property indicating whether the update was successful or not.
   */
  async updateSettings(settings: { cartEnabled: boolean; recentEnabled: boolean }) {
    const observer$ = StockCounterClient.ehttp
      .makePut('/cookies/updatesettings', { settings });
    const response = await lastValueFrom(observer$);
    const updated = (response as {body}).body;
    if (updated.success) {
      this.cartEnabled = settings.cartEnabled;
      this.recentEnabled = settings.recentEnabled;
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
  async addCartItem(
    cartItemId: string, totalCostwithNoShipping: number) {
    if (!this.cartEnabled) {
      return { success: true };
    }
    const observer$ = StockCounterClient.ehttp
      .makePut('/cookies/addcartitem', { cartItemId, totalCostwithNoShipping });
    const response = await lastValueFrom(observer$);
    return (response as {body}).body as Isuccess;
  }

  /**
   * Adds a recent item to the cookies.
   * It takes the "recentItemId" as a parameter and makes a PUT request to add the item to the recent items list.
   * If the "recentEnabled" property is false, it returns a success response.
   * @param recentItemId - The ID of the recent item to add.
   * @returns An object containing a "success" property indicating whether the operation was successful or not.
   */
  async addRecent(recentItemId: string) {
    if (!this.recentEnabled) {
      return { success: true };
    }
    const observer$ = StockCounterClient.ehttp
      .makePut('/cookies/addrecentitem', { recentItemId });
    const response = await lastValueFrom(observer$);
    return (response as {body}).body as Isuccess;
  }

  /**
   * Deletes a cart item from the cookies.
   * It takes the "recentItemId" as a parameter and makes a PUT request to delete the item from the cart.
   * If the "cartEnabled" property is false, it returns a success response.
   * @param recentItemId - The ID of the cart item to delete.
   * @returns An object containing a "success" property indicating whether the operation was successful or not.
   */
  async deleteCartItem(recentItemId: string) {
    if (!this.cartEnabled) {
      return { success: true };
    }
    const observer$ = StockCounterClient.ehttp
      .makePut(`/cookies/deletecartitem/${recentItemId}`, {});
    const response = await lastValueFrom(observer$);
    const deleted = (response as {body}).body as Isuccess;
    return deleted;
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
    const response = await lastValueFrom(observer$) ;
    return (response as {body}).body as Isuccess;
  }

  /**
   * Appends the current cart items to the cookies.
   * It makes a GET request to retrieve the cart items and returns them as an array of "IcartInterface" objects.
   * If the "cartEnabled" property is false, it returns an empty array.
   * @returns An array of "IcartInterface" objects representing the current cart items.
   */
  async appendToCart() {
    if (!this.cartEnabled) {
      return { success: true };
    }
    const observer$ = StockCounterClient.ehttp
      .makeGet('/cookies/appendtocart');
    const response = await lastValueFrom(observer$);
    const carts = (response as {body}).body as IcartInterface[];
    return carts;
  }

  /**
   * Appends the current recent items to the cookies.
   * It makes a GET request to retrieve the recent items and returns them as an array of "Item" objects.
   * If the "recentEnabled" property is false, it returns an empty array.
   * @returns An array of "Item" objects representing the current recent items.
   */
  async appendToRecent() {
    if (!this.recentEnabled) {
      return { success: true };
    }
    const observer$ = StockCounterClient.ehttp
      .makeGet('/cookies/appendtorecent');
    const response = await lastValueFrom(observer$) as { body: Item[] };
    return (response as {body}).body as Item[];
  }
}
