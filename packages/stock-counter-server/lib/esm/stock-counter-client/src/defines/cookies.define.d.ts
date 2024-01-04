import { IcartInterface, Isuccess } from '@open-stock/stock-universal';
import { Item } from './item.define';
/**
 * This is a class called "Cookies" that handles the management of cookies for a website.
 * It has properties for "cartEnabled" and "recentEnabled" which determine whether the cart and recent items functionalities are enabled or not.
 * The class has a constructor that initializes these properties.
 */
export declare class Cookies {
    /** Determines whether the cart functionality is enabled or not. */
    cartEnabled: boolean;
    /** Determines whether the recent items functionality is enabled or not. */
    recentEnabled: boolean;
    constructor();
    /**
     * Makes a GET request to retrieve the current settings for the cookies from the server.
     * It updates the "cartEnabled" and "recentEnabled" properties based on the response.
     */
    getSettings(): Promise<void>;
    /**
     * Makes a PUT request to update the settings for the cookies on the server.
     * It takes a "settings" parameter which contains the new settings.
     * If the update is successful, it updates the "cartEnabled" and "recentEnabled" properties accordingly.
     * @param settings - The new settings for the cookies.
     * @returns An object containing a "success" property indicating whether the update was successful or not.
     */
    updateSettings(settings: {
        cartEnabled: boolean;
        recentEnabled: boolean;
    }): Promise<Isuccess>;
    /**
     * Adds a cart item to the cookies.
     * It takes the "cartItemId" and "totalCostwithNoShipping" as parameters and makes a PUT request to add the item to the cart.
     * If the "cartEnabled" property is false, it returns a success response.
     * @param cartItemId - The ID of the cart item to add.
     * @param totalCostwithNoShipping - The total cost of the cart item without shipping.
     * @returns An object containing a "success" property indicating whether the operation was successful or not.
     */
    addCartItem(cartItemId: string, totalCostwithNoShipping: number): Promise<Isuccess>;
    /**
     * Adds a recent item to the cookies.
     * It takes the "recentItemId" as a parameter and makes a PUT request to add the item to the recent items list.
     * If the "recentEnabled" property is false, it returns a success response.
     * @param recentItemId - The ID of the recent item to add.
     * @returns An object containing a "success" property indicating whether the operation was successful or not.
     */
    addRecent(recentItemId: string): Promise<Isuccess>;
    /**
     * Deletes a cart item from the cookies.
     * It takes the "recentItemId" as a parameter and makes a PUT request to delete the item from the cart.
     * If the "cartEnabled" property is false, it returns a success response.
     * @param recentItemId - The ID of the cart item to delete.
     * @returns An object containing a "success" property indicating whether the operation was successful or not.
     */
    deleteCartItem(recentItemId: string): Promise<Isuccess>;
    /**
     * Clears the cart by making a PUT request to remove all cart items from the cookies.
     * If the "cartEnabled" property is false, it returns a success response.
     * @returns An object containing a "success" property indicating whether the operation was successful or not.
     */
    clearCart(): Promise<Isuccess>;
    /**
     * Appends the current cart items to the cookies.
     * It makes a GET request to retrieve the cart items and returns them as an array of "IcartInterface" objects.
     * If the "cartEnabled" property is false, it returns an empty array.
     * @returns An array of "IcartInterface" objects representing the current cart items.
     */
    appendToCart(): Promise<IcartInterface[] | {
        success: boolean;
    }>;
    /**
     * Appends the current recent items to the cookies.
     * It makes a GET request to retrieve the recent items and returns them as an array of "Item" objects.
     * If the "recentEnabled" property is false, it returns an empty array.
     * @returns An array of "Item" objects representing the current recent items.
     */
    appendToRecent(): Promise<Item[] | {
        success: boolean;
    }>;
}
