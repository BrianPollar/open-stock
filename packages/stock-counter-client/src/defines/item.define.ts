import {
  DatabaseAuto,
  IcostMeta,
  Ifile,
  IfileMeta,
  IinventoryMeta, Iitem, Isponsored,
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
  /** The user's company ID. */
  companyId: string;

  /** The number of items in stock. */
  numbersInstock: number;

  /** The name of the item. */
  name: string;

  /** The brand of the item. */
  brand: string;

  /** The category of the item. */
  category?: string;

  subCategory?: string;

  /** The state of the item. */
  state?: TitemState;

  /** The colors of the item. */
  colors?: TitemColor[];

  /** The model of the item. */
  model?: string;

  /** The country of origin of the item. */
  origin?: string;

  /** The cost metadata of the item. */
  costMeta: IcostMeta;

  /** The description of the item. */
  description?: string;

  /** The inventory metadata of the item. */
  inventoryMeta: IinventoryMeta[];

  /** The photos of the item. */
  photos?: IfileMeta[] = [];

  /** Any known problems with the item. */
  anyKnownProblems?: string;

  /** The number of items bought. */
  numberBought?: number;

  /** The sponsored items of the item. */
  sponsored?: Isponsored[];

  /** The buyer guarantee of the item. */
  buyerGuarantee?: string;

  /** The users who reviewed the item. */
  reviewedBy?: string[];

  /** The number of reviews of the item. */
  reviewCount?: number;

  /** The weight of the reviews of the item. */
  reviewWeight?: number;

  /** The users who liked the item. */
  likes?: string[];

  /** The number of likes of the item. */
  likesCount?: number;

  /** The number of times the item has been viewed. */
  timesViewed?: number;

  /** The quantity of the item ordered. */
  orderedQty = 1;

  /** The total rating of the item. */
  reviewRatingsTotal?;

  /**
   * Creates an instance of Item.
   * @param data The data to initialize the item with.
   */
  ecomerceCompat: boolean;

  /**
   * Represents the constructor of the Item class.
   * @param {any} data - The data used to initialize the Item instance.
   */
  constructor(data) {
    super(data);
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
  static async searchItems(
    companyId: string,
    category: string,
    searchterm: string,
    searchKey: string,
    extraFilters,
    subCategory?: string
  ) {
    const observer$ = StockCounterClient.ehttp
      .makePost(`/item/search/${companyId}`, { searchterm, searchKey, category, extraFilters, subCategory });
    const items = await lastValueFrom(observer$) as unknown[];
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
  static async getItems(
    companyId: string,
    url: string,
    offset = 0,
    limit = 20
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet(`${url}/${offset}/${limit}/${companyId}`);
    const items = await lastValueFrom(observer$) as unknown[];
    return items
      .map(val => new Item(val));
  }

  /**
   * Gets a single item.
   * @param companyId - The ID of the company
   * @param url The URL to get the item from.
   * @returns The item.
   */
  static async getOneItem(
    companyId: string,
    url: string
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet(`${url}`);
    const item = await lastValueFrom(observer$) as unknown[];
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
  static async addItem(
    companyId: string,
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
          `/item/create/${companyId}`,
          details);
      added = await lastValueFrom(observer$) as Isuccess;
    } else {
      const observer$ = StockCounterClient.ehttp
        .makePost(`/invitem/create/${companyId}`, details);
      added = await lastValueFrom(observer$) as Isuccess;
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
  static async deleteItems(
    companyId: string,
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
   * @param companyId - The ID of the company
   * @param vals The values to update the item with.
   * @param url The URL to update the item from.
   * @param files The files to update the item with.
   * @returns The success status of updating the item.
   */
  async updateItem(
    companyId: string,
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
   * @param companyId - The ID of the company
   * @param sponsored The sponsored item.
   * @param item The item to make sponsored.
   * @returns The success status of making the item sponsored.
   */
  async makeSponsored(
    companyId: string,
    sponsored: Isponsored,
    item: Item) {
    const observer$ = StockCounterClient.ehttp
      .makePut(`/item/addsponsored/${this._id}/${companyId}`, { sponsored });
    const added = await lastValueFrom(observer$) as Isuccess;

    if (added.success) {
      if (!this.sponsored) {
        this.sponsored = [];
      }
      this.sponsored.push({ item, discount: sponsored.discount } as unknown as Isponsored);
    }
    return added;
  }

  /**
   * Updates a sponsored item.
   * @param companyId - The ID of the company
   * @param sponsored The sponsored item to update.
   * @returns The success status of updating the sponsored item.
   */
  async updateSponsored(companyId: string, sponsored: Isponsored) {
    const observer$ = StockCounterClient.ehttp
      .makePut(`/item/updatesponsored/${this._id}/${companyId}`, { sponsored });
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
   * @param companyId - The ID of the company
   * @param itemId The ID of the item to delete.
   * @returns The success status of deleting the sponsored item.
   */
  async deleteSponsored(companyId: string, itemId: string) {
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

  /**
   * Retrieves sponsored items for a given company.
   * @param companyId - The ID of the company.
   * @returns A Promise that resolves to an array of sponsored items.
   */
  async getSponsored(companyId: string) {
    const mappedIds = this.sponsored.map(val =>(val.item as unknown as Item)._id || val.item);
    const observer$ = StockCounterClient.ehttp
      .makePost(`/item/getsponsored/${companyId}`, { sponsored: mappedIds || [] });
    const items = await lastValueFrom(observer$) as unknown[];
    return this.sponsored
      .map(sponsrd => {
        sponsrd.item = new Item(
          items.find(val => (val as Item)._id === (sponsrd.item as unknown as Item)._id || sponsrd.item)) as unknown as Iitem;
      });
  }

  /**
   * Likes an item.
   * @param companyId - The ID of the company.
   * @param userId - The ID of the user.
   * @returns A promise that resolves to the updated item.
   */
  async likeItem(companyId: string, userId: string) {
    const observer$ = StockCounterClient.ehttp
      .makePut(`/item/like/${this._id}/${companyId}`, {});
    const updated = await lastValueFrom(observer$) as Isuccess;
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
  async unLikeItem(companyId: string, userId: string) {
    const observer$ = StockCounterClient.ehttp
      .makePut(`/item/unlike/${this._id}/${companyId}`, {});
    const updated = await lastValueFrom(observer$) as Isuccess;
    this.likes = this.likes.filter(val => val !== userId);
    this.likesCount--;
    return updated;
  }

  /**
   * Deletes an item associated with a company.
   * @param companyId - The ID of the company.
   * @returns A promise that resolves to the success response.
   */
  async deleteItem(companyId: string) {
    const filesWithDir = this.photos
      .map(val => ({ filename: val }));

    const observer$ = StockCounterClient.ehttp
      .makePut(`/item/deleteone/${this._id}/${companyId}`, { filesWithDir });
    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Deletes images associated with an item.
   * @param companyId - The ID of the company.
   * @param filesWithDir - An array of file metadata objects.
   * @returns A promise that resolves to the success status of the deletion.
   */
  async deleteImages(companyId: string, filesWithDir: IfileMeta[]) {
    const observer$ = StockCounterClient.ehttp
    // eslint-disable-next-line @typescript-eslint/naming-convention
      .makePut(`/item/deleteimages/${companyId}`, { filesWithDir, item: { _id: this._id } });
    const deleted = await lastValueFrom(observer$) as Isuccess;
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
    this.ecomerceCompat = data.ecomerceCompat || this.ecomerceCompat;
  }
}
