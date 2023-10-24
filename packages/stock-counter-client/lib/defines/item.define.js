/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
/** Item  class: This class represents an item object with properties and methods for manipulating item data. It includes methods for searching items, getting items, adding items, updating items, deleting items, adding and updating sponsored items, liking and unliking items, deleting images, and others. */
export class Item extends DatabaseAuto {
    /** */
    constructor(data) {
        super(data);
        /** */
        this.photos = [];
        /** */
        this.orderedQty = 1; // dis is always not initialised
        this.appndPdctCtror(data);
    }
    /** */
    static async searchItems(type, searchterm, searchKey, extraFilters) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/item/search', { searchterm, searchKey, category: type, extraFilters });
        const items = await lastValueFrom(observer$);
        return items
            .map(val => new Item(val));
    }
    /** */
    static async getItems(url, offset = 0, limit = 0) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`${url}/${offset}/${limit}`);
        const items = await lastValueFrom(observer$);
        return items
            .map(val => new Item(val));
    }
    /** */
    static async getOneItem(url) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`${url}`);
        const item = await lastValueFrom(observer$);
        return new Item(item);
    }
    /** */
    static async addItem(vals, files, inventoryStock = false) {
        let added;
        const details = {
            item: vals
        };
        if (!inventoryStock) {
            const observer$ = StockCounterClient.ehttp
                .uploadFiles(files, '/item/create', details);
            added = await lastValueFrom(observer$);
        }
        else {
            const observer$ = StockCounterClient.ehttp
                .makePost('/invitem/create', details);
            added = await lastValueFrom(observer$);
        }
        return added;
    }
    /** */
    static async deleteItems(ids, filesWithDir, url) {
        const observer$ = StockCounterClient.ehttp
            .makePut(`${url}`, { ids, filesWithDir });
        return await lastValueFrom(observer$);
    }
    /** */
    async updateItem(vals, url, files) {
        let updated;
        const details = {
            item: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                _id: this._id,
                ...vals
            }
        };
        if (files && files.length > 0) {
            const observer$ = StockCounterClient.ehttp
                .uploadFiles(files, '/item/updateimg', details);
            updated = await lastValueFrom(observer$);
        }
        else {
            const observer$ = StockCounterClient.ehttp
                .makePut(`${url}`, details);
            updated = await lastValueFrom(observer$);
        }
        return updated;
    }
    /** */
    async makeSponsored(sponsored, item) {
        const observer$ = StockCounterClient.ehttp
            .makePut(`/item/addsponsored/${this._id}`, { sponsored });
        const added = await lastValueFrom(observer$);
        if (added.success) {
            if (!this.sponsored) {
                this.sponsored = [];
            }
            this.sponsored.push({ item, discount: sponsored.discount });
        }
        return added;
    }
    /** */
    async updateSponsored(sponsored) {
        const observer$ = StockCounterClient.ehttp
            .makePut(`/item/updatesponsored/${this._id}`, { sponsored });
        const updated = await lastValueFrom(observer$);
        if (updated.success) {
            const found = this.sponsored
                .find(val => val.item === sponsored.item); // no OR here maintain consitency do notpoulate sponsored in backend
            if (found) {
                found.discount = sponsored.discount;
            }
        }
        return updated;
    }
    /** */
    async deleteSponsored(itemId) {
        const observer$ = StockCounterClient.ehttp
            .makeDelete(`/item/deletesponsored/${this._id}/${itemId}`);
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
    /** */
    async getSponsored() {
        const mappedIds = this.sponsored.map(val => val.item._id || val.item);
        const observer$ = StockCounterClient.ehttp
            .makePost('/item/getsponsored', { sponsored: mappedIds || [] });
        const items = await lastValueFrom(observer$);
        return this.sponsored
            .map(sponsrd => {
            sponsrd.item = new Item(items.find(val => val._id === sponsrd.item._id || sponsrd.item));
        });
    }
    /** */
    async likeItem(userId) {
        const observer$ = StockCounterClient.ehttp
            .makePut(`/item/like/${this._id}`, {});
        const updated = await lastValueFrom(observer$);
        this.likes.push(userId);
        this.likesCount++;
        return updated;
    }
    /** */
    async unLikeItem(userId) {
        const observer$ = StockCounterClient.ehttp
            .makePut(`/item/unlike/${this._id}`, {});
        const updated = await lastValueFrom(observer$);
        this.likes = this.likes.filter(val => val !== userId);
        this.likesCount--;
        return updated;
    }
    /** */
    async deleteItem() {
        const filesWithDir = this.photos
            .map(val => ({ filename: val }));
        const observer$ = StockCounterClient.ehttp
            .makePut(`/item/deleteone/${this._id}`, { filesWithDir });
        return await lastValueFrom(observer$);
    }
    /** */
    async deleteImages(filesWithDir) {
        const observer$ = StockCounterClient.ehttp
            // eslint-disable-next-line @typescript-eslint/naming-convention
            .makePut('/item/deleteimages', { filesWithDir, item: { _id: this._id } });
        const deleted = await lastValueFrom(observer$);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        const toStrings = filesWithDir.map(val => val.filename);
        this.photos = this.photos.filter(val => !toStrings.includes(val));
        return deleted;
    }
    /** */
    appndPdctCtror(data) {
        this.urId = data.urId || this.urId;
        this.numbersInstock = data.numbersInstock || this.numbersInstock;
        this.name = data.name || this.name;
        this.brand = data.brand || this.brand;
        this.type = data.type || this.type;
        this.category = data.category || this.category;
        this.state = data.state || this.state;
        this.colors = data.colors || this.colors;
        this.model = data.model || this.model;
        this.origin = data.origin || this.origin;
        this.createdAt = data.createdAt || this.createdAt;
        this.updatedAt = data.updatedAt || this.updatedAt;
        this.costMeta = data.costMeta || this.costMeta;
        this.description = data.description || this.description;
        this.inventoryMeta = data.inventoryMeta || this.inventoryMeta;
        this.urId = data.urId || this.urId;
        this._id = data._id || this._id;
        this.numbersInstock = data.numbersInstock || this.numbersInstock;
        this.name = data.name || this.name;
        this.brand = data.brand || this.brand;
        this.type = data.type || this.type;
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
    }
}
//# sourceMappingURL=item.define.js.map