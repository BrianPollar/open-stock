import { IcartInterface, Isuccess } from '@open-stock/stock-universal';
import { Item } from './item.define';
interface Icookie {
    cartEnabled: boolean;
    recentEnabled: boolean;
    wishListEnabled: boolean;
    compareListEnabled: boolean;
}
export declare class Cookies {
    cartEnabled: boolean;
    recentEnabled: boolean;
    wishListEnabled: boolean;
    compareListEnabled: boolean;
    constructor();
    getSettings(userId?: string): Promise<void>;
    updateSettings(settings: Icookie, userId?: string): Promise<Icookie>;
    addCartItem(cartItemId: string, totalCostwithNoShipping: number, userId?: string): Promise<Isuccess>;
    addRecent(recentItemId: string, userId?: string): Promise<Isuccess>;
    addWishList(wishListItemId: string, userId?: string): Promise<Isuccess>;
    addCompareList(compareLisItemId: string, userId?: string): Promise<Isuccess>;
    deleteCartItem(cartItemId: string): Promise<Isuccess>;
    deleteWishListItem(wishListItemId: string): Promise<Isuccess>;
    deleteCompareListItem(compareLisItemId: string): Promise<Isuccess>;
    /**
     * Clears the cart by making a PUT request to remove all cart items from the cookies.
     * If the "cartEnabled" property is false, it returns a success response.
     * @returns An object containing a "success" property indicating whether the operation was successful or not.
     */
    clearCart(): Promise<Isuccess>;
    /**
     * Clears the wish list by making a PUT request to remove all wish list items from the cookies.
     * If the "wishListEnabled" property is false, it returns a success response.
     * @returns An object containing a "success" property indicating whether the operation was successful or not.
     */
    clearWishList(): Promise<Isuccess>;
    /**
     * Clears the compare list by making a PUT request to remove all compare list items from the cookies.
     * If the "compareListEnabled" property is false, it returns a success response.
     * @returns An object containing a "success" property indicating whether the operation was successful or not.
     */
    clearCompareList(): Promise<Isuccess>;
    /**
     * Appends the current cart items to the cookies.
     * It makes a GET request to retrieve the cart items and returns them as an array of "IcartInterface" objects.
     * If the "cartEnabled" property is false, it returns an empty array.
     * @returns An array of "IcartInterface" objects representing the current cart items.
     */
    appendToCart(): Promise<IcartInterface[]>;
    /**
     * Appends the current recent items to the cookies.
     * It makes a GET request to retrieve the recent items and returns them as an array of "Item" objects.
     * If the "recentEnabled" property is false, it returns an empty array.
     * @returns An array of "Item" objects representing the current recent items.
     */
    appendToRecent(): Promise<Item[]>;
    /**
     * Appends the current wish list items to the cookies.
     * It makes a GET request to retrieve the wish list items and returns them as an array of "Item" objects.
     * If the "wishListEnabled" property is false, it returns an empty array.
     * @returns An array of "Item" objects representing the current wish list items.
     */
    appendToWishList(): Promise<Item[]>;
    /**
     * Appends the current compare list items to the cookies.
     * It makes a GET request to retrieve the compare list items and returns them as an array of "Item" objects.
     * If the "compareListEnabled" property is false, it returns an empty array.
     * @returns An array of "Item" objects representing the current compare list items.
     */
    appendToCompareList(): Promise<Item[]>;
}
export {};
