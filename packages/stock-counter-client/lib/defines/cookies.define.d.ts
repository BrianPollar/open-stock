import { IcartInterface, Isuccess } from '@open-stock/stock-universal';
import { Item } from './item.define';
/** This is a class called "Cookies" that handles the management of cookies for a website. It has properties for "cartEnabled" and "recentEnabled" which determine whether the cart and recent items functionalities are enabled or not.
The class has a constructor that initializes these properties.
There are several methods defined in this class: */
export declare class Cookies {
    /** */
    cartEnabled: boolean;
    /** */
    recentEnabled: boolean;
    constructor();
    /** "getSettings()": This method makes a GET request to retrieve the current settings for the cookies from the server. It updates the "cartEnabled" and "recentEnabled" properties based on the response.*/
    getSettings(): Promise<void>;
    /** "updateSettings(settings)": This method makes a PUT request to update the settings for the cookies on the server. It takes a "settings" parameter which contains the new settings. If the update is successful, it updates the "cartEnabled" and "recentEnabled" properties accordingly. */
    updateSettings(settings: any): Promise<Isuccess>;
    /** "addCartItem(cartItemId, totalCostwithNoShipping)": This method adds a cart item to the cookies. It takes the "cartItemId" and "totalCostwithNoShipping" as parameters and makes a PUT request to add the item to the cart. If the "cartEnabled" property is false, it returns a success response. */
    addCartItem(cartItemId: string, totalCostwithNoShipping: number): Promise<Isuccess>;
    /** "addRecent(recentItemId)": This method adds a recent item to the cookies. It takes the "recentItemId" as a parameter and makes a PUT request to add the item to the recent items list. If the "recentEnabled" property is false, it returns a success response. */
    addRecent(recentItemId: string): Promise<Isuccess>;
    /** "deleteCartItem(recentItemId)": This method deletes a cart item from the cookies. It takes the "recentItemId" as a parameter and makes a PUT request to delete the item from the cart. If the "cartEnabled" property is false, it returns a success response.*/
    deleteCartItem(recentItemId: string): Promise<Isuccess>;
    /** "clearCart()": This method clears the cart by making a PUT request to remove all cart items from the cookies. If the "cartEnabled" property is false, it returns a success response.*/
    clearCart(): Promise<Isuccess>;
    /** "appendToCart()": This method appends the current cart items to the cookies. It makes a GET request to retrieve the cart items and returns them as an array of "IcartInterface" objects. If the "cartEnabled" property is false, it returns an empty array. */
    appendToCart(): Promise<IcartInterface[] | {
        success: boolean;
    }>;
    /** "appendToRecent()": This method appends the current recent items to the cookies. It makes a GET request to retrieve the recent items and returns them as an array of "Item" objects. If the "recentEnabled" property is false, it returns an empty array. */
    appendToRecent(): Promise<Item[] | {
        success: boolean;
    }>;
}
