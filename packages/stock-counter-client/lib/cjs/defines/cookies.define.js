"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cookies = void 0;
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../stock-counter-client");
class Cookies {
    constructor() { }
    async getSettings(userId) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet('/cookies/getsettings/' + userId);
        const settings = await (0, rxjs_1.lastValueFrom)(observer$);
        this.cartEnabled = settings?.cartEnabled;
        this.recentEnabled = settings?.recentEnabled;
        this.wishListEnabled = settings?.wishListEnabled;
        this.compareListEnabled = settings?.compareListEnabled;
    }
    async updateSettings(settings, userId) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/cookies/updatesettings/' + userId, { settings });
        const response = await (0, rxjs_1.lastValueFrom)(observer$);
        if (response.cartEnabled) {
            this.cartEnabled = settings.cartEnabled;
            this.recentEnabled = settings.recentEnabled;
            this.wishListEnabled = settings.wishListEnabled;
            this.compareListEnabled = settings.compareListEnabled;
        }
        return response;
    }
    async addCartItem(cartItemId, totalCostwithNoShipping, userId) {
        if (!this.cartEnabled) {
            return { success: true };
        }
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/cookies/addcartitem/' + userId, { cartItemId, totalCostwithNoShipping });
        const response = await (0, rxjs_1.lastValueFrom)(observer$);
        return response;
    }
    async addRecent(recentItemId, userId) {
        if (!this.recentEnabled) {
            return { success: true };
        }
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/cookies/addrecentitem/' + userId, { recentItemId });
        const response = await (0, rxjs_1.lastValueFrom)(observer$);
        return response;
    }
    async addWishList(wishListItemId, userId) {
        if (!this.wishListEnabled) {
            return { success: true };
        }
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/cookies/addwishlistitem/' + userId, { wishListItemId });
        const response = await (0, rxjs_1.lastValueFrom)(observer$);
        return response;
    }
    async addCompareList(compareLisItemId, userId) {
        if (!this.compareListEnabled) {
            return { success: true };
        }
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/cookies/addcomparelistitems/' + userId, { compareLisItemId });
        const response = await (0, rxjs_1.lastValueFrom)(observer$);
        return response;
    }
    async deleteCartItem(cartItemId) {
        if (!this.cartEnabled) {
            return { success: true };
        }
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut(`/cookies/deletecartitem/${cartItemId}`, {});
        const response = await (0, rxjs_1.lastValueFrom)(observer$);
        return response;
    }
    async deleteWishListItem(wishListItemId) {
        if (!this.wishListEnabled) {
            return { success: true };
        }
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut(`/cookies/deletewishlistitem/${wishListItemId}`, {});
        const response = await (0, rxjs_1.lastValueFrom)(observer$);
        return response;
    }
    async deleteCompareListItem(compareLisItemId) {
        if (!this.compareListEnabled) {
            return { success: true };
        }
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/cookies/deletecomparelistitem', { compareLisItemId });
        const response = await (0, rxjs_1.lastValueFrom)(observer$);
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
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/cookies/clearcart', {});
        const response = await (0, rxjs_1.lastValueFrom)(observer$);
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
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/cookies/clearwishlist', {});
        const response = await (0, rxjs_1.lastValueFrom)(observer$);
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
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/cookies/clearcomparelist', {});
        const response = await (0, rxjs_1.lastValueFrom)(observer$);
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
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet('/cookies/appendtocart');
        const response = await (0, rxjs_1.lastValueFrom)(observer$);
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
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet('/cookies/appendtorecent');
        const response = await (0, rxjs_1.lastValueFrom)(observer$);
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
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet('/cookies/appendtowishlist');
        const response = await (0, rxjs_1.lastValueFrom)(observer$);
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
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet('/cookies/appendtorecent');
        const response = await (0, rxjs_1.lastValueFrom)(observer$);
        return response;
    }
}
exports.Cookies = Cookies;
//# sourceMappingURL=cookies.define.js.map