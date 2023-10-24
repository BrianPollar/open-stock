import {
  DatabaseAuto,
  IcostMeta,
  Ifile,
  IinventoryMeta,
  Isponsored,
  Isuccess,
  TitemColor,
  TitemState
} from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';

/**
 * Item class: This class represents an item object with properties and methods for manipulating item data.
 * It includes methods for searching items, getting items, adding items, updating items, deleting items,
 * adding and updating sponsored items, liking and unliking items, deleting images, and others.
 */
export class Item extends DatabaseAuto {
  /** Unique identifier for the user who created the item. */
  urId: string;

  /** The number of items in stock. */
  numbersInstock: number;

  /** The name of the item. */
  name: string;

  /** The brand of the item. */
  brand: string;

  /** The type of the item. */
  type: string;

  /** The category of the item. */
  category: string;

  /** The state of the item. */
  state: TitemState;

  /** The colors of the item. */
  colors: TitemColor[];

  /** The model of the item. */
  model: string;

  /** The country of origin of the item. */
  origin: string;

  /** The cost metadata of the item. */
  costMeta: IcostMeta;

  /** The description of the item. */
  description: string;

  /** The inventory metadata of the item. */
  inventoryMeta: IinventoryMeta[];

  /** The photos of the item. */
  photos: string[] = [];

  /** Any known problems with the item. */
  anyKnownProblems: string;

  /** The number of items bought. */
  numberBought: number;

  /** The sponsored items of the item. */
  sponsored: Isponsored[];

  /** The buyer guarantee of the item. */
  buyerGuarantee: string;

  /** The users who reviewed the item. */
  reviewedBy: string[];

  /** The number of reviews of the item. */
  reviewCount: number;

  /** The weight of the reviews of the item. */
  reviewWeight: number;

  /** The users who liked the item. */
  likes: string[];

  /** The number of likes of the item. */
  likesCount: number;

  /** The number of times the item has been viewed. */
  timesViewed: number;

  /** The quantity of the item ordered. */
  orderedQty = 1;

  /** The total rating of the item. */
  reviewRatingsTotal;

