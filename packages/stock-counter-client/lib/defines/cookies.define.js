/* eslint-disable @typescript-eslint/no-explicit-any */
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
/** This is a class called "Cookies" that handles the management of cookies for a website. It has properties for "cartEnabled" and "recentEnabled" which determine whether the cart and recent items functionalities are enabled or not.
The class has a constructor that initializes these properties.
There are several methods defined in this class: */
export class Cookies {
    constructor() { }
    /** "getSettings()": This method makes a GET request to retrieve the current settings for the cookies from the server. It updates the "cartEnabled" and "recentEnabled" properties based on the response.*/
    async getSettings() {
        const observer$ = StockCounterClient.ehttp.makeGet('/cookies/getsettings');
        const response = await lastValueFrom(observer$);
        const settings = response.body;
        this.cartEnabled = settings?.cartEnabled;
        this.recentEnabled = settings?.recentEnabled;
    }
    /** "updateSettings(settings)": This method makes a PUT request to update the settings for the cookies on the server. It takes a "settings" parameter which contains the new settings. If the update is successful, it updates the "cartEnabled" and "recentEnabled" properties accordingly. */
    async updateSettings(settings) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/cookies/updatesettings', { settings });
        const response = await lastValueFrom(observer$);
        const updated = response.body;
        if (updated.success) {
            this.cartEnabled = settings.cartEnabled;
            this.recentEnabled = settings.recentEnabled;
        }
        return updated;
    }
    /** "addCartItem(cartItemId, totalCostwithNoShipping)": This method adds a cart item to the cookies. It takes the "cartItemId" and "totalCostwithNoShipping" as parameters and makes a PUT request to add the item to the cart. If the "cartEnabled" property is false, it returns a success response. */
    async addCartItem(cartItemId, totalCostwithNoShipping) {
        if (!this.cartEnabled) {
            return { success: true };
        }
        const observer$ = StockCounterClient.ehttp
            .makePut('/cookies/addcartitem', { cartItemId, totalCostwithNoShipping });
        const response = await lastValueFrom(observer$);
        return response.body;
    }
    /** "addRecent(recentItemId)": This method adds a recent item to the cookies. It takes the "recentItemId" as a parameter and makes a PUT request to add the item to the recent items list. If the "recentEnabled" property is false, it returns a success response. */
    async addRecent(recentItemId) {
        if (!this.recentEnabled) {
            return { success: true };
        }
        const observer$ = StockCounterClient.ehttp
            .makePut('/cookies/addrecentitem', { recentItemId });
        const response = await lastValueFrom(observer$);
        return response.body;
    }
    /** "deleteCartItem(recentItemId)": This method deletes a cart item from the cookies. It takes the "recentItemId" as a parameter and makes a PUT request to delete the item from the cart. If the "cartEnabled" property is false, it returns a success response.*/
    async deleteCartItem(recentItemId) {
        if (!this.cartEnabled) {
            return { success: true };
        }
        const observer$ = StockCounterClient.ehttp
            .makePut(`/cookies/deletecartitem/${recentItemId}`, {});
        const response = await lastValueFrom(observer$);
        const deleted = response.body;
        return deleted;
    }
    /** "clearCart()": This method clears the cart by making a PUT request to remove all cart items from the cookies. If the "cartEnabled" property is false, it returns a success response.*/
    async clearCart() {
        if (!this.cartEnabled) {
            return { success: true };
        }
        const observer$ = StockCounterClient.ehttp
            .makePut('/cookies/clearcart', {});
        const response = await lastValueFrom(observer$);
        return response.body;
    }
    /** "appendToCart()": This method appends the current cart items to the cookies. It makes a GET request to retrieve the cart items and returns them as an array of "IcartInterface" objects. If the "cartEnabled" property is false, it returns an empty array. */
    async appendToCart() {
        if (!this.cartEnabled) {
            return { success: true };
        }
        const observer$ = StockCounterClient.ehttp
            .makeGet('/cookies/appendtocart');
        const response = await lastValueFrom(observer$);
        const carts = response.body;
        return carts;
    }
    /** "appendToRecent()": This method appends the current recent items to the cookies. It makes a GET request to retrieve the recent items and returns them as an array of "Item" objects. If the "recentEnabled" property is false, it returns an empty array. */
    async appendToRecent() {
        if (!this.recentEnabled) {
            return { success: true };
        }
        const observer$ = StockCounterClient.ehttp
            .makeGet('/cookies/appendtorecent');
        const response = await lastValueFrom(observer$);
        return response.body;
    }
}
//# sourceMappingURL=cookies.define.js.map