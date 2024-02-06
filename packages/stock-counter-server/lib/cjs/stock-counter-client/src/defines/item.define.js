"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = void 0;
const stock_universal_1 = require("@open-stock/stock-universal");
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../stock-counter-client");
/**
 * Item class: This class represents an item object with properties and methods for manipulating item data.
 * It includes methods for searching items, getting items, adding items, updating items, deleting items,
 * adding and updating sponsored items, liking and unliking items, deleting images, and others.
 */
class Item extends stock_universal_1.DatabaseAuto {
    /**
     * Represents the constructor of the Item class.
     * @param {any} data - The data used to initialize the Item instance.
     */
    constructor(data) {
        super(data);
        /** The photos of the item. */
        this.photos = [];
        /** The quantity of the item ordered. */
        this.orderedQty = 1;
        this.appndPdctCtror(data);
    }
    /**
     * Searches for items.
     * @param companyId - The ID of the company
     * @param type The type of the item.
     * @param searchterm The search term.
     * @param searchKey The search key.
     * @param extraFilters Additional filters.
     * @returns An array of items that match the search criteria.
     */
    static async searchItems(companyId, category, searchterm, searchKey, extraFilters, subCategory) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost(`/item/search/${companyId}`, { searchterm, searchKey, category, extraFilters });
        const items = await (0, rxjs_1.lastValueFrom)(observer$);
        return items
            .map(val => new Item(val));
    }
    /**
     * Gets items.
     * @param companyId - The ID of the company
     * @param url The URL to get the items from.
     * @param offset The offset to start getting items from.
     * @param limit The maximum number of items to get.
     * @returns An array of items.
     */
    static async getItems(companyId, url, offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`${url}/${offset}/${limit}/${companyId}`);
        const items = await (0, rxjs_1.lastValueFrom)(observer$);
        return items
            .map(val => new Item(val));
    }
    /**
     * Gets a single item.
     * @param companyId - The ID of the company
     * @param url The URL to get the item from.
     * @returns The item.
     */
    static async getOneItem(companyId, url) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`${url}`);
        const item = await (0, rxjs_1.lastValueFrom)(observer$);
        return new Item(item);
    }
    /**
     * Adds an item.
     * @param companyId - The ID of the company
     * @param vals The values to add the item with.
     * @param files The files to add to the item.
     * @param inventoryStock Whether the item is in inventory stock.
     * @returns The success status of adding the item.
     */
    static async addItem(companyId, vals, files, inventoryStock = false) {
        let added;
        const details = {
            item: vals
        };
        if (!inventoryStock) {
            const observer$ = stock_counter_client_1.StockCounterClient.ehttp
                .uploadFiles(files, `/item/create/${companyId}`, details);
            added = await (0, rxjs_1.lastValueFrom)(observer$);
        }
        else {
            const observer$ = stock_counter_client_1.StockCounterClient.ehttp
                .makePost(`/invitem/create/${companyId}`, details);
            added = await (0, rxjs_1.lastValueFrom)(observer$);
        }
        return added;
    }
    /**
     * Deletes items.
     * @param companyId - The ID of the company
     * @param ids The IDs of the items to delete.
     * @param filesWithDir The files to delete with their directories.
     * @param url The URL to delete the items from.
     * @returns The success status of deleting the items.
     */
    static async deleteItems(companyId, ids, filesWithDir, url) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut(`${url}`, { ids, filesWithDir });
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Updates an item.
     * @param companyId - The ID of the company
     * @param vals The values to update the item with.
     * @param url The URL to update the item from.
     * @param files The files to update the item with.
     * @returns The success status of updating the item.
     */
    async updateItem(companyId, vals, url, files) {
        let updated;
        const details = {
            item: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                _id: this._id,
                ...vals
            }
        };
        if (files && files.length > 0) {
            const observer$ = stock_counter_client_1.StockCounterClient.ehttp
                .uploadFiles(files, '/item/updateimg', details);
            updated = await (0, rxjs_1.lastValueFrom)(observer$);
        }
        else {
            const observer$ = stock_counter_client_1.StockCounterClient.ehttp
                .makePut(`${url}`, details);
            updated = await (0, rxjs_1.lastValueFrom)(observer$);
        }
        return updated;
    }
    /**
     * Makes an item sponsored.
     * @param companyId - The ID of the company
     * @param sponsored The sponsored item.
     * @param item The item to make sponsored.
     * @returns The success status of making the item sponsored.
     */
    async makeSponsored(companyId, sponsored, item) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut(`/item/addsponsored/${this._id}/${companyId}`, { sponsored });
        const added = await (0, rxjs_1.lastValueFrom)(observer$);
        if (added.success) {
            if (!this.sponsored) {
                this.sponsored = [];
            }
            this.sponsored.push({ item, discount: sponsored.discount });
        }
        return added;
    }
    /**
     * Updates a sponsored item.
     * @param companyId - The ID of the company
     * @param sponsored The sponsored item to update.
     * @returns The success status of updating the sponsored item.
     */
    async updateSponsored(companyId, sponsored) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut(`/item/updatesponsored/${this._id}/${companyId}`, { sponsored });
        const updated = await (0, rxjs_1.lastValueFrom)(observer$);
        if (updated.success) {
            const found = this.sponsored
                .find(val => val.item === sponsored.item);
            if (found) {
                found.discount = sponsored.discount;
            }
        }
        return updated;
    }
    /**
     * Deletes a sponsored item.
     * @param companyId - The ID of the company
     * @param itemId The ID of the item to delete.
     * @returns The success status of deleting the sponsored item.
     */
    async deleteSponsored(companyId, itemId) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeDelete(`/item/deletesponsored/${this._id}/${itemId}`);
        const deleted = await (0, rxjs_1.lastValueFrom)(observer$);
        if (deleted.success) {
            const found = this.sponsored.find(sponsd => sponsd.item._id === itemId);
            if (found) {
                const indexOf = this.sponsored.indexOf(found);
                this.sponsored.splice(indexOf, 1);
            }
        }
        return deleted;
    }
    /**
     * Retrieves sponsored items for a given company.
     * @param companyId - The ID of the company.
     * @returns A Promise that resolves to an array of sponsored items.
     */
    async getSponsored(companyId) {
        const mappedIds = this.sponsored.map(val => val.item._id || val.item);
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost(`/item/getsponsored/${companyId}`, { sponsored: mappedIds || [] });
        const items = await (0, rxjs_1.lastValueFrom)(observer$);
        return this.sponsored
            .map(sponsrd => {
            sponsrd.item = new Item(items.find(val => val._id === sponsrd.item._id || sponsrd.item));
        });
    }
    /**
     * Likes an item.
     * @param companyId - The ID of the company.
     * @param userId - The ID of the user.
     * @returns A promise that resolves to the updated item.
     */
    async likeItem(companyId, userId) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut(`/item/like/${this._id}/${companyId}`, {});
        const updated = await (0, rxjs_1.lastValueFrom)(observer$);
        this.likes.push(userId);
        this.likesCount++;
        return updated;
    }
    /**
     * Unlikes an item by removing the user's like from the item's likes array.
     * @param companyId - The ID of the company associated with the item.
     * @param userId - The ID of the user who unliked the item.
     * @returns A promise that resolves to the updated item.
     */
    async unLikeItem(companyId, userId) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut(`/item/unlike/${this._id}/${companyId}`, {});
        const updated = await (0, rxjs_1.lastValueFrom)(observer$);
        this.likes = this.likes.filter(val => val !== userId);
        this.likesCount--;
        return updated;
    }
    /**
     * Deletes an item associated with a company.
     * @param companyId - The ID of the company.
     * @returns A promise that resolves to the success response.
     */
    async deleteItem(companyId) {
        const filesWithDir = this.photos
            .map(val => ({ filename: val }));
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut(`/item/deleteone/${this._id}/${companyId}`, { filesWithDir });
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Deletes images associated with an item.
     * @param companyId - The ID of the company.
     * @param filesWithDir - An array of file metadata objects.
     * @returns A promise that resolves to the success status of the deletion.
     */
    async deleteImages(companyId, filesWithDir) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            // eslint-disable-next-line @typescript-eslint/naming-convention
            .makePut(`/item/deleteimages/${companyId}`, { filesWithDir, item: { _id: this._id } });
        const deleted = await (0, rxjs_1.lastValueFrom)(observer$);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        const toStrings = filesWithDir.map(val => val._id);
        this.photos = this.photos.filter(val => !toStrings.includes(val._id));
        return deleted;
    }
    /**
     * Updates the properties of the item based on the provided data.
     * @param {object} data - The data containing the properties to update.
     */
    appndPdctCtror(data) {
        this.urId = data.urId;
        this.companyId = data.companyId || this.companyId;
        this.numbersInstock = data.numbersInstock || this.numbersInstock;
        this.name = data.name || this.name;
        this.brand = data.brand || this.brand;
        this.category = data.category || this.category;
        this.subCategory = data.subCategory || this.subCategory;
        this.state = data.state || this.state;
        this.colors = data.colors || this.colors;
        this.model = data.model || this.model;
        this.origin = data.origin || this.origin;
        this.createdAt = data.createdAt || this.createdAt;
        this.updatedAt = data.updatedAt || this.updatedAt;
        this.costMeta = data.costMeta || this.costMeta;
        this.description = data.description || this.description;
        this.inventoryMeta = data.inventoryMeta || this.inventoryMeta;
        this.urId = data.urId;
        this.companyId = data.companyId || this.companyId;
        this._id = data._id || this._id;
        this.numbersInstock = data.numbersInstock || this.numbersInstock;
        this.name = data.name || this.name;
        this.brand = data.brand || this.brand;
        this.category = data.category || this.category;
        this.state = data.state || this.state;
        this.photos = data.photos || this.photos;
        this.colors = data.colors || this.colors;
        this.model = data.model || this.model;
        this.origin = data.origin || this.origin;
        this.anyKnownProblems = data.anyKnownProblems || this.anyKnownProblems;
        this.createdAt = data.createdAt || this.createdAt;
        this.updatedAt = data.updatedAt || this.updatedAt;
        this.costMeta = data.costMeta || this.costMeta;
        if (typeof data.costMeta.offer === typeof 'string') {
            this.costMeta.offer = data.costMeta.offer === 'true';
        }
        this.description = data.description || this.description;
        this.numberBought = data.numberBought || this.numberBought;
        this.sponsored = data.sponsored || this.sponsored;
        this.buyerGuarantee = data.buyerGuarantee || this.buyerGuarantee;
        this.reviewedBy = data.reviewedBy || this.reviewedBy;
        this.reviewCount = data.reviewCount || this.reviewCount;
        this.reviewWeight = data.reviewWeight || this.reviewWeight;
        this.likes = data.likes || this.likes;
        this.likesCount = data.likesCount || this.likesCount;
        this.timesViewed = data.timesViewed || this.timesViewed;
        this.inventoryMeta = data.inventoryMeta
            .map(val => {
            if (typeof val.quantity === typeof 'string') {
                val.quantity = Number(val.quantity);
            }
            return val;
        });
        this.ecomerceCompat = data.ecomerceCompat || this.ecomerceCompat;
    }
}
exports.Item = Item;
//# sourceMappingURL=item.define.js.map