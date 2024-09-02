import { lastValueFrom } from 'rxjs';
import { ItrackEdit, Iuser, IuserActionTrack } from '../../interfaces/general.interface';
import { IdataArrayResponse, Isuccess } from '../../interfaces/return.interface';
import { StockUniversal } from '../../stock-universal';
import { DatabaseAuto } from '../base/base.define';
import { IparentData } from './track-view.define';

export class TrackEdit
  extends DatabaseAuto {
  parent: string | IparentData;
  createdBy: Iuser;
  users: IuserActionTrack[];
  deletedBy: Iuser;

  /**
   * Constructor for TrackEdit
   * @param data the data to initialize the TrackEdit object
   */
  constructor(data: ItrackEdit) {
    super(data);
    this.parent = data.parent;
    this.createdBy = data.createdBy as Iuser;
    this.users = data.users;
    this.deletedBy = data.deletedBy as Iuser;
  }

  /**
   * Get a track edit document by parent id
   * @param parent the parent id to query
   * @returns a TrackEdit object
   */
  static async getByParent(parent: string) {
    const observer$ = StockUniversal.ehttp.makeGet(`/track/gettrackeditbyparent/${parent}`);
    const edit = await lastValueFrom(observer$) as ItrackEdit;

    return new TrackEdit(edit);
  }

  /**
   * Get track edits made by a user
   * @param userId the id of the user to query
   * @param offset the offset of the results to return
   * @param limit the maximum number of results to return
   * @returns a promise resolving to an object containing the count of all track edits made by the user and an array of track edits
   */
  static async getByUser(userId: string, offset = 0, limit = 20) {
    const observer$ = StockUniversal.ehttp.makeGet(`/track/gettrackeditbyuser/${offset}/${limit}/${userId}`);
    const edits = await lastValueFrom(observer$) as IdataArrayResponse;

    return {
      count: edits.count,
      trackEdits: edits.data.map(val => new TrackEdit(val as ItrackEdit))
    };
  }

  /**
   * Get all track edits
   * @param offset the offset of the results to return
   * @param limit the maximum number of results to return
   * @returns a promise resolving to an object containing the count of all track edits and an array of track edits
   */
  static async getAll(offset = 0, limit = 20) {
    const observer$ = StockUniversal.ehttp.makeGet(`/track/gettrackedit/${offset}/${limit}`);
    const edits = await lastValueFrom(observer$) as IdataArrayResponse;

    return {
      count: edits.count,
      trackEdits: edits.data.map(val => new TrackEdit(val as ItrackEdit))
    };
  }

  /**
   * Delete a track edit
   * @param id the id of the track edit to delete
   * @returns a promise resolving to an object containing a boolean indicating success
   */
  static async deleteOne(id: string) {
    const observer$ = StockUniversal.ehttp.makeDelete(`/track/deletetrackedit/${id}`);

    const deleted = await lastValueFrom(observer$) as Isuccess;

    return deleted;
  }
}


