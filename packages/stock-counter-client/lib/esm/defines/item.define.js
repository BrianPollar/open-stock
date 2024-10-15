import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
export class Item extends DatabaseAuto {
    constructor(data) {
        super(data);
        this.photos = [] = [];
        this.reviewCount = 0;
        this.reviewWeight = 0;
        this.likesCount = 0;
        this.timesViewed = 0;
        this.orderedQty = 1;
        this.reviewRatingsTotal = 0;
        this.soldCount = 0;
        this.appndPdctCtror(data);
    }
    static async filterAll(filter) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/item/filter', filter);
        const items = await lastValueFrom(observer$);
        return {
            count: items.count,
            items: items.data
                .map(val => new Item(val))
        };
    }
    static async getAll(route, offset = 0, limit = 20, ecomerceCompat = 'false') {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/item/${route}/${offset}/${limit}/${ecomerceCompat}`);
        const items = await lastValueFrom(observer$);
        return {
            count: items.count,
            items: items.data
                .map(val => new Item(val))
        };
    }
    static async getOne(urIdOr_id) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/item/one/${urIdOr_id}`);
        const item = await lastValueFrom(observer$);
        return new Item(item);
    }
    static async add(vals, files, ecomerceCompat = false) {
        let added;
        const body = {
            item: vals
        };
        if (ecomerceCompat) {
            const observer$ = StockCounterClient.ehttp
                .uploadFiles(files, '/item/add/img', body);
            added = await lastValueFrom(observer$);
        }
        else {
            const observer$ = StockCounterClient.ehttp
                .makePost('/item/add', body);
            added = await lastValueFrom(observer$);
        }
        return added;
    }
    static removeMany(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('item/delete/many', vals);
        return lastValueFrom(observer$);
    }
    async update(vals, files) {
        let updated;
        const body = {
            item: {
                _id: this._id,
                ...vals
            }
        };
        if (files && files.length > 0) {
            const observer$ = StockCounterClient.ehttp
                .uploadFiles(files, '/item/update/img', body);
            updated = await lastValueFrom(observer$);
        }
        else {
            const observer$ = StockCounterClient.ehttp
                .makePut('/item/update', body);
            updated = await lastValueFrom(observer$);
        }
        return updated;
    }
    async addSponsored(sponsored, item) {
        const observer$ = StockCounterClient.ehttp
            .makePut(`/item/sponsored/add/${this._id}`, sponsored);
        const added = await lastValueFrom(observer$);
        if (added.success) {
            if (!this.sponsored) {
                this.sponsored = [];
            }
            this.sponsored.push({ item, discount: sponsored.discount });
        }
        return added;
    }
    async updateSponsored(sponsored) {
        const observer$ = StockCounterClient.ehttp
            .makePut(`/item/sponsored/update/${this._id}`, sponsored);
        const updated = await lastValueFrom(observer$);
        if (updated.success && this.sponsored) {
            const found = this.sponsored
                .find(val => val.item === sponsored.item);
            if (found) {
                found.discount = sponsored.discount;
            }
        }
        return updated;
    }
    async removeSponsored(itemId) {
        const observer$ = StockCounterClient.ehttp
            .makeDelete(`/item/sponsored/delete/${this._id}/${itemId}`);
        const deleted = await lastValueFrom(observer$);
        if (deleted.success && this.sponsored) {
            const found = this.sponsored.find(sponsd => sponsd.item._id === itemId);
            if (found) {
                const indexOf = this.sponsored.indexOf(found);
                this.sponsored.splice(indexOf, 1);
            }
        }
        return deleted;
    }
    async getSponsored() {
        const mappedIds = this.sponsored ? this.sponsored.map(val => val.item._id || val.item) : [];
        const observer$ = StockCounterClient.ehttp
            .makePost('/item/sponsored/get', { _ids: mappedIds || [] });
        const items = await lastValueFrom(observer$);
        if (!this.sponsored) {
            this.sponsored = [];
        }
        return this.sponsored
            .map(sponsrd => {
            if (sponsrd.item &&
                items.data && items.data.length > 0 && typeof sponsrd.item !== 'string' && sponsrd.item._id) {
                const foundItem = items.data.find(val => {
                    if (typeof sponsrd.item === 'string') {
                        return val._id === sponsrd.item;
                    }
                    else {
                        return val._id === sponsrd.item._id;
                    }
                });
                if (foundItem) {
                    sponsrd.item = new Item(foundItem);
                }
                return sponsrd;
            }
        });
    }
    async like(userId) {
        const observer$ = StockCounterClient.ehttp
            .makePut(`/item/like/${this._id}`, {});
        const updated = await lastValueFrom(observer$);
        if (!this.likes) {
            this.likes = [];
        }
        this.likes.push(userId);
        if (this.likesCount) {
            this.likesCount++;
        }
        return updated;
    }
    async unLike(userId) {
        const observer$ = StockCounterClient.ehttp
            .makePut(`/item/unlike/${this._id}`, {});
        const updated = await lastValueFrom(observer$);
        if (this.likes) {
            this.likes = this.likes.filter(val => val !== userId);
        }
        if (this.likesCount) {
            this.likesCount--;
        }
        return updated;
    }
    remove() {
        const observer$ = StockCounterClient.ehttp
            .makePut(`/item/delete/one/${this._id}`, {});
        return lastValueFrom(observer$);
    }
    async removeFiles(filesWithDir) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/item/deletefiles', { filesWithDir, item: { _id: this._id } });
        const deleted = await lastValueFrom(observer$);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        const toStrings = filesWithDir.map(val => val._id);
        if (this.photos) {
            this.photos = this.photos.filter(val => !toStrings.includes(val._id));
        }
        if (this.video && toStrings.includes(this.video._id)) {
            // eslint-disable-next-line no-undefined
            this.video = undefined;
        }
        return deleted;
    }
    /**
     * Updates the properties of the item based on the provided data.
     * @param {object} data - The data containing the properties to update.
     */
    appndPdctCtror(data) {
        this.urId = data.urId;
        this.companyId = data.companyId.toString() || this.companyId;
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