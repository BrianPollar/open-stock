/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */

import { lastValueFrom } from 'rxjs';
import { Item } from './item.define';
import { DatabaseAuto, Isuccess } from '@open-stock/stock-universal';
import { StockCounterClient } from '../stock-counter-client';

/**
 * Represents an item offer.
 */
export class ItemOffer extends DatabaseAuto {
  /** The user ID. */
  urId: string;

  /** The items in the offer. */
  items: Item[];

  /** The expiration date of the offer. */
  expireAt: Date;

  /** The type of the offer. */
  type: string;

  /** The header of the offer. */
  header: string;

  /** The sub-header of the offer. */
  subHeader: string;

  /** The amount of the offer. */
  ammount: number;

  /**
   * Creates a new instance of ItemOffer.
   * @param data The data to initialize the instance with.
   */
  constructor(data) {
    super(data);
    this.urId = data.urId;
    this.items = data.items.map((val) => new Item(val));
    this.expireAt = data.expireAt;
    this.type = data.type;
    this.header = data.header;
    this.subHeader = data.subHeader;
    this.ammount = data.ammount;
  }

  /**
   * Gets all item offers.
   * @param type The type of the offer.
   * @param url The URL to get the offers from.
   * @param offset The offset to start from.
   * @param limit The maximum number of items to return.
   * @returns An array of ItemOffer instances.
   */
  static async getItemOffers(
    type: string,
    url = 'getall',
    offset = 0,
    limit = 0
  ): Promise<ItemOffer[]> {
    const observer$ = StockCounterClient.ehttp.makeGet(
      `/itemoffer/${url}/${type}/${offset}/${limit}`
    );
    const offers = await lastValueFrom(observer$) as ItemOffer[];
    return offers.map((val) => new ItemOffer(val));
  }

  /**
   * Gets a single item offer.
   * @param id The ID of the offer to get.
   * @returns An instance of ItemOffer.
   */
  static async getOneItemOffer(id: string): Promise<ItemOffer> {
    const observer$ = StockCounterClient.ehttp.makeGet(
      `/itemoffer/getone/${id}`
    );
    const offer = await lastValueFrom(observer$) as ItemOffer;
    return new ItemOffer(offer);
  }

  /**
   * Creates a new item offer.
   * @param itemoffer The item offer to create.
   * @returns An instance of Isuccess.
   */
  static async createItemOffer(
    itemoffer: {
      items: string[] | Item[];
      expireAt: Date;
      header: string;
      subHeader: string;
      ammount: number;
    }
  ): Promise<Isuccess> {
    const observer$ = StockCounterClient.ehttp.makePost('/itemoffer/create', {
      itemoffer
    });
    const added = await lastValueFrom(observer$) as Isuccess;
    return added;
  }

  /**
   * Deletes multiple item offers.
   * @param ids The IDs of the offers to delete.
   * @returns An instance of Isuccess.
   */
  static async deleteItemOffers(ids: string[]): Promise<Isuccess> {
    const observer$ = StockCounterClient.ehttp.makePut('/itemoffer/deletemany', {
      ids
    });
    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Updates an item offer.
   * @param vals The values to update the item offer with.
   * @returns An instance of Isuccess.
   */
  async updateItemOffer(vals): Promise<Isuccess> {
    const observer$ = StockCounterClient.ehttp.makePut(
      '/itemoffer/update',
      vals
    );
    const updated = await lastValueFrom(observer$) as Isuccess;
    if (updated.success) {
      this.items = vals.items || this.items;
      this.expireAt = vals.expireAt || this.expireAt;
    }
    return updated;
  }

  /**
   * Deletes an item offer.
   * @returns An instance of Isuccess.
   */
  async deleteItemOffer(): Promise<Isuccess> {
    const observer$ = StockCounterClient.ehttp.makeDelete(
      `/itemoffer/deleteone/${this._id}`
    );
    return await lastValueFrom(observer$) as Isuccess;
  }
}
