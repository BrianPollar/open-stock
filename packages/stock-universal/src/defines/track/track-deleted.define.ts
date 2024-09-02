import { lastValueFrom } from 'rxjs';
import { ItrackDeleted } from '../../interfaces/general.interface';
import { IdataArrayResponse, Isuccess } from '../../interfaces/return.interface';
import { StockUniversal } from '../../stock-universal';
import { DatabaseAuto } from '../base/base.define';
import { IparentData } from './track-view.define';

export class TrackDeleted
  extends DatabaseAuto {
  parent: string | IparentData;
  deletedAt: string;

  constructor(data: ItrackDeleted) {
    super(data);
    this.parent = data.parent;
    this.deletedAt = data.deletedAt;
  }

  /**
   * Get all trackDeleteds, paginated.
   *
   * @param offset - The offset from which to return the trackDeleteds.
   * @param limit - The maximum number of trackDeleteds to return.
   * @returns An object containing the total count of trackDeleteds and an array of the trackDeleteds.
   */
  static async getAll(offset = 0, limit = 20) {
    const observer$ = StockUniversal.ehttp.makeGet(`/track/gettrackdelete/${offset}/${limit}`);
    const edits = await lastValueFrom(observer$) as IdataArrayResponse;

    return {
      count: edits.count,
      trackDeleteds: edits.data.map(val => new TrackDeleted(val as ItrackDeleted))
    };
  }

  /**
   * Deletes a trackDeleted by id.
   *
   * @param id - The id of the trackDeleted to delete.
   * @returns A boolean indicating whether the trackDeleted was successfully deleted.
   */
  static async deleteOne(id: string) {
    const observer$ = StockUniversal.ehttp.makeDelete(`/track/deletetrackdelete/${id}`);
    const deleted = await lastValueFrom(observer$) as Isuccess;

    return deleted;
  }
}
