import { lastValueFrom } from 'rxjs';
import { ItrackView, IuserActionTrack } from '../../interfaces/general.interface';
import { IdataArrayResponse, Isuccess } from '../../interfaces/return.interface';
import { StockUniversal } from '../../stock-universal';
import { TdataTypeForTrack } from '../../types/union.types';
import { DatabaseAuto } from '../base/base.define';

export interface IparentData {
  _id: string;
  urId?: string;
  info: string;
  dataType: TdataTypeForTrack;
  invoiceId?: string;
  estimateId?: string;
}
export interface IdateFilterObj {
  direction: 'eq' | 'gte' | 'lte'| 'between';
  dateVal: Date;
  gteDateVal?: Date;
}
export class TrackView
  extends DatabaseAuto {
  parent: string | IparentData;
  users: IuserActionTrack[];

  /**
   * Constructor for TrackView
   * @param data the data to initialize the TrackView object
   */
  constructor(data: ItrackView) {
    super(data);
    this.parent = data.parent;
    this.users = data.users;
  }


  static async getByDates(url: 'gettrackviewbyuserdate' | 'gettrackviewbydate', filters: IdateFilterObj, offset = 0, limit = 40) {
    const observer$ = StockUniversal.ehttp.makePost(`/track/${url}${offset}/${limit}`, filters);
    const views = await lastValueFrom(observer$) as IdataArrayResponse;

    return {
      count: views.count,
      trackViews: views.data.map(val => new TrackView(val as ItrackView))
    };
  }

  /**
   * Get a track view document by parent id
   * @param parent the parent id to query
   * @returns a TrackView object
   */
  static async getByParent(parent: string) {
    const observer$ = StockUniversal.ehttp.makeGet(`/track/gettrackviewbyparent/${parent}`);
    const view = await lastValueFrom(observer$) as ItrackView;

    return new TrackView(view);
  }

  /**
   * Get track views for a user
   * @param userId the user id to query
   * @param offset the offset of the query
   * @param limit the limit of the query
   * @returns a TrackView object with a count of the total results and an array of track views
   */
  static async getByUser(userId: string, offset = 0, limit = 20) {
    const observer$ = StockUniversal.ehttp.makeGet(`/track/gettrackviewbyuser/${offset}/${limit}/${userId}`);
    const views = await lastValueFrom(observer$) as IdataArrayResponse;

    return {
      count: views.count,
      trackViews: views.data.map(val => new TrackView(val as ItrackView))
    };
  }

  /**
   * Get all track views
   * @param offset the offset of the query
   * @param limit the limit of the query
   * @returns a TrackView object with a count of the total results and an array of track views
   */
  static async getAll(offset = 0, limit = 20) {
    const observer$ = StockUniversal.ehttp.makeGet(`/track/gettrackview/${offset}/${limit}`);
    const views = await lastValueFrom(observer$) as IdataArrayResponse;

    return {
      count: views.count,
      trackViews: views.data.map(val => new TrackView(val as ItrackView))
    };
  }

  /**
   * Deletes a track view by id.
   *
   * @param id the id of the track view to delete.
   * @returns a boolean indicating whether the track view was successfully deleted.
   */
  static async deleteOne(id: string) {
    const observer$ = StockUniversal.ehttp.makeDelete(`/track/deletetrackview/${id}`);
    const deleted = await lastValueFrom(observer$) as Isuccess;

    return deleted;
  }
}
