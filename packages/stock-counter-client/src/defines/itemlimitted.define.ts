/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { lastValueFrom } from 'rxjs';
import { DatabaseAuto, Isuccess } from '@open-stock/stock-universal';
import { StockCounterClient } from '../stock-counter-client';

/** ItemLimitted  class: This class extends
 * the  DatabaseAuto  class and represents
 * an item limitted object in the database. It has
 * properties for  urId  (a string representing the UUID)
 * and  name  (an array of  Item  objects). */
export class ItemLimitted extends DatabaseAuto {
  /** The UUID of the item limitted. */
  urId: string;
  /** The name of the item limitted. */
  name: string;

  /**
   * Creates an instance of ItemLimitted.
   * @param data - The data to initialize the instance with.
   */
  constructor(data) {
    super(data);
    this.urId = data.urId;
    this.name = data.name;
  }

  /**
   * Retrieves item limitteds from the server based
   * on the specified type, URL, offset, and limit.
   * @param offset - The offset to start retrieving item limitteds from.
   * @param limit - The maximum number of item limitteds to retrieve.
   * @returns An array of ItemLimitted instances.
   */
  static async getItemLimitteds(offset = 0, limit = 0) {
    const observer$ = StockCounterClient.ehttp
      .makeGet(`/itemlimitted/getall/${offset}/${limit}`);
    const limitteds = await lastValueFrom(observer$) as ItemLimitted[];
    return limitteds.map(val => new ItemLimitted(val));
  }

  /**
   * Retrieves a specific item limitted from the server
   * based on the provided ID.
   * @param id - The ID of the item limitted to retrieve.
   * @returns A single ItemLimitted instance.
   */
  static async getOneItemLimitted(id: string) {
    const observer$ = StockCounterClient.ehttp.makeGet(`/itemlimitted/getone/${id}`);
    const limitted = await lastValueFrom(observer$) as ItemLimitted;
    return new ItemLimitted(limitted);
  }

  /**
   * Creates a new item limitted on the server.
   * @param data - The data to create the item limitted with.
   * @returns A success response.
   */
  static async createItemLimitted(data) {
    const observer$ = StockCounterClient.ehttp
      .makePost('/itemlimitted/create', {
        itemlimitted: data
      });
    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Deletes multiple item limitteds from the server based on the provided IDs.
   * @param ids - The IDs of the item limitteds to delete.
   * @returns A success response.
   */
  static async deleteItemLimitteds(ids: string[]) {
    const observer$ = StockCounterClient.ehttp
      .makePut('/itemlimitted/deletemany', { ids });
    const deleted = await lastValueFrom(observer$) as Isuccess;
    return deleted;
  }

  /**
   * Updates the current item limitted instance on the server.
   * @param data - The data to update the item limitted with.
   * @returns A success response.
   */
  async update(data) {
    data._id = this._id;
    const observer$ = StockCounterClient.ehttp
      .makePut('/itemlimitted/updateone', data);
    const updated = await lastValueFrom(observer$) as Isuccess;
    if (updated.success) {
      this.name = data.name;
    }
    return updated;
  }

  /**
   * Deletes the current item limitted instance from the server.
   * @returns A success response.
   */
  async deleteItemLimitted() {
    const observer$ = StockCounterClient.ehttp
      .makeDelete(`/itemlimitted/deleteone/${this._id}`);
    const deleted = await lastValueFrom(observer$) as Isuccess;
    return deleted;
  }
}