  /**
   * Creates an instance of Item.
   * @param data The data to initialize the item with.
   */
  constructor(data) {
    super(data);
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
  static async searchItems(
    type: string,
    searchterm: string,
    searchKey: string,
    extraFilters
  ) {
    const observer$ = StockCounterClient.ehttp
      .makePost('/item/search', { searchterm, searchKey, category: type, extraFilters });
    const items = await lastValueFrom(observer$) as unknown[];
    return items
      .map(val => new Item(val));
  }

  /**
   * Gets items.
   * @param url The URL to get the items from.
   * @param offset The offset to start getting items from.
   * @param limit The maximum number of items to get.
   * @returns An array of items.
   */
  static async getItems(
    url: string,
    offset = 0,
    limit = 0
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet(`${url}/${offset}/${limit}`);
    const items = await lastValueFrom(observer$) as unknown[];
    return items
      .map(val => new Item(val));
  }

  /**
   * Gets a single item.
   * @param url The URL to get the item from.
   * @returns The item.
   */
  static async getOneItem(
    url: string
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet(`${url}`);
    const item = await lastValueFrom(observer$) as unknown[];
    return new Item(item);
  }

  /**
   * Adds an item.
   * @param vals The values to add the item with.
   * @param files The files to add to the item.
   * @param inventoryStock Whether the item is in inventory stock.
   * @returns The success status of adding the item.
   */
  static async addItem(
    vals: object,
    files: Ifile[],
    inventoryStock = false
  ) {
    let added: Isuccess;
    const details = {
      item: vals
    };
    if (!inventoryStock) {
      const observer$ = StockCounterClient.ehttp
        .uploadFiles(files,
          '/item/create',
          details);
      added = await lastValueFrom(observer$) as Isuccess;
    } else {
      const observer$ = StockCounterClient.ehttp
        .makePost('/invitem/create', details);
      added = await lastValueFrom(observer$) as Isuccess;
    }
    return added;
  }

  /**
   * Deletes items.
   * @param ids The IDs of the items to delete.
   * @param filesWithDir The files to delete with their directories.
   * @param url The URL to delete the items from.
   * @returns The success status of deleting the items.
   */
  static async deleteItems(
    ids: string[],
    filesWithDir,
    url: string
  ) {
    const observer$ = StockCounterClient.ehttp
      .makePut(`${url}`, { ids, filesWithDir });
    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Updates an item.
   * @param vals The values to update the item with.
   * @param url The URL to update the item from.
   * @param files The files to update the item with.
   * @returns The success status of updating the item.
   */
  async updateItem(
    vals: object,
    url: string,
    files?: Ifile[]
  ) {
    let updated: Isuccess;
    const details = {
      item: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _id: this._id,
        ...vals
      }
    };
    if (files && files.length > 0) {
      const observer$ = StockCounterClient.ehttp
        .uploadFiles(files,
          '/item/updateimg',
          details);
      updated = await lastValueFrom(observer$) as Isuccess;
    } else {
      const observer$ = StockCounterClient.ehttp
        .makePut(`${url}`, details);
      updated = await lastValueFrom(observer$) as Isuccess;
    }
    return updated;
  }

  /**
   * Makes an item sponsored.
   * @param sponsored The sponsored item.
   * @param item The item to make sponsored.
   * @returns The success status of making the item sponsored.
   */
  async makeSponsored(
    sponsored: Isponsored, item: Item) {
    const observer$ = StockCounterClient.ehttp
      .makePut(`/item/addsponsored/${this._id}`, { sponsored });
    const added = await lastValueFrom(observer$) as Isuccess;

    if (added.success) {
      if (!this.sponsored) {
        this.sponsored = [];
      }
      this.sponsored.push({ item, discount: sponsored.discount } as Isponsored);
    }
    return added;
  }

  /**
   * Updates a sponsored item.
   * @param sponsored The sponsored item to update.
   * @returns The success status of updating the sponsored item.
   */
  async updateSponsored(sponsored: Isponsored) {
    const observer$ = StockCounterClient.ehttp
      .makePut(`/item/updatesponsored/${this._id}`, { sponsored });
    const updated = await lastValueFrom(observer$) as Isuccess;

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
  async deleteSponsored(itemId: string) {
    const observer$ = StockCounterClient.ehttp
      .makeDelete(`/item/deletesponsored/${this._id}/${itemId}`);
    const deleted = await lastValueFrom(observer$) as Isuccess;

    if (deleted.success) {
      const found = this.sponsored.find(sponsd => (sponsd.item as unknown as Item)._id === itemId);
      if (found) {
        const indexOf = this.sponsored.indexOf(found);
        this.sponsored.splice(indexOf, 1);
      }
    }
    return deleted;
  }

  /** */
  async getSponsored() {
    const mappedIds = this.sponsored.map(val =>(val.item as unknown as Item)._id || val.item);
    const observer$ = StockCounterClient.ehttp
      .makePost('/item/getsponsored', { sponsored: mappedIds || [] });
    const items = await lastValueFrom(observer$) as unknown[];
    return this.sponsored
      .map(sponsrd => {
        sponsrd.item = new
        Item(
          items.find(val=>(val as Item)._id === (sponsrd.item as unknown as Item)._id || sponsrd.item)) as any;
      });
  }

  /** */
  async likeItem(userId: string) {
    const observer$ = StockCounterClient.ehttp
      .makePut(`/item/like/${this._id}`, {});
    const updated = await lastValueFrom(observer$) as Isuccess;
    this.likes.push(userId);
    this.likesCount++;
    return updated;
  }

  /** */
  async unLikeItem(userId: string) {
    const observer$ = StockCounterClient.ehttp
      .makePut(`/item/unlike/${this._id}`, {});
    const updated = await lastValueFrom(observer$) as Isuccess;
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
    return await lastValueFrom(observer$) as Isuccess;
  }

  /** */
  async deleteImages(filesWithDir) {
    const observer$ = StockCounterClient.ehttp
    // eslint-disable-next-line @typescript-eslint/naming-convention
      .makePut('/item/deleteimages', { filesWithDir, item: { _id: this._id } });
    const deleted = await lastValueFrom(observer$) as Isuccess;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const toStrings: string = filesWithDir.map(val => val.filename);
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
      this.costMeta.offer = (data.costMeta.offer as unknown as string) === 'true';
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

