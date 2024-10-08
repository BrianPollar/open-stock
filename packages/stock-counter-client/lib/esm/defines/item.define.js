import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
/**
 * Item class: This class represents an item object with properties and methods for manipulating item data.
 * It includes methods for searching items, getting items, adding items, updating items, deleting items,
 * adding and updating sponsored items, liking and unliking items, deleting images, and others.
 */
export class Item extends DatabaseAuto {
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
     * @param companyId - The ID of the company
     * @param type The type of the item.
     * @param searchterm The search term.
     * @param searchKey The search key.
     * @param extraFilters Additional filters.
     * @returns An array of items that match the search criteria.
     */
    static async searchItems(companyId, searchterm, searchKey, extraFilters, category = 'all', subCategory, offset = 0, limit = 20, ecomerceCompat = 'false') {
        const observer$ = StockCounterClient.ehttp
            .makePost(`/item/search/${offset}/${limit}/${companyId}`, { searchterm, searchKey, category, extraFilters, subCategory, ecomerceCompat });
        const items = await lastValueFrom(observer$);
        return {
            count: items.count,
            items: items.data
                .map(val => new Item(val))
        };
    }
    /**
     * Gets items.
     * @param companyId - The ID of the company
     * @param url The URL to get the items from.
     * @param offset The offset to start getting items from.
     * @param limit The maximum number of items to get.
     * @returns An array of items.
     */
    static async getItems(companyId, url, offset = 0, limit = 20, ecomerceCompat = 'false') {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`${url}/${offset}/${limit}/${companyId}/${ecomerceCompat}`);
        const items = await lastValueFrom(observer$);
        return {
            count: items.count,
            items: items.data
                .map(val => new Item(val))
        };
    }
    /**
     * Gets a single item.
     * @param companyId - The ID of the company
     * @param url The URL to get the item from.
     * @returns The item.
     */
    static async getOneItem(companyId, url) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`${url}/${companyId}`);
        const item = await lastValueFrom(observer$);
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
    static async addItem(companyId, vals, files, ecomerceCompat = false) {
        let added;
        const details = {
            item: vals
        };
        if (ecomerceCompat) {
            const observer$ = StockCounterClient.ehttp
                .uploadFiles(files, `/item/createimg/${companyId}`, details);
            added = await lastValueFrom(observer$);
        }
        else {
            const observer$ = StockCounterClient.ehttp
                .makePost(`/item/create/${companyId}`, details);
            added = await lastValueFrom(observer$);
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
        const observer$ = StockCounterClient.ehttp
            .makePut(`${url}/${companyId}`, { ids, filesWithDir });
        return await lastValueFrom(observer$);
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
                _id: this._id,
                ...vals
            }
        };
        if (files && files.length > 0) {
            const observer$ = StockCounterClient.ehttp
                .uploadFiles(files, `/item/updateimg/${companyId}`, details);
            updated = await lastValueFrom(observer$);
        }
        else {
            const observer$ = StockCounterClient.ehttp
                .makePut(`${url}/${companyId}`, details);
            updated = await lastValueFrom(observer$);
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
        const observer$ = StockCounterClient.ehttp
            .makePut(`/item/addsponsored/${this._id}/${companyId}`, { sponsored });
        const added = await lastValueFrom(observer$);
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
        const observer$ = StockCounterClient.ehttp
            .makePut(`/item/updatesponsored/${this._id}/${companyId}`, { sponsored });
        const updated = await lastValueFrom(observer$);
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
        const observer$ = StockCounterClient.ehttp
            .makeDelete(`/item/deletesponsored/${this._id}/${itemId}/${companyId}`);
        const deleted = await lastValueFrom(observer$);
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
        const observer$ = StockCounterClient.ehttp
            .makePost(`/item/getsponsored/${companyId}`, { sponsored: mappedIds || [] });
        const items = await lastValueFrom(observer$);
        return this.sponsored
            .map(sponsrd => {
            sponsrd.item = new Item(items.data.find(val => val._id === sponsrd.item._id || sponsrd.item));
        });
    }
    /**
     * Likes an item.
     * @param companyId - The ID of the company.
     * @param userId - The ID of the user.
     * @returns A promise that resolves to the updated item.
     */
    async likeItem(companyId, userId) {
        const observer$ = StockCounterClient.ehttp
            .makePut(`/item/like/${this._id}/${companyId}`, {});
        const updated = await lastValueFrom(observer$);
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
        const observer$ = StockCounterClient.ehttp
            .makePut(`/item/unlike/${this._id}/${companyId}`, {});
        const updated = await lastValueFrom(observer$);
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
        const observer$ = StockCounterClient.ehttp
            .makePut(`/item/deleteone/${this._id}/${companyId}`, { filesWithDir });
        return await lastValueFrom(observer$);
    }
    /**
     * Deletes images associated with an item.
     * @param companyId - The ID of the company.
     * @param filesWithDir - An array of file metadata objects.
     * @returns A promise that resolves to the success status of the deletion.
     */
    async deleteFiles(companyId, filesWithDir) {
        const observer$ = StockCounterClient.ehttp
            .makePut(`/item/deletefiles/${companyId}`, { filesWithDir, item: { _id: this._id } });
        const deleted = await lastValueFrom(observer$);
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
//# sourceMappingURL=item.define.js.map