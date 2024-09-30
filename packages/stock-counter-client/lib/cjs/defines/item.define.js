"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = void 0;
const stock_universal_1 = require("@open-stock/stock-universal");
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../stock-counter-client");
class Item extends stock_universal_1.DatabaseAuto {
    /**
     * Represents the constructor of the Item class.
     * @param data - The data used to initialize the Item instance.
     */
    constructor(data) {
        super(data);
        /** The photos of the item. */
        this.photos = [];
        /** The quantity of the item ordered. */
        this.orderedQty = 1;
        this.soldCount = 0;
        this.appndPdctCtror(data);
    }
    /**
     * Searches for items.
  
     * @param type The type of the item.
     * @param searchterm The search term.
     * @param searchKey The search key.
     * @param extraFilters Additional filters.
     * @returns An array of items that match the search criteria.
     */
    static async filterAll(filter) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/item/filter', filter);
        const items = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: items.count,
            items: items.data
                .map(val => new Item(val))
        };
    }
    /**
     * Gets items.
  
     * @param offset The offset to start getting items from.
     * @param limit The maximum number of items to get.
     * @returns An array of items.
     */
    static async getAll(route, offset = 0, limit = 20, ecomerceCompat = 'false') {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/item/${route}/${offset}/${limit}/${ecomerceCompat}`);
        const items = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: items.count,
            items: items.data
                .map(val => new Item(val))
        };
    }
    /**
     * Gets a single item.
  
     * @param url The URL to get the item from.
     * @returns The item.
     */
    static async getOne(urId) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/item/one/${urId}`);
        const item = await (0, rxjs_1.lastValueFrom)(observer$);
        return new Item(item);
    }
    /**
     * Adds an item.
  
     * @param vals The values to add the item with.
     * @param files The files to add to the item.
     * @param inventoryStock Whether the item is in inventory stock.
     * @returns The success status of adding the item.
     */
    static async add(vals, files, ecomerceCompat = false) {
        let added;
        const body = {
            item: vals
        };
        if (ecomerceCompat) {
            const observer$ = stock_counter_client_1.StockCounterClient.ehttp
                .uploadFiles(files, '/item/add/img', body);
            added = await (0, rxjs_1.lastValueFrom)(observer$);
        }
        else {
            const observer$ = stock_counter_client_1.StockCounterClient.ehttp
                .makePost('/item/add', body);
            added = await (0, rxjs_1.lastValueFrom)(observer$);
        }
        return added;
    }
    /**
     * Deletes items.
  
     * @param _ids The IDs of the items to delete.
     * @param filesWithDir The files to delete with their directories.
     * @param url The URL to delete the items from.
     * @returns The success status of deleting the items.
     */
    static removeMany(url, vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut(`${url}`, vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Updates an item.
  
     * @param vals The values to update the item with.
     * @param url The URL to update the item from.
     * @param files The files to update the item with.
     * @returns The success status of updating the item.
     */
    async update(vals, files) {
        let updated;
        const body = {
            item: {
                _id: this._id,
                ...vals
            }
        };
        if (files && files.length > 0) {
            const observer$ = stock_counter_client_1.StockCounterClient.ehttp
                .uploadFiles(files, '/item/update/img', body);
            updated = await (0, rxjs_1.lastValueFrom)(observer$);
        }
        else {
            const observer$ = stock_counter_client_1.StockCounterClient.ehttp
                .makePut('/item/update', body);
            updated = await (0, rxjs_1.lastValueFrom)(observer$);
        }
        return updated;
    }
    /**
     * Makes an item sponsored.
  
     * @param sponsored The sponsored item.
     * @param item The item to make sponsored.
     * @returns The success status of making the item sponsored.
     */
    async addSponsored(sponsored, item) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut(`/item/sponsored/add/${this._id}`, sponsored);
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
  
     * @param sponsored The sponsored item to update.
     * @returns The success status of updating the sponsored item.
     */
    async updateSponsored(sponsored) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut(`/item/sponsored/update/${this._id}`, sponsored);
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
  
     * @param itemId The ID of the item to delete.
     * @returns The success status of deleting the sponsored item.
     */
    async removeSponsored(itemId) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeDelete(`/item/sponsored/delete/${this._id}/${itemId}`);
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
     .
     * @returns A Promise that resolves to an array of sponsored items.
     */
    async getSponsored() {
        const mappedIds = this.sponsored.map(val => val.item._id || val.item);
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/item/sponsored/get', { _ids: mappedIds || [] });
        const items = await (0, rxjs_1.lastValueFrom)(observer$);
        return this.sponsored
            .map(sponsrd => {
            sponsrd.item = new Item(items
                .data
                .find(val => {
                return val._id === sponsrd.item._id || sponsrd.item;
            }));
        });
    }
    /**
     * Likes an item.
     .
     * @param userId - The ID of the user.
     * @returns A promise that resolves to the updated item.
     */
    async like(userId) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut(`/item/like/${this._id}`, {});
        const updated = await (0, rxjs_1.lastValueFrom)(observer$);
        this.likes.push(userId);
        this.likesCount++;
        return updated;
    }
    /**
     * Unlikes an item by removing the user's like from the item's likes array.
      associated with the item.
     * @param userId - The ID of the user who unliked the item.
     * @returns A promise that resolves to the updated item.
     */
    async unLike(userId) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut(`/item/unlike/${this._id}`, {});
        const updated = await (0, rxjs_1.lastValueFrom)(observer$);
        this.likes = this.likes.filter(val => val !== userId);
        this.likesCount--;
        return updated;
    }
    /**
     * Deletes an item associated with a company.
     .
     * @returns A promise that resolves to the success response.
     */
    remove() {
        const filesWithDir = this.photos
            .map(val => ({ filename: val }));
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut(`/item/delete/one/${this._id}`, { filesWithDir });
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Deletes images associated with an item.
     * @param filesWithDir - An array of file metadata objects.
     * @returns A promise that resolves to the success status of the deletion.
     */
    async removeFiles(filesWithDir) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/item/deletefiles', { filesWithDir, item: { _id: this._id } });
        const deleted = await (0, rxjs_1.lastValueFrom)(observer$);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        const toStrings = filesWithDir.map(val => val._id);
        this.photos = this.photos.filter(val => !toStrings.includes(val._id));
        if (this.video && toStrings.includes(this.video._id)) {
            this.video = null;
        }
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
        this.video = data.video || this.video;
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
        this.ecomerceCompat = data.ecomerceCompat;
        this.soldCount = data.soldCount || this.soldCount;
    }
}
exports.Item = Item;
//# sourceMappingURL=item.define.js.map