"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemOffer = void 0;
const rxjs_1 = require("rxjs");
const item_define_1 = require("./item.define");
const stock_universal_1 = require("@open-stock/stock-universal");
const stock_counter_client_1 = require("../stock-counter-client");
/**
 * Represents an item offer.
 */
class ItemOffer extends stock_universal_1.DatabaseAuto {
    /**
     * Creates a new instance of ItemOffer.
     * @param data The data to initialize the instance with.
     */
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.companyId = data.companyId;
        this.items = data.items.map((val) => new item_define_1.Item(val));
        this.expireAt = data.expireAt;
        this.type = data.type;
        this.header = data.header;
        this.subHeader = data.subHeader;
        this.ammount = data.ammount;
    }
    /**
     * Gets all item offers.
     * @param companyId - The ID of the company
     * @param type The type of the offer.
     * @param url The URL to get the offers from.
     * @param offset The offset to start from.
     * @param limit The maximum number of items to return.
     * @returns An array of ItemOffer instances.
     */
    static async getItemOffers(companyId, type, url = 'getall', offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makeGet(`/itemoffer/${url}/${type}/${offset}/${limit}/${companyId}`);
        const offers = await (0, rxjs_1.lastValueFrom)(observer$);
        return offers.map((val) => new ItemOffer(val));
    }
    /**
     * Gets a single item offer.
     * @param companyId - The ID of the company
     * @param id The ID of the offer to get.
     * @returns An instance of ItemOffer.
     */
    static async getOneItemOffer(companyId, id) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makeGet(`/itemoffer/getone/${id}`);
        const offer = await (0, rxjs_1.lastValueFrom)(observer$);
        return new ItemOffer(offer);
    }
    /**
     * Creates a new item offer.
     * @param companyId - The ID of the company
     * @param itemoffer The item offer to create.
     * @returns An instance of Isuccess.
     */
    static async createItemOffer(companyId, itemoffer) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makePost(`/itemoffer/create/${companyId}`, {
            itemoffer
        });
        const added = await (0, rxjs_1.lastValueFrom)(observer$);
        return added;
    }
    /**
     * Deletes multiple item offers.
     * @param companyId - The ID of the company
     * @param ids The IDs of the offers to delete.
     * @returns An instance of Isuccess.
     */
    static async deleteItemOffers(companyId, ids) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makePut(`/itemoffer/deletemany/${companyId}`, {
            ids
        });
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Updates an item offer.
     * @param companyId - The ID of the company
     * @param vals The values to update the item offer with.
     * @returns An instance of Isuccess.
     */
    async updateItemOffer(companyId, vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makePut(`/itemoffer/update/${companyId}`, vals);
        const updated = await (0, rxjs_1.lastValueFrom)(observer$);
        if (updated.success) {
            this.items = vals.items || this.items;
            this.expireAt = vals.expireAt || this.expireAt;
        }
        return updated;
    }
    /**
     * Deletes an item offer.
     * @param companyId - The ID of the company
     * @returns An instance of Isuccess.
     */
    async deleteItemOffer(companyId) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makeDelete(`/itemoffer/deleteone/${this._id}/${companyId}`);
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.ItemOffer = ItemOffer;
//# sourceMappingURL=itemoffer.define.js.map