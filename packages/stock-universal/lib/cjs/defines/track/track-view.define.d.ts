import { ItrackView, IuserActionTrack } from '../../interfaces/general.interface';
import { Isuccess } from '../../interfaces/return.interface';
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
    direction: 'eq' | 'gte' | 'lte' | 'between';
    dateVal: Date;
    gteDateVal?: Date;
}
export declare class TrackView extends DatabaseAuto {
    parent: string | IparentData;
    users: IuserActionTrack[];
    /**
     * Constructor for TrackView
     * @param data the data to initialize the TrackView object
     */
    constructor(data: ItrackView);
    static getByDates(url: 'gettrackviewbyuserdate' | 'gettrackviewbydate', filters: IdateFilterObj, offset?: number, limit?: number): Promise<{
        count: number;
        trackViews: TrackView[];
    }>;
    /**
     * Get a track view document by parent id
     * @param parent the parent id to query
     * @returns a TrackView object
     */
    static getByParent(parent: string): Promise<TrackView>;
    /**
     * Get track views for a user
     * @param userId the user id to query
     * @param offset the offset of the query
     * @param limit the limit of the query
     * @returns a TrackView object with a count of the total results and an array of track views
     */
    static getByUser(userId: string, offset?: number, limit?: number): Promise<{
        count: number;
        trackViews: TrackView[];
    }>;
    /**
     * Get all track views
     * @param offset the offset of the query
     * @param limit the limit of the query
     * @returns a TrackView object with a count of the total results and an array of track views
     */
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        trackViews: TrackView[];
    }>;
    /**
     * Deletes a track view by id.
     *
     * @param _id the id of the track view to delete.
     * @returns a boolean indicating whether the track view was successfully deleted.
     */
    static deleteOne(_id: string): Promise<Isuccess>;
}
